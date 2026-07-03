import type { Campaign, Prisma } from "@prisma/client";

/**
 * Real lifetime spend for one campaign — summed from every Impression's
 * actual charged `cost`, not derived from `viewsDelivered * bidPerBlock`
 * (which would misrepresent history if the bid was edited after some events
 * already billed at the old price, and would ignore click spend entirely).
 */
export async function campaignSpend(db: Prisma.TransactionClient, campaignId: string): Promise<number> {
  const agg = await db.impression.aggregate({
    where: { campaignId },
    _sum: { cost: true },
  });
  return agg._sum.cost ?? 0;
}

export function serializeCampaign(c: Campaign, spend: number) {
  return {
    id: c.id,
    adLine: c.adLine,
    targetUrl: c.targetUrl,
    companyName: c.companyName,
    brandIconUrl: c.brandIconUrl,
    showOnLeaderboard: c.showOnLeaderboard,
    surface: c.surface,
    deliverySpeed: c.deliverySpeed,
    bidPerBlock: c.bidPerBlock,
    numBlocks: c.numBlocks,
    viewsPurchased: c.viewsPurchased,
    viewsDelivered: c.viewsDelivered,
    clicksDelivered: c.clicksDelivered,
    spend,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  };
}
