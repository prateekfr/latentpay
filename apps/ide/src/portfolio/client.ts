export interface AuctionCampaign {
  id: string;
  adLine: string;
  targetUrl: string;
  companyName: string | null;
  brandIconUrl: string | null;
  bidPerBlock: number;
  viewsDelivered: number;
  status: string;
}

/** The current winning campaign for a surface, from the real auction
 *  endpoint (`apps/web/app/api/v1/auction/[surface]/route.ts`) — no auth
 *  required, matches the response the advertiser portal's own BidQueue
 *  widget consumes. Returns null when nothing is currently serving (no
 *  advertiser live on this surface) or on any network/parse failure;
 *  never throws. */
export async function fetchCurrentAd(
  baseUrl: string,
  surface: string,
  fetchImpl: typeof fetch = fetch,
): Promise<AuctionCampaign | null> {
  try {
    const res = await fetchImpl(`${baseUrl}/api/v1/auction/${surface}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { campaigns?: AuctionCampaign[] };
    return json.campaigns?.[0] ?? null;
  } catch {
    return null;
  }
}
