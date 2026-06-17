import prisma from "../../lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function AdvertiserPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="max-w-6xl mx-auto w-full px-6 py-12 text-zinc-400 font-mono">
        Unauthorized access. Please sign in.
      </div>
    );
  }
  const advertiserId = userId;

  // Auto-seed mock advertiser if not exists
  await prisma.advertiser.upsert({
    where: { id: advertiserId },
    update: {},
    create: {
      id: advertiserId,
      companyName: "Acme Corp Sponsors",
      balance: 500.0,
    },
  });

  // Check and seed active mock campaign if none exist for this advertiser
  const campaignsCheck = await prisma.campaign.findMany({
    where: { advertiserId },
  });

  if (campaignsCheck.length === 0) {
    await prisma.campaign.create({
      data: {
        id: `campaign-${advertiserId}`,
        advertiserId: advertiserId,
        adCopy: "Scale your LLM apps dynamically with Acme API",
        targetUrl: "https://acme.com",
        isActive: true,
      },
    });
  }

  // Fetch the advertiser details
  const advertiser = await prisma.advertiser.findUnique({
    where: { id: advertiserId },
  });

  // Fetch all campaigns for this advertiser with impression counts
  const campaigns = await prisma.campaign.findMany({
    where: { advertiserId },
    include: {
      _count: {
        select: { impressions: true },
      },
    },
    orderBy: { id: "asc" },
  });

  const balance = advertiser ? advertiser.balance : 0.0;
  const companyName = advertiser
    ? advertiser.companyName
    : "Acme Corp Sponsors";

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-12 flex flex-col gap-8 animate-fade-in bg-[#131315]">
      {/* Campaigns Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Campaigns
        </h1>
        <p className="text-sm text-zinc-400">
          Manage your AI monetization streams and active ad deployments for{" "}
          <span className="text-indigo-400 font-semibold">{companyName}</span>.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Overview & Active Campaigns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Budget Bento Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden group mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                  Available Budget
                </span>
                <div className="text-4xl md:text-5xl font-black tracking-tight text-white">
                  ${balance.toFixed(2)}
                </div>
              </div>
              <div className="flex gap-4">
                <button className="bg-surface-container hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-lg font-semibold text-xs uppercase transition-colors border border-white/5">
                  Add Funds
                </button>
                <button className="bg-white/5 hover:bg-white/10 text-on-surface px-4 py-2 rounded-lg font-semibold text-xs uppercase transition-colors border border-white/5">
                  Transaction History
                </button>
              </div>
            </div>
          </div>

          {/* Active Campaigns Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                Active Deployments
              </h2>
              <span className="material-symbols-outlined text-zinc-500 cursor-pointer hover:text-white transition-colors">
                filter_list
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              {campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <span className="text-sm font-semibold text-white">
                    No active campaigns
                  </span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-surface-container-lowest/50 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Campaign Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Spend</th>
                      <th className="px-6 py-4 text-right">Impressions</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm divide-y divide-white/5 text-zinc-300">
                    {campaigns.map((camp) => {
                      const spend = camp._count.impressions * 0.015;
                      return (
                        <tr
                          key={camp.id}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-sm">
                                  rocket_launch
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-white font-body-md text-body-md">
                                  {camp.adCopy}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  {camp.id} • {camp.targetUrl}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {camp.isActive ? (
                              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-container/20 text-primary font-semibold text-xs">
                                <div className="w-2 h-2 rounded-full bg-primary active-dot"></div>
                                Live
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-500 font-semibold text-xs border border-zinc-700">
                                <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                                Paused
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right text-on-surface">
                            ${spend.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-on-surface">
                            {camp._count.impressions.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Create Campaign Form */}
        <div className="lg:col-span-4">
          <div className="glass-card rounded-2xl p-6 h-full flex flex-col glow-hover transition-all duration-300">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">
                Create Campaign
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Launch a new targeted ad stream across the Aether network.
              </p>
            </div>

            <form className="space-y-6 flex-grow flex flex-col">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                  Campaign Name
                </label>
                <div className="relative glow-border rounded-lg transition-all duration-300">
                  <input
                    disabled
                    className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-0 focus:border-transparent text-sm shadow-inner opacity-50 select-none cursor-not-allowed"
                    placeholder="e.g., Winter AI Summit"
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <span>Daily Budget</span>
                  <span className="text-primary font-bold">Max $500</span>
                </div>
                <div className="relative glow-border rounded-lg transition-all duration-300 flex items-center bg-[#0F172A] border border-white/10 px-4 py-3 shadow-inner opacity-50 select-none cursor-not-allowed">
                  <span className="text-zinc-500 mr-2">$</span>
                  <input
                    disabled
                    className="w-full bg-transparent border-none p-0 text-white placeholder-zinc-600 focus:ring-0 text-sm font-mono cursor-not-allowed"
                    placeholder="0.00"
                    type="number"
                  />
                </div>
              </div>

              {/* Creative Upload Banner warning standard */}
              <div className="space-y-2 mt-auto pt-6 border-t border-white/5">
                <label className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    image
                  </span>
                  Creative Asset Required
                </label>
                <div className="border-2 border-dashed border-primary/40 rounded-lg p-6 text-center hover:bg-primary/5 transition-colors cursor-not-allowed group">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mx-auto mb-3">
                    <span className="material-symbols-outlined">
                      upload_file
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white mb-1">
                    Upload Leaderboard Banner
                  </p>
                  {/* Standard strict size warning callout */}
                  <p className="text-xs font-mono text-primary opacity-90 font-semibold">
                    Strictly 728x90px (PNG, JPG)
                  </p>
                </div>
              </div>

              <button
                disabled
                className="btn-primary w-full py-3 rounded-lg mt-6 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                Initialize Campaign (MVP Locked)
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
