import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

const WINDOWS = ["24h", "all"] as const;
type Window = (typeof WINDOWS)[number];

function isWindow(value: unknown): value is Window {
  return typeof value === "string" && (WINDOWS as readonly string[]).includes(value);
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const window: Window = isWindow(searchParams.get("window")) ? (searchParams.get("window") as Window) : "24h";

  const cutoff = window === "24h" ? new Date(Date.now() - DAY_MS) : undefined;
  const viewWhere = { kind: "view", ...(cutoff ? { createdAt: { gte: cutoff } } : {}) };

  const [overall, hourCount, allTimeViewCount, byCampaign] = await Promise.all([
    prisma.impression.aggregate({ where: viewWhere, _sum: { cost: true }, _count: { _all: true } }),
    prisma.impression.count({ where: { kind: "view", createdAt: { gte: new Date(Date.now() - HOUR_MS) } } }),
    prisma.impression.count({ where: { kind: "view" } }),
    prisma.impression.groupBy({
      by: ["campaignId"],
      where: viewWhere,
      _sum: { cost: true },
      _count: { _all: true },
    }),
  ]);

  const totalViews = overall._count._all;
  const totalCost = overall._sum.cost ?? 0;
  const marketPrice = totalViews > 0 ? (totalCost / totalViews) * 1000 : 0;

  const campaignIds = byCampaign.map((b) => b.campaignId);
  const campaigns = campaignIds.length
    ? await prisma.campaign.findMany({
        where: { id: { in: campaignIds }, showOnLeaderboard: true },
        select: { id: true, adLine: true, companyName: true, targetUrl: true, brandIconUrl: true },
      })
    : [];
  const campaignById = new Map(campaigns.map((c) => [c.id, c]));

  const leaderboard = byCampaign
    .map((b) => {
      const campaign = campaignById.get(b.campaignId);
      if (!campaign) return null;
      const views = b._count._all;
      const cost = b._sum.cost ?? 0;
      return {
        id: campaign.id,
        adLine: campaign.adLine,
        companyName: campaign.companyName,
        targetUrl: campaign.targetUrl,
        brandIconUrl: campaign.brandIconUrl,
        views,
        pricePerK: views > 0 ? (cost / views) * 1000 : 0,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.pricePerK - a.pricePerK)
    .slice(0, 15);

  return NextResponse.json({
    window,
    marketPrice,
    impressionsPerHour: hourCount,
    totalImpressions: allTimeViewCount,
    leaderboard,
  });
}
