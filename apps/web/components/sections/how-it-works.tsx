'use client'

import { Cpu, Sparkles, Wallet } from 'lucide-react'
import { TiltCard } from '../ui/TiltCard'
import { SectionReveal, StaggerContainer, StaggerItem } from '../ui/SectionReveal'

const steps = [
  {
    num: '01',
    title: 'You Use AI',
    body: 'Keep chatting, generating, and prompting like you always do. LatentPay runs quietly in the background.',
    icon: Cpu,
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  },
  {
    num: '02',
    title: 'We Fill the Gap',
    body: 'During the seconds your model spends thinking, we surface a single, relevant, non-intrusive sponsor.',
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
  },
  {
    num: '03',
    title: 'You Get Paid',
    body: 'Every impression drops micro-earnings straight into your wallet. Cash out anytime, no minimums.',
    icon: Wallet,
    gradient: 'linear-gradient(135deg, #34d399, #22d3ee)',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionReveal className="mx-auto max-w-2xl text-center">
        <span className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#22d3ee]">
          Process
        </span>
        <h2 className="mt-4 font-heading text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.03em]">
          How It <span className="gradient-text">Works</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[rgba(240,240,248,0.55)]">
          Three steps. Zero effort. You are already doing step one.
        </p>
      </SectionReveal>

      <div className="relative mt-16">
        <div
          className="absolute left-0 right-0 top-[26px] hidden h-px md:block"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(236,72,153,0.4), rgba(52,211,153,0.4), transparent)',
          }}
        />
        <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <StaggerItem key={step.num}>
              <TiltCard className="h-full">
                <div className="card-surface relative h-full rounded-3xl p-7">
                  <div
                    className="grid h-[52px] w-[52px] place-items-center rounded-2xl"
                    style={{ background: step.gradient }}
                  >
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="absolute right-6 top-6 font-mono text-3xl font-bold text-[rgba(240,240,248,0.12)]">
                    {step.num}
                  </span>
                  <h3 className="mt-6 font-heading text-xl font-bold tracking-[-0.02em]">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-[rgba(240,240,248,0.55)]">{step.body}</p>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
