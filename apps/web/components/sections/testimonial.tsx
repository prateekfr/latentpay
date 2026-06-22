'use client'

import { SectionReveal } from '../ui/SectionReveal'

export function Testimonial() {
  return (
    <section className="relative z-10 mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
      <SectionReveal>
        <div className="gradient-text text-5xl font-bold leading-none">✦</div>
        <blockquote className="mt-8 font-heading text-[clamp(1.5rem,3.5vw,2.75rem)] font-medium leading-[1.25] tracking-[-0.02em] text-[rgba(240,240,248,0.85)]">
          &ldquo;I left my AI tabs open all day anyway. Last month LatentPay turned that idle time into{' '}
          <span className="gradient-text font-semibold">$312</span> — money I genuinely did
          nothing extra to earn.&rdquo;
        </blockquote>
        <div className="mt-9 flex items-center justify-center gap-3">
          <span
            className="grid h-11 w-11 place-items-center rounded-full font-heading font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
          >
            MR
          </span>
          <div className="text-left">
            <div className="font-medium">Maya Reyes</div>
            <div className="text-sm text-[rgba(240,240,248,0.45)]">Indie developer & power user</div>
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}
