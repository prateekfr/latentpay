import { describe, expect, it, vi } from "vitest";
import { pollDeviceFlow, startDeviceFlow } from "../src/auth/deviceFlow";

function fakeFetch(status: number, body: unknown): typeof fetch {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch;
}

describe("startDeviceFlow", () => {
  it("parses a successful start response", async () => {
    const fetchImpl = fakeFetch(200, {
      deviceCode: "secret-device-code",
      userCode: "WDJB-4F2K",
      verificationUrl: "http://localhost:3000/dashboard?device=WDJB-4F2K",
      expiresInSeconds: 600,
      pollIntervalMs: 2000,
    });
    const result = await startDeviceFlow("http://localhost:3000", fetchImpl);
    expect(result).toEqual({
      deviceCode: "secret-device-code",
      userCode: "WDJB-4F2K",
      verificationUrl: "http://localhost:3000/dashboard?device=WDJB-4F2K",
      expiresInSeconds: 600,
      pollIntervalMs: 2000,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/auth/device/start",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ clientKind: "ide" }),
      }),
    );
  });

  it("returns null on a non-2xx response", async () => {
    const fetchImpl = fakeFetch(500, { error: "boom" });
    expect(await startDeviceFlow("http://localhost:3000", fetchImpl)).toBeNull();
  });

  it("returns null when the response is missing required fields", async () => {
    const fetchImpl = fakeFetch(200, { deviceCode: "x" });
    expect(await startDeviceFlow("http://localhost:3000", fetchImpl)).toBeNull();
  });

  it("returns null when the network call throws", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    expect(await startDeviceFlow("http://localhost:3000", fetchImpl)).toBeNull();
  });
});

describe("pollDeviceFlow", () => {
  it("reports pending", async () => {
    const fetchImpl = fakeFetch(200, { status: "pending" });
    const result = await pollDeviceFlow("http://localhost:3000", "device-code", fetchImpl);
    expect(result).toEqual({ status: "pending" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/auth/device/poll",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ deviceCode: "device-code" }),
      }),
    );
  });

  it("reports approved with the bearer token", async () => {
    const fetchImpl = fakeFetch(200, { status: "approved", token: "lpv1_abc123" });
    const result = await pollDeviceFlow("http://localhost:3000", "device-code", fetchImpl);
    expect(result).toEqual({ status: "approved", token: "lpv1_abc123" });
  });

  it("reports expired", async () => {
    const fetchImpl = fakeFetch(200, { status: "expired" });
    const result = await pollDeviceFlow("http://localhost:3000", "device-code", fetchImpl);
    expect(result).toEqual({ status: "expired" });
  });

  it("treats a network error as pending rather than throwing", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    const result = await pollDeviceFlow("http://localhost:3000", "device-code", fetchImpl);
    expect(result).toEqual({ status: "pending" });
  });

  it("treats a non-2xx response as pending", async () => {
    const fetchImpl = fakeFetch(500, { error: "boom" });
    const result = await pollDeviceFlow("http://localhost:3000", "device-code", fetchImpl);
    expect(result).toEqual({ status: "pending" });
  });
});
