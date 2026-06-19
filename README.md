# LatentPay

LatentPay is an overlay engine and micro-rewards platform. The system allows users to opt-in to view native, non-intrusive sponsor advertisements in a custom Chrome extension overlay during Large Language Model (LLM) generation latency. In return, users earn passive micro-rewards per query.

The platform is designed to scale across major LLM platforms, including OpenAI ChatGPT, Anthropic Claude, and Google Gemini.

---

## Monorepo Architecture

This project is organized as a Turborepo monorepo, separating core interfaces and packages:

- **`apps/web`**: A Next.js web application containing the user landing page, user earnings dashboard, advertiser campaign manager portal, database model layers, and the Clerk-based security and proxy middleware.
- **`apps/extension`**: A Manifest V3 Chrome Extension containing content scripts, background settings, and interactive popup interface.
- **`packages/ui`**: Shared UI component library.
- **`packages/eslint-config`**: Shared ESLint configurations.
- **`packages/typescript-config`**: Shared TypeScript compiler configurations.

---

## Technology Stack and Core Dependencies

### Web Portal and API Service

- **Framework**: Next.js (Version 16, utilizing Turbopack)
- **Styling**: Tailwind CSS
- **Database ORM**: Prisma with SQLite
- **Authentication**: Clerk for Next.js authentication

### Browser Extension

- **Specification**: Manifest V3
- **Content Injection**: Isolated Shadow DOM Injection (using the Glass Pane strategy) to prevent website stylesheets from bleeding into the LatentPay banner overlay.
- **Platform Support**:
  - ChatGPT (`https://chatgpt.com/*`)
  - Claude (`https://claude.ai/*`)
  - Gemini (`https://gemini.google.com/*`)

---

## Ingestion Flow and Security

1.  **Platform Detection**: The content script determines the hosting website using `window.location.hostname`.
2.  **Streaming Monitor**: The script monitors active streaming states:
    - **ChatGPT**: Inspects the stop button selector (`button[data-testid="stop-button"]`) and class `.result-streaming`.
    - **Claude**: Targets enabled case-insensitive stop buttons and verifies input container state (`fieldset[disabled]`).
    - **Gemini**: Validates active progress indicators (`mat-progress-bar`, `div[role="progressbar"]`) and cancel buttons.
3.  **Dynamic Snapping**: On active streams, the isolated glass pane root snaps its coordinate boundaries to the LLM input composer in real-time.
4.  **Reward Evaluation**: If an active stream continues for 5.0 seconds or more, it is flagged as a valid view.
5.  **User Verification Bridge**: On generation stop, the script retrieves the Clerk User ID from synced storage. If present, it submits an HTTP POST request containing `userId`, `campaignId`, and `durationSeconds` to the Next.js API endpoint.
6.  **Ledger Transaction**: The web server processes the request inside a Prisma transaction, logging the impression, updating campaign statistics, and incrementing the target user's wallet balance by `$0.01` USD.

---

## Installation and Configuration

### Prerequisites

- Node.js (Version 18 or higher)
- npm (Version 10 or higher)
- A Clerk developer account

### Step 1: Clone and Install Dependencies

Navigate to your target directory and clone the repository, then run the installer:

```bash
npm install
```

### Step 2: Configure Environment Variables

Create a `.env.local` file inside `apps/web/` to define the configuration properties:

```bash
# apps/web/.env.local

# Clerk Credentials
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Next.js Public URLs (used for sign-in redirection)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/
```

### Step 3: Run Database Migrations

Initialize the SQLite database schema and generate the client types:

```bash
# Run schema migration
npx prisma migrate dev --name init --schema=apps/web/prisma/schema.prisma

# Generate Prisma Client types
npx prisma generate --schema=apps/web/prisma/schema.prisma
```

---

## Running the Project

### Developing Web and API Services

To start the Next.js dev server on port 3000:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Installing the Browser Extension

1.  Open Google Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** in the top-right corner.
3.  Click **Load unpacked** in the top-left corner.
4.  Select the directory: `d:\Projects\latentpay\apps\extension`.

---

## End-to-End Testing Procedure

### Step 1: Seed Data and Retrieve User ID

1.  Navigate to the web portal at `http://localhost:3000`.
2.  Click **Sign In** and complete the Clerk authentication process.
3.  Navigate to the **Dashboard** at `http://localhost:3000/dashboard`.
4.  Locate the section **Link your extension** and copy the displayed User ID (e.g., `user_2...`).

### Step 2: Configure the Extension

1.  Click the LatentPay Extension icon in your Chrome toolbar.
2.  Paste the copied Clerk User ID into the input field.
3.  Click **Save User ID**.

### Step 3: Serve the Ad Banner

1.  Navigate to ChatGPT, Claude, or Gemini.
2.  Type a prompt and submit it to initiate a streaming response.
3.  Observe that the glassmorphic LatentPay ad banner slides in smoothly and centers itself directly above the prompt input box.
4.  Keep the stream running for more than 5.0 seconds. The status badge will change to **+0.01 LP Earned**.
5.  Wait for the LLM to complete its response, or click **Stop generating** manually. The banner will immediately disappear.
6.  Return to the web portal **Dashboard** and refresh the page to view the updated wallet balance and impression ledger table.

---

## Verification Commands

To verify workspace types and configuration matches, run:

```bash
# Static type checking
npm run check-types

# ESLint validation
npm run lint

# Compile production bundles
npm run build
```
