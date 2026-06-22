'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Star, Users, Megaphone, Download } from 'lucide-react'
import { TextScramble } from '../ui/TextScramble'
import { MagneticButton } from '../ui/MagneticButton'

const phrases = [
  'Get paid for the milliseconds you spend waiting on AI.',
  'Latency is no longer dead time. Turn it into your income stream.',
  'Join the wait economy. Free, private, always on.',
]

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, -60])

  return (
    <section
      ref={ref}
      id="home"
      className="relative z-10 flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pt-24 sm:px-8"
    >
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(124,58,237,0.28), transparent 70%), radial-gradient(40% 40% at 85% 100%, rgba(236,72,153,0.18), transparent 70%)',
        }}
      />
      <div
        className="animate-scan-line pointer-events-none absolute left-0 top-0 h-0.5 w-full"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(90deg, transparent, #8b5cf6, #ec4899, #8b5cf6, transparent)',
        }}
      />

      <motion.div style={{ opacity, y }} className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="shimmer-tag mx-auto inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.08)] px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-[rgba(240,240,248,0.75)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
          Now Live — Join the Wait Economy
        </motion.div>

        <h1 className="mt-8 font-heading text-[clamp(3.5rem,10vw,8rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
          <TextScramble text="Monetize" delay={250} />
          <br />
          <span className="gradient-text">the Wait.</span>
        </h1>

        <div className="mx-auto mt-7 max-w-2xl space-y-1.5 text-pretty text-base leading-relaxed sm:text-lg">
          {phrases.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.18 }}
              className={
                i === 0
                  ? 'text-[rgba(240,240,248,0.8)]'
                  : 'text-[rgba(240,240,248,0.45)]'
              }
            >
              {p}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <MagneticButton href="/dashboard" className="btn-gradient w-full sm:w-auto" strength={0.28}>
            Start Earning
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
              <ArrowRight className="h-4 w-4" />
            </motion.span>
          </MagneticButton>
          <MagneticButton
            href="#extension"
            className="btn-ghost w-full sm:w-auto border-[rgba(123,91,240,0.35)] bg-[rgba(123,91,240,0.1)] hover:bg-[rgba(123,91,240,0.18)] text-[rgba(240,240,248,0.9)]"
            strength={0.22}
          >
            <Download className="h-4 w-4" />
            Download Extension
          </MagneticButton>
          <MagneticButton href="#how" className="btn-ghost w-full sm:w-auto" strength={0.22}>
            See How It Works
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.35 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Users, label: '2,341 earners' },
            { icon: Megaphone, label: '180+ campaigns' },
            { icon: Star, label: '4.9 / 5 rating' },
          ].map((pill) => (
            <span
              key={pill.label}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(13,13,26,0.6)] px-4 py-2 text-xs text-[rgba(240,240,248,0.65)] backdrop-blur"
            >
              <pill.icon className="h-3.5 w-3.5 text-violet" />
              {pill.label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(240,240,248,0.35)]">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="h-8 w-px bg-gradient-to-b from-violet to-transparent"
        />
      </div>
    </section>
  )
}
