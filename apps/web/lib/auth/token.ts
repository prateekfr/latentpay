import { randomBytes, createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import prisma from "../prisma";

export type ClientKind = "extension" | "ide";

const TOKEN_PREFIX = "lpv1_";
const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000;
// Only extend expiry once a token is within this window of expiring — keeps
// refreshes rare (jumps back out to the full TTL) instead of on every request.
const REFRESH_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;
// Only bump `lastUsedAt` if it's gone stale by this much, so a hot path like
// impression submission doesn't take a DB write on every single call.
const LAST_USED_WRITE_INTERVAL_MS = 5 * 60 * 1000;

type TxClient = Prisma.TransactionClient;

export function tokenExpiry(): Date {
  return new Date(Date.now() + TOKEN_TTL_MS);
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateToken(): { raw: string; hash: string } {
  const raw = `${TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
  return { raw, hash: hashToken(raw) };
}

/** Mint and persist a new token for a user, inside an existing transaction. */
export async function mintToken(tx: TxClient, userId: string, clientKind: ClientKind): Promise<string> {
  const { raw, hash } = generateToken();
  await tx.authToken.create({
    data: { tokenHash: hash, userId, clientKind, expiresAt: tokenExpiry() },
  });
  return raw;
}

export interface VerifiedToken {
  tokenId: string;
  userId: string;
  clientKind: string;
}

/**
 * Extracts and validates the `Authorization: Bearer <token>` header against
 * stored token hashes. Returns null on any failure (missing header, unknown
 * hash, expired, revoked) — callers should treat null as a generic 401,
 * never distinguishing *why* to a client (avoids leaking which tokens exist).
 */
export async function verifyBearerToken(request: Request): Promise<VerifiedToken | null> {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;

  const raw = header.slice("Bearer ".length).trim();
  if (!raw) return null;

  const record = await prisma.authToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!record || record.revokedAt || record.expiresAt < new Date()) return null;

  touchToken(record).catch(() => {
    // Best-effort bookkeeping — never fail the request over this.
  });

  return { tokenId: record.id, userId: record.userId, clientKind: record.clientKind };
}

async function touchToken(record: { id: string; lastUsedAt: Date | null; expiresAt: Date }): Promise<void> {
  const now = new Date();
  const lastUsedStale =
    !record.lastUsedAt || now.getTime() - record.lastUsedAt.getTime() > LAST_USED_WRITE_INTERVAL_MS;
  const nearExpiry = record.expiresAt.getTime() - now.getTime() < REFRESH_THRESHOLD_MS;

  if (!lastUsedStale && !nearExpiry) return;

  await prisma.authToken.update({
    where: { id: record.id },
    data: {
      lastUsedAt: now,
      ...(nearExpiry ? { expiresAt: tokenExpiry() } : {}),
    },
  });
}

export async function revokeToken(tokenId: string): Promise<void> {
  await prisma.authToken.update({ where: { id: tokenId }, data: { revokedAt: new Date() } });
}
