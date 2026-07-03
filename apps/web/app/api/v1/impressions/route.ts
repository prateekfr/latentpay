import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/prisma";
import {
  EARNER_SHARE,
  clickPrice,
  isEventKind,
  isSurface,
  recomputeSurface,
  viewPrice,
  type Surface,
} from "../../../../lib/auction";
import { verifyBearerToken } from "../../../../lib/auth/token";
import { checkRateLimit, getClientIp } from "../../../../lib/rateLimit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Legitimate traffic can't exceed ~1 impression per platform per 5s
// generation-stop, across at most a few concurrent platforms — these give
// generous headroom above that for jitter/retries while still bounding abuse.
const TOKEN_RATE_LIMIT = 45;
const IP_RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60 * 1000;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function existingImpressionResponse(
  existing: { id: string; userId: string; kind: string; cost: number; payoutAmount: number; durationSeconds: number; campaignId: string },
  walletBalance: number,
) {
  return NextResponse.json(
    {
      success: true,
      message: "Already recorded (idempotent replay).",
      data: {
        impressionId: existing.id,
        userId: existing.userId,
        walletBalance: parseFloat(walletBalance.toFixed(4)),
        kind: existing.kind,
        cost: existing.cost,
        payoutAmount: existing.payoutAmount,
        durationSeconds: existing.durationSeconds,
        campaignId: existing.campaignId,
        campaignCompleted: false,
      },
    },
    { status: 200, headers: corsHeaders },
  );
}

export async function POST(request: Request) {
  try {
    // Authenticated to a specific linked device, never a client-supplied
    // userId — closes the "curl with any userId you like" hole.
    const verified = await verifyBearerToken(request);
    if (!verified) {
      return NextResponse.json(
        { error: "Missing or invalid bearer token. Sign in via the extension/IDE popup first." },
        { status: 401, headers: corsHeaders },
      );
    }
    const userId = verified.userId;

    if (!checkRateLimit(`impressions:token:${verified.tokenId}`, TOKEN_RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: corsHeaders });
    }
    if (!checkRateLimit(`impressions:ip:${getClientIp(request)}`, IP_RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: corsHeaders });
    }

    const body = await request.json();
    const { surface, durationSeconds, campaignId, eventId } = body;
    const kind = body.kind === undefined ? "view" : body.kind;

    if (!isEventKind(kind)) {
      return NextResponse.json(
        { error: 'Invalid kind. Must be "view" or "click".' },
        { status: 400, headers: corsHeaders },
      );
    }
    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { error: "eventId (string) is required — generate one client-side per generation-stop event." },
        { status: 400, headers: corsHeaders },
      );
    }

    if (kind === "click" && !campaignId) {
      return NextResponse.json(
        { error: "campaignId is required for kind=\"click\" — a click always refers to the ad that was shown." },
        { status: 400, headers: corsHeaders },
      );
    }

    if (kind === "view") {
      if (typeof durationSeconds !== "number") {
        return NextResponse.json(
          { error: "durationSeconds (number) is required for kind=\"view\"." },
          { status: 400, headers: corsHeaders },
        );
      }
      if (!campaignId && !isSurface(surface)) {
        return NextResponse.json(
          { error: "surface must be \"extension\" or \"terminal\" when campaignId is not provided." },
          { status: 400, headers: corsHeaders },
        );
      }
      if (durationSeconds < 5.0) {
        return NextResponse.json(
          { error: "Invalid impression. Duration must be at least 5 seconds." },
          { status: 400, headers: corsHeaders },
        );
      }
    }

    // Idempotent replay: a retried submission of the same real-world event
    // (e.g. a background-worker retry after a flaky response) returns the
    // original result instead of double-crediting.
    const existingByEvent = await prisma.impression.findUnique({ where: { eventId } });
    if (existingByEvent) {
      const existingUser = await prisma.user.findUnique({ where: { id: existingByEvent.userId } });
      return existingImpressionResponse(existingByEvent, existingUser?.walletBalance ?? 0);
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, walletBalance: 0.0 },
    });

    const campaign = campaignId
      ? await prisma.campaign.findUnique({ where: { id: campaignId } })
      : await prisma.campaign.findFirst({
          where: { surface, status: "serving" },
        });

    if (!campaign) {
      return NextResponse.json(
        {
          error:
            kind === "click"
              ? "That campaign no longer exists."
              : "No campaign is currently serving on this surface.",
        },
        { status: 404, headers: corsHeaders },
      );
    }

    const cost = kind === "click" ? clickPrice(campaign.bidPerBlock) : viewPrice(campaign.bidPerBlock);
    const payoutAmount = cost * EARNER_SHARE;

    const result = await prisma.$transaction(async (tx) => {
      // Race-safe floor check: only debit if the advertiser can actually
      // afford it, atomically — replaces an unconditional decrement that
      // could otherwise drive balance negative.
      const debited = await tx.advertiser.updateMany({
        where: { id: campaign.advertiserId, balance: { gte: cost } },
        data: { balance: { decrement: cost } },
      });

      if (debited.count === 0) {
        // Balance is shared across all of this advertiser's campaigns, so
        // any of them could have drawn it to zero — pause all active ones,
        // not just this one, and let each affected surface re-auction.
        const affected = await tx.campaign.findMany({
          where: { advertiserId: campaign.advertiserId, status: { in: ["serving", "queued"] } },
          select: { surface: true },
        });
        await tx.campaign.updateMany({
          where: { advertiserId: campaign.advertiserId, status: { in: ["serving", "queued"] } },
          data: { status: "paused" },
        });
        for (const surfaceName of new Set(affected.map((c) => c.surface))) {
          await recomputeSurface(tx, surfaceName as Surface);
        }
        return { insufficientFunds: true } as const;
      }

      let impression;
      try {
        impression = await tx.impression.create({
          data: {
            userId,
            campaignId: campaign.id,
            kind,
            durationSeconds: kind === "view" ? durationSeconds : 0,
            cost,
            payoutAmount,
            eventId,
          },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          // Lost a race with a concurrent duplicate submission of the same
          // event — surface the same "already recorded" outcome below,
          // don't double-credit.
          return { duplicateEvent: true } as const;
        }
        throw err;
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: payoutAmount } },
      });

      let completed = false;
      if (kind === "view") {
        const viewsDelivered = campaign.viewsDelivered + 1;
        completed = viewsDelivered >= campaign.viewsPurchased;
        await tx.campaign.update({
          where: { id: campaign.id },
          data: {
            viewsDelivered,
            status: completed ? "completed" : campaign.status,
          },
        });
      } else {
        await tx.campaign.update({
          where: { id: campaign.id },
          data: { clicksDelivered: { increment: 1 } },
        });
      }

      if (completed) {
        await recomputeSurface(tx, campaign.surface as Surface);
      }

      return { impression, updatedUser, completed } as const;
    });

    if ("insufficientFunds" in result) {
      return NextResponse.json(
        { error: "This campaign's advertiser is out of budget. No impression was recorded." },
        { status: 409, headers: corsHeaders },
      );
    }

    if ("duplicateEvent" in result) {
      const existing = await prisma.impression.findUnique({ where: { eventId } });
      const existingUser = existing ? await prisma.user.findUnique({ where: { id: existing.userId } }) : null;
      if (!existing) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
      }
      return existingImpressionResponse(existing, existingUser?.walletBalance ?? 0);
    }

    return NextResponse.json(
      {
        success: true,
        message: `${kind === "click" ? "Click" : "Impression"} registered successfully`,
        data: {
          impressionId: result.impression.id,
          userId: result.updatedUser.id,
          walletBalance: parseFloat(result.updatedUser.walletBalance.toFixed(4)),
          kind,
          cost,
          payoutAmount,
          durationSeconds: kind === "view" ? durationSeconds : 0,
          campaignId: campaign.id,
          campaignCompleted: result.completed,
        },
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error handling impression ingestion:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500, headers: corsHeaders },
    );
  }
}
