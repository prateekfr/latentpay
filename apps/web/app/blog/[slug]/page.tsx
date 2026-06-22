import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog — LatentPay',
}

const posts: Record<string, { title: string; date: string; readTime: string; tag: string; tagColor: string; content: string }> = {
  'introducing-latentpay': {
    title: 'Introducing LatentPay: Turning AI Latency Into Income',
    date: 'June 10, 2025',
    readTime: '5 min read',
    tag: 'Company',
    tagColor: '#8b5cf6',
    content: `Every time you send a message to an AI model, something predictable happens: the model disappears for a few seconds to think. Those seconds have a name in systems engineering — latency. They are the gap between your question and the answer.

The entire AI industry has treated this latency as a problem to be minimised. Engineers race to reduce it. Startups benchmark themselves on it. But nobody had thought to ask a different question: what if that time could be valuable to the person who is waiting?

That question is the founding thesis of LatentPay.

**The Insight**

We spend cumulative hours each week waiting on AI. If you are a developer, a writer, a researcher, or just a curious person who uses ChatGPT or Claude daily, those gaps add up to 20, 30, 40 minutes of waiting time per week — time you are already giving, but not getting anything back for.

LatentPay turns that time into income. A lightweight browser extension detects the exact moment a model begins generating, and for the duration of that gap, surfaces a single, relevant, skippable sponsor card. When the response arrives, the card disappears and a micro-payment lands in your wallet.

**The Architecture**

The first thing we get asked is: does LatentPay read my prompts?

No. Not ever.

The extension hooks into the page's loading and UI state — it detects the spinner, the "thinking" animation, the streaming indicator. It does not touch the text input, the conversation history, or anything that could identify what you are working on. Contextual targeting works on task category inference (are you on a coding AI or a design AI?) not on prompt content.

This was a non-negotiable design decision made on day one.

**Where We Are Now**

We launched to a small beta group in April 2025 and have since grown to over 2,300 active earners across 40 countries. We have paid out more than $14,000 in total earnings. Our advertiser roster includes developer tools, SaaS products, and creator platforms who have discovered what it means to reach high-intent users in the exact moment they are thinking about a problem.

This is just the beginning. The AI latency inventory is enormous and largely untouched. We are building the infrastructure to make it the most effective — and most user-respecting — ad surface on the internet.

Welcome to the wait economy.`,
  },
  'the-wait-economy': {
    title: 'The Wait Economy: A New Frontier in Digital Advertising',
    date: 'June 14, 2025',
    readTime: '7 min read',
    tag: 'Insights',
    tagColor: '#22d3ee',
    content: `Advertising has always followed attention. Search ads followed the intent signal. Social ads followed the attention signal. Video ads followed the lean-back signal. Each new medium created a new surface for reaching people where they already were.

AI latency is the next surface — and it is different from everything that came before.

**Why AI Latency Is Unique**

When someone sees a search ad, they are in active intent mode — looking for something specific. When someone sees a social ad, they are in passive consumption mode — scrolling to be entertained or informed. Both of these states are well-mapped by existing ad tech.

But the AI latency state is something new. The user has just articulated a specific thought — a question, a task, a need — and is now in a moment of anticipation. They are not scrolling. They are not searching. They are waiting for something they actively asked for. Their attention is uniquely available.

This is what we call the wait economy: the emerging commercial value of the moments between asking and receiving in AI-mediated experiences.

**The Inventory**

The numbers are staggering. ChatGPT alone processes hundreds of millions of queries per day. Claude, Gemini, Perplexity, and dozens of other AI tools add hundreds of millions more. At an average latency of 2–4 seconds per query, the total waiting time created by global AI usage is measured in centuries per day.

A fraction of that inventory, monetised thoughtfully, represents a meaningful new revenue stream for the people who generate it — the users.

**Context Without Surveillance**

The advertising industry has built enormous infrastructure for targeting based on identity, behaviour, and profile. LatentPay deliberately does not use any of this. Our contextual matching works on task category, not user identity. A developer asking about API rate limits sees a developer tool ad. A writer crafting a press release sees a writing software ad. The model does not know — and does not need to know — who you are.

This is better for users (no surveillance), better for advertisers (high-intent contextual match), and arguably better for society (an ad model that does not depend on mass data collection).

**What Comes Next**

The wait economy is just beginning. As AI becomes more deeply embedded in work, creativity, and daily life, the latency inventory will grow. The question is whether that time will be captured by platforms and wasted — or returned to the people who generate it.

We think it should go back to the users. That is what LatentPay is building.`,
  },
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = posts[slug]

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#07070d] text-[#f0f0f8]">
        <h1 className="font-heading text-4xl font-bold">Article Not Found</h1>
        <p className="mt-4 text-[rgba(240,240,248,0.5)]">This post may still be in the works.</p>
        <Link href="/blog" className="btn-ghost mt-8 inline-flex">
          ← Back to Blog
        </Link>
      </div>
    )
  }

  const paragraphs = post.content.split('\n\n')

  return (
    <div className="min-h-screen bg-[#07070d] text-[#f0f0f8]">
      <div className="mx-auto max-w-2xl px-5 pb-32 pt-36 sm:px-8 sm:pt-40">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[rgba(240,240,248,0.4)] transition-colors hover:text-[rgba(240,240,248,0.7)]"
        >
          ← Blog
        </Link>

        {/* Meta */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span
            className="rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider"
            style={{ background: `${post.tagColor}18`, color: post.tagColor }}
          >
            {post.tag}
          </span>
          <span className="text-sm text-[rgba(240,240,248,0.35)]">{post.date}</span>
          <span className="text-sm text-[rgba(240,240,248,0.35)]">·</span>
          <span className="text-sm text-[rgba(240,240,248,0.35)]">{post.readTime}</span>
        </div>

        {/* Title */}
        <h1 className="mt-6 font-heading text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.03em]">
          {post.title}
        </h1>

        {/* Divider */}
        <div
          className="my-10 h-px w-full"
          style={{ background: 'linear-gradient(to right, rgba(139,92,246,0.5), transparent)' }}
        />

        {/* Content */}
        <div className="space-y-6 leading-relaxed text-[rgba(240,240,248,0.65)]">
          {paragraphs.map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**')) {
              return (
                <h2
                  key={i}
                  className="font-heading text-xl font-bold tracking-[-0.02em] text-[rgba(240,240,248,0.9)]"
                >
                  {para.slice(2, -2)}
                </h2>
              )
            }
            return <p key={i}>{para}</p>
          })}
        </div>

        {/* Footer nav */}
        <div className="mt-16 flex justify-between">
          <Link
            href="/blog"
            className="text-sm text-[rgba(240,240,248,0.4)] transition-colors hover:text-[rgba(240,240,248,0.7)]"
          >
            ← All posts
          </Link>
          <Link href="/dashboard" className="btn-gradient inline-flex text-sm">
            Start Earning
          </Link>
        </div>
      </div>
    </div>
  )
}
