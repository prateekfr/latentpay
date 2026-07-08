"use client";

import { motion } from "framer-motion";
import type { BidQueueEntry, Surface } from "../types";
import { SURFACE_LABELS } from "../types";

interface Props {
  surface: Surface;
  entries: BidQueueEntry[];
  loading?: boolean;
}

export default function BidQueue({ surface, entries, loading }: Props) {
  return (
    <div className="card-surface rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.05] flex items-center justify-between">
        <div>
          <h4 className="font-display font-semibold text-white text-sm">Bid queue</h4>
          <p className="text-[11px] text-white/30 mt-0.5">
            {entries.length} live · {SURFACE_LABELS[surface]} surface
            {loading && " · updating…"}
          </p>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto divide-y divide-white/[0.04]">
        {entries.length === 0 ? (
          <div className="py-10 text-center text-sm text-white/30">
            No campaigns on this surface yet — be the first.
          </div>
        ) : (
          entries.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.6) }}
              className={`flex items-center gap-3 px-4 py-3 ${
                i === 0 ? "bg-amber-500/[0.06] border-l-2 border-amber-400" : ""
              }`}
            >
              {i === 0 ? (
                <span className="text-sm w-6 flex-shrink-0 text-center" title="Leading this surface">
                  👑
                </span>
              ) : (
                <span className="text-xs font-mono text-white/25 w-6 flex-shrink-0 text-center">{i + 1}</span>
              )}
              <div className="min-w-0 flex-1">
                <p className={`text-sm truncate ${i === 0 ? "text-white font-semibold" : "text-white/85"}`}>
                  {e.adLine}
                </p>
                <p className="text-[11px] text-white/30 mt-0.5">
                  <span className="tag tag-green" style={{ padding: "1px 6px", fontSize: "9px" }}>
                    live
                  </span>{" "}
                  · {e.viewsDelivered.toLocaleString()} imps
                </p>
              </div>
              <span
                className={`font-mono text-sm font-semibold flex-shrink-0 ${i === 0 ? "text-amber-400" : "gradient-text"}`}
              >
                ${e.bidPerBlock.toFixed(2)}
                <span className="text-white/25 text-[10px] font-normal"> /1k</span>
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
