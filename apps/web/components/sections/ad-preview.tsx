'use client'

import { Check } from 'lucide-react'
import { TiltCard } from '../ui/TiltCard'
import { SectionReveal } from '../ui/SectionReveal'

const features = [
  'One sponsor per gap — never a wall of ads',
  'Context-aware matching to what you are doing',
  'Skippable, labeled, and fully transparent',
  'Revenue split in your favor, paid instantly',
]

export function AdPreview() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <SectionReveal direction="up">
          <span className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#a855f7]">
            Live Preview
          </span>
          <h2 className="mt-4 font-heading text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            Ads that feel like{' '}
            <span className="gradient-text">features, not friction.</span>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-[rgba(240,240,248,0.5)]">
            We designed the gap experience to respect your flow. No pop-ups, no autoplay, no
            tracking soup — just a clean sponsor card while your model thinks.
          </p>
          <ul className="mt-7 space-y-3.5">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[rgba(240,240,248,0.75)]">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[rgba(139,92,246,0.2)]">
                  <Check className="h-3 w-3 text-violet" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </SectionReveal>

        <SectionReveal direction="up" delay={0.12}>
          <TiltCard max={10}>
            <div className="card-surface overflow-hidden rounded-3xl">
              {/* chrome bar */}
              <div className="flex items-center gap-3 border-b border-[rgba(139,92,246,0.15)] px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ef4444]/80" />
                  <span className="h-3 w-3 rounded-full bg-[#fbbf24]/80" />
                  <span className="h-3 w-3 rounded-full bg-[#34d399]/80" />
                </div>
                <div className="flex-1 rounded-md bg-[rgba(255,255,255,0.04)] px-3 py-1 text-center font-mono text-[0.7rem] text-[rgba(240,240,248,0.4)]">
                  chat.openai.com
                </div>
              </div>

              <div className="space-y-4 p-5">
                {/* user msg */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.08)] px-4 py-2.5 text-sm text-[rgba(240,240,248,0.85)]">
                    Write me a launch plan for my SaaS startup
                  </div>
                </div>

                {/* thinking */}
                <div className="flex items-center gap-2 text-xs text-[rgba(240,240,248,0.5)]">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-violet"
                        style={{ animation: `thinking-dot 1.2s ease-in-out ${d * 0.2}s infinite` }}
                      />
                    ))}
                  </span>
                  GPT-4o is thinking...
                </div>

                {/* ad banner */}
                <div className="rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[rgba(19,16,31,0.8)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[rgba(139,92,246,0.15)] px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-violet">
                      Sponsored
                    </span>
                    <span className="font-mono text-[0.6rem] text-[rgba(240,240,248,0.3)]">
                      while you wait
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-[rgba(240,240,248,0.9)]">
                    Ship your landing page in minutes with Vercel.
                  </p>
                  <p className="mt-1 text-xs text-[rgba(240,240,248,0.5)]">
                    Deploy frontend apps with zero config and global edge.
                  </p>
                  <button className="mt-3 rounded-lg bg-violet px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                    Try Free →
                  </button>
                </div>

                {/* earning */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse-ring" />
                  <span className="font-mono text-[#34d399]">+$0.01 earned</span>
                </div>
              </div>
            </div>
          </TiltCard>
        </SectionReveal>
      </div>
    </section>
  )
}
