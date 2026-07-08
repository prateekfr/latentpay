import prisma from "../../lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { assignRole, readRole } from "../../lib/role";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-surface rounded-2xl p-10 text-center max-w-sm mx-4">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="font-display font-bold text-white text-xl mb-2">Sign in required</h2>
          <p className="text-white/40 text-sm">Please sign in to view your earnings dashboard.</p>
        </div>
      </div>
    );
  }

  const clerkUser = await currentUser();
  const role = readRole(clerkUser);

  if (role === "advertiser") {
    redirect("/advertiser");
  }
  if (!role) {
    await assignRole(userId, "earner");
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
    include: { campaign: { select: { adLine: true, companyName: true } } },
  });

  const impressionsCount = await prisma.impression.count({ where: { userId } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const impressionsTodayCount = await prisma.impression.count({
    where: { userId, createdAt: { gte: today } },
  });
  const todayAgg = await prisma.impression.aggregate({
    where: { userId, createdAt: { gte: today } },
    _sum: { payoutAmount: true },
  });

  // Real 7-day activity, bucketed by calendar day — replaces what used to be
  // a hardcoded fake chart shown identically to every user.
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const weekImpressions = await prisma.impression.findMany({
    where: { userId, createdAt: { gte: sevenDaysAgo } },
    select: { payoutAmount: true, createdAt: true },
  });
  const dailyTotals = Array<number>(7).fill(0);
  const dailyLabels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    dailyLabels.push(d.toLocaleDateString(undefined, { weekday: "narrow" }));
  }
  for (const imp of weekImpressions) {
    const dayIndex = Math.floor((imp.createdAt.getTime() - sevenDaysAgo.getTime()) / 86_400_000);
    if (dayIndex >= 0 && dayIndex < 7) dailyTotals[dayIndex] = (dailyTotals[dayIndex] ?? 0) + imp.payoutAmount;
  }
  const weekTotal = dailyTotals.reduce((s, v) => s + v, 0);
  const maxDaily = Math.max(...dailyTotals);
  const chartBars = dailyTotals.map((v) => (maxDaily > 0 ? v / maxDaily : 0));

  // "Active right now" = an impression in the last 10 minutes, not "ever had
  // one impression, once" — the latter isn't actually "live."
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentActivityCount = await prisma.impression.count({
    where: { userId, createdAt: { gte: tenMinutesAgo } },
  });

  const earningsToday      = todayAgg._sum.payoutAmount ?? 0;
  const walletBalance      = user.walletBalance;
  // Honest extrapolation from real trailing-week earnings — no fabricated
  // floor. A brand-new account shows $0.00, not a fake "$45.20."
  const monthlyEst         = (weekTotal / 7) * 30;
  const activeStreamsCount = recentActivityCount > 0 ? 1 : 0;

  return (
    <DashboardClient
      userId={userId}
      walletBalance={walletBalance}
      earningsToday={earningsToday}
      impressionsCount={impressionsCount}
      impressionsTodayCount={impressionsTodayCount}
      monthlyEst={monthlyEst}
      weekTotal={weekTotal}
      activeStreamsCount={activeStreamsCount}
      chartBars={chartBars}
      chartLabels={dailyLabels}
      impressions={impressions.map((imp) => ({
        id: imp.id,
        adLine: imp.campaign.adLine,
        companyName: imp.campaign.companyName,
        durationSeconds: imp.durationSeconds,
        payoutAmount: imp.payoutAmount,
        createdAt: imp.createdAt.toISOString(),
      }))}
    />
  );
}
