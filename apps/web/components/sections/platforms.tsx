const platforms = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Midjourney', 'Copilot', 'Grok', 'Mistral']

export function Platforms() {
  return (
    <section className="relative z-10 w-full py-16">
      <p className="text-center font-heading text-xs font-bold uppercase tracking-[0.16em] text-[rgba(240,240,248,0.25)]">
        Works Seamlessly With
      </p>
      <div className="mask-fade-x mt-8 overflow-hidden">
        <div className="flex w-max animate-marquee gap-0">
          {[...platforms, ...platforms, ...platforms].map((p, i) => (
            <div key={i} className="px-3">
              <div className="flex items-center gap-2.5 rounded-full border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.06)] px-5 py-2.5 whitespace-nowrap">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
                />
                <span className="font-heading text-sm font-medium text-[rgba(240,240,248,0.7)]">
                  {p}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
