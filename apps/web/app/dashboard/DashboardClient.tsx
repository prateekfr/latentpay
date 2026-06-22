"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "../../components/ui/AnimatedCounter";
import SectionReveal from "../../components/ui/SectionReveal";

interface Impression {
  id: string;
  campaignId: string;
  durationSeconds: number;
  payoutAmount: number;
  createdAt: string;
}

interface Props {
  userId: string;
  walletBalance: number;
  earningsToday: number;
  impressionsCount: number;
  impressionsTodayCount: number;
  monthlyEst: number;
  pendingPayout: number;
  activeStreamsCount: number;
  impressions: Impression[];
}

const STAT_TILES = (p: Props) => [
  {
    label: "Monthly Est.",
    value: `$${p.monthlyEst.toFixed(2)}`,
    icon: "📅",
    color: "violet",
    sub: "projected earnings",
  },
  {
    label: "Pending Payout",
    value: `$${p.pendingPayout.toFixed(2)}`,
    icon: "⏳",
    color: "amber",
    sub: "clearing in 2–3 days",
  },
  {
    label: "Total Views",
    value: p.impressionsCount.toString(),
    icon: "👁",
    color: "cyan",
    sub: "lifetime impressions",
  },
  {
    label: "Active Streams",
    value: p.activeStreamsCount.toString(),
    icon: "🔴",
    color: "emerald",
    sub: p.activeStreamsCount > 0 ? "live right now" : "install extension",
    live: p.activeStreamsCount > 0,
  },
];

/* ─── Mini chart mock (7-day bar chart) ─────────────── */
const CHART_BARS = [0.03, 0.07, 0.05, 0.12, 0.08, 0.15, 0.09];

export default function DashboardClient(props: Props) {
  const stats = STAT_TILES(props);

  return (
    <div className="min-h-screen bg-[#07070d] pt-24 pb-20 px-4">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ─── Header ───────────────────────────────── */}
        <SectionReveal>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="tag tag-green mb-2 inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-ring-green" />
                Wallet Active
              </span>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-white">
                Earnings Overview
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Real-time AI monetization performance
              </p>
            </div>
            <button className="btn-gradient self-start sm:self-auto px-5 py-2.5 rounded-xl text-sm font-semibold">
              Withdraw Funds
            </button>
          </div>
        </SectionReveal>

        {/* ─── Extension link card ───────────────────── */}
        <SectionReveal delay={0.05}>
          <div className="glass rounded-2xl p-5 border border-violet-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ boxShadow: "0 0 30px rgba(139,92,246,0.08)" }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-lg flex-shrink-0">
                🔗
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-0.5">Link your Chrome Extension</h4>
                <p className="text-xs text-white/40 leading-relaxed max-w-md">
                  Copy this ID and paste it into the LatentPay Chrome Extension to route earnings to this wallet.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 glass rounded-xl p-2 border border-white/[0.06] flex-shrink-0">
              <span className="font-mono text-xs text-violet-400 px-2 truncate max-w-[200px] select-all">
                {props.userId}
              </span>
              <span className="text-[10px] text-white/30 font-mono uppercase px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.05] whitespace-nowrap">
                User ID
              </span>
            </div>
          </div>
        </SectionReveal>

        {/* ─── Balance hero + mini chart ─────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Balance card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 glass rounded-2xl p-8 relative overflow-hidden border border-violet-500/20"
            style={{ boxShadow: "0 0 50px rgba(139,92,246,0.12)" }}
          >
            {/* Glow orb */}
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full glow-breathe"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)" }} />

            <div className="relative z-10">
              <span className="tag tag-purple mb-4 inline-flex">Available Balance</span>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-display font-black text-5xl md:text-6xl text-white tracking-tight">
                  $<AnimatedCounter value={props.walletBalance} decimals={4} />
                </span>
                <span className="text-white/30 font-mono text-sm">USD</span>
              </div>

              <div className="flex items-center gap-2 mb-8">
                <span className="text-emerald-400 text-sm">↑</span>
                <span className="text-emerald-400 font-mono text-sm font-semibold">
                  +${props.earningsToday.toFixed(4)} today
                </span>
                {props.earningsToday > 0 && (
                  <span className="tag tag-green">+{props.impressionsTodayCount} views</span>
                )}
              </div>

              {/* 7-day mini bar chart */}
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider font-mono mb-3">7-day activity</p>
                <div className="flex items-end gap-1.5 h-10">
                  {CHART_BARS.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease: "easeOut" }}
                      className="flex-1 rounded-sm origin-bottom"
                      style={{
                        height: `${h * 100}%`,
                        background: i === 5
                          ? "linear-gradient(to top, #8b5cf6, #ec4899)"
                          : "rgba(139,92,246,0.25)",
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i} className="text-[9px] text-white/20 font-mono flex-1 text-center">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {stats.slice(0, 3).map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                className="glass glass-hover rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/35 uppercase tracking-wider font-mono">
                    {stat.label}
                  </span>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <div className="font-display font-bold text-2xl text-white">{stat.value}</div>
                <div className="text-xs text-white/30 mt-1">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Active streams banner ─────────────────── */}
        {props.activeStreamsCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-5 border border-emerald-500/20 flex items-center gap-4"
            style={{ boxShadow: "0 0 25px rgba(16,185,129,0.08)" }}
          >
            <div className="relative flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
              <span className="relative w-3 h-3 rounded-full bg-emerald-400 block" />
            </div>
            <div>
              <span className="text-sm font-semibold text-emerald-400">Extension Active</span>
              <p className="text-xs text-white/35 mt-0.5">Earning in real-time across your AI sessions</p>
            </div>
            <div className="ml-auto tag tag-green">Live</div>
          </motion.div>
        )}

        {/* ─── Activity table ────────────────────────── */}
        <SectionReveal delay={0.1}>
          <div className="glass rounded-2xl overflow-hidden border border-white/[0.07]">
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-lg">Recent Earnings</h3>
              <button className="text-xs text-violet-400 font-semibold hover:text-violet-300 transition-colors">
                View All →
              </button>
            </div>

            {props.impressions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-3xl mb-5">
                  💤
                </div>
                <h4 className="font-display font-semibold text-white mb-2">No earnings yet</h4>
                <p className="text-sm text-white/35 max-w-sm leading-relaxed mb-6">
                  Start earning by using ChatGPT or Claude with the LatentPay extension active.
                </p>
                <div className="glass rounded-xl p-4 text-left space-y-2 text-xs text-white/40 max-w-xs">
                  <p className="text-white/60 font-semibold mb-2">Quick Guide</p>
                  <p>1. Install the Chrome extension</p>
                  <p>2. Open ChatGPT and send any prompt</p>
                  <p>3. Watch the overlay appear — keep it visible for 5s</p>
                  <p>4. Rewards appear here instantly</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      {["Date", "Campaign", "Duration", "Type", "Earned"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs text-white/30 uppercase tracking-wider font-mono">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                      {props.impressions.map((imp, i) => (
                        <motion.tr
                          key={imp.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.06 }}
                          className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4 text-xs text-white/35 font-mono">
                              {new Date(imp.createdAt).toLocaleDateString(undefined, {
                                month: "short", day: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-sm flex-shrink-0">
                                  🤖
                                </div>
                                <span className="text-sm text-white/70 font-mono truncate max-w-[140px]">
                                  {imp.campaignId.slice(0, 18)}…
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-white/35 font-mono">
                              {imp.durationSeconds.toFixed(1)}s
                            </td>
                            <td className="px-6 py-4">
                              <span className="tag tag-purple">Ad View</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="gradient-text-green font-bold font-mono text-sm">
                                +${imp.payoutAmount.toFixed(4)}
                              </span>
                            </td>
                        </motion.tr>
                      ))}
                    </tbody>
                </table>
              </div>
            )}
          </div>
        </SectionReveal>

      </div>
    </div>
  );
}
