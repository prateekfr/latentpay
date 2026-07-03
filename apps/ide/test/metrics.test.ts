import { describe, expect, it, vi } from "vitest";
import { submitImpression } from "../src/metrics/client";

function fakeFetch(status: number, body: unknown): typeof fetch {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch;
}

describe("submitImpression", () => {
  it("authenticates with a bearer token instead of a raw userId", async () => {
    const fetchImpl = fakeFetch(200, {
      success: true,
      data: { walletBalance: 0.05, payoutAmount: 0.01 },
    });
    const result = await submitImpression(
      "http://localhost:3000",
      "lpv1_test-token",
      "mock-campaign-abc",
      6.2,
      "event-1",
      fetchImpl,
    );
    expect(result).toEqual({ walletBalance: 0.05, payoutAmount: 0.01 });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/impressions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer lpv1_test-token" }),
        body: JSON.stringify({
          campaignId: "mock-campaign-abc",
          durationSeconds: 6.2,
          kind: "view",
          eventId: "event-1",
        }),
      }),
    );
  });

  it("returns null on a non-2xx response instead of throwing", async () => {
    const fetchImpl = fakeFetch(400, { error: "Invalid impression" });
    const result = await submitImpression(
      "http://localhost:3000",
      "lpv1_test-token",
      "mock-campaign-abc",
      1,
      "event-2",
      fetchImpl,
    );
    expect(result).toBeNull();
  });

  it("returns null when the network call throws", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    const result = await submitImpression(
      "http://localhost:3000",
      "lpv1_test-token",
      "mock-campaign-abc",
      1,
      "event-3",
      fetchImpl,
    );
    expect(result).toBeNull();
  });
});
