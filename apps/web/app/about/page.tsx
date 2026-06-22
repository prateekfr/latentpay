import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — LatentPay',
  description: 'The story behind LatentPay — who we are, why we built it, and where we are going.',
}

const values = [
  {
    title: 'Privacy by Default',
    body: 'We built LatentPay so it never needs to read your prompts. Earning money should not cost you your data.',
    accent: '#34d399',
  },
  {
    title: 'User Alignment',
    body: "The earner's experience comes first. If an ad feels intrusive, it should not exist on our platform — full stop.",
    accent: '#8b5cf6',
  },
  {
    title: 'Radical Transparency',
    body: 'Every payout rate, every impression count, every CPM charged to advertisers — all visible to earners in real time.',
    accent: '#22d3ee',
  },
  {
    title: 'Fair Economics',
    body: 'The majority of every impression dollar goes to the user, not to us. We take a small platform fee and nothing more.',
    accent: '#fbbf24',
  },
]

const team = [
  { name: 'Manav', role: 'Founder & CEO', initials: 'MN', gradient: 'from-violet-600 to-fuchsia-500' },
  { name: 'Engineering', role: 'Core Platform', initials: 'EP', gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Design', role: 'Product & Brand', initials: 'DS', gradient: 'from-pink-500 to-rose-600' },
  { name: 'Growth', role: 'Earner & Advertiser', initials: 'GR', gradient: 'from-amber-500 to-orange-500' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-[#f0f0f8]">
      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-5 pb-16 pt-36 text-center sm:px-8 sm:pt-40">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{ background: 'radial-gradient(55% 40% at 50% 0%, rgba(168,85,247,0.2), transparent 70%)' }}
        />
        <span className="relative font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#a855f7]">
          Our Story
        </span>
        <h1 className="relative mt-4 font-heading text-[clamp(2.5rem,7vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          We turned a bug into a{' '}
          <span className="gradient-text">business model</span>
        </h1>
        <p className="relative mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[rgba(240,240,248,0.55)]">
          Every time you send a prompt, your model disappears for a few seconds to think. That time has
          always existed — LatentPay is the first company to make it valuable to the person waiting.
        </p>
      </section>

      {/* Origin story */}
      <section className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <div className="card-surface space-y-6 rounded-3xl p-10 leading-relaxed text-[rgba(240,240,248,0.65)]">
          <p>
            The idea started in a late-night coding session. Waiting on a Claude response, the founder
            noticed the spinner — 3 seconds, 4 seconds, 5 seconds — and thought:{' '}
            <em className="text-[rgba(240,240,248,0.85)]">
              &ldquo;This time belongs to me. Is anyone doing anything with it?&rdquo;
            </em>
          </p>
          <p>
            Nobody was. The entire ad industry had spent decades targeting search results, social feeds,
            and videos. Nobody had thought to look at the one place where every internet user now
            spends cumulative hours every week — waiting on AI.
          </p>
          <p>
            LatentPay was incorporated six weeks later. The first version was a Chrome extension that
            detected generation state on ChatGPT. It paid out 7 users a grand total of $14 in its
            first week. Those 7 users told 40 more. Those 40 told the first 2,000.
          </p>
          <p>
            We now serve impressions across six AI platforms, have paid out over $14,000 to active
            earners, and have a growing roster of advertisers who have discovered what contextual,
            high-intent AI-native advertising looks like.
          </p>
          <p className="font-medium text-[rgba(240,240,248,0.85)]">
            We are just getting started.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="text-center">
          <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.03em]">
            What we <span className="gradient-text">believe</span>
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="card-surface rounded-3xl p-8">
              <div
                className="mb-4 h-1 w-12 rounded-full"
                style={{ background: v.accent }}
              />
              <h3
                className="font-heading text-xl font-bold tracking-[-0.02em]"
                style={{ color: v.accent }}
              >
                {v.title}
              </h3>
              <p className="mt-3 leading-relaxed text-[rgba(240,240,248,0.55)]">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <div className="text-center">
          <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.03em]">
            The <span className="gradient-text">team</span>
          </h2>
          <p className="mt-4 text-[rgba(240,240,248,0.45)]">
            Small by design. Fast by nature.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="card-surface flex flex-col items-center rounded-2xl p-6 text-center">
              <div
                className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${member.gradient} font-heading text-xl font-bold text-white`}
              >
                {member.initials}
              </div>
              <div className="mt-4 font-heading font-semibold">{member.name}</div>
              <div className="mt-1 text-xs text-[rgba(240,240,248,0.4)]">{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="mx-auto max-w-2xl px-5 pb-32 pt-8 text-center sm:px-8">
        <h2 className="font-heading text-3xl font-bold tracking-[-0.03em]">
          Get in <span className="gradient-text">touch</span>
        </h2>
        <p className="mt-4 text-[rgba(240,240,248,0.5)]">
          Press inquiries, partnership proposals, or just want to say hi?
        </p>
        <a
          href="mailto:hello@latentpay.io"
          className="btn-ghost mt-8 inline-flex"
        >
          hello@latentpay.io
        </a>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/careers" className="text-sm text-[rgba(240,240,248,0.4)] hover:text-[rgba(240,240,248,0.7)] transition-colors">
            View open roles →
          </Link>
          <Link href="/pricing" className="text-sm text-[rgba(240,240,248,0.4)] hover:text-[rgba(240,240,248,0.7)] transition-colors">
            Advertiser pricing →
          </Link>
        </div>
      </section>
    </div>
  )
}
