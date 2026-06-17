import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, campaignId, durationSeconds } = body;

    // Payload validation
    if (!userId || !campaignId || typeof durationSeconds !== "number") {
      return NextResponse.json(
        {
          error:
            "Missing or invalid parameters. Requires userId (string), campaignId (string), durationSeconds (number).",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    if (durationSeconds < 5.0) {
      return NextResponse.json(
        { error: "Invalid impression. Duration must be at least 5 seconds." },
        { status: 400, headers: corsHeaders },
      );
    }

    // Auto-seed user if not exists (facilitates MVP manual testing)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, walletBalance: 0.0 },
    });

    // Auto-seed campaign/advertiser if campaign does not exist
    let campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      const advertiserId = "default-advertiser";
      await prisma.advertiser.upsert({
        where: { id: advertiserId },
        update: {},
        create: { id: advertiserId, companyName: "LatentPay Mock Sponsor" },
      });

      campaign = await prisma.campaign.create({
        data: {
          id: campaignId,
          advertiserId: advertiserId,
          adCopy: "Support free LLM queries with LatentPay",
          targetUrl: "https://latentpay.com",
          isActive: true,
        },
      });
    }

    const payoutAmount = 0.01;

    // Transactional write: save impression and update user ledger balance
    const [impression, updatedUser] = await prisma.$transaction([
      prisma.impression.create({
        data: {
          userId,
          campaignId,
          durationSeconds,
          payoutAmount,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: payoutAmount,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Impression registered successfully",
        data: {
          impressionId: impression.id,
          userId: updatedUser.id,
          walletBalance: parseFloat(updatedUser.walletBalance.toFixed(4)),
          payoutAmount,
          durationSeconds,
        },
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error handling impression ingestion:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500, headers: corsHeaders },
    );
  }
}
