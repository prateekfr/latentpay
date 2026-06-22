"use client";

import { motion } from "framer-motion";
import SectionReveal from "../../components/ui/SectionReveal";
import AnimatedCounter from "../../components/ui/AnimatedCounter";

interface Campaign {
  id: string;
  adCopy: string;
  targetUrl: string;
  isActive: boolean;
  impressionCount: number;
  spend: number;
}

interface Props {
  companyName: string;
  balance: number;
  campaigns: Campaign[];
}

const PLATFORMS = ["ChatGPT", "Claude", "Perplexity", "Gemini"];

export default function AdvertiserClient({ companyName, balance, campaigns }: Props) {
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressionCount, 0);
  const totalSpend       = campaigns.reduce((s, c) => s + c.spend, 0);
  const activeCampaigns  = campaigns.filter((c) => c.isActive).length;
  const estCPM           = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;

  return (
    <div className="min-h-screen bg-[#07070d] pt-24 pb-20 px-4">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ─── Header ───────────────────────────────── */}
        <SectionReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="tag tag-amber mb-2 inline-flex">Command Center</span>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-white">
                Campaigns
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Managing ad streams for{" "}
                <span className="text-amber-400 font-semibold">{companyName}</span>
              </p>
            </div>
            <div className="flex gap-3 self-start sm:self-auto">
              <button className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-semibold">
                Transaction History
              </button>
              <button className="btn-gradient px-5 py-2.5 rounded-xl text-sm font-semibold">
                + New Campaign
              </button>
            </div>
          </div>
        </SectionReveal>

        {/* ─── KPI row ──────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Ad Budget", value: balance, prefix: "$", decimals: 2, icon: "💰", color: "amber" },
            { label: "Total Spend", value: totalSpend, prefix: "$", decimals: 2, icon: "📤", color: "pink" },
            { label: "Impressions", value: totalImpressions, prefix: "", decimals: 0, icon: "👁", color: "cyan" },
            { label: "Avg CPM", value: estCPM, prefix: "$", decimals: 2, icon: "📈", color: "purple" },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="glass glass-hover rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/30 uppercase tracking-wider font-mono">{kpi.label}</span>
                <span className="text-lg">{kpi.icon}</span>
              </div>
              <div className={`font-display font-bold text-2xl gradient-text`}>
                <AnimatedCounter
                  value={kpi.value}
                  prefix={kpi.prefix}
                  decimals={kpi.decimals}
                  duration={1.8}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Budget hero + live preview ───────────── */}
        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Budget card (3/5) */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3 glass rounded-2xl p-8 relative overflow-hidden border border-amber-500/20"
            style={{ boxShadow: "0 0 50px rgba(245,158,11,0.08)" }}
          >
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full glow-breathe"
              style={{ background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)" }} />

            <div className="relative z-10">
              <span className="tag tag-amber mb-4 inline-flex">Available Budget</span>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display font-black text-5xl text-white tracking-tight">
                  $<AnimatedCounter value={balance} decimals={2} duration={2} />
                </span>
                <span className="text-white/30 font-mono text-sm">USD</span>
              </div>

              {/* Budget spend ring visual */}
              <div className="flex items-center gap-5 mb-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="rotate-[-90deg] w-full h-full">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="url(#spendGrad)" strokeWidth="3"
                      strokeDasharray={`${Math.min((totalSpend / balance) * 100, 100)} 100`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="spendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white font-mono">
                      {balance > 0 ? ((totalSpend / balance) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-pink-500" />
                    <span className="text-white/40">Spent: </span>
                    <span className="text-white font-mono">${totalSpend.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-white/10" />
                    <span className="text-white/40">Remaining: </span>
                    <span className="text-white font-mono">${(balance - totalSpend).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="btn-gradient flex-1 py-2.5 rounded-xl text-sm font-semibold">
                  Add Funds
                </button>
                <button className="btn-ghost flex-1 py-2.5 rounded-xl text-sm font-semibold">
                  History
                </button>
              </div>
            </div>
          </motion.div>

          {/* Live ad preview (2/5) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 glass rounded-2xl overflow-hidden border border-white/[0.07]"
          >
            <div className="p-4 border-b border-white/[0.05]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 font-mono uppercase tracking-wider">Live Preview</span>
                <span className="tag tag-purple">728×90px</span>
              </div>
            </div>

            {/* Browser mockup */}
            <div className="p-4 bg-[#0a0a12] space-y-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                <div className="ml-2 flex-1 bg-white/[0.03] rounded px-2 py-1 text-[10px] text-white/20 font-mono">
                  chatgpt.com
                </div>
              </div>

              <div className="glass rounded-lg p-3 border border-violet-500/15" style={{ boxShadow: "0 0 15px rgba(139,92,246,0.08)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="tag tag-purple" style={{ fontSize: "9px", padding: "1px 5px" }}>Sponsored</span>
                  <span className="text-[9px] text-white/25 font-mono">during LLM latency</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {campaigns[0]?.adCopy ?? "Your ad copy here"}
                    </p>
                    <p className="text-[9px] text-white/35 truncate mt-0.5">
                      {campaigns[0]?.targetUrl ?? "your-site.com"}
                    </p>
                  </div>
                  <button className="flex-shrink-0 bg-violet-600 text-white text-[9px] font-bold px-2 py-1 rounded">
                    Learn →
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {PLATFORMS.map((p) => (
                  <span key={p} className="text-[9px] text-white/30 font-mono border border-white/[0.06] px-1.5 py-0.5 rounded">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Campaigns table ───────────────────────── */}
        <SectionReveal delay={0.05}>
          <div className="glass rounded-2xl overflow-hidden border border-white/[0.07]">
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-bold text-white text-lg">Active Deployments</h3>
                <span className="tag tag-green">{activeCampaigns} live</span>
              </div>
            </div>

            {campaigns.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-white/40 text-sm">No campaigns yet. Create your first one above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px]">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      {["Campaign", "Status", "Platforms", "Impressions", "Spend", "CPM"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs text-white/30 uppercase tracking-wider font-mono">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                      {campaigns.map((camp, i) => {
                        const cpm = camp.impressionCount > 0
                          ? (camp.spend / camp.impressionCount) * 1000
                          : 0;
                        return (
                          <motion.tr
                            key={camp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                            className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-sm flex-shrink-0">
                                    🚀
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm text-white font-medium truncate max-w-[180px]">
                                      {camp.adCopy}
                                    </p>
                                    <p className="text-xs text-white/30 font-mono truncate max-w-[180px]">
                                      {camp.targetUrl}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {camp.isActive ? (
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-ring-green" />
                                    <span className="tag tag-green">Live</span>
                                  </div>
                                ) : (
                                  <span className="tag" style={{ background: "rgba(100,100,100,0.1)", borderColor: "rgba(100,100,100,0.2)", color: "#6b7280" }}>
                                    Paused
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-1">
                                  {PLATFORMS.slice(0, 2).map((p) => (
                                    <span key={p} className="text-[9px] font-mono text-white/30 border border-white/[0.06] px-1.5 py-0.5 rounded">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-sm text-white/70">
                                {camp.impressionCount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 font-mono text-sm gradient-text-amber font-semibold">
                                ${camp.spend.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 font-mono text-sm text-white/50">
                                ${cpm.toFixed(2)}
                              </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                </table>
              </div>
            )}
          </div>
        </SectionReveal>

        {/* ─── Create Campaign (MVP locked) ─────────── */}
        <SectionReveal delay={0.1}>
          <div className="glass rounded-2xl p-8 border border-white/[0.07] relative overflow-hidden">
            {/* Lock overlay */}
            <div className="absolute inset-0 bg-[#07070d]/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-3">
              <div className="glass-2 rounded-2xl px-8 py-5 text-center border border-amber-500/20">
                <div className="text-3xl mb-2">🔒</div>
                <p className="font-display font-semibold text-white">Campaign Builder</p>
                <p className="text-xs text-white/40 mt-1">Available in next release · Beta Q3 2025</p>
                <button className="btn-gradient mt-4 px-6 py-2 rounded-lg text-sm font-semibold">
                  Join Waitlist
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 opacity-30 pointer-events-none select-none">
              <div>
                <h2 className="font-display font-bold text-xl text-white mb-1">Create Campaign</h2>
                <p className="text-xs text-white/40 mb-5">Launch a targeted ad stream across the LatentPay network.</p>

                <div className="space-y-4">
                  {["Campaign Name", "Daily Budget ($)", "Target URL", "Ad Copy"].map((label) => (
                    <div key={label}>
                      <label className="text-xs text-white/30 uppercase tracking-wider font-mono block mb-1.5">
                        {label}
                      </label>
                      <div className="glass rounded-xl px-4 py-3 text-sm text-white/20">
                        &nbsp;
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/30 uppercase tracking-wider font-mono block mb-3">
                  Creative Asset (728×90px)
                </label>
                <div className="border-2 border-dashed border-white/10 rounded-2xl h-40 flex flex-col items-center justify-center gap-2">
                  <div className="text-3xl">🖼</div>
                  <p className="text-xs text-white/20">PNG or JPG · 728×90px</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <span key={p} className="tag" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.2)" }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>

      </div>
    </div>
  );
}
