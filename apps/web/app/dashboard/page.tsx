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

  const walletBalance = user ? user.walletBalance : 0.0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8 animate-fade-in">
      {/* Dashboard Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Earnings Console
        </h1>
        <p className="text-sm text-zinc-400">
          Track your passive ad impressions, view history, and manage accrued
          balance.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earnings Card */}
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col justify-between shadow-lg hover:border-zinc-700/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-400">
              Total Earnings
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-white">
              ${walletBalance.toFixed(4)}
            </span>
            <span className="ml-1.5 text-xs font-semibold text-zinc-500">
              USD
            </span>
          </div>
          <div className="mt-3 text-xs text-zinc-500 leading-relaxed">
            Earned passively during LLM query wait times
          </div>
        </div>

        {/* Valid Impressions Card */}
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col justify-between shadow-lg hover:border-zinc-700/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-400">
              Valid Impressions
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-white">
              {impressionsCount}
            </span>
            <span className="ml-1.5 text-xs font-semibold text-zinc-500">
              runs
            </span>
          </div>
          <div className="mt-3 text-xs text-zinc-500 leading-relaxed">
            Ad durations validated for &gt;= 5.0 seconds
          </div>
        </div>

        {/* Base Payout Rate Card */}
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col justify-between shadow-lg hover:border-zinc-700/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-400">
              Average Rate
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-white">
              $0.0100
            </span>
            <span className="ml-1.5 text-xs font-semibold text-zinc-500">
              / query
            </span>
          </div>
          <div className="mt-3 text-xs text-zinc-500 leading-relaxed">
            Flat-rate reward allocation per session
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-white">Recent Impressions</h3>
          <p className="text-xs text-zinc-400">
            Ledger audits showing latest validated sponsorship durations.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-lg">
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
              <div className="mt-6 flex flex-col gap-2 text-left rounded-lg border border-zinc-800 bg-[#07070d] p-4 text-xs text-zinc-400">
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
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="py-3.5 px-6">Impression ID</th>
                    <th className="py-3.5 px-6">Sponsor Campaign</th>
                    <th className="py-3.5 px-6 text-right">View Duration</th>
                    <th className="py-3.5 px-6 text-right">Payout Credit</th>
                    <th className="py-3.5 px-6 text-right">Logged At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-sm">
                  {impressions.map((imp) => (
                    <tr
                      key={imp.id}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono text-xs text-zinc-500">
                        {imp.id.slice(0, 12)}...
                      </td>
                      <td className="py-4 px-6 font-medium text-zinc-300">
                        {imp.campaignId}
                      </td>
                      <td className="py-4 px-6 text-right text-zinc-300">
                        {imp.durationSeconds.toFixed(2)}s
                      </td>
                      <td className="py-4 px-6 text-right text-emerald-400 font-semibold">
                        +${imp.payoutAmount.toFixed(4)}
                      </td>
                      <td className="py-4 px-6 text-right text-xs text-zinc-500">
                        {new Date(imp.createdAt).toLocaleTimeString()} (
                        {new Date(imp.createdAt).toLocaleDateString()})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
