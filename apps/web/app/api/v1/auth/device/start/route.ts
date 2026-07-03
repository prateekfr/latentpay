import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "../../../../../../lib/prisma";
import { checkRateLimit, getClientIp } from "../../../../../../lib/rateLimit";

// Unambiguous alphabet — no 0/O or 1/I/L confusion when read off a screen.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const EXPIRES_MS = 10 * 60 * 1000;
const START_RATE_LIMIT = 10;
const START_RATE_WINDOW_MS = 60 * 1000;

function generateUserCode(): string {
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CODE_ALPHABET[bytes.readUInt8(i) % CODE_ALPHABET.length];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

function readClientKind(value: unknown): string | undefined {
  return value === "extension" || value === "ide" ? value : undefined;
}

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(`device-start:${getClientIp(request)}`, START_RATE_LIMIT, START_RATE_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const clientKind = readClientKind((body as Record<string, unknown>)?.clientKind);

    let userCode = generateUserCode();
    for (let attempts = 0; attempts < 5; attempts++) {
      const existing = await prisma.deviceAuthRequest.findUnique({ where: { userCode } });
      if (!existing) break;
      userCode = generateUserCode();
    }

    const deviceRequest = await prisma.deviceAuthRequest.create({
      data: {
        userCode,
        clientKind,
        expiresAt: new Date(Date.now() + EXPIRES_MS),
      },
    });

    const origin = new URL(request.url).origin;
    const verificationUrl = new URL(`${origin}/sign-in/device`);
    verificationUrl.searchParams.set("code", userCode);
    if (clientKind) verificationUrl.searchParams.set("client", clientKind);

    return NextResponse.json({
      deviceCode: deviceRequest.id,
      userCode,
      verificationUrl: verificationUrl.toString(),
      expiresInSeconds: EXPIRES_MS / 1000,
      pollIntervalMs: 2000,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}
