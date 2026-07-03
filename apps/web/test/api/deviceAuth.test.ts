import { describe, expect, it, vi, beforeEach } from "vitest";

const mockPrisma = {
  deviceAuthRequest: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  user: { upsert: vi.fn() },
  $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback(mockPrisma)),
};

vi.mock("../../lib/prisma", () => ({ default: mockPrisma }));

vi.mock("../../lib/rateLimit", () => ({
  checkRateLimit: vi.fn(() => true),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("../../lib/auth/token", () => ({
  mintToken: vi.fn(async () => "lpv1_minted-token"),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock("../../lib/role", () => ({
  readRole: vi.fn(() => null),
  assignRole: vi.fn(),
}));

const { POST: startDevice } = await import("../../app/api/v1/auth/device/start/route");
const { POST: pollDevice } = await import("../../app/api/v1/auth/device/poll/route");
const { POST: approveDevice } = await import("../../app/api/v1/auth/device/approve/route");
const { checkRateLimit } = await import("../../lib/rateLimit");
const { mintToken } = await import("../../lib/auth/token");
const { auth } = await import("@clerk/nextjs/server");

function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/auth/device/start", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
    mockPrisma.deviceAuthRequest.findUnique.mockResolvedValue(null);
    mockPrisma.deviceAuthRequest.create.mockResolvedValue({ id: "device_1" });
  });

  it("creates a device request and returns a verification URL carrying the clientKind", async () => {
    const res = await startDevice(jsonRequest("http://localhost:3000/api/v1/auth/device/start", { clientKind: "ide" }));
    const body = await res.json();

    expect(body.deviceCode).toBe("device_1");
    expect(body.verificationUrl).toContain("client=ide");
    expect(mockPrisma.deviceAuthRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ clientKind: "ide" }) }),
    );
  });

  it("is rate-limited per IP", async () => {
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const res = await startDevice(jsonRequest("http://localhost:3000/api/v1/auth/device/start", {}));
    expect(res.status).toBe(429);
  });
});

describe("POST /api/v1/auth/device/poll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue(true);
    mockPrisma.$transaction.mockImplementation(async (callback) => callback(mockPrisma));
    mockPrisma.user.upsert.mockResolvedValue({});
    mockPrisma.deviceAuthRequest.update.mockResolvedValue({});
  });

  it("reports pending while not yet approved", async () => {
    mockPrisma.deviceAuthRequest.findUnique.mockResolvedValue({
      id: "device_1",
      status: "pending",
      userId: null,
      expiresAt: new Date(Date.now() + 100_000),
      consumedAt: null,
      clientKind: "extension",
    });
    const res = await pollDevice(jsonRequest("http://localhost:3000/api/v1/auth/device/poll", { deviceCode: "device_1" }));
    const body = await res.json();
    expect(body).toEqual({ status: "pending" });
    expect(mintToken).not.toHaveBeenCalled();
  });

  it("reports expired once past expiresAt", async () => {
    mockPrisma.deviceAuthRequest.findUnique.mockResolvedValue({
      id: "device_1",
      status: "pending",
      userId: null,
      expiresAt: new Date(Date.now() - 1000),
      consumedAt: null,
      clientKind: "extension",
    });
    const res = await pollDevice(jsonRequest("http://localhost:3000/api/v1/auth/device/poll", { deviceCode: "device_1" }));
    expect(await res.json()).toEqual({ status: "expired" });
  });

  it("mints a token exactly once on pickup and marks the request consumed", async () => {
    mockPrisma.deviceAuthRequest.findUnique.mockResolvedValue({
      id: "device_1",
      status: "approved",
      userId: "user_1",
      expiresAt: new Date(Date.now() + 100_000),
      consumedAt: null,
      clientKind: "ide",
    });

    const res = await pollDevice(jsonRequest("http://localhost:3000/api/v1/auth/device/poll", { deviceCode: "device_1" }));
    const body = await res.json();

    expect(body).toEqual({ status: "approved", token: "lpv1_minted-token" });
    expect(mintToken).toHaveBeenCalledWith(mockPrisma, "user_1", "ide");
    expect(mockPrisma.deviceAuthRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ consumedAt: expect.any(Date) }) }),
    );
  });

  it("is single-use: a device code already consumed reports expired, not approved again", async () => {
    mockPrisma.deviceAuthRequest.findUnique.mockResolvedValue({
      id: "device_1",
      status: "approved",
      userId: "user_1",
      expiresAt: new Date(Date.now() + 100_000),
      consumedAt: new Date(),
      clientKind: "extension",
    });
    const res = await pollDevice(jsonRequest("http://localhost:3000/api/v1/auth/device/poll", { deviceCode: "device_1" }));
    expect(await res.json()).toEqual({ status: "expired" });
    expect(mintToken).not.toHaveBeenCalled();
  });
});

describe("POST /api/v1/auth/device/approve", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.deviceAuthRequest.findUnique.mockResolvedValue({
      id: "device_1",
      userCode: "ABCD-1234",
      expiresAt: new Date(Date.now() + 100_000),
      consumedAt: null,
    });
    mockPrisma.deviceAuthRequest.update.mockResolvedValue({});
  });

  it("requires a signed-in Clerk session", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as unknown as Awaited<ReturnType<typeof auth>>);
    const res = await approveDevice(
      jsonRequest("http://localhost:3000/api/v1/auth/device/approve", { userCode: "ABCD-1234" }),
    );
    expect(res.status).toBe(401);
    expect(mockPrisma.deviceAuthRequest.update).not.toHaveBeenCalled();
  });

  it("approves the request for the signed-in user", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1" } as unknown as Awaited<ReturnType<typeof auth>>);
    const res = await approveDevice(
      jsonRequest("http://localhost:3000/api/v1/auth/device/approve", { userCode: "ABCD-1234" }),
    );
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockPrisma.deviceAuthRequest.update).toHaveBeenCalledWith({
      where: { userCode: "ABCD-1234" },
      data: { status: "approved", userId: "user_1" },
    });
  });
});
