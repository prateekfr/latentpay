import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers — LatentPay',
  description: 'Join the team building the wait economy. Open roles at LatentPay.',
}

const roles = [
  {
    title: 'Senior Full-Stack Engineer',
    team: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    description:
      'Own end-to-end features across the extension, web dashboard, and impression pipeline. You will touch everything from the Chrome APIs that detect model generation state to the Prisma queries that credit earner wallets.',
    skills: ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Chrome Extensions'],
    accent: '#8b5cf6',
  },
  {
    title: 'Growth & Partnerships Lead',
    team: 'Growth',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    description:
      'Drive earner acquisition and advertiser partnerships. You will own the funnel from first touch to first payout, and land the brand deals that make LatentPay\'s inventory worth buying.',
    skills: ['B2B Sales', 'Creator/User Growth', 'Analytics', 'Partnerships'],
    accent: '#ec4899',
  },
  {
    title: 'Product Designer',
    team: 'Design',
    location: 'Remote (Global)',
    type: 'Full-time',
    description:
      'Design the future of the extension UI, earner dashboard, and advertiser self-serve flow. You will define what it feels like to earn money passively and what it feels like to run a campaign on AI latency inventory.',
    skills: ['Figma', 'Motion Design', 'Design Systems', 'User Research'],
    accent: '#22d3ee',
  },
  {
    title: 'Ad Ops & Campaign Manager',
    team: 'Advertiser Success',
    location: 'Remote (US)',
    type: 'Full-time',
    description:
      'Manage advertiser campaigns from setup to reporting. You will help brands get the most out of their LatentPay spend and build the playbooks that scale our managed service tier.',
    skills: ['Ad Ops', 'Campaign Management', 'Excel/SQL', 'Client Management'],
    accent: '#fbbf24',
  },
]

const perks = [
  { emoji: '🌍', label: 'Fully Remote', desc: 'Work from anywhere in the world' },
  { emoji: '📈', label: 'Early Equity', desc: 'Meaningful ownership in what we build' },
  { emoji: '🏥', label: 'Health Coverage', desc: 'Medical, dental, and vision for you' },
  { emoji: '💻', label: 'Setup Budget', desc: '$1,500 to build your ideal workspace' },
  { emoji: '📚', label: 'Learning Stipend', desc: '$500/year for courses and conferences' },
  { emoji: '🧘', label: 'Async Culture', desc: 'Deep work time protected by default' },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-[#f0f0f8]">
      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-5 pb-16 pt-36 text-center sm:px-8 sm:pt-40">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{ background: 'radial-gradient(55% 40% at 50% 0%, rgba(236,72,153,0.18), transparent 70%)' }}
        />
        <span className="relative font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#ec4899]">
          Careers
        </span>
        <h1 className="relative mt-4 font-heading text-[clamp(2.5rem,7vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Build the <span className="gradient-text">wait economy</span>
        </h1>
        <p className="relative mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[rgba(240,240,248,0.55)]">
          We are a small team doing something nobody has done before. If you want to leave a dent and
          hate bureaucracy, you will fit right in.
        </p>
      </section>

      {/* Perks */}
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {perks.map((perk) => (
            <div key={perk.label} className="card-surface rounded-2xl p-5">
              <span className="text-2xl">{perk.emoji}</span>
              <div className="mt-3 font-heading font-semibold">{perk.label}</div>
              <div className="mt-1 text-sm text-[rgba(240,240,248,0.45)]">{perk.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Open roles */}
      <section className="mx-auto max-w-5xl px-5 py-16 pb-32 sm:px-8">
        <h2 className="font-heading text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.03em]">
          Open <span className="gradient-text">Roles</span>
        </h2>
        <p className="mt-3 text-[rgba(240,240,248,0.45)]">
          {roles.length} positions available — all remote, all full-time.
        </p>

        <div className="mt-10 space-y-6">
          {roles.map((role) => (
            <div key={role.title} className="card-surface group overflow-hidden rounded-3xl p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="font-mono text-xs uppercase tracking-wider"
                      style={{ color: role.accent }}
                    >
                      {role.team}
                    </span>
                    <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-2.5 py-0.5 text-xs text-[rgba(240,240,248,0.4)]">
                      {role.type}
                    </span>
                    <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-2.5 py-0.5 text-xs text-[rgba(240,240,248,0.4)]">
                      {role.location}
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-xl font-bold tracking-[-0.02em]">
                    {role.title}
                  </h3>
                  <p className="mt-3 max-w-2xl leading-relaxed text-[rgba(240,240,248,0.55)]">
                    {role.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {role.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg px-2.5 py-1 font-mono text-xs"
                        style={{ background: `${role.accent}14`, color: role.accent }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0">
                  <a
                    href={`mailto:jobs@latentpay.io?subject=${encodeURIComponent(role.title)}`}
                    className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 font-heading text-sm font-semibold transition-all hover:brightness-110"
                    style={{
                      borderColor: `${role.accent}40`,
                      color: role.accent,
                      background: `${role.accent}10`,
                    }}
                  >
                    Apply →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-surface mt-10 rounded-2xl p-8 text-center">
          <p className="font-heading text-lg font-semibold">
            Don&apos;t see your role?
          </p>
          <p className="mt-2 text-sm text-[rgba(240,240,248,0.45)]">
            We hire for talent, not just open seats. Tell us what you can do.
          </p>
          <a
            href="mailto:jobs@latentpay.io?subject=General Application"
            className="btn-ghost mt-6 inline-flex"
          >
            Send a General Application
          </a>
        </div>
      </section>
    </div>
  )
}
