import { describe, expect, it, vi, beforeEach } from "vitest";

const mockAuthToken = {
  findUnique: vi.fn(),
  update: vi.fn(),
};

vi.mock("../../lib/prisma", () => ({
  default: { authToken: mockAuthToken },
}));

const { verifyBearerToken, hashToken, generateToken, revokeToken, mintToken } = await import(
  "../../lib/auth/token"
);

function makeRequest(authHeader?: string): Request {
  return new Request("http://example.com", {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

describe("generateToken / hashToken", () => {
  it("produces a raw token whose hash matches hashToken(raw)", () => {
    const { raw, hash } = generateToken();
    expect(raw.startsWith("lpv1_")).toBe(true);
    expect(hashToken(raw)).toBe(hash);
  });

  it("produces different tokens on each call", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a.raw).not.toBe(b.raw);
  });
});

describe("verifyBearerToken", () => {
  beforeEach(() => {
    mockAuthToken.findUnique.mockReset();
    mockAuthToken.update.mockReset().mockResolvedValue({});
  });

  it("returns null when there is no Authorization header", async () => {
    expect(await verifyBearerToken(makeRequest())).toBeNull();
  });

  it("returns null when the header isn't a Bearer token", async () => {
    expect(await verifyBearerToken(makeRequest("Basic abc123"))).toBeNull();
  });

  it("returns null when the token hash isn't found", async () => {
    mockAuthToken.findUnique.mockResolvedValue(null);
    expect(await verifyBearerToken(makeRequest("Bearer lpv1_unknown"))).toBeNull();
  });

  it("returns null for a revoked token", async () => {
    mockAuthToken.findUnique.mockResolvedValue({
      id: "tok_1",
      userId: "user_1",
      clientKind: "extension",
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 100_000),
      lastUsedAt: null,
    });
    expect(await verifyBearerToken(makeRequest("Bearer lpv1_revoked"))).toBeNull();
  });

  it("returns null for an expired token", async () => {
    mockAuthToken.findUnique.mockResolvedValue({
      id: "tok_1",
      userId: "user_1",
      clientKind: "extension",
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1000),
      lastUsedAt: null,
    });
    expect(await verifyBearerToken(makeRequest("Bearer lpv1_expired"))).toBeNull();
  });

  it("returns the verified identity for a valid token", async () => {
    mockAuthToken.findUnique.mockResolvedValue({
      id: "tok_1",
      userId: "user_1",
      clientKind: "extension",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 100_000),
      lastUsedAt: null,
    });
    const result = await verifyBearerToken(makeRequest("Bearer lpv1_valid"));
    expect(result).toEqual({ tokenId: "tok_1", userId: "user_1", clientKind: "extension" });
  });

  it("never throws even if the best-effort lastUsedAt write rejects", async () => {
    mockAuthToken.findUnique.mockResolvedValue({
      id: "tok_1",
      userId: "user_1",
      clientKind: "extension",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 100_000),
      lastUsedAt: null,
    });
    mockAuthToken.update.mockRejectedValue(new Error("db down"));
    await expect(verifyBearerToken(makeRequest("Bearer lpv1_valid"))).resolves.toEqual({
      tokenId: "tok_1",
      userId: "user_1",
      clientKind: "extension",
    });
  });
});

describe("mintToken", () => {
  it("creates an AuthToken row via the given transaction client and returns the raw token", async () => {
    const create = vi.fn().mockResolvedValue({});
    const tx = { authToken: { create } } as unknown as Parameters<typeof mintToken>[0];

    const raw = await mintToken(tx, "user_1", "ide");

    expect(raw.startsWith("lpv1_")).toBe(true);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tokenHash: hashToken(raw),
          userId: "user_1",
          clientKind: "ide",
        }),
      }),
    );
  });
});

describe("revokeToken", () => {
  it("sets revokedAt on the given token id", async () => {
    mockAuthToken.update.mockResolvedValue({});
    await revokeToken("tok_1");
    expect(mockAuthToken.update).toHaveBeenCalledWith({
      where: { id: "tok_1" },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
