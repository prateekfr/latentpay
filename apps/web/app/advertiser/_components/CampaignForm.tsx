"use client";

import { useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import Toggle from "../../../components/ui/Toggle";
import FileDrop from "../../../components/ui/FileDrop";
import { BLOCK_SIZE, DELIVERY_SPEEDS, MIN_BID_PER_BLOCK, MIN_BID_TO_LEAD, SURFACES } from "../../../lib/auction";
import type { CampaignDTO, DeliverySpeed, Surface } from "../types";
import { SURFACE_LABELS } from "../types";

interface Props {
  email: string;
  companyName: string;
  surface: Surface;
  onSurfaceChange: (s: Surface) => void;
  topBid: number;
  onCreated: (campaign: CampaignDTO) => void;
}

const SURFACE_COPY: Record<Surface, { icon: string; label: string; blurb: string }> = {
  extension: { icon: "🖥️", label: SURFACE_LABELS.extension, blurb: "Premium space — clickable hyperlinks" },
  terminal: { icon: "⌨️", label: SURFACE_LABELS.terminal, blurb: "The CLI status line — ambient, lower price, high volume" },
};

const SPEED_COPY: Record<DeliverySpeed, { label: string; blurb: string }> = {
  slow: { label: "Slow", blurb: "~2 days" },
  medium: { label: "Medium", blurb: "~6 hours" },
  fast: { label: "Fast", blurb: "ASAP" },
};

export default function CampaignForm({ email, companyName, surface, onSurfaceChange, topBid, onCreated }: Props) {
  const [formEmail, setFormEmail] = useState(email);
  const [adLine, setAdLine] = useState("");
  const [targetUrl, setTargetUrl] = useState("https://");
  const [formCompanyName, setFormCompanyName] = useState(companyName === "My Company" ? "" : companyName);
  const [brandIconUrl, setBrandIconUrl] = useState<string | null>(null);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>("fast");
  const [bidPerBlock, setBidPerBlock] = useState(MIN_BID_TO_LEAD);
  const [numBlocks, setNumBlocks] = useState(1);
  const [showPricingInfo, setShowPricingInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = bidPerBlock * numBlocks;
  const totalViews = numBlocks * BLOCK_SIZE;
  const needsToBeat = topBid > 0 && bidPerBlock <= topBid;
  const beatBid = Math.round((topBid + 0.1) * 100) / 100;

  const domain = useMemo(() => {
    try {
      return new URL(targetUrl).hostname || "your-site.com";
    } catch {
      return "your-site.com";
    }
  }, [targetUrl]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (adLine.length < 3 || adLine.length > 60) {
      setError("Ad line must be 3-60 characters.");
      return;
    }
    if (!/^https:\/\/.+/.test(targetUrl)) {
      setError("Destination URL must start with https://.");
      return;
    }
    if (bidPerBlock < MIN_BID_PER_BLOCK) {
      setError(`Bid per block must be at least $${MIN_BID_PER_BLOCK.toFixed(2)}.`);
      return;
    }
    if (!Number.isInteger(numBlocks) || numBlocks < 1) {
      setError("Number of blocks must be a positive integer.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formEmail,
          adLine,
          targetUrl,
          companyName: formCompanyName || undefined,
          brandIconUrl: brandIconUrl || undefined,
          showOnLeaderboard,
          surface,
          deliverySpeed,
          bidPerBlock,
          numBlocks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong placing this campaign.");
        return;
      }
      onCreated(data.campaign);
      setAdLine("");
      setTargetUrl("https://");
      setBrandIconUrl(null);
      setNumBlocks(1);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="font-display font-bold text-white text-lg">Place a new campaign</h3>
        <p className="text-xs text-white/40 mt-1 leading-relaxed">
          Same auction as the homepage — bid any amount from ${MIN_BID_TO_LEAD.toFixed(2)} for the Claude Code
          spinner; below-top bids queue behind the leaders. Billed to your signed-in account.
        </p>
      </div>

      <div>
        <label className="field-label">Email (required)</label>
        <input
          type="email"
          required
          className="field"
          value={formEmail}
          onChange={(e) => setFormEmail(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="field-label mb-0">Ad line · 3–60 char</label>
          <span className="text-[10px] text-white/25 font-mono">{adLine.length} / 60</span>
        </div>
        <input
          type="text"
          required
          maxLength={60}
          placeholder="Try Linear — issue tracking built for speed"
          className="field"
          value={adLine}
          onChange={(e) => setAdLine(e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Destination URL (https://)</label>
        <input
          type="url"
          required
          placeholder="https://linear.app/"
          className="field"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Company name (optional, shown on leaderboard)</label>
        <input
          type="text"
          className="field"
          placeholder="Linear"
          value={formCompanyName}
          onChange={(e) => setFormCompanyName(e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Brand icon (optional, PNG/JPG/WebP ≤ 64 KB)</label>
        <FileDrop value={brandIconUrl} onChange={setBrandIconUrl} />
      </div>

      <Toggle
        checked={showOnLeaderboard}
        onChange={setShowOnLeaderboard}
        label="Show me on the public leaderboard"
      />

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="field-label mb-0">Bid per block (min ${MIN_BID_PER_BLOCK.toFixed(2)} — sets queue priority)</label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">$</span>
          <input
            type="number"
            step="0.01"
            min={MIN_BID_PER_BLOCK}
            required
            className="field"
            value={bidPerBlock}
            onChange={(e) => setBidPerBlock(parseFloat(e.target.value) || 0)}
          />
        </div>
        {topBid > 0 && (
          <p className={`mt-1.5 text-[11px] ${needsToBeat ? "text-amber-400" : "text-emerald-400"}`}>
            Top bid is ${topBid.toFixed(2)} per block
            {needsToBeat ? ` — to take #1 you must bid at least $${beatBid.toFixed(2)} ($0.10 over the top).` : " — you're leading this surface."}
          </p>
        )}
      </div>

      <div>
        <label className="field-label">Number of blocks (1,000 views each)</label>
        <input
          type="number"
          step="1"
          min={1}
          required
          className="field"
          value={numBlocks}
          onChange={(e) => setNumBlocks(parseInt(e.target.value, 10) || 1)}
        />
      </div>

      <div>
        <label className="field-label">Where does this campaign run? (your bid prices this one placement)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SURFACES.map((s) => {
            const active = surface === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onSurfaceChange(s)}
                className={`relative text-left rounded-xl p-3.5 transition-all duration-200 ${active ? "scale-[1.02]" : ""}`}
                style={{
                  border: `1px solid ${active ? "rgba(245,158,11,0.55)" : "rgba(255,255,255,0.08)"}`,
                  background: active ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
                  boxShadow: active ? "0 4px 24px rgba(245,158,11,0.15)" : "none",
                }}
              >
                {active && (
                  <span className="absolute top-2.5 right-2.5 text-amber-400 text-xs">✓</span>
                )}
                <div className="flex items-center gap-2.5 text-sm text-white/85">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                      active ? "bg-amber-500/20 border border-amber-500/30" : "bg-white/[0.04] border border-white/[0.06]"
                    }`}
                  >
                    {SURFACE_COPY[s].icon}
                  </div>
                  <span className="font-semibold">{SURFACE_COPY[s].label}</span>
                </div>
                <p className="text-[11px] text-white/35 mt-1.5 leading-relaxed">{SURFACE_COPY[s].blurb}</p>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-white/25 mt-2">
          Each surface runs its own auction — your bid competes only against campaigns on the same surface.{" "}
          <button
            type="button"
            onClick={() => setShowPricingInfo((v) => !v)}
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            How surface pricing works
          </button>
        </p>
        {showPricingInfo && (
          <div className="mt-2 rounded-xl p-3 text-[11px] text-white/45 leading-relaxed bg-white/[0.03] border border-white/[0.06]">
            Extension and Terminal each rank campaigns independently by bid. The highest bidder on a surface
            serves live; everyone else queues behind it in bid order and takes over automatically once the
            leader&apos;s purchased blocks are fully delivered.
          </div>
        )}
      </div>

      <div>
        <label className="field-label">Delivery speed (how quickly your views are spent — does not change the price)</label>
        <div className="grid grid-cols-3 gap-2">
          {DELIVERY_SPEEDS.map((s) => {
            const active = deliverySpeed === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setDeliverySpeed(s)}
                className={`rounded-xl py-2.5 text-center transition-all duration-200 ${active ? "scale-[1.02]" : ""}`}
                style={{
                  border: `1px solid ${active ? "rgba(139,92,246,0.55)" : "rgba(255,255,255,0.08)"}`,
                  background: active ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)",
                  boxShadow: active ? "0 4px 20px rgba(139,92,246,0.15)" : "none",
                }}
              >
                <div className="text-xs font-semibold text-white/85">{SPEED_COPY[s].label}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{SPEED_COPY[s].blurb}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.06]">
        <p className="text-[11px] text-white/30 uppercase tracking-wider font-mono mb-2">Estimated total</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-display font-bold text-2xl gradient-text">${totalPrice.toFixed(2)}</span>
          <span className="text-xs text-white/35">
            {numBlocks} block{numBlocks === 1 ? "" : "s"} at ${bidPerBlock.toFixed(2)} = {totalViews.toLocaleString()}{" "}
            views
          </span>
        </div>
        <p className="text-[11px] text-white/25 leading-relaxed">
          Each block buys 1,000 views. More blocks = more views. A higher bid moves you up the queue so your
          views deliver sooner — it doesn&apos;t add views. You pay this fixed price and never more.
        </p>
      </div>

      {/* Live preview */}
      <div>
        <p className="field-label">Live preview · what every viewer sees</p>
        <div className="rounded-xl p-3 border border-violet-500/15 bg-[#0a0a12]">
          <div className="flex items-center gap-2 mb-2">
            <span className="tag tag-purple" style={{ fontSize: "9px", padding: "1px 5px" }}>
              Sponsored
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {brandIconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brandIconUrl} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" />
              ) : null}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{adLine || "Your ad here"}</p>
                <p className="text-[9px] text-white/35 truncate mt-0.5">{domain}</p>
              </div>
            </div>
            <button
              type="button"
              className="flex-shrink-0 bg-violet-600 text-white text-[9px] font-bold px-2 py-1 rounded"
            >
              Checkout now →
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-pink-400">{error}</p>}

      <motion.button
        type="submit"
        disabled={submitting}
        whileTap={{ scale: 0.98 }}
        className="btn-gradient w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Launching…" : "Launch campaign"}
      </motion.button>
    </form>
  );
}
