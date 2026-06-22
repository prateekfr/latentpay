import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How It Works — LatentPay',
  description: 'Learn exactly how LatentPay turns AI waiting time into passive income — from install to payout.',
}

const steps = [
  {
    num: '01',
    title: 'Install the Extension',
    body: 'Add LatentPay to Chrome in seconds. It runs silently alongside any AI tool you already use — no accounts to link, no prompts to share.',
    color: '#8b5cf6',
  },
  {
    num: '02',
    title: 'Use AI Normally',
    body: 'Keep chatting, generating, and prompting exactly as you always do. LatentPay detects the moment a model begins processing your request.',
    color: '#a855f7',
  },
  {
    num: '03',
    title: 'The Gap Fills',
    body: "During the seconds your model spends thinking — typically 1–6 seconds — a single, context-matched sponsor card appears. It's labeled, skippable, and non-intrusive.",
    color: '#ec4899',
  },
  {
    num: '04',
    title: 'You Earn',
    body: 'Every impression deposits micro-earnings directly into your LatentPay wallet. Earnings accumulate in real time with no minimum threshold for cashout.',
    color: '#34d399',
  },
]

const faqs = [
  {
    q: 'Does LatentPay read my prompts?',
    a: 'No. LatentPay detects latency state (when a model is generating) without reading, logging, or transmitting any prompt content. Your conversations are private.',
  },
  {
    q: 'Which AI tools are supported?',
    a: 'ChatGPT, Claude, Gemini, Perplexity, Copilot, Mistral, Grok, and Midjourney are fully supported. More integrations ship monthly.',
  },
  {
    q: 'How much can I earn?',
    a: 'Earnings depend on how often you use AI and campaign availability. Power users average $0.01–$0.04 per session. Early earners have crossed $300/month.',
  },
  {
    q: 'How are sponsors selected?',
    a: 'Sponsors are matched to the general topic of your task — not your identity. No behavioral profiles are built and no data is sold.',
  },
  {
    q: 'How do I cash out?',
    a: 'Connect a payment method in your dashboard and withdraw anytime. PayPal, Stripe, and crypto payouts are available.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes. Earners pay nothing — ever. LatentPay makes money on the advertiser side through cost-per-impression billing.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-[#f0f0f8]">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-36 sm:px-8 sm:pt-40">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{ background: 'radial-gradient(60% 40% at 50% 0%, rgba(124,58,237,0.22), transparent 70%)' }}
        />
        <div className="relative text-center">
          <span className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#22d3ee]">
            The Process
          </span>
          <h1 className="mt-4 font-heading text-[clamp(2.5rem,7vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            How LatentPay <span className="gradient-text">Works</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[rgba(240,240,248,0.55)]">
            Four steps. Zero friction. You are probably already doing step one right now.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="card-surface group relative overflow-hidden rounded-3xl p-8 sm:p-10"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden="true"
                style={{ background: `radial-gradient(60% 60% at 0% 50%, ${step.color}18, transparent)` }}
              />
              <div className="relative flex gap-6">
                <span
                  className="shrink-0 font-mono text-5xl font-bold leading-none tracking-tighter"
                  style={{ color: `${step.color}40` }}
                >
                  {step.num}
                </span>
                <div>
                  <h2
                    className="font-heading text-2xl font-bold tracking-[-0.02em]"
                    style={{ color: step.color }}
                  >
                    {step.title}
                  </h2>
                  <p className="mt-3 text-lg leading-relaxed text-[rgba(240,240,248,0.6)]">
                    {step.body}
                  </p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="absolute -bottom-6 left-1/2 h-6 w-px -translate-x-1/2"
                  aria-hidden="true"
                  style={{ background: `linear-gradient(to bottom, ${step.color}60, transparent)` }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* The Ad Experience */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#a855f7]">
              The Ad Experience
            </span>
            <h2 className="mt-4 font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              One card. One moment. <span className="gradient-text">Zero disruption.</span>
            </h2>
            <p className="mt-5 leading-relaxed text-[rgba(240,240,248,0.55)]">
              We designed the gap experience around one principle: the ad must respect the flow. No
              pop-ups, no autoplay video, no notification spam.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                'Appears only during model generation — never during your reading or typing',
                'One sponsor per gap, clearly labeled "Sponsored"',
                'Skippable at any time with a single click',
                'Context-matched to your task category, not your identity',
                'Disappears the instant your response arrives',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[rgba(240,240,248,0.7)]">
                  <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-[rgba(52,211,153,0.15)] text-center text-xs leading-5 text-[#34d399]">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* mock ad card */}
          <div className="card-surface overflow-hidden rounded-3xl">
            <div className="flex items-center gap-3 border-b border-[rgba(139,92,246,0.15)] px-5 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#ef4444]/70" />
                <span className="h-3 w-3 rounded-full bg-[#fbbf24]/70" />
                <span className="h-3 w-3 rounded-full bg-[#34d399]/70" />
              </div>
              <div className="flex-1 rounded bg-[rgba(255,255,255,0.04)] px-3 py-1 text-center font-mono text-xs text-[rgba(240,240,248,0.35)]">
                claude.ai
              </div>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-tr-sm border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.08)] px-4 py-2.5 text-sm text-[rgba(240,240,248,0.8)]">
                  Help me write a pitch deck for investors
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[rgba(240,240,248,0.45)]">
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]"
                      style={{ opacity: 0.3 + d * 0.35 }}
                    />
                  ))}
                </span>
                Claude is thinking...
              </div>
              <div className="rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[rgba(19,16,31,0.9)] p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[rgba(139,92,246,0.15)] px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-[#8b5cf6]">
                    Sponsored
                  </span>
                  <span className="font-mono text-[0.6rem] text-[rgba(240,240,248,0.25)]">skip →</span>
                </div>
                <p className="mt-3 font-medium text-[rgba(240,240,248,0.9)]">
                  Pitch decks that close rounds — made with Pitch.
                </p>
                <p className="mt-1 text-xs text-[rgba(240,240,248,0.45)]">
                  Beautiful templates, collaboration tools, and analytics.
                </p>
                <button className="mt-3 rounded-lg bg-[#8b5cf6] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
                  Try Free →
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-[#34d399]" />
                <span className="font-mono text-[#34d399]">+$0.01 earned</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
        <h2 className="text-center font-heading text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.03em]">
          Frequently <span className="gradient-text">Asked</span>
        </h2>
        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="card-surface rounded-2xl p-6">
              <p className="font-heading font-semibold tracking-[-0.01em]">{faq.q}</p>
              <p className="mt-2.5 leading-relaxed text-[rgba(240,240,248,0.55)]">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-5 py-16 pb-32 text-center sm:px-8">
        <h2 className="font-heading text-3xl font-bold tracking-[-0.03em]">
          Ready to start <span className="gradient-text">earning?</span>
        </h2>
        <p className="mt-4 text-[rgba(240,240,248,0.5)]">
          Free to join. No card required. Works in 60 seconds.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/dashboard" className="btn-gradient w-full sm:w-auto">
            Start Earning Free
          </Link>
          <Link href="/pricing" className="btn-ghost w-full sm:w-auto">
            See Pricing
          </Link>
        </div>
      </section>
    </div>
  )
}
