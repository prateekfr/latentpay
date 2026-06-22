import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog — LatentPay',
  description: 'Thoughts on AI monetization, the wait economy, and building the future of passive income.',
}

const posts = [
  {
    slug: 'introducing-latentpay',
    title: 'Introducing LatentPay: Turning AI Latency Into Income',
    excerpt:
      'Every time you prompt an AI model, there are seconds of silence. We built a business inside those seconds — here is the story of why and how.',
    date: 'June 10, 2025',
    readTime: '5 min read',
    tag: 'Company',
    tagColor: '#8b5cf6',
  },
  {
    slug: 'the-wait-economy',
    title: 'The Wait Economy: A New Frontier in Digital Advertising',
    excerpt:
      'Search ads captured intent. Social ads captured attention. AI latency ads capture something entirely new — the moment between asking and knowing.',
    date: 'June 14, 2025',
    readTime: '7 min read',
    tag: 'Insights',
    tagColor: '#22d3ee',
  },
  {
    slug: 'privacy-first-ads',
    title: 'How We Serve Ads Without Reading Your Prompts',
    excerpt:
      'Context-matching without surveillance sounds impossible. We will explain exactly how LatentPay achieves relevance without touching prompt content.',
    date: 'June 17, 2025',
    readTime: '6 min read',
    tag: 'Engineering',
    tagColor: '#34d399',
  },
  {
    slug: 'earner-spotlight-maya',
    title: 'Earner Spotlight: How Maya Made $312 in One Month',
    excerpt:
      'Maya Reyes is an indie developer who spends 4–6 hours a day inside AI tools. She had no idea those hours could pay her back.',
    date: 'June 20, 2025',
    readTime: '4 min read',
    tag: 'Community',
    tagColor: '#fbbf24',
  },
  {
    slug: 'advertiser-guide',
    title: 'The Advertiser Guide to AI-Native Contextual Targeting',
    excerpt:
      'Reaching developers, founders, and power users at the exact moment they are researching your category. A deep-dive into LatentPay for brands.',
    date: 'June 21, 2025',
    readTime: '8 min read',
    tag: 'Advertisers',
    tagColor: '#ec4899',
  },
  {
    slug: 'latency-map',
    title: 'We Mapped 100,000 AI Gaps. Here Is What We Found.',
    excerpt:
      'A data deep-dive into latency patterns across AI tools — average gap durations, variance by task type, and what this means for ad inventory.',
    date: 'June 22, 2025',
    readTime: '9 min read',
    tag: 'Data',
    tagColor: '#a855f7',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-[#f0f0f8]">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-5 pb-12 pt-36 sm:px-8 sm:pt-40">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{ background: 'radial-gradient(50% 40% at 50% 0%, rgba(139,92,246,0.18), transparent 70%)' }}
        />
        <div className="relative">
          <span className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#8b5cf6]">
            Journal
          </span>
          <h1 className="mt-4 font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            The LatentPay <span className="gradient-text">Blog</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-[rgba(240,240,248,0.5)]">
            Thoughts on AI monetization, the wait economy, privacy-first advertising, and building in public.
          </p>
        </div>
      </section>

      {/* Featured post */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="card-surface group relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden="true"
            style={{ background: 'radial-gradient(50% 50% at 0% 50%, rgba(139,92,246,0.12), transparent)' }}
          />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[rgba(139,92,246,0.15)] px-3 py-1 font-mono text-xs uppercase tracking-wider text-[#8b5cf6]">
                Company
              </span>
              <span className="text-sm text-[rgba(240,240,248,0.35)]">June 10, 2025</span>
              <span className="text-sm text-[rgba(240,240,248,0.35)]">·</span>
              <span className="text-sm text-[rgba(240,240,248,0.35)]">5 min read</span>
            </div>
            <h2 className="mt-5 font-heading text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-tight tracking-[-0.03em]">
              Introducing LatentPay: Turning AI Latency Into Income
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[rgba(240,240,248,0.5)]">
              Every time you prompt an AI model, there are seconds of silence. We built a business inside
              those seconds — here is the story of why and how.
            </p>
            <Link
              href="/blog/introducing-latentpay"
              className="mt-8 inline-flex items-center gap-2 font-heading text-sm font-semibold text-[#8b5cf6] transition-all hover:gap-3"
            >
              Read article <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Post grid */}
      <section className="mx-auto max-w-7xl px-5 py-12 pb-32 sm:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(1).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card-surface group flex flex-col overflow-hidden rounded-2xl p-7 transition-all hover:border-[rgba(139,92,246,0.4)]"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="rounded-full px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider"
                  style={{ background: `${post.tagColor}18`, color: post.tagColor }}
                >
                  {post.tag}
                </span>
                <span className="text-xs text-[rgba(240,240,248,0.3)]">{post.readTime}</span>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold leading-snug tracking-[-0.02em] transition-colors group-hover:text-white">
                {post.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[rgba(240,240,248,0.45)]">
                {post.excerpt}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs text-[rgba(240,240,248,0.3)]">{post.date}</span>
                <span className="font-heading text-xs font-semibold text-[#8b5cf6] opacity-0 transition-opacity group-hover:opacity-100">
                  Read →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
