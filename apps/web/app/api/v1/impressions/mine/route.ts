import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "../../../../../lib/prisma";

const MAX_ROWS = 200;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const impressions = await prisma.impression.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
    include: { campaign: { select: { adLine: true, companyName: true } } },
  });

  return NextResponse.json({
    impressions: impressions.map((imp) => ({
      id: imp.id,
      adLine: imp.campaign.adLine,
      companyName: imp.campaign.companyName,
      durationSeconds: imp.durationSeconds,
      payoutAmount: imp.payoutAmount,
      createdAt: imp.createdAt.toISOString(),
    })),
  });
}
