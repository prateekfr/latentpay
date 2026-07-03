import { describe, expect, it, vi } from "vitest";
import { fetchCurrentAd } from "../src/portfolio/client";

function fakeFetch(status: number, body: unknown): typeof fetch {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch;
}

describe("fetchCurrentAd", () => {
  it("returns the top campaign for the surface", async () => {
    const campaign = {
      id: "camp_1",
      adLine: "hey im back",
      targetUrl: "https://google.com",
      companyName: "google",
      brandIconUrl: "data:image/png;base64,abc",
      bidPerBlock: 1.03,
      viewsDelivered: 12,
      status: "serving",
    };
    const fetchImpl = fakeFetch(200, { surface: "terminal", topBid: 1.03, campaigns: [campaign] });
    const result = await fetchCurrentAd("http://localhost:3000", "terminal", fetchImpl);
    expect(result).toEqual(campaign);
    expect(fetchImpl).toHaveBeenCalledWith("http://localhost:3000/api/v1/auction/terminal");
  });

  it("returns null when no campaign is currently serving", async () => {
    const fetchImpl = fakeFetch(200, { surface: "terminal", topBid: 0, campaigns: [] });
    expect(await fetchCurrentAd("http://localhost:3000", "terminal", fetchImpl)).toBeNull();
  });

  it("returns null on a non-2xx response", async () => {
    const fetchImpl = fakeFetch(500, { error: "boom" });
    expect(await fetchCurrentAd("http://localhost:3000", "terminal", fetchImpl)).toBeNull();
  });

  it("returns null when the network call throws", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    expect(await fetchCurrentAd("http://localhost:3000", "terminal", fetchImpl)).toBeNull();
  });
});
