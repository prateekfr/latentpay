import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-grow bg-[#131315]">
      <main className="max-w-7xl mx-auto px-6 overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-24 pb-24 px-6 md:px-10 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Monetize the{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Wait State.
                </span>
              </h1>
              <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Turn AI generation latency into passive earnings. Seamlessly
                inject native banner ads into LLM interfaces while users wait for
                responses.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <a
                href="#"
                className="w-full sm:w-auto text-center bg-gradient-to-r from-primary-container to-secondary-container text-white px-8 py-4 rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(107,33,168,0.5)] hover:shadow-[0_0_30px_rgba(107,33,168,0.7)] transition-all border border-primary/30 active:scale-95 duration-150 cursor-pointer"
              >
                Get Chrome Extension
              </a>
              <Link
                href="/advertiser"
                className="w-full sm:w-auto text-center bg-zinc-900/50 backdrop-blur-md border border-white/10 text-zinc-300 px-8 py-4 rounded-xl font-semibold text-sm hover:bg-zinc-800/80 transition-colors active:scale-95 duration-150"
              >
                Launch Ad Campaign
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            {/* Abstract Browser Mockup */}
            <div className="relative bg-zinc-950/80 rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Browser Header */}
              <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-black/40">
                <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                <div className="mx-auto bg-zinc-900/50 rounded-md px-16 py-1 text-[10px] text-zinc-500 font-mono border border-white/5">
                  chatgpt.com
                </div>
              </div>

              {/* Browser Content */}
              <div className="p-6 h-[400px] flex flex-col justify-end relative bg-[radial-gradient(ellipse_at_top,rgba(107,33,168,0.05),transparent)]">
                {/* Simulated Chat Bubble */}
                <div className="mb-4 max-w-[85%] self-start bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span className="font-bold text-zinc-300">ChatGPT</span>
                  </div>
                  Analyzing payload metrics... Please hold while the model is
                  thinking.
                </div>

                {/* Floating Ad Container */}
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-[90%] h-20 bg-zinc-900/85 backdrop-blur-md border border-primary/30 rounded-xl flex items-center justify-between px-6 overflow-hidden shadow-[0_0_20px_rgba(107,33,168,0.3)] animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-xs">
                      L
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-zinc-500 font-semibold block uppercase tracking-wider">
                        Sponsored Placement
                      </span>
                      <span className="text-xs text-zinc-200 font-medium">
                        Earn rewards while waiting
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 active-dot shadow-[0_0_8px_#34d399]"></div>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      LP Active
                    </span>
                  </div>
                </div>

                {/* Prompt Input Field */}
                <div className="w-full bg-zinc-900/60 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs">
                    <span className="material-symbols-outlined text-sm">
                      auto_awesome
                    </span>
                    <span>Ask ChatGPT anything...</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center cursor-pointer hover:bg-primary-container/80 transition-colors">
                    <span className="material-symbols-outlined text-white text-sm">
                      send
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Network Statistics Ticker */}
      <section className="border-y border-white/5 bg-zinc-900/30 py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-[scroll_30s_linear_infinite] gap-16 font-mono text-sm items-center">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            <span className="text-zinc-500">Total Paid Out:</span>
            <span className="text-[#10b981] font-bold">$12,450.50</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(223,183,255,0.8)]"></span>
            <span className="text-zinc-500">Active Impressions Today:</span>
            <span className="text-primary font-bold">1.2M+</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-zinc-500 text-sm">
              timer
            </span>
            <span className="text-zinc-500">Average Latency Monetized:</span>
            <span className="text-zinc-200 font-bold">7.4s</span>
          </div>
          {/* Duplicate for seamless looping */}
          <div className="flex items-center gap-3 ml-16">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            <span className="text-zinc-500">Total Paid Out:</span>
            <span className="text-[#10b981] font-bold">$12,450.50</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(223,183,255,0.8)]"></span>
            <span className="text-zinc-500">Active Impressions Today:</span>
            <span className="text-primary font-bold">1.2M+</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-zinc-500 text-sm">
              timer
            </span>
            <span className="text-zinc-500">Average Latency Monetized:</span>
            <span className="text-zinc-200 font-bold">7.4s</span>
          </div>
        </div>
      </section>

      {/* Feature Section (Bento Grid) */}
      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Card (Users) */}
          <div className="bg-white/[0.02] backdrop-blur-[12px] border border-white/5 p-8 rounded-2xl flex flex-col justify-between group hover:border-emerald-500/20 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-emerald-400">
                  payments
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Earn While It Streams
              </h3>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                Transform every loading indicator into a revenue stream. Perfect
                for power users and AI practitioners who spend hours prompting
                daily.
              </p>
            </div>
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Configuration</span>
                <span className="text-emerald-400 font-medium">
                  Zero-config
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Payouts</span>
                <span className="text-emerald-400 font-medium">Real-time</span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-zinc-500">Validation Threshold</span>
                <span className="text-emerald-400 font-medium">5s minimum</span>
              </div>
            </div>
          </div>

          {/* Right Card (Advertisers) */}
          <div className="bg-white/[0.02] backdrop-blur-[12px] border border-white/5 p-8 rounded-2xl flex flex-col justify-between group hover:border-primary/20 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary">
                  target
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Contextual Sponsorships
              </h3>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                Place your brand directly in the line of sight of high-value
                technical users during moments of undivided attention.
              </p>
            </div>
            <div className="bg-[#131315] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3 text-xs text-zinc-500 font-mono">
                <span>Upload Zone Blueprint</span>
                <span className="text-primary font-medium">728x90px (8:1)</span>
              </div>
              <div className="w-full aspect-[8/1] bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.01)_10px,rgba(255,255,255,0.01)_20px)] border-2 border-dashed border-primary/20 rounded-md flex items-center justify-center relative overflow-hidden">
                <span className="material-symbols-outlined text-primary/50 text-xl absolute animate-pulse">
                  upload_file
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-500 font-medium">
                  ChatGPT
                </span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-500 font-medium">
                  Claude
                </span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-500 font-medium">
                  Gemini
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}
