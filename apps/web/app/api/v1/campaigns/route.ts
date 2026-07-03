import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "../../../../lib/prisma";
import {
  BLOCK_SIZE,
  MIN_BID_PER_BLOCK,
  isDeliverySpeed,
  isSurface,
  recomputeSurface,
} from "../../../../lib/auction";
import { serializeCampaign } from "../../../../lib/campaigns";

const MAX_ICON_BYTES = 64 * 1024;

function validateCreatePayload(body: unknown) {
  if (typeof body !== "object" || body === null) return "Invalid request body.";
  const b = body as Record<string, unknown>;

  if (typeof b.email !== "string" || !/^\S+@\S+\.\S+$/.test(b.email)) {
    return "A valid email is required.";
  }
  if (typeof b.adLine !== "string" || b.adLine.length < 3 || b.adLine.length > 60) {
    return "Ad line must be 3-60 characters.";
  }
  if (typeof b.targetUrl !== "string" || !/^https:\/\/.+/.test(b.targetUrl)) {
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
  if (typeof b.showOnLeaderboard !== "boolean") {
    return "Invalid leaderboard preference.";
  }
  if (!isSurface(b.surface)) {
    return "Invalid surface.";
  }
  if (!isDeliverySpeed(b.deliverySpeed)) {
    return "Invalid delivery speed.";
  }
  if (typeof b.bidPerBlock !== "number" || !Number.isFinite(b.bidPerBlock) || b.bidPerBlock < MIN_BID_PER_BLOCK) {
    return `Bid per block must be at least $${MIN_BID_PER_BLOCK.toFixed(2)}.`;
  }
  if (typeof b.numBlocks !== "number" || !Number.isInteger(b.numBlocks) || b.numBlocks < 1) {
    return "Number of blocks must be a positive integer.";
  }
  return null;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { advertiserId: userId },
    orderBy: { createdAt: "desc" },
  });
  const spendByCampaign = await prisma.impression.groupBy({
    by: ["campaignId"],
    where: { campaign: { advertiserId: userId } },
    _sum: { cost: true },
  });
  const spendMap = new Map(spendByCampaign.map((s) => [s.campaignId, s._sum.cost ?? 0]));

  return NextResponse.json({
    campaigns: campaigns.map((c) => serializeCampaign(c, spendMap.get(c.id) ?? 0)),
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await request.json();
  const error = validateCreatePayload(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const b = body as {
    email: string;
    adLine: string;
    targetUrl: string;
    companyName?: string | null;
    brandIconUrl?: string | null;
    showOnLeaderboard: boolean;
    surface: string;
    deliverySpeed: string;
    bidPerBlock: number;
    numBlocks: number;
  };

  const advertiser = await prisma.advertiser.findUnique({ where: { id: userId } });
  if (!advertiser) {
    return NextResponse.json({ error: "Advertiser account not found." }, { status: 404 });
  }

  // Soft affordability gate: catches the common case early with a clear
  // message. Not a hard reservation (clicks are priced above numBlocks'
  // nominal budget and aren't capped by it either way) — the real
  // enforcement is the balance floor check at impression time.
  const committedBudget = b.bidPerBlock * b.numBlocks;
  if (advertiser.balance < committedBudget) {
    return NextResponse.json(
      {
        error: `This campaign could cost up to $${committedBudget.toFixed(2)}; your balance is $${advertiser.balance.toFixed(2)}. Add funds first.`,
      },
      { status: 400 },
    );
  }

  const campaign = await prisma.$transaction(async (tx) => {
    if (b.email !== advertiser.email) {
      await tx.advertiser.update({ where: { id: userId }, data: { email: b.email } });
    }

    const created = await tx.campaign.create({
      data: {
        advertiserId: userId,
        adLine: b.adLine,
        targetUrl: b.targetUrl,
        companyName: b.companyName || null,
        brandIconUrl: b.brandIconUrl || null,
        showOnLeaderboard: b.showOnLeaderboard,
        surface: b.surface,
        deliverySpeed: b.deliverySpeed,
        bidPerBlock: b.bidPerBlock,
        numBlocks: b.numBlocks,
        viewsPurchased: b.numBlocks * BLOCK_SIZE,
        status: "queued",
      },
    });

    await recomputeSurface(tx, b.surface as Parameters<typeof recomputeSurface>[1]);

    return created;
  });

  return NextResponse.json({ campaign: serializeCampaign(campaign, 0) }, { status: 201 });
}
