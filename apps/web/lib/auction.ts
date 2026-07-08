import type { Prisma } from "@prisma/client";

export const SURFACES = ["extension", "terminal"] as const;
export type Surface = (typeof SURFACES)[number];

export const DELIVERY_SPEEDS = ["slow", "medium", "fast"] as const;
export type DeliverySpeed = (typeof DELIVERY_SPEEDS)[number];

export const CAMPAIGN_STATUSES = ["serving", "queued", "paused", "completed"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const BLOCK_SIZE = 1000;
export const MIN_BID_PER_BLOCK = 0.5;
export const MIN_BID_TO_LEAD = 1.0;

// Revenue split: the developer whose machine showed the ad keeps this share
// of every dollar an advertiser is charged (views and clicks alike).
export const EARNER_SHARE = 0.5;
// A click is a much higher-intent event than a view, so it's billed as a
// multiple of the campaign's per-impression price — on top of, not capped
// by, the campaign's purchased view blocks.
export const CLICK_MULTIPLIER = 50;

export const EVENT_KINDS = ["view", "click"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export function isEventKind(value: unknown): value is EventKind {
  return typeof value === "string" && (EVENT_KINDS as readonly string[]).includes(value);
}

/** Full price charged to the advertiser for one impression at this campaign's bid. */
export function viewPrice(bidPerBlock: number): number {
  return bidPerBlock / BLOCK_SIZE;
}

/** Full price charged to the advertiser for one click at this campaign's bid. */
export function clickPrice(bidPerBlock: number): number {
  return viewPrice(bidPerBlock) * CLICK_MULTIPLIER;
}

export function isSurface(value: unknown): value is Surface {
  return typeof value === "string" && (SURFACES as readonly string[]).includes(value);
}

export function isDeliverySpeed(value: unknown): value is DeliverySpeed {
  return typeof value === "string" && (DELIVERY_SPEEDS as readonly string[]).includes(value);
}

type TxClient = Prisma.TransactionClient;

/**
 * Re-ranks a single surface's auction: among campaigns still competing for it
 * ("serving" or "queued", with budget left), the highest bidder (ties broken
 * by earliest createdAt) becomes "serving" and everyone else becomes "queued".
 * Call inside a transaction after any mutation that could change ranking:
 * campaign create, pause/resume, bid edit, delete, or a campaign completing.
 */
export async function recomputeSurface(tx: TxClient, surface: Surface): Promise<void> {
  const contenders = await tx.campaign.findMany({
    where: { surface, status: { in: ["serving", "queued"] } },
    orderBy: [{ bidPerBlock: "desc" }, { createdAt: "asc" }],
  });

  const leader = contenders[0];
  if (!leader) return;
  const rest = contenders.slice(1);

  if (leader.status !== "serving") {
    await tx.campaign.update({ where: { id: leader.id }, data: { status: "serving" } });
  }

  for (const c of rest) {
    if (c.status !== "queued") {
      await tx.campaign.update({ where: { id: c.id }, data: { status: "queued" } });
    }
  }
}
