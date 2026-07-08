import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { checkRateLimit, getClientIp } from "../../../../../../lib/rateLimit";
import { mintToken, type ClientKind } from "../../../../../../lib/auth/token";

const POLL_RATE_LIMIT = 60;
const POLL_RATE_WINDOW_MS = 60 * 1000;

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(`device-poll:${getClientIp(request)}`, POLL_RATE_LIMIT, POLL_RATE_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }

    const body = await request.json();
    const { deviceCode } = body;
    if (!deviceCode || typeof deviceCode !== "string") {
      return NextResponse.json({ error: "Missing deviceCode" }, { status: 400 });
    }

    const record = await prisma.deviceAuthRequest.findUnique({ where: { id: deviceCode } });
    if (!record || record.expiresAt < new Date() || record.consumedAt) {
      return NextResponse.json({ status: "expired" });
    }

    if (record.status !== "approved" || !record.userId) {
      return NextResponse.json({ status: "pending" });
    }

    // Picking up the approval is what mints the actual credential — approval
    // itself only resolves *who*; a bare userId is never handed to the
    // client, only an opaque bearer token whose hash is what's stored.
    // Single-use: a leaked/reused device code can't be replayed once the
    // client has already picked up the approval.
    const userId = record.userId;
    const clientKind: ClientKind = record.clientKind === "ide" ? "ide" : "extension";

    const token = await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, walletBalance: 0.0 },
      });

      const raw = await mintToken(tx, userId, clientKind);

      await tx.deviceAuthRequest.update({
        where: { id: deviceCode },
        data: { consumedAt: new Date() },
      });

      return raw;
    });

    return NextResponse.json({ status: "approved", token });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}
