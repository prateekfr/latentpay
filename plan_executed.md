# LatentPay - Product Requirement Document & Technical Specification

## 1. Executive Summary & Inspiration
* **Product Name:** LatentPay
* **Inspiration:** Inspired by Kickbacks.ai (which injects ads during IDE code generation latency). LatentPay shifts this paradigm to the consumer browser ecosystem, capturing and monetizing the "dead time" (5-30 seconds of generation latency) on mainstream consumer LLM platforms.
* **Target Platforms (MVP):** ChatGPT (chatgpt.com), Claude (claude.ai), Gemini (gemini.google.com).
* **Core Value Proposition:** Users opt-in to view native, non-intrusive sponsor ads while an LLM is generating an answer, earning passive micro-rewards per valid completion.

---

## 2. Strategic Product Decisions (The MVP Scope)
To maximize iteration velocity and eliminate infrastructure bottlenecking/fraud vectors at launch, the following constraints are locked:

1. **Ad Format (Option A - Native Infill):** Ads must NOT be intrusive popups. They must render as sleek, native-looking banner elements injected directly into the active chat response stream, right below the generating text bubble.
2. **Payout Trigger (Option B - Event-Based):**
   * No high-frequency 1-second websocket heartbeats (prevents bot-farm scaling and server overhead).
   * **Logic:** The extension records the exact timestamp when generation begins and when it ends. If total `duration >= 5 seconds`, it counts as a single valid impression and fires **one single payload** to the backend upon completion.
3. **Initial Inventory Strategy:** Initial ad payloads are hardcoded to promote LatentPay itself. The self-serve advertiser portal will populate inventory post-MVP.

---

## 3. Repository Architecture (Turborepo Monorepo)
The workspace utilizes an npm-workspaces Monorepo managed by Turborepo to enable strict TypeScript type-sharing between the client extension and the backend API.

```text
latentpay/
├── apps/
│   ├── web/          # Next.js (Landing, Dashboards, Wallets, and Ingestion API)
│   └── extension/    # Chrome Extension (Manifest V3, Content Scripts, Popup)
├── packages/
│   ├── ts-config/    # Shared TypeScript configurations
│   └── types/        # Shared data contracts (Zod validation schemas)
├── package.json      # Workspace root configuration
└── PLAN.md           # This master directive file
```
---

## 4. Unified Tech Stack
* **Language:** TypeScript (Strict Mode) across the entire stack.
* **Monorepo Orchestrator:** Turborepo + npm workspaces.
* **Web App & Ingestion API:** Next.js (App Router). API routes will double as the ingestion endpoint for extension payloads.
* **Styling:** Tailwind CSS.
* **Database:** PostgreSQL (Hosted via Supabase or Neon) handled via an ORM (Prisma or Drizzle).
* **Authentication:** Clerk or Supabase Auth.
* **Payment rails:** Stripe (for advertiser top-ups) and Stripe Connect (for user reward payouts).


## 5. Technical Flow & Logic

### Flow A: Client-Side State Detection (Content Script)
1. Content script initializes on target domain (e.g., chatgpt.com).
2. A lightweight DOM polling interval or MutationObserver monitors state-change selectors.
3. **Generation Start Trigger:** Detection of the native "Stop generating" square button action.
    * Action: Log startTime, query backend for a targeted ad creative, inject a Shadow DOM container containing the banner right inside the latest .agent-turn chat bubble.
4. **Generation End Trigger:** Disappearance of the "Stop generating" element.
    * Action: Log endTime, calculate duration = (endTime - startTime) / 1000.
    * Clear the injected ad element from the DOM.
    * If duration >= 5, package the payload and fire an HTTP POST to /api/v1/impressions.

### Flow B: Backend Event Ingestion & Ledger
1. Next.js API route receives the impression payload.
2. Server validates the payload using a shared Zod schema (verifying user session, session duration sanity, and token signatures).
3. Database transactional write:
    * Dedubbing check (preventing replay attacks).
    * Append a line item to the accurate transactional balance Ledger table.
    * Increment user's aggregate wallet balance.


## 6. Phased Implementation Roadmap
**Phase 1:** Chrome Extension DOM Parsing & Mock Overlay
* Goal: Flawless detection of active generation states on ChatGPT without breaking native UI.
* Set up Manifest V3 configuration.
* Write content scripts targeting ChatGPT's specific CSS container selectors.
* Ensure mock HTML banner injects and ejects smoothly on completion.

**Phase 2:** Database Layer & Ingestion API Setup
* Goal: Ready the data layer to record transactions.
* Initialize Postgres schema using an ORM.
* Create User, Advertiser, Campaign, and Ledger tables.
* Write the Next.js API ingestion route with strict server-side validation.

**Phase 3:** End-to-End Client-to-Server Integration
* Goal: Connect the extension to the live local database.
* Replace extension logs with actual fetch requests hitting the Next.js API.
* Implement basic user token validation so the extension knows who is earning the credit.

**Phase 4:** Web Portal, Authentication & Wallets
* Goal: Allow users to track earnings and advertisers to see analytics.
* Set up user login and onboarding.
* Build out the user balance tracking chart view. 
* Build the skeletal structure for the Advertiser Campaign creation UI.