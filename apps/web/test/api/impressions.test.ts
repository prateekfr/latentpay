import { describe, expect, it, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const mockTx = {
  advertiser: { updateMany: vi.fn() },
  campaign: { findMany: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
  impression: { create: vi.fn() },
  user: { update: vi.fn() },
};

const mockPrisma = {
  impression: { findUnique: vi.fn() },
  user: { findUnique: vi.fn(), upsert: vi.fn() },
  campaign: { findUnique: vi.fn(), findFirst: vi.fn() },
  $transaction: vi.fn(async (callback: (tx: typeof mockTx) => unknown) => callback(mockTx)),
};

vi.mock("../../lib/prisma", () => ({ default: mockPrisma }));

vi.mock("../../lib/auth/token", () => ({
  verifyBearerToken: vi.fn(),
}));

vi.mock("../../lib/rateLimit", () => ({
  checkRateLimit: vi.fn(() => true),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("../../lib/auction", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/auction")>();
  return { ...actual, recomputeSurface: vi.fn() };
});

const { POST } = await import("../../app/api/v1/impressions/route");
const { verifyBearerToken } = await import("../../lib/auth/token");
const { checkRateLimit } = await import("../../lib/rateLimit");

const VALID_TOKEN = { tokenId: "tok_1", userId: "user_1", clientKind: "extension" };

function makeRequest(body: unknown, authorization = "Bearer lpv1_valid"): Request {
  return new Request("http://example.com/api/v1/impressions", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(authorization ? { authorization } : {}) },
    body: JSON.stringify(body),
  });
}

const CAMPAIGN = {
  id: "camp_1",
  advertiserId: "adv_1",
  surface: "extension",
  bidPerBlock: 5.0,
  numBlocks: 100,
  viewsPurchased: 100000,
  viewsDelivered: 0,
  status: "serving",
};

describe("POST /api/v1/impressions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback) => callback(mockTx));
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (verifyBearerToken as ReturnType<typeof vi.fn>).mockResolvedValue(VALID_TOKEN);
    mockPrisma.impression.findUnique.mockResolvedValue(null);
    mockPrisma.user.upsert.mockResolvedValue({ id: "user_1", walletBalance: 0 });
    mockPrisma.campaign.findUnique.mockResolvedValue(CAMPAIGN);
  });

  it("rejects requests with no bearer token", async () => {
    (verifyBearerToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(makeRequest({ campaignId: "camp_1", durationSeconds: 6, eventId: "e1" }, ""));
    expect(res.status).toBe(401);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects requests with an invalid/expired bearer token", async () => {
    (verifyBearerToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(makeRequest({ campaignId: "camp_1", durationSeconds: 6, eventId: "e1" }));
    expect(res.status).toBe(401);
  });

  it("rate-limits once the per-token/IP threshold is exceeded", async () => {
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const res = await POST(makeRequest({ campaignId: "camp_1", durationSeconds: 6, eventId: "e1" }));
    expect(res.status).toBe(429);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("requires an eventId", async () => {
    const res = await POST(makeRequest({ campaignId: "camp_1", durationSeconds: 6 }));
    expect(res.status).toBe(400);
  });

  it("rejects and pauses campaigns when the advertiser can't afford it, without creating an impression or crediting the wallet", async () => {
    mockTx.advertiser.updateMany.mockResolvedValue({ count: 0 });
    mockTx.campaign.findMany.mockResolvedValue([{ surface: "extension" }]);

    const res = await POST(makeRequest({ campaignId: "camp_1", durationSeconds: 6, eventId: "e1" }));

    expect(res.status).toBe(409);
    expect(mockTx.impression.create).not.toHaveBeenCalled();
    expect(mockTx.user.update).not.toHaveBeenCalled();
    expect(mockTx.campaign.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "paused" } }),
    );
  });

  it("records a view impression and credits the wallet on the happy path", async () => {
    mockTx.advertiser.updateMany.mockResolvedValue({ count: 1 });
    mockTx.impression.create.mockResolvedValue({ id: "imp_1" });
    mockTx.user.update.mockResolvedValue({ id: "user_1", walletBalance: 0.0025 });

    const res = await POST(makeRequest({ campaignId: "camp_1", durationSeconds: 6, eventId: "e1" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.walletBalance).toBeCloseTo(0.0025);
    expect(mockTx.impression.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user_1", campaignId: "camp_1", eventId: "e1" }),
      }),
    );
  });

  it("replays a duplicate eventId instead of double-crediting", async () => {
    mockPrisma.impression.findUnique.mockResolvedValue({
      id: "imp_1",
      userId: "user_1",
      kind: "view",
      cost: 0.005,
      payoutAmount: 0.0025,
      durationSeconds: 6,
      campaignId: "camp_1",
    });
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user_1", walletBalance: 0.0025 });

    const res = await POST(makeRequest({ campaignId: "camp_1", durationSeconds: 6, eventId: "e1" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toMatch(/already recorded/i);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("treats a concurrent duplicate-eventId race (unique constraint violation) as a replay, not a 500", async () => {
    mockTx.advertiser.updateMany.mockResolvedValue({ count: 1 });
    mockTx.impression.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "6.2.0",
      }),
    );
    // After losing the race, the route re-reads the row the other request created.
    mockPrisma.impression.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "imp_1",
      userId: "user_1",
      kind: "view",
      cost: 0.005,
      payoutAmount: 0.0025,
      durationSeconds: 6,
      campaignId: "camp_1",
    });
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user_1", walletBalance: 0.0025 });

    const res = await POST(makeRequest({ campaignId: "camp_1", durationSeconds: 6, eventId: "e1" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toMatch(/already recorded/i);
  });
});
