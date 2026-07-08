"use client";

export type Role = "earner" | "advertiser";

export interface RoleOption {
  role: Role;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: string;
  glow: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "earner",
    title: "I'm a User",
    subtitle: "Earn money",
    description: "Get paid for the seconds your AI spends thinking. No setup cost, ever.",
    icon: "💸",
    accent: "#34d399",
    glow: "rgba(52,211,153,0.25)",
  },
  {
    role: "advertiser",
    title: "I'm an Advertiser",
    subtitle: "Reach developers",
    description: "Bid for the most focused attention on earth — one line, while they wait.",
    icon: "📣",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
  },
];

interface Props {
  option: RoleOption;
  onClick?: () => void;
  disabled?: boolean;
  ctaLabel?: string;
}

export function RoleOptionCard({ option, onClick, disabled, ctaLabel = "Continue →" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative flex flex-col items-start text-left rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-1 cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      style={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 12px 40px ${option.glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
      }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl mb-4"
        style={{ background: `${option.accent}1a`, border: `1px solid ${option.accent}40` }}
      >
        {option.icon}
      </div>
      <span
        className="text-xs font-mono uppercase tracking-wider font-semibold mb-1"
        style={{ color: option.accent }}
      >
        {option.subtitle}
      </span>
      <h3 className="font-display font-bold text-lg text-white mb-2">{option.title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{option.description}</p>
      <span
        className="mt-4 text-sm font-semibold flex items-center gap-1.5 transition-transform group-hover:translate-x-1"
        style={{ color: option.accent }}
      >
        {ctaLabel}
      </span>
    </button>
  );
}
