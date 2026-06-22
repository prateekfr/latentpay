import prisma from "../../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import AdvertiserClient from "./AdvertiserClient";

export const dynamic = "force-dynamic";

export default async function AdvertiserPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-10 text-center max-w-sm mx-4 border border-white/[0.07]">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="font-display font-bold text-white text-xl mb-2">Sign in required</h2>
          <p className="text-white/40 text-sm">Please sign in to access the Advertiser Command Center.</p>
        </div>
      </div>
    );
  }

  const advertiserId = userId;

  await prisma.advertiser.upsert({
    where: { id: advertiserId },
    update: {},
    create: { id: advertiserId, companyName: "Acme Corp Sponsors", balance: 500.0 },
  });

  const campaignsCheck = await prisma.campaign.findMany({ where: { advertiserId } });
  if (campaignsCheck.length === 0) {
    await prisma.campaign.create({
      data: {
        id: `campaign-${advertiserId}`,
        advertiserId,
        adCopy: "Scale your LLM apps dynamically with Acme API",
        targetUrl: "https://acme.com",
        isActive: true,
      },
    });
  }

  const advertiser = await prisma.advertiser.findUnique({ where: { id: advertiserId } });
  const campaigns = await prisma.campaign.findMany({
    where: { advertiserId },
    include: { _count: { select: { impressions: true } } },
    orderBy: { id: "asc" },
  });

  return (
    <AdvertiserClient
      companyName={advertiser?.companyName ?? "Acme Corp Sponsors"}
      balance={advertiser?.balance ?? 0}
      campaigns={campaigns.map((c) => ({
        id: c.id,
        adCopy: c.adCopy,
        targetUrl: c.targetUrl,
        isActive: c.isActive,
        impressionCount: c._count.impressions,
        spend: c._count.impressions * 0.015,
      }))}
    />
  );
}
