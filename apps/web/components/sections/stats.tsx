'use client'

import { motion } from 'framer-motion'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import { SectionReveal } from '../ui/SectionReveal'

const stats = [
  { value: 14820, prefix: '$', suffix: '+', label: 'Paid to earners', sub: 'and counting, daily' },
  { value: 1.8, decimals: 1, suffix: 'M', label: 'Impressions served', sub: 'across all gaps' },
  { value: 2341, label: 'Active earners', sub: 'in 40+ countries' },
  { value: 0.01, decimals: 2, prefix: '$', suffix: '/view', label: 'Average payout', sub: 'no minimums' },
]

export function Stats() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionReveal>
        <div className="card-surface relative overflow-hidden rounded-[2rem] border-[rgba(139,92,246,0.3)] px-6 py-14 sm:px-12">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(139,92,246,0.12), transparent)' }}
          />
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
            aria-hidden="true"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
            aria-hidden="true"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.35), transparent 70%)' }}
          />

          <h2 className="relative text-center font-heading text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-[-0.03em]">
            Numbers that <span className="gradient-text">speak loud.</span>
          </h2>

          <div className="relative mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="gradient-text font-heading text-[clamp(2rem,5vw,3.25rem)] font-extrabold tracking-tight">
                  <AnimatedCounter
                    value={s.value}
                    decimals={s.decimals ?? 0}
                    prefix={s.prefix ?? ''}
                    suffix={s.suffix ?? ''}
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-[rgba(240,240,248,0.7)]">
                  {s.label}
                </div>
                <div className="mt-1 hidden text-xs text-[rgba(240,240,248,0.3)] sm:block">
                  {s.sub}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}
