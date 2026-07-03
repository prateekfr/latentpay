export interface ImpressionResult {
  walletBalance: number;
  payoutAmount: number;
}

/** POST to `/api/v1/impressions`, authenticated with the bearer token minted
 *  by the device-auth flow (see `auth/deviceFlow.ts` and `auth/tokenStore.ts`)
 *  rather than a raw userId — the server resolves identity from the token,
 *  never from client-supplied data. `fetchImpl` is injectable for tests;
 *  never throws (a failed/errored request resolves to null so callers can
 *  stay resilient). */
export async function submitImpression(
  baseUrl: string,
  token: string,
  campaignId: string,
  durationSeconds: number,
  eventId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ImpressionResult | null> {
  try {
    const res = await fetchImpl(`${baseUrl}/api/v1/impressions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ campaignId, durationSeconds, kind: "view", eventId }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { walletBalance?: number; payoutAmount?: number };
    };
    return {
      walletBalance: json.data?.walletBalance ?? 0,
      payoutAmount: json.data?.payoutAmount ?? 0,
    };
  } catch {
    return null;
  }
}
