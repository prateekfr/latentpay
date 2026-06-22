import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — LatentPay',
  description: 'LatentPay is free for earners. Transparent CPM pricing for advertisers. No hidden fees.',
}

const earnerFeatures = [
  'Install the browser extension in seconds',
  'Earn on every AI session automatically',
  'Real-time wallet with live balance',
  'Cash out anytime — no minimums',
  'Works across ChatGPT, Claude, Gemini & more',
  'Zero data selling — ever',
]

const advertiserPlans = [
  {
    name: 'Starter',
    cpm: '$2.50',
    minSpend: '$50',
    features: [
      'Self-serve campaign builder',
      'Category targeting (broad)',
      'Basic spend analytics',
      'Standard support',
    ],
    accent: '#8b5cf6',
    highlight: false,
  },
  {
    name: 'Growth',
    cpm: '$4.00',
    minSpend: '$500',
    features: [
      'Everything in Starter',
      'Keyword & intent targeting',
      'A/B creative testing',
      'Live CPM analytics dashboard',
      'Priority support',
    ],
    accent: '#ec4899',
    highlight: true,
  },
  {
    name: 'Enterprise',
    cpm: 'Custom',
    minSpend: 'Custom',
    features: [
      'Everything in Growth',
      'Managed campaign service',
      'Dedicated account manager',
      'Custom integrations & reporting',
      'SLA + invoiced billing',
    ],
    accent: '#22d3ee',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-[#f0f0f8]">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-5 pb-12 pt-36 text-center sm:px-8 sm:pt-40">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{ background: 'radial-gradient(60% 40% at 50% 0%, rgba(124,58,237,0.2), transparent 70%)' }}
        />
        <span className="relative font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#fbbf24]">
          Pricing
        </span>
        <h1 className="relative mt-4 font-heading text-[clamp(2.5rem,7vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Simple, <span className="gradient-text">transparent</span> pricing
        </h1>
        <p className="relative mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[rgba(240,240,248,0.55)]">
          Earners are always free. Advertisers pay only for real impressions — no subscriptions,
          no setup fees.
        </p>
      </section>

      {/* Earner free tier */}
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <div
          className="relative overflow-hidden rounded-[2rem] border border-[rgba(52,211,153,0.3)] p-10 sm:p-14"
          style={{ background: 'linear-gradient(145deg, rgba(12,40,30,0.7), rgba(7,7,13,0.95))' }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{ background: 'radial-gradient(50% 60% at 100% 0%, rgba(52,211,153,0.12), transparent)' }}
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-block rounded-full border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)] px-3 py-1 font-heading text-xs font-bold uppercase tracking-[0.12em] text-[#34d399]">
                For Earners
              </span>
              <div className="mt-4 flex items-end gap-2">
                <span className="font-heading text-7xl font-extrabold tracking-[-0.04em] text-white">
                  $0
                </span>
                <span className="mb-3 text-[rgba(240,240,248,0.45)]">forever</span>
              </div>
              <p className="mt-2 text-[rgba(240,240,248,0.55)]">
                LatentPay is 100% free for users. We earn on the advertiser side so you never pay a cent.
              </p>
            </div>
            <div className="shrink-0 space-y-3 lg:min-w-[280px]">
              {earnerFeatures.map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-[rgba(240,240,248,0.7)]">
                  <span className="h-5 w-5 shrink-0 rounded-full bg-[rgba(52,211,153,0.15)] text-center text-xs leading-5 text-[#34d399]">
                    ✓
                  </span>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div className="relative mt-10">
            <Link href="/dashboard" className="btn-gradient inline-flex">
              Start Earning Free
            </Link>
          </div>
        </div>
      </section>

      {/* Advertiser plans */}
      <section className="mx-auto max-w-7xl px-5 py-16 pb-32 sm:px-8">
        <div className="text-center">
          <span className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#ec4899]">
            For Advertisers
          </span>
          <h2 className="mt-4 font-heading text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.03em]">
            Reach people <span className="gradient-text">in the moment they think</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[rgba(240,240,248,0.5)]">
            Pay only per verified impression. No monthly seat fees. Cancel anytime.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {advertiserPlans.map((plan) => (
            <div
              key={plan.name}
              className="card-surface relative flex flex-col overflow-hidden rounded-3xl p-8"
              style={
                plan.highlight
                  ? { border: `1px solid ${plan.accent}60`, boxShadow: `0 0 48px ${plan.accent}20` }
                  : {}
              }
            >
              {plan.highlight && (
                <span
                  className="absolute right-6 top-6 rounded-full px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-white"
                  style={{ background: plan.accent }}
                >
                  Most Popular
                </span>
              )}
              <div
                className="mb-1 font-heading text-xs font-bold uppercase tracking-[0.12em]"
                style={{ color: plan.accent }}
              >
                {plan.name}
              </div>
              <div className="mt-3 flex items-end gap-1">
                <span className="font-heading text-4xl font-extrabold tracking-tight">{plan.cpm}</span>
                {plan.cpm !== 'Custom' && (
                  <span className="mb-1.5 text-sm text-[rgba(240,240,248,0.4)]">CPM</span>
                )}
              </div>
              <div className="mt-1 text-sm text-[rgba(240,240,248,0.4)]">
                Min spend: {plan.minSpend}
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[rgba(240,240,248,0.65)]">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full text-center text-[0.6rem] leading-4" style={{ background: `${plan.accent}22`, color: plan.accent }}>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href={plan.name === 'Enterprise' ? '/about#contact' : '/advertiser'}
                  className="block w-full rounded-xl py-3 text-center font-heading text-sm font-bold transition-all hover:brightness-110"
                  style={{
                    background: plan.highlight
                      ? `linear-gradient(135deg, ${plan.accent}, #a855f7)`
                      : `${plan.accent}18`,
                    color: plan.highlight ? '#fff' : plan.accent,
                    border: `1px solid ${plan.accent}40`,
                  }}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-[rgba(240,240,248,0.3)]">
          All plans are billed per impression. No subscriptions. No setup fees.{' '}
          <Link href="/how-it-works" className="text-[#8b5cf6] underline-offset-2 hover:underline">
            Learn how targeting works →
          </Link>
        </p>
      </section>
    </div>
  )
}
