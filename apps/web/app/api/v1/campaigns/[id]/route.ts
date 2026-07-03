import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "../../../../../lib/prisma";
import { MIN_BID_PER_BLOCK, isDeliverySpeed, recomputeSurface, type Surface } from "../../../../../lib/auction";
import { campaignSpend, serializeCampaign } from "../../../../../lib/campaigns";

const MAX_ICON_BYTES = 64 * 1024;

type Params = { params: Promise<{ id: string }> };

function validatePatchPayload(body: unknown) {
  if (typeof body !== "object" || body === null) return "Invalid request body.";
  const b = body as Record<string, unknown>;

  if (b.adLine !== undefined && (typeof b.adLine !== "string" || b.adLine.length < 3 || b.adLine.length > 60)) {
    return "Ad line must be 3-60 characters.";
  }
  if (b.targetUrl !== undefined && (typeof b.targetUrl !== "string" || !/^https:\/\/.+/.test(b.targetUrl))) {
    return "Destination URL must start with https://.";
  }
  if (b.companyName !== undefined && b.companyName !== null && typeof b.companyName !== "string") {
    return "Invalid company name.";
  }
  if (b.brandIconUrl !== undefined && b.brandIconUrl !== null) {
    if (typeof b.brandIconUrl !== "string" || !b.brandIconUrl.startsWith("data:image/")) {
      return "Brand icon must be an image data URI.";
    }
    const base64 = b.brandIconUrl.split(",")[1] ?? "";
    const approxBytes = Math.ceil((base64.length * 3) / 4);
    if (approxBytes > MAX_ICON_BYTES) {
      return "Brand icon must be 64KB or smaller.";
    }
  }
  if (b.showOnLeaderboard !== undefined && typeof b.showOnLeaderboard !== "boolean") {
    return "Invalid leaderboard preference.";
  }
  if (b.deliverySpeed !== undefined && !isDeliverySpeed(b.deliverySpeed)) {
    return "Invalid delivery speed.";
  }
  if (
    b.bidPerBlock !== undefined &&
    (typeof b.bidPerBlock !== "number" || !Number.isFinite(b.bidPerBlock) || b.bidPerBlock < MIN_BID_PER_BLOCK)
  ) {
    return `Bid per block must be at least $${MIN_BID_PER_BLOCK.toFixed(2)}.`;
  }
  if (b.status !== undefined && b.status !== "paused" && b.status !== "queued") {
    return "Status can only be set to 'paused' or 'queued' (resume) by the advertiser.";
  }
  return null;
}

export async function PATCH(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing || existing.advertiserId !== userId) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  }

  const body = await request.json();
  const error = validatePatchPayload(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const b = body as {
    adLine?: string;
    targetUrl?: string;
    companyName?: string | null;
    brandIconUrl?: string | null;
    showOnLeaderboard?: boolean;
    deliverySpeed?: string;
    bidPerBlock?: number;
    status?: "paused" | "queued";
  };

  if (existing.status === "completed" && b.status === "queued") {
    return NextResponse.json({ error: "This campaign has already completed." }, { status: 400 });
  }

  // Same soft affordability gate as campaign creation, re-checked here so an
  // advertiser can't dodge it by editing around it — only matters on resume
  // or a bid increase, since those are the only edits that raise committed spend.
  const resuming = b.status === "queued" && existing.status !== "queued" && existing.status !== "serving";
  const bidIncreasing = b.bidPerBlock !== undefined && b.bidPerBlock > existing.bidPerBlock;
  if (resuming || bidIncreasing) {
    const advertiser = await prisma.advertiser.findUnique({ where: { id: userId } });
    const committedBudget = (b.bidPerBlock ?? existing.bidPerBlock) * existing.numBlocks;
    if (!advertiser || advertiser.balance < committedBudget) {
      return NextResponse.json(
        {
          error: `This campaign could cost up to $${committedBudget.toFixed(2)}; your balance is $${(advertiser?.balance ?? 0).toFixed(2)}. Add funds first.`,
        },
        { status: 400 },
      );
    }
  }

  const campaign = await prisma.$transaction(async (tx) => {
    const updated = await tx.campaign.update({
      where: { id },
      data: {
        adLine: b.adLine,
        targetUrl: b.targetUrl,
        companyName: b.companyName === undefined ? undefined : b.companyName || null,
        brandIconUrl: b.brandIconUrl === undefined ? undefined : b.brandIconUrl || null,
        showOnLeaderboard: b.showOnLeaderboard,
        deliverySpeed: b.deliverySpeed,
        bidPerBlock: b.bidPerBlock,
        status: b.status,
      },
    });

    await recomputeSurface(tx, updated.surface as Surface);

    const spend = await campaignSpend(tx, updated.id);

    return serializeCampaign(updated, spend);
  });

  return NextResponse.json({ campaign });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing || existing.advertiserId !== userId) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.campaign.delete({ where: { id } });
    await recomputeSurface(tx, existing.surface as Surface);
  });

  return NextResponse.json({ success: true });
}
