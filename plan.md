# LatentPay Master Implementation Plan: Phases 5 - 7

## Overview
With the core generation tracking, API ingestion, and User Dashboard completed (Phases 1-4), LatentPay possesses a functional supply-side loop. The remaining phases aim to close the marketplace loop (Demand), secure the infrastructure (Auth), and expand the addressable market (Scale).

---

## Phase 5: The Advertiser Dashboard (The Demand Side)
**Goal:** Build the revenue engine. Advertisers need a portal to view budgets, monitor active campaigns, and upload creatives.

* **Database Seeding:** Implement auto-seeding logic for an advertiser (`id: 'mock-advertiser-456'`) with a starting budget (e.g., $500.00) and at least one active `Campaign` to ensure zero-state UI testing.
* **Web Portal (`/advertiser`):** Create a React Server Component dashboard.
* **Metrics & UI:**
    * Display "Remaining Budget" using the global Prisma client.
    * Render an "Active Campaigns" data table.
    * Build a "Create New Campaign" placeholder UI.
* **Creative Standards:** Enforce the IAB Leaderboard standard for ad creative uploads: **728x90 pixels (8:1 aspect ratio)**.
* **Navigation:** Update the shared `layout.tsx` header to include seamless routing to the `/advertiser` dashboard.

---

## Phase 6: Security & Authentication (The Shield)
**Goal:** Replace mock hardcoded IDs with secure, persistent user authentication.

* **Auth Integration:** Install and configure an authentication provider (e.g., Clerk or Supabase Auth) within the Next.js `apps/web` workspace.
* **Database Migration:** Update the Prisma schema to map internal `User` and `Advertiser` records to the Auth provider's secure UUIDs.
* **Route Protection:** Implement middleware to protect the `/dashboard` and `/advertiser` routes, ensuring users can only view their own ledger data.
* **Extension Handshake:** Update the Chrome Extension to retrieve and pass a secure Auth token in the headers of the `fetch` POST request to `/api/v1/impressions`, preventing spoofed ledger entries.

---

## Phase 7: Multi-LLM Expansion (The Scale)
**Goal:** Expand the extension's reach beyond ChatGPT to capture latency on other major LLM platforms.

* **Manifest Updates:** Update `manifest.json` host permissions to include `https://claude.ai/*` and `https://gemini.google.com/*`.
* **DOM Strategy Modularization:** Refactor `content.js` to detect the active hostname and apply platform-specific DOM parsing logic.
    * *ChatGPT:* Target `conversation-turn` and `.result-streaming`.
    * *Claude:* Map Anthropic's specific streaming text containers.
    * *Gemini:* Map Google's specific generation state UI elements.
* **Unified UI Rendering:** Ensure the fixed `latentpay-root` glass pane overlay correctly frames the input boxes across all three distinct responsive layouts.