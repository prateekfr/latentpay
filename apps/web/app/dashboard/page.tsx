import prisma from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = "mock-user-123";

  // Fetch user balance details
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Fetch the 5 most recent impressions
  const impressions = await prisma.impression.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch the total count of valid impressions
  const impressionsCount = await prisma.impression.count({
    where: { userId },
  });

  // Calculate today's earnings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const impressionsTodayCount = await prisma.impression.count({
    where: {
      userId,
      createdAt: {
        gte: today,
      },
    },
  });
  const earningsToday = impressionsTodayCount * 0.01;

  const walletBalance = user ? user.walletBalance : 0.0;

  // Projection estimations
  const monthlyEst = Math.max(walletBalance * 15, 45.2).toFixed(2);
  const pendingPayout = Math.max(walletBalance * 0.15, 12.5).toFixed(2);
  const activeStreamsCount = impressionsCount > 0 ? 1 : 0;

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-12 flex flex-col gap-8 animate-fade-in bg-[#131315]">
      {/* Dashboard Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Earnings Overview
        </h1>
        <p className="text-sm text-zinc-400">
          Track your AI monetization performance in real-time.
        </p>
      </header>

      {/* Hero Section & Stats Grid Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Balance Card */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden group glow-active">
          {/* Decorative background elements */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-700"></div>
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-secondary/5 rounded-full blur-[60px]"></div>

          <div className="relative z-10">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 block">
              Available Balance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-black tracking-tight text-white">
                ${walletBalance.toFixed(4)}
              </span>
              <span className="text-sm font-semibold text-zinc-500">USD</span>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <span className="material-symbols-outlined text-emerald-400 text-sm">
                trending_up
              </span>
              <span className="text-emerald-400 font-mono text-xs font-medium">
                +${earningsToday.toFixed(4)} today
              </span>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
          {/* Stat 1 */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:bg-white/5 transition-colors duration-300">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Monthly Est.
              </span>
              <span className="material-symbols-outlined text-zinc-500 text-sm">
                calendar_month
              </span>
            </div>
            <div className="mt-4 text-xl font-bold text-white">
              ${monthlyEst}
            </div>
          </div>

          {/* Stat 2 */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:bg-white/5 transition-colors duration-300">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Pending Payout
              </span>
              <span className="material-symbols-outlined text-zinc-500 text-sm">
                schedule
              </span>
            </div>
            <div className="mt-4 text-xl font-bold text-white">
              ${pendingPayout}
            </div>
          </div>

          {/* Stat 3 */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:bg-white/5 transition-colors duration-300 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Active Streams
              </span>
              {activeStreamsCount > 0 ? (
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
              ) : (
                <span className="w-3 h-3 rounded-full bg-zinc-700"></span>
              )}
            </div>
            <div className="mt-4 text-xl font-bold text-white relative z-10">
              {activeStreamsCount}
            </div>
            <div className="absolute -bottom-4 -right-4 text-primary/5">
              <span className="material-symbols-outlined !text-6xl">
                router
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass-card rounded-2xl overflow-hidden mt-4">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Recent Earnings</h3>
          <button className="text-primary text-xs font-bold uppercase hover:text-primary-fixed transition-colors">
            View All
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          {impressions.length === 0 ? (
            /* Zero State View */
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 mb-4 animate-bounce">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-white">
                No transactions logged
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-relaxed">
                Start earning by prompting ChatGPT while running your LatentPay
                extension.
              </p>
              <div className="mt-6 flex flex-col gap-2 text-left rounded-lg border border-white/5 bg-black/20 p-4 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">
                  Quick Guide:
                </span>
                <span>1. Open ChatGPT and input a complex prompt.</span>
                <span>2. Observe the sponsor overlay tick to 5s.</span>
                <span>3. End generation to register passive rewards.</span>
              </div>
            </div>
          ) : (
            /* Ledger Table List */
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-high/30 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Source / Stream</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm divide-y divide-white/5 text-zinc-300">
                {impressions.map((imp) => (
                  <tr
                    key={imp.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      {new Date(imp.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-sm">
                            smart_toy
                          </span>
                        </div>
                        <span className="text-white font-medium">
                          {imp.campaignId} ({imp.durationSeconds.toFixed(1)}s)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-container/10 text-primary font-semibold text-[10px] uppercase border border-primary/20">
                        Ad View
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-bold">
                      +${imp.payoutAmount.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
