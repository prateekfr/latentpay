"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { CampaignDTO, CampaignStatus } from "../types";
import { SURFACE_LABELS } from "../types";

interface Props {
  campaigns: CampaignDTO[];
  onUpdated: (campaign: CampaignDTO) => void;
  onDeleted: (id: string) => void;
}

const STATUS_TAG: Record<CampaignStatus, string> = {
  serving: "tag-green",
  queued: "tag-amber",
  paused: "tag-muted",
  completed: "tag-purple",
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  serving: "Serving",
  queued: "Queued",
  paused: "Paused",
  completed: "Completed",
};

export default function CampaignsTable({ campaigns, onUpdated, onDeleted }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CampaignStatus>("all");
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setSyncedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  }, [campaigns]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.adLine.toLowerCase().includes(q) ||
        (c.companyName ?? "").toLowerCase().includes(q) ||
        c.targetUrl.toLowerCase().includes(q) ||
        c.status.includes(q)
      );
    });
  }, [campaigns, search, statusFilter]);

  async function togglePause(c: CampaignDTO) {
    setBusyId(c.id);
    try {
      const nextStatus = c.status === "paused" ? "queued" : "paused";
      const res = await fetch(`/api/v1/campaigns/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok) onUpdated(data.campaign);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteCampaign(c: CampaignDTO) {
    if (!confirm(`Delete "${c.adLine}"? This can't be undone.`)) return;
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/v1/campaigns/${c.id}`, { method: "DELETE" });
      if (res.ok) onDeleted(c.id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="card-surface rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/[0.05] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-white text-lg">Campaigns</h3>
          {syncedAt && <span className="text-[11px] text-white/25 font-mono">Synced {syncedAt}</span>}
        </div>
        <p className="text-xs text-white/35">Delivery and auction state from the current backend snapshot.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search ad line, brand, URL, status…"
            className="field flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="field sm:w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | CampaignStatus)}
          >
            <option value="all">All statuses</option>
            <option value="serving">Serving</option>
            <option value="queued">Queued</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="py-16 text-center px-6">
          <div className="text-4xl mb-4">🚀</div>
          <p className="text-white/40 text-sm">You do not have any campaigns yet.</p>
          <p className="text-white/25 text-xs mt-2">
            Questions about a campaign? Contact{" "}
            <a href="mailto:support@latentpay.com" className="text-violet-400 hover:text-violet-300">
              support@latentpay.com
            </a>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Ad line", "Surface", "Status", "Views", "Spend", "Bid", ""].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs text-white/30 uppercase tracking-wider font-mono"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((c, i) => {
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.04 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate max-w-[220px]">{c.adLine}</p>
                          <p className="text-xs text-white/30 font-mono truncate max-w-[220px]">{c.targetUrl}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-white/50 whitespace-nowrap">{SURFACE_LABELS[c.surface]}</td>
                      <td className="px-6 py-4">
                        <span className={`tag ${STATUS_TAG[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-white/70">
                        <div>
                          {c.viewsDelivered.toLocaleString()} / {c.viewsPurchased.toLocaleString()}
                        </div>
                        {c.clicksDelivered > 0 && (
                          <div className="text-[11px] text-white/30">{c.clicksDelivered.toLocaleString()} clicks</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-amber-400 font-semibold">
                        ${c.spend.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-white/50">${c.bidPerBlock.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {c.status !== "completed" && (
                            <button
                              type="button"
                              disabled={busyId === c.id}
                              onClick={() => togglePause(c)}
                              className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-40"
                            >
                              {c.status === "paused" ? "Resume" : "Pause"}
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busyId === c.id}
                            onClick={() => deleteCampaign(c)}
                            className="text-[11px] text-pink-400 hover:text-pink-300 transition-colors disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-white/[0.04] text-[11px] text-white/25">
            {filtered.length} of {campaigns.length} rows
          </div>
        </>
      )}
    </div>
  );
}
