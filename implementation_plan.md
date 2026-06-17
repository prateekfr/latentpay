# Implementation Plan - Phase 4: Web Portal & Wallets

This plan covers the implementation of a user-facing dashboard page at `/dashboard` within `apps/web` utilizing Next.js React Server Components. We will fetch persistent user wallet balances and transaction ledgers from the SQLite database and display them in a sleek, dark-mode-first Tailwind layout.

## User Review Required

> [!IMPORTANT]
> **Mock User Fetching**:
> Since full auth is deferred, we will fetch data for `mock-user-123`. To prevent the page from crashing if the user has not viewed any ads yet, we will automatically check if the user exists. If they do not exist, we will display a sleek, interactive "0.00 LP" state with instructions on how to run the Chrome Extension to start earning.
>
> **Navigation Header Placement**:
> We will add the navigation header inside the root [layout.tsx](file:///d:/Projects/latentpay/apps/web/app/layout.tsx) so it persists across all subpages, featuring a clean navbar with dashboard routes.

## Open Questions

There are no open questions.

---

## Proposed Changes

### Web Application (`apps/web`)

#### [MODIFY] [layout.tsx](file:///d:/Projects/latentpay/apps/web/app/layout.tsx)
- Embed a sleek header navigation component with a logo ("LatentPay"), links to "/" and "/dashboard", and a mock user badge showing their status.

#### [NEW] [page.tsx](file:///d:/Projects/latentpay/apps/web/app/dashboard/page.tsx)
- Create a React Server Component at `apps/web/app/dashboard/page.tsx`.
- Import the global `prisma` client.
- Fetch user info for `mock-user-123` containing their current wallet balance.
- Query their 5 most recent `Impression` history records, sorted by `createdAt DESC`.
- Render a premium dashboard using Tailwind CSS:
  - **Metric Card**: Sleek dark background card with glowing border showing "Total Earnings" formatted in USD (e.g. `$0.01`).
  - **Impressions Stat Card**: Shows the count of active generations watched.
  - **Transaction Table**: Lists the date, duration (seconds), and payout credit (`+$0.01`) for recent generations, with hover highlights and micro-interactions.
  - **Zero State Graphic**: A gorgeous, friendly banner encouraging extension usage if the ledger is empty.

---

## Verification Plan

### Automated Tests
- Run TS checks and workspace lints to ensure clean builds:
  ```bash
  npm run check-types
  npm run lint
  ```

### Manual Verification
- Boot the dev server:
  ```bash
  npm run dev --workspace=web
  ```
- Open `http://localhost:3000/dashboard` in a browser.
- Verify:
  1. Header navigation is visible and routes between home and dashboard cleanly.
  2. If `mock-user-123` exists in SQLite, the balance shows correctly (e.g. `$0.01` or `$0.02` if previously run).
  3. Recent impressions are listed chronologically in a clean table.
  4. Design is fully responsive, looking premium with smooth gradients and dark-mode aesthetics.
