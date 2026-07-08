import Link from "next/link";
import { LatentPayLogo } from "./ui/LatentPayLogo";

const LINKS = {
  Product: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Earn", href: "/dashboard" },
    { label: "Advertise", href: "/advertiser" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.06] bg-[#07070d]">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex mb-5 opacity-80 hover:opacity-100 transition-opacity">
              <LatentPayLogo markHeight={32} wordmarkSize="16px" />
            </Link>

            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Turning the AI wait state into a revenue stream for everyone — users, developers, and advertisers.
            </p>

            <div className="flex items-center gap-4 mt-6">
              {["𝕏", "▲", "in", "gh"].map((icon) => (
                <button
                  key={icon}
                  className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/20 transition-all text-xs font-mono"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
                {group}
              </p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/[0.05] grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
          <p className="text-xs text-white/25 text-center sm:text-left justify-self-center sm:justify-self-start">
            © 2026 LatentPay, Inc. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/25 justify-self-center order-first sm:order-none">
            Made with <span className="heartbeat text-red-500">❤️</span> from{" "}
            <span className="gradient-text-india font-semibold">India</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-white/25 font-mono justify-self-center sm:justify-self-end">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
