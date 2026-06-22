'use client'

import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { MagneticButton } from '../ui/MagneticButton'
import { SectionReveal } from '../ui/SectionReveal'

export function CTA() {
  return (
    <section id="cta" className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <SectionReveal>
        <div
          className="relative overflow-hidden rounded-[2rem] border border-[rgba(139,92,246,0.35)] px-6 py-16 text-center sm:px-12 sm:py-24"
          style={{
            background:
              'linear-gradient(145deg, rgba(46,16,101,0.6), rgba(12,8,26,0.95))',
            boxShadow: '0 0 80px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div
            className="animate-spin-slow pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[rgba(139,92,246,0.2)]"
            aria-hidden="true"
          />
          <div
            className="animate-spin-slow pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full border border-[rgba(236,72,153,0.15)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(139,92,246,0.18), transparent)' }}
          />

          <div className="relative">
            <span className="inline-block rounded-full border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)] px-3 py-1 font-heading text-xs font-bold uppercase tracking-[0.12em] text-[#34d399]">
              Free to Join
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl font-heading text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              Ready to get paid <span className="gradient-text">for waiting?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[rgba(240,240,248,0.45)]">
              Install the extension, keep using AI the way you already do, and watch the
              micro-earnings stack up.
            </p>

            <motion.div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MagneticButton href="/dashboard" className="btn-gradient w-full sm:w-auto">
                Start Earning Free
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </MagneticButton>
              <MagneticButton href="/advertiser" className="btn-ghost w-full sm:w-auto" strength={0.22}>
                For Advertisers
              </MagneticButton>
            </motion.div>

            <p className="mt-7 font-mono text-xs text-[rgba(240,240,248,0.25)]">
              Works with Chrome · No card required · Cancel anytime
            </p>
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}
