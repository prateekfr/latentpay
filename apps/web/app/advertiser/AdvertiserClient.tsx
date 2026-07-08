"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "../../components/ui/AnimatedCounter";
import SectionReveal from "../../components/ui/SectionReveal";
import StatTiles from "./_components/StatTiles";
import BidQueue from "./_components/BidQueue";
import CampaignForm from "./_components/CampaignForm";
import CampaignsTable from "./_components/CampaignsTable";
import type { BidQueueEntry, CampaignDTO, Surface } from "./types";
import { SURFACE_LABELS } from "./types";

interface Props {
  email: string;
  companyName: string;
  balance: number;
  campaigns: CampaignDTO[];
  initialSurface: Surface;
  initialBidQueue: BidQueueEntry[];
}

export default function AdvertiserClient({
  email,
  companyName,
  balance,
  campaigns: initialCampaigns,
  initialSurface,
  initialBidQueue,
}: Props) {
  const [campaigns, setCampaigns] = useState<CampaignDTO[]>(initialCampaigns);
  const [surface, setSurface] = useState<Surface>(initialSurface);
  const [bidQueue, setBidQueue] = useState<BidQueueEntry[]>(initialBidQueue);
  const [bidQueueLoading, setBidQueueLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBidQueueLoading(true);
    fetch(`/api/v1/auction/${surface}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.campaigns)) setBidQueue(data.campaigns);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setBidQueueLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [surface, campaigns]);

  const topBid = bidQueue[0]?.bidPerBlock ?? 0;
  const servingCampaigns = campaigns.filter((c) => c.status === "serving");
  const isLeadingSurface = servingCampaigns.some((c) => c.surface === surface);
  const leaderAdLine = servingCampaigns.find((c) => c.surface === surface)?.adLine;

  const totalSpend = useMemo(
    () => campaigns.reduce((s, c) => s + (c.viewsDelivered / 1000) * c.bidPerBlock, 0),
    [campaigns],
  );

  function handleCreated(campaign: CampaignDTO) {
    setCampaigns((prev) => [campaign, ...prev]);
  }

  function handleUpdated(campaign: CampaignDTO) {
    setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? campaign : c)));
  }

  function handleDeleted(id: string) {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#07070d] pt-24 pb-20 px-4">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ─── Header ───────────────────────────────── */}
        <SectionReveal>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="tag tag-amber mb-2 inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-ring-green" />
                Advertiser Console
              </span>
              <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white">
                Reach the most focused audience on earth.
              </h1>
              <p className="text-white/40 text-sm mt-1">Live campaigns, real-time delivery, one auction.</p>
            </div>
            <a
              href="mailto:support@latentpay.com"
              className="btn-ghost self-start sm:self-auto px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Contact support
            </a>
          </div>
        </SectionReveal>

        {/* ─── Budget hero + company card ─────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 card-surface rounded-2xl p-5 sm:p-8 relative overflow-hidden border border-amber-500/20"
            style={{ boxShadow: "0 0 50px rgba(245,158,11,0.12)" }}
          >
            <div
              className="absolute -right-20 -top-20 w-64 h-64 rounded-full glow-breathe"
              style={{ background: "radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 70%)" }}
            />
            <div className="relative z-10">
              <span className="tag tag-amber mb-4 inline-flex">Available Budget</span>
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-2">
                <span className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight break-all">
                  $<AnimatedCounter value={balance} decimals={2} />
                </span>
                <span className="text-white/30 font-mono text-sm">USD</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
                <span className="text-amber-400 font-mono text-xs sm:text-sm font-semibold">
                  ${totalSpend.toFixed(2)} spent lifetime
                </span>
                {servingCampaigns.length > 0 && (
                  <span className="tag tag-green">{servingCampaigns.length} live</span>
                )}
              </div>
              <p className="text-white/30 text-xs max-w-md leading-relaxed">
                Place a new campaign in the same live auction the homepage runs.{" "}
                {email && (
                  <>
                    Signed in as <span className="text-white/50">{email}</span>.
                  </>
                )}{" "}
                Need something custom?{" "}
                <a href="mailto:support@latentpay.com" className="text-amber-400 hover:text-amber-300">
                  Contact support
                </a>
                .
              </p>
            </div>
          </motion.div>

          {/* Leading-surface live status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-surface rounded-2xl p-6 flex flex-col justify-center"
          >
            {isLeadingSurface ? (
              <>
                <div className="relative flex-shrink-0 mb-3">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30 w-3 h-3" />
                  <span className="relative w-3 h-3 rounded-full bg-emerald-400 block" />
                </div>
                <span className="text-sm font-semibold text-emerald-400">You&apos;re #1</span>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">
                  Leading the <span className="text-white/60">{SURFACE_LABELS[surface]}</span> surface with
                  &ldquo;{leaderAdLine}&rdquo;
                </p>
              </>
            ) : (
              <>
                <span className="text-2xl mb-2">🎯</span>
                <span className="text-sm font-semibold text-white/70">Not leading yet</span>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">
                  {topBid > 0
                    ? `Top bid on ${SURFACE_LABELS[surface]} is $${topBid.toFixed(2)} — beat it to take #1.`
                    : `No campaigns on ${SURFACE_LABELS[surface]} yet — be the first to serve.`}
                </p>
              </>
            )}
          </motion.div>
        </div>

        {/* ─── Stat tiles ─────────────────────────────── */}
        <StatTiles campaigns={campaigns} />

        {/* ─── Place a new campaign ──────────────────── */}
        <div className="grid lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-2">
            <BidQueue surface={surface} entries={bidQueue} loading={bidQueueLoading} />
          </div>
          <div className="lg:col-span-3">
            <CampaignForm
              email={email}
              companyName={companyName}
              surface={surface}
              onSurfaceChange={setSurface}
              topBid={topBid}
              onCreated={handleCreated}
            />
          </div>
        </div>

        {/* ─── Campaigns table ───────────────────────── */}
        <SectionReveal delay={0.05}>
          <CampaignsTable campaigns={campaigns} onUpdated={handleUpdated} onDeleted={handleDeleted} />
        </SectionReveal>

      </div>
    </div>
  );
}
