'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { SectionReveal } from '../ui/SectionReveal'

interface LeaderboardRow {
  id: string
  adLine: string
  companyName: string | null
  targetUrl: string
  brandIconUrl: string | null
  views: number
  pricePerK: number
}

interface MarketData {
  window: '24h' | 'all'
  marketPrice: number
  impressionsPerHour: number
  totalImpressions: number
  leaderboard: LeaderboardRow[]
}

export function BidMarket() {
  const [window_, setWindow] = useState<'24h' | 'all'>('24h')
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/v1/market?window=${window_}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [window_])

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionReveal>
        <div className="card-surface relative overflow-hidden rounded-[2rem] border-[rgba(245,158,11,0.3)] px-6 py-14 sm:px-12">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(245,158,11,0.1), transparent)' }}
          />

          <div className="relative flex flex-col items-center text-center">
            <span className="inline-block rounded-full border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] px-3 py-1 font-heading text-xs font-bold uppercase tracking-[0.12em] text-amber-400">
              Live Market
            </span>
            <h2 className="mt-5 font-heading text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-[-0.03em]">
              The bid <span className="gradient-text">market.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-[rgba(240,240,248,0.45)]">
              Real auction data, updated live — not a mockup. 50% of every dollar settles to the developer
              whose machine showed the ad.
            </p>

            <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
              {(['24h', 'all'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setWindow(w)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    window_ === w ? 'bg-amber-500/15 text-amber-300' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {w === '24h' ? '24h' : 'All'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-10 grid grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
              <div className="gradient-text font-heading text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight">
                ${data ? data.marketPrice.toFixed(2) : '—'}
              </div>
              <div className="mt-1.5 text-xs text-[rgba(240,240,248,0.4)]">blended · per 1k imps</div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
              <div className="gradient-text font-heading text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight">
                {data
                  ? formatCount(window_ === '24h' ? data.impressionsPerHour : data.totalImpressions)
                  : '—'}
              </div>
              <div className="mt-1.5 text-xs text-[rgba(240,240,248,0.4)]">
                {window_ === '24h' ? 'impressions / hr · billable' : 'total impressions · billable'}
              </div>
            </div>
          </div>

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/[0.06]">
            {loading ? (
              <div className="py-14 text-center text-sm text-white/30">Loading live data…</div>
            ) : !data || data.leaderboard.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <p className="text-sm text-white/40">No live campaigns yet — be the first to bid.</p>
                <a href="/advertiser" className="text-sm font-semibold text-amber-400 hover:text-amber-300">
                  Bid on this line →
                </a>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                    <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-white/30 sm:px-6">
                      #
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-white/30 sm:px-6">
                      Campaign
                    </th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-mono uppercase tracking-wider text-white/30 sm:px-6">
                      $ / 1,000 impressions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {data.leaderboard.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
                      className="hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-white/25 sm:px-6">{i + 1}</td>
                      <td className="px-4 py-3 sm:px-6">
                        <a
                          href={row.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="group inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white"
                        >
                          {row.companyName && <span className="font-semibold">{row.companyName}</span>}
                          <span className="truncate text-white/50 group-hover:text-white/70">{row.adLine}</span>
                          <ArrowUpRight className="h-3 w-3 flex-shrink-0 text-white/25 group-hover:text-amber-400" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-amber-400 sm:px-6">
                        ${row.pricePerK.toFixed(4)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p className="relative mt-6 text-center text-xs text-[rgba(240,240,248,0.25)]">
            For advertisers ·{' '}
            <a href="/advertiser" className="text-amber-400 hover:text-amber-300">
              bid on this line
            </a>
          </p>
        </div>
      </SectionReveal>
    </section>
  )
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toLocaleString()
}
