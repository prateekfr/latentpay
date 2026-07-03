import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { isSurface } from "../../../../../lib/auction";

type Params = { params: Promise<{ surface: string }> };

// Consumed cross-origin by the Chrome extension's content script (running on
// chatgpt.com/claude.ai/gemini.google.com) and the VS Code extension host —
// neither is same-origin with this app, so this needs the same CORS
// treatment as /api/v1/impressions, or the browser silently drops the
// response and the client never sees a live campaign.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(_request: Request, { params }: Params) {
  const { surface } = await params;

  if (!isSurface(surface)) {
    return NextResponse.json({ error: "Unknown surface." }, { status: 400, headers: corsHeaders });
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      surface,
      showOnLeaderboard: true,
      status: { in: ["serving", "queued"] },
    },
    orderBy: [{ bidPerBlock: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      adLine: true,
      targetUrl: true,
      companyName: true,
      brandIconUrl: true,
      bidPerBlock: true,
      viewsDelivered: true,
      status: true,
    },
  });

  const topBid = campaigns[0]?.bidPerBlock ?? 0;

  return NextResponse.json({ surface, topBid, campaigns }, { headers: corsHeaders });
}
