'use client'

import { Code2, Chrome, Terminal, Download } from 'lucide-react'
import { TiltCard } from '../ui/TiltCard'
import { SectionReveal, StaggerContainer, StaggerItem } from '../ui/SectionReveal'

type Platform = {
  key: string
  icon: typeof Code2
  color: string
  name: string
  tag: string
  body: string
  meta: string
  downloadHref: string
  downloadLabel: string
  instructions: string
}

const platforms: Platform[] = [
  {
    key: 'ide',
    icon: Code2,
    color: '#8b5cf6',
    name: 'IDE Extension',
    tag: 'VS Code',
    body: 'Track earnings from your sidebar while Claude Code thinks in VS Code. Zero workflow change.',
    meta: 'VS Code · Cursor · Windsurf',
    downloadHref: '/downloads/latentpay-ide.vsix',
    downloadLabel: 'Download .vsix',
    instructions: 'Extensions panel → ⋯ → Install from VSIX',
  },
  {
    key: 'chrome',
    icon: Chrome,
    color: '#22d3ee',
    name: 'Chrome Extension',
    tag: 'Browser',
    body: 'Earn from every gap in ChatGPT, Claude, and Gemini — right where you already chat.',
    meta: 'Chrome · Brave · Edge',
    downloadHref: '/downloads/latentpay-chrome-extension.zip',
    downloadLabel: 'Download .zip',
    instructions: 'Unzip → chrome://extensions → Enable Developer Mode → Load unpacked',
  },
  {
    key: 'terminal',
    icon: Terminal,
    color: '#fbbf24',
    name: 'Terminal',
    tag: 'CLI',
    body: 'Claude Code CLI sessions are read automatically by the same IDE extension — no separate install.',
    meta: 'macOS · Linux · Windows',
    downloadHref: '/downloads/latentpay-ide.vsix',
    downloadLabel: 'Download .vsix',
    instructions: 'Same extension as IDE — reads your Claude Code sessions automatically',
  },
]

export function Downloads() {
  return (
    <section id="extension" className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionReveal className="mx-auto max-w-2xl text-center">
        <span className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#8b5cf6]">
          Get LatentPay
        </span>
        <h2 className="mt-4 font-heading text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.03em]">
          Everywhere you <span className="gradient-text">already work.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[rgba(240,240,248,0.5)]">
          One account, every surface. Install once, sign in, and start earning the moment an AI makes you wait.
        </p>
      </SectionReveal>

      <StaggerContainer className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" stagger={0.1}>
        {platforms.map((p) => (
          <StaggerItem key={p.key}>
            <DownloadCard platform={p} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  )
}

function DownloadCard({ platform: p }: { platform: Platform }) {
  return (
    <TiltCard className="h-full">
      <div className="card-surface relative flex h-full flex-col rounded-3xl p-7">
        <div className="flex items-center justify-between">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl"
            style={{ background: `${p.color}22`, border: `1px solid ${p.color}44` }}
          >
            <p.icon className="h-5 w-5" style={{ color: p.color }} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(52,211,153,0.12)] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-[#34d399]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] pulse-ring-green" />
            Live
          </span>
        </div>

        <span
          className="mt-5 inline-block w-fit rounded-full px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wider"
          style={{ background: `${p.color}1a`, color: p.color }}
        >
          {p.tag}
        </span>
        <h3 className="mt-3 font-heading text-xl font-bold tracking-[-0.02em]">{p.name}</h3>
        <p className="mt-2 flex-1 leading-relaxed text-[rgba(240,240,248,0.55)]">{p.body}</p>
        <p className="mt-4 font-mono text-xs text-[rgba(240,240,248,0.3)]">{p.meta}</p>

        <div className="mt-6">
          <a
            href={p.downloadHref}
            download
            className="btn-gradient inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm"
          >
            {p.downloadLabel}
            <Download className="h-4 w-4" />
          </a>
          <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-[rgba(240,240,248,0.35)]">
            {p.instructions}
          </p>
        </div>
      </div>
    </TiltCard>
  )
}

export default Downloads
