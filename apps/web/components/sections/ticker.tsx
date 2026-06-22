const data = [
  { value: '$14,820+', label: 'Total Paid Out' },
  { value: '1.8M', label: 'Impressions Served' },
  { value: '2,341', label: 'Active Earners' },
  { value: '2.4s', label: 'Avg Latency Gap' },
  { value: '180+', label: 'Live Campaigns' },
  { value: '$0.01', label: 'Per View' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'Earner Rating' },
]

export function Ticker() {
  return (
    <div className="relative z-10 overflow-hidden border-y border-[rgba(139,92,246,0.15)] bg-[#0a0a14]/80 py-4 backdrop-blur">
      <div className="mask-fade-x overflow-hidden">
        <div className="flex w-max animate-ticker">
          {[...data, ...data].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-8">
              <span className="gradient-text font-mono text-lg font-bold">{item.value}</span>
              <span className="text-xs uppercase tracking-[0.08em] text-[rgba(240,240,248,0.4)]">
                {item.label}
              </span>
              <span className="ml-5 h-1 w-1 rounded-full bg-[rgba(139,92,246,0.4)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
