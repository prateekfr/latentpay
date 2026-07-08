import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { verifyBearerToken } from "../../../../../lib/auth/token";

// Lets a linked device (extension/IDE) read its own owner's live balance
// without ever seeing another user's data — auth is the bearer token itself,
// same as the impression-ingestion endpoint, never a client-supplied userId.
export async function GET(request: Request) {
  const verified = await verifyBearerToken(request);
  if (!verified) {
    return NextResponse.json(
      { error: "Missing or invalid bearer token. Sign in via the extension/IDE popup first." },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: verified.userId } });
  if (!user) {
    return NextResponse.json({ walletBalance: 0, earningsToday: 0 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayAgg = await prisma.impression.aggregate({
    where: { userId: verified.userId, createdAt: { gte: startOfDay } },
    _sum: { payoutAmount: true },
  });

  return NextResponse.json({
    walletBalance: user.walletBalance,
    earningsToday: todayAgg._sum.payoutAmount ?? 0,
  });
}
