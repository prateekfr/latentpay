import prisma from "../../lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { assignRole, readRole } from "../../lib/role";
import { serializeCampaign } from "../../lib/campaigns";
import AdvertiserClient from "./AdvertiserClient";
import type { CampaignDTO } from "./types";

export const dynamic = "force-dynamic";

const DEFAULT_SURFACE = "extension" as const;

export default async function AdvertiserPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-surface rounded-2xl p-10 text-center max-w-sm mx-4">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="font-display font-bold text-white text-xl mb-2">Sign in required</h2>
          <p className="text-white/40 text-sm">Please sign in to access the Campaign Portal.</p>
        </div>
      </div>
    );
  }

  const clerkUser = await currentUser();
  const role = readRole(clerkUser);

  if (role === "earner") {
    redirect("/dashboard");
  }
  if (!role) {
    await assignRole(userId, "advertiser");
  }

  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? "";

  const advertiser = await prisma.advertiser.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, companyName: "My Company", email, balance: 500.0 },
  });

  const campaigns = await prisma.campaign.findMany({
    where: { advertiserId: userId },
    orderBy: { createdAt: "desc" },
  });

  const spendByCampaign = await prisma.impression.groupBy({
    by: ["campaignId"],
    where: { campaign: { advertiserId: userId } },
    _sum: { cost: true },
  });
  const spendMap = new Map(spendByCampaign.map((s) => [s.campaignId, s._sum.cost ?? 0]));

  const bidQueue = await prisma.campaign.findMany({
    where: {
      surface: DEFAULT_SURFACE,
      showOnLeaderboard: true,
      status: { in: ["serving", "queued"] },
    },
    orderBy: [{ bidPerBlock: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      adLine: true,
      companyName: true,
      brandIconUrl: true,
      bidPerBlock: true,
      viewsDelivered: true,
      status: true,
    },
  });

  const campaignDTOs: CampaignDTO[] = campaigns.map(
    (c) => serializeCampaign(c, spendMap.get(c.id) ?? 0) as CampaignDTO,
  );

  return (
    <AdvertiserClient
      email={advertiser.email || email}
      companyName={advertiser.companyName}
      balance={advertiser.balance}
      campaigns={campaignDTOs}
      initialSurface={DEFAULT_SURFACE}
      initialBidQueue={bidQueue.map((c) => ({ ...c, status: c.status as CampaignDTO["status"] }))}
    />
  );
}
