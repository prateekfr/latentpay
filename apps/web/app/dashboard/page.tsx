import prisma from "../../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-10 text-center max-w-sm mx-4 border border-white/[0.07]">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="font-display font-bold text-white text-xl mb-2">Sign in required</h2>
          <p className="text-white/40 text-sm">Please sign in to view your earnings dashboard.</p>
        </div>
      </div>
    );
  }

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, walletBalance: 0.0 },
  });

  const impressions = await prisma.impression.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const impressionsCount = await prisma.impression.count({ where: { userId } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const impressionsTodayCount = await prisma.impression.count({
    where: { userId, createdAt: { gte: today } },
  });

  const earningsToday     = impressionsTodayCount * 0.01;
  const walletBalance     = user.walletBalance;
  const monthlyEst        = Math.max(walletBalance * 15, 45.2);
  const pendingPayout     = Math.max(walletBalance * 0.15, 12.5);
  const activeStreamsCount = impressionsCount > 0 ? 1 : 0;

  return (
    <DashboardClient
      userId={userId}
      walletBalance={walletBalance}
      earningsToday={earningsToday}
      impressionsCount={impressionsCount}
      impressionsTodayCount={impressionsTodayCount}
      monthlyEst={monthlyEst}
      pendingPayout={pendingPayout}
      activeStreamsCount={activeStreamsCount}
      impressions={impressions.map((imp) => ({
        id: imp.id,
        campaignId: imp.campaignId,
        durationSeconds: imp.durationSeconds,
        payoutAmount: imp.payoutAmount,
        createdAt: imp.createdAt.toISOString(),
      }))}
    />
  );
}
