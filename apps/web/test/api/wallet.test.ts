import { describe, expect, it, vi, beforeEach } from "vitest";

const mockPrisma = {
  user: { findUnique: vi.fn() },
  impression: { aggregate: vi.fn() },
};

vi.mock("../../lib/prisma", () => ({ default: mockPrisma }));

vi.mock("../../lib/auth/token", () => ({
  verifyBearerToken: vi.fn(),
}));

const { GET } = await import("../../app/api/v1/wallet/me/route");
const { verifyBearerToken } = await import("../../lib/auth/token");

const VALID_TOKEN = { tokenId: "tok_1", userId: "user_1", clientKind: "extension" };

function makeRequest(authorization = "Bearer lpv1_valid"): Request {
  return new Request("http://example.com/api/v1/wallet/me", {
    headers: authorization ? { authorization } : {},
  });
}

describe("GET /api/v1/wallet/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (verifyBearerToken as ReturnType<typeof vi.fn>).mockResolvedValue(VALID_TOKEN);
    mockPrisma.impression.aggregate.mockResolvedValue({ _sum: { payoutAmount: 0.014 } });
  });

  it("rejects requests with no bearer token", async () => {
    (verifyBearerToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(401);
  });

  it("returns zeroed balance for a token whose user row hasn't been created yet", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await GET(makeRequest());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({ walletBalance: 0, earningsToday: 0 });
  });

  it("returns the live wallet balance and today's earnings for the token's owner", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user_1", walletBalance: 1.2345 });
    const res = await GET(makeRequest());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.walletBalance).toBeCloseTo(1.2345);
    expect(body.earningsToday).toBeCloseTo(0.014);
    expect(mockPrisma.impression.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: "user_1" }) }),
    );
  });

  it("defaults today's earnings to 0 when there are no impressions yet", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user_1", walletBalance: 0 });
    mockPrisma.impression.aggregate.mockResolvedValue({ _sum: { payoutAmount: null } });
    const res = await GET(makeRequest());
    const body = await res.json();
    expect(body.earningsToday).toBe(0);
  });
});
