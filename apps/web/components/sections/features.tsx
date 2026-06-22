'use client'

import { Plug, LayoutDashboard, Target, ShieldCheck, Wallet } from 'lucide-react'
import { TiltCard } from '../ui/TiltCard'
import { SectionReveal, StaggerContainer, StaggerItem } from '../ui/SectionReveal'

// Row 1: 3 × col-span-1  |  Row 2: col-span-2 + col-span-1  → perfect 3-column bento
const features = [
  {
    title: 'Context-Aware Ads',
    body: 'Sponsors matched to your task — never your identity. Relevant, respectful, and always skippable.',
    icon: Target,
    tag: 'Smart',
    tagColor: '#22d3ee',
    span: '',
  },
  {
    title: 'Privacy First',
    body: 'No prompt logging. No selling data. No behavioral profiling. Ever.',
    icon: ShieldCheck,
    tag: 'Secure',
    tagColor: '#34d399',
    span: '',
  },
  {
    title: 'Real-time Wallet',
    body: 'Watch earnings tick up live after every impression and cash out instantly — no minimums.',
    icon: Wallet,
    tag: 'Money',
    tagColor: '#fbbf24',
    span: '',
  },
  {
    title: 'Native Integration',
    body: 'A lightweight browser extension that hooks into every major AI tool — ChatGPT, Claude, Gemini, Perplexity, and more. Install once, earn everywhere, zero configuration.',
    icon: Plug,
    tag: 'Core',
    tagColor: '#8b5cf6',
    span: 'md:col-span-2',
  },
  {
    title: 'Advertiser Dashboard',
    body: 'Launch campaigns in minutes with granular targeting, live spend analytics, and transparent cost-per-impression billing — fully self-serve.',
    icon: LayoutDashboard,
    tag: 'For Brands',
    tagColor: '#ec4899',
    span: '',
  },
]

export function Features() {
  return (
    <section id="features" className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionReveal className="mx-auto max-w-2xl text-center">
        <span className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#fbbf24]">
          Features
        </span>
        <h2 className="mt-4 font-heading text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.03em]">
          Everything you need, <span className="text-[#22d3ee]">nothing you don&apos;t.</span>
        </h2>
      </SectionReveal>

      <StaggerContainer
        className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
        stagger={0.08}
      >
        {features.map((f) => (
          <StaggerItem key={f.title} className={f.span}>
            <TiltCard className="h-full">
              <div className="card-surface relative h-full rounded-3xl p-7">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl"
                  style={{ background: `${f.tagColor}22`, border: `1px solid ${f.tagColor}44` }}
                >
                  <f.icon className="h-5 w-5" style={{ color: f.tagColor }} />
                </div>
                <span
                  className="mt-5 inline-block rounded-full px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wider"
                  style={{ background: `${f.tagColor}1a`, color: f.tagColor }}
                >
                  {f.tag}
                </span>
                <h3 className="mt-3 font-heading text-xl font-bold tracking-[-0.02em]">
                  {f.title}
                </h3>
                <p className="mt-2 leading-relaxed text-[rgba(240,240,248,0.55)]">{f.body}</p>
              </div>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  )
}
