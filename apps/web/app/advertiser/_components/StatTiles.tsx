import { motion } from "framer-motion";
import AnimatedCounter from "../../../components/ui/AnimatedCounter";
import type { CampaignDTO } from "../types";

interface Props {
  campaigns: CampaignDTO[];
}

const BADGE_CLASSES: Record<string, string> = {
  violet: "bg-violet-500/15 border-violet-500/25 text-violet-300",
  amber: "bg-amber-500/15 border-amber-500/25 text-amber-300",
  cyan: "bg-cyan-500/15 border-cyan-500/25 text-cyan-300",
  emerald: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300",
};

export default function StatTiles({ campaigns }: Props) {
  const totalCampaigns = campaigns.length;
  const serving = campaigns.filter((c) => c.status === "serving").length;
  const totalViews = campaigns.reduce((s, c) => s + c.viewsDelivered, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicksDelivered, 0);
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const servingBlocks = campaigns.filter((c) => c.status === "serving").reduce((s, c) => s + c.numBlocks, 0);
  const queuedBlocks = campaigns.filter((c) => c.status === "queued").reduce((s, c) => s + c.numBlocks, 0);

  const tiles = [
    { label: "Campaigns", value: totalCampaigns, decimals: 0, prefix: "", sub: "total placed", icon: "📣", color: "violet" },
    { label: "Serving", value: serving, decimals: 0, prefix: "", sub: "currently active", icon: "🔴", color: "emerald" },
    { label: "Views", value: totalViews, decimals: 0, prefix: "", sub: `${totalClicks.toLocaleString()} clicks`, icon: "👁", color: "cyan" },
    { label: "Spend", value: totalSpend, decimals: 2, prefix: "$", sub: "lifetime spend", icon: "💸", color: "amber" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {tiles.map((tile, i) => (
        <motion.div
          key={tile.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.06 }}
          className="card-surface rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/30 uppercase tracking-wider font-mono">{tile.label}</span>
            <div
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm flex-shrink-0 ${BADGE_CLASSES[tile.color]}`}
            >
              {tile.icon}
            </div>
          </div>
          <div className="font-display font-bold text-2xl gradient-text">
            <AnimatedCounter value={tile.value} prefix={tile.prefix} decimals={tile.decimals} duration={1.8} />
          </div>
          <div className="text-xs text-white/30 mt-1">{tile.sub}</div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.24 }}
        className="card-surface rounded-2xl p-5 col-span-2 md:col-span-1"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/30 uppercase tracking-wider font-mono">Blocks</span>
          <div className="w-8 h-8 rounded-lg border bg-violet-500/15 border-violet-500/25 text-violet-300 flex items-center justify-center text-sm flex-shrink-0">
            🧩
          </div>
        </div>
        <div className="font-display font-bold text-2xl text-white">
          {servingBlocks} / {queuedBlocks}
        </div>
        <div className="text-xs text-white/30 mt-1">serving / queued</div>
      </motion.div>
    </div>
  );
}
