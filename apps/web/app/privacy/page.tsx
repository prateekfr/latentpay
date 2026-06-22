import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — LatentPay',
  description: 'How LatentPay collects, uses, and protects your information.',
}

const sections = [
  {
    id: 'overview',
    title: '1. Overview',
    body: `LatentPay, Inc. ("LatentPay", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains what information we collect when you use our browser extension, website, and dashboard (collectively, the "Service"), how we use it, and what choices you have.

By using the Service you agree to the practices described in this Policy. If you disagree with any part of this Policy, please discontinue use of the Service.`,
  },
  {
    id: 'what-we-collect',
    title: '2. Information We Collect',
    body: `Account Information: When you create a LatentPay account we collect your email address, a username, and payment details for payouts. We do not collect more than we need.

Extension Telemetry: The browser extension detects when an AI model is in a generation state (i.e., "thinking"). It records the occurrence of this event, the AI platform domain, and the duration of the gap. It does not read, log, transmit, or store any prompt text, response text, or conversation content — ever.

Impression Data: We record when and for how long a sponsored card was displayed, whether it was skipped or interacted with, and which campaign it belonged to. This data is used to calculate earner payouts and provide advertisers with aggregate campaign metrics.

Usage Analytics: We collect standard web analytics (page views, referrer, device type, session duration) via privacy-respecting tools that do not fingerprint you or build behavioral profiles.

Payment Information: Payout details (PayPal email, crypto address, or bank information) are stored encrypted. Card data is handled exclusively by our payment processor (Stripe) and never touches our servers.`,
  },
  {
    id: 'what-we-dont-collect',
    title: '3. What We Do NOT Collect',
    body: `LatentPay is built on a privacy-first architecture. We explicitly do not:

— Read, store, or transmit your AI prompts or responses
— Build behavioral or psychological profiles of individual users
— Sell, rent, or trade your personal data to any third party
— Use third-party tracking pixels, fingerprinting scripts, or cross-site tracking
— Require location data, contacts, or camera/microphone access`,
  },
  {
    id: 'how-we-use',
    title: '4. How We Use Your Information',
    body: `We use the information we collect to:

— Operate and improve the Service
— Calculate and process earner payouts
— Provide advertisers with aggregate, anonymised campaign performance data
— Send transactional emails (payout confirmations, security alerts)
— Respond to support requests
— Comply with legal obligations

We do not use your information for personalised advertising, resale, or any purpose not listed here.`,
  },
  {
    id: 'data-sharing',
    title: '5. Data Sharing',
    body: `We share data with third parties only as necessary to operate the Service:

Service Providers: We work with Stripe (payments), Cloudflare (infrastructure), and analytics tools. These providers are contractually bound to process data only on our behalf.

Advertisers: Advertisers receive aggregate impression metrics (total impressions, skip rate, click rate by category). They never receive individual user data or any personally identifiable information.

Legal Compliance: We may disclose data if required by law, court order, or to protect the rights and safety of LatentPay, its users, or the public.

Business Transfers: In the event of a merger, acquisition, or asset sale, user data may be transferred. We will provide notice before your data is transferred and becomes subject to a different privacy policy.`,
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    body: `We retain account data for as long as your account is active or as needed to provide the Service. Impression telemetry is retained for 24 months. You may request deletion of your account and associated data at any time by contacting privacy@latentpay.io. Deletion requests are processed within 30 days.`,
  },
  {
    id: 'security',
    title: '7. Security',
    body: `We use industry-standard security practices including TLS encryption in transit, AES-256 encryption at rest for sensitive fields, and strict access controls on production systems. However, no method of transmission or storage is 100% secure. We encourage you to use a strong, unique password for your LatentPay account.`,
  },
  {
    id: 'rights',
    title: '8. Your Rights',
    body: `Depending on where you reside, you may have the right to:

— Access the personal data we hold about you
— Correct inaccurate data
— Request deletion of your data ("right to be forgotten")
— Object to or restrict certain processing
— Data portability — receive a copy of your data in a machine-readable format
— Withdraw consent at any time where processing is based on consent

To exercise any of these rights, contact us at privacy@latentpay.io. We will respond within 30 days.`,
  },
  {
    id: 'cookies',
    title: '9. Cookies',
    body: `Our website uses strictly necessary cookies for session management and authentication. We do not use advertising cookies or third-party tracking cookies. For full details, see our Cookie Policy.`,
  },
  {
    id: 'children',
    title: '10. Children\'s Privacy',
    body: `The Service is not directed at children under the age of 13 (or 16 in the EU). We do not knowingly collect personal data from children. If you believe we have inadvertently collected such data, please contact us and we will delete it promptly.`,
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by email or by displaying a prominent notice in the Service. The "Last Updated" date at the top of this page indicates when the policy was last revised.`,
  },
  {
    id: 'contact',
    title: '12. Contact',
    body: `If you have questions or concerns about this Privacy Policy or our data practices, please contact us:

LatentPay, Inc.
Email: privacy@latentpay.io
Address: On file with the registered agent`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-[#f0f0f8]">
      <div className="mx-auto max-w-3xl px-5 pb-32 pt-36 sm:px-8 sm:pt-40">
        <div className="mb-12">
          <span className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#34d399]">
            Legal
          </span>
          <h1 className="mt-4 font-heading text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-[rgba(240,240,248,0.45)]">
            Last updated: June 22, 2025
          </p>
          <div className="mt-6 rounded-2xl border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.05)] p-5 text-sm leading-relaxed text-[rgba(240,240,248,0.7)]">
            <strong className="text-[#34d399]">Plain-language summary:</strong> We do not read your
            prompts. We do not sell your data. We collect only what is needed to pay you and improve
            the Service. The full policy follows.
          </div>
        </div>

        <nav className="mb-12 rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)] p-5">
          <p className="mb-3 font-heading text-xs font-bold uppercase tracking-wider text-[rgba(240,240,248,0.4)]">
            Table of Contents
          </p>
          <ol className="space-y-1.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-[rgba(240,240,248,0.5)] transition-colors hover:text-[#8b5cf6]"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-12">
          {sections.map((s) => (
            <div key={s.id} id={s.id}>
              <h2 className="font-heading text-xl font-bold tracking-[-0.02em] text-[rgba(240,240,248,0.9)]">
                {s.title}
              </h2>
              <div className="mt-4 whitespace-pre-line text-[rgba(240,240,248,0.55)] leading-relaxed">
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
