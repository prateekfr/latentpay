import { describe, expect, it, beforeEach, vi } from "vitest";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  it("allows requests within the limit", () => {
    expect(checkRateLimit("key-a", 3, 1000)).toBe(true);
    expect(checkRateLimit("key-a", 3, 1000)).toBe(true);
    expect(checkRateLimit("key-a", 3, 1000)).toBe(true);
  });

  it("blocks once the limit is exceeded within the window", () => {
    checkRateLimit("key-b", 2, 1000);
    checkRateLimit("key-b", 2, 1000);
    expect(checkRateLimit("key-b", 2, 1000)).toBe(false);
  });

  it("resets after the window elapses", () => {
    checkRateLimit("key-c", 1, 1000);
    expect(checkRateLimit("key-c", 1, 1000)).toBe(false);
    vi.setSystemTime(1001);
    expect(checkRateLimit("key-c", 1, 1000)).toBe(true);
  });

  it("tracks independent keys separately", () => {
    checkRateLimit("key-d", 1, 1000);
    expect(checkRateLimit("key-d", 1, 1000)).toBe(false);
    expect(checkRateLimit("key-e", 1, 1000)).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers the first x-forwarded-for entry", () => {
    const req = new Request("http://example.com", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://example.com", { headers: { "x-real-ip": "198.51.100.7" } });
    expect(getClientIp(req)).toBe("198.51.100.7");
  });

  it("fails open to 'unknown' when no proxy header is present", () => {
    const req = new Request("http://example.com");
    expect(getClientIp(req)).toBe("unknown");
  });
});
