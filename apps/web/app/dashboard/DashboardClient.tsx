"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedCounter from "../../components/ui/AnimatedCounter";
import SectionReveal from "../../components/ui/SectionReveal";

interface Impression {
  id: string;
  adLine: string;
  companyName: string | null;
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
  weekTotal: number;
  activeStreamsCount: number;
  chartBars: number[];
  chartLabels: string[];
  impressions: Impression[];
}

const BADGE_CLASSES: Record<string, string> = {
  violet: "bg-violet-500/15 border-violet-500/25 text-violet-300",
  amber: "bg-amber-500/15 border-amber-500/25 text-amber-300",
  cyan: "bg-cyan-500/15 border-cyan-500/25 text-cyan-300",
  emerald: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300",
};

const STAT_TILES = (p: Props) => [
  {
    label: "Monthly Est.",
    value: `$${p.monthlyEst.toFixed(2)}`,
    icon: "📅",
    color: "violet",
    sub: "based on last 7 days",
  },
  {
    label: "This Week",
    value: `$${p.weekTotal.toFixed(2)}`,
    icon: "📈",
    color: "amber",
    sub: "last 7 days earned",
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

function WithdrawModal({
  open,
  onClose,
  walletBalance,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  walletBalance: number;
  userId: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0d16] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              ✕
            </button>
            <span className="tag tag-purple mb-4 inline-flex">Withdraw Funds</span>
            <div className="font-display font-black text-4xl text-white mb-1">
              $<AnimatedCounter value={walletBalance} decimals={4} />
            </div>
            <p className="text-white/40 text-xs mb-6">Available balance</p>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Payouts are processed manually right now — email{" "}
              <a href={`mailto:support@latentpay.com?subject=Withdrawal request&body=User ID: ${userId}`} className="text-violet-400 hover:text-violet-300">
                support@latentpay.com
              </a>{" "}
              with your User ID below and we&apos;ll send your balance.
            </p>
            <div className="flex items-center gap-2 rounded-xl p-2 bg-white/[0.03] border border-white/[0.06] mb-6">
              <span className="font-mono text-xs text-violet-400 px-2 truncate flex-1 select-all">{userId}</span>
              <span className="text-[10px] text-white/30 font-mono uppercase px-2 whitespace-nowrap">User ID</span>
            </div>
            <a
              href={`mailto:support@latentpay.com?subject=Withdrawal request&body=User ID: ${userId}%0ABalance: $${walletBalance.toFixed(4)}`}
              className="btn-gradient w-full justify-center"
            >
              Email support to withdraw
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function DashboardClient(props: Props) {
  const stats = STAT_TILES(props);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [allImpressions, setAllImpressions] = useState<Impression[] | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const visibleImpressions = allImpressions ?? props.impressions;

  async function handleViewAll() {
    if (allImpressions) {
      setAllImpressions(null); // toggle back to the short list
      return;
    }
    setLoadingAll(true);
    try {
      const res = await fetch("/api/v1/impressions/mine");
      if (res.ok) {
        const data = await res.json();
        setAllImpressions(data.impressions);
      }
    } finally {
      setLoadingAll(false);
    }
  }

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
              <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white">
                Earnings Overview
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Real-time AI monetization performance
              </p>
            </div>
            <button
              onClick={() => setWithdrawOpen(true)}
              className="btn-gradient self-start sm:self-auto px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Withdraw Funds
            </button>
          </div>
        </SectionReveal>

        {/* ─── Extension link card ───────────────────── */}
        <SectionReveal delay={0.05}>
          <div className="card-surface rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <div className="flex items-center gap-2 rounded-xl p-2 bg-white/[0.03] border border-white/[0.06] flex-shrink-0">
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
            className="lg:col-span-2 card-surface rounded-2xl p-5 sm:p-8 relative overflow-hidden"
            style={{ boxShadow: "0 0 50px rgba(139,92,246,0.12)" }}
          >
            {/* Glow orb */}
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full glow-breathe"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)" }} />

            <div className="relative z-10">
              <span className="tag tag-purple mb-4 inline-flex">Available Balance</span>

              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-2">
                <span className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight break-all">
                  $<AnimatedCounter value={props.walletBalance} decimals={4} />
                </span>
                <span className="text-white/30 font-mono text-sm">USD</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
                <span className="text-emerald-400 text-sm">↑</span>
                <span className="text-emerald-400 font-mono text-xs sm:text-sm font-semibold">
                  +${props.earningsToday.toFixed(4)} today
                </span>
                {props.earningsToday > 0 && (
                  <span className="tag tag-green">+{props.impressionsTodayCount} views</span>
                )}
              </div>

              {/* 7-day mini bar chart — real per-day earnings, not mock data */}
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider font-mono mb-3">7-day activity</p>
                <div className="flex items-end gap-1.5 h-10">
                  {props.chartBars.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease: "easeOut" }}
                      className="flex-1 rounded-sm origin-bottom"
                      style={{
                        minHeight: h > 0 ? "3px" : "1px",
                        height: `${Math.max(h * 100, h > 0 ? 8 : 2)}%`,
                        background: i === props.chartBars.length - 1
                          ? "linear-gradient(to top, #8b5cf6, #ec4899)"
                          : "rgba(139,92,246,0.25)",
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {props.chartLabels.map((d, i) => (
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
                className="card-surface rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/35 uppercase tracking-wider font-mono">
                    {stat.label}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm flex-shrink-0 ${BADGE_CLASSES[stat.color]}`}
                  >
                    {stat.icon}
                  </div>
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
            className="card-surface rounded-2xl p-5 flex items-center gap-4"
            style={{ boxShadow: "0 0 25px rgba(16,185,129,0.08)" }}
          >
            <div className="relative flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
              <span className="relative w-3 h-3 rounded-full bg-emerald-400 block" />
            </div>
            <div>
              <span className="text-sm font-semibold text-emerald-400">Extension Active</span>
              <p className="text-xs text-white/35 mt-0.5">Earned an impression in the last 10 minutes</p>
            </div>
            <div className="ml-auto tag tag-green">Live</div>
          </motion.div>
        )}

        {/* ─── Activity table ────────────────────────── */}
        <SectionReveal delay={0.1}>
          <div className="card-surface rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-lg">
                {allImpressions ? "All Earnings" : "Recent Earnings"}
              </h3>
              {props.impressions.length > 0 && (
                <button
                  onClick={handleViewAll}
                  disabled={loadingAll}
                  className="text-xs text-violet-400 font-semibold hover:text-violet-300 transition-colors disabled:opacity-50"
                >
                  {loadingAll ? "Loading…" : allImpressions ? "Show recent" : "View All →"}
                </button>
              )}
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
                <div className="card-surface rounded-xl p-4 text-left space-y-2 text-xs text-white/40 max-w-xs">
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
                      {visibleImpressions.map((imp, i) => (
                        <motion.tr
                          key={imp.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.6) }}
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
                                <div className="min-w-0">
                                  <p className="text-sm text-white/80 truncate max-w-[180px]">{imp.adLine}</p>
                                  {imp.companyName && (
                                    <p className="text-xs text-white/30 truncate max-w-[180px]">{imp.companyName}</p>
                                  )}
                                </div>
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

      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        walletBalance={props.walletBalance}
        userId={props.userId}
      />
    </div>
  );
}
