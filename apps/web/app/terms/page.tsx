import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — LatentPay',
  description: 'The terms and conditions governing your use of LatentPay.',
}

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: `By accessing or using the LatentPay website, browser extension, or any related service (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.

These Terms apply to all visitors, users, and others who access or use the Service, including earners, advertisers, and developers.`,
  },
  {
    id: 'description',
    title: '2. Description of Service',
    body: `LatentPay is a platform that enables users ("Earners") to receive micro-payments in exchange for viewing sponsored content during AI model generation intervals ("Gaps"). Advertisers ("Brands") pay for impressions served during these Gaps. LatentPay facilitates the connection between Earners and Advertisers and processes payments on behalf of both parties.`,
  },
  {
    id: 'eligibility',
    title: '3. Eligibility',
    body: `You must be at least 13 years of age (or 16 in the EU) to use the Service. By using the Service, you represent that you meet this requirement. If you are using the Service on behalf of a company or organisation, you represent that you have authority to bind that entity to these Terms.`,
  },
  {
    id: 'accounts',
    title: '4. Accounts',
    body: `You are responsible for maintaining the security of your account credentials. You must notify us immediately at security@latentpay.io if you suspect unauthorised access to your account. We are not liable for any loss arising from unauthorised use of your account.

You may not create multiple accounts to circumvent payout limits or advertiser caps. Accounts found to be in violation may be suspended without notice.`,
  },
  {
    id: 'earner-terms',
    title: '5. Earner Terms',
    body: `As an Earner you agree to:

— Not use automation, bots, scripts, or artificial means to generate impressions or inflate earnings
— Not manipulate, block, or modify the served ad content in ways that misrepresent delivery to advertisers
— Not create false impressions through refreshing, scripted interactions, or impression farms
— Provide accurate payment information for payout purposes

Violation of these terms will result in account termination and forfeiture of any pending or accrued balance. Earnings are paid in accordance with the payout schedule available in your dashboard. LatentPay reserves the right to adjust payout rates based on advertiser demand and platform economics with 7 days' notice.`,
  },
  {
    id: 'advertiser-terms',
    title: '6. Advertiser Terms',
    body: `As an Advertiser you agree to:

— Not submit creatives that are deceptive, misleading, or violate applicable advertising laws
— Not target, collect data on, or attempt to identify individual Earners
— Comply with all applicable laws including CAN-SPAM, GDPR, and CCPA as they apply to your creatives and landing pages
— Pay all campaign charges as billed; disputed charges must be raised within 30 days of the invoice date

LatentPay reserves the right to reject, pause, or remove any campaign that violates these Terms or our Advertising Guidelines without refund.`,
  },
  {
    id: 'prohibited',
    title: '7. Prohibited Uses',
    body: `You agree not to:

— Use the Service for any illegal purpose or in violation of any laws
— Attempt to reverse-engineer, decompile, or extract source code from the extension or platform
— Interfere with the proper operation of the Service or its underlying infrastructure
— Use the Service to distribute malware, spyware, or other harmful software
— Impersonate LatentPay, its employees, or other users`,
  },
  {
    id: 'ip',
    title: '8. Intellectual Property',
    body: `All content, design, code, and materials comprising the Service are the intellectual property of LatentPay, Inc. or its licensors. You may not reproduce, distribute, or create derivative works from any part of the Service without our prior written consent.

Your account data (earnings history, campaign data) is owned by you. You grant LatentPay a limited licence to use this data to operate and improve the Service.`,
  },
  {
    id: 'disclaimers',
    title: '9. Disclaimers',
    body: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. LATENTPAY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.

EARNING RATES ARE NOT GUARANTEED AND MAY FLUCTUATE BASED ON ADVERTISER DEMAND, CAMPAIGN AVAILABILITY, AND PLATFORM ECONOMICS.`,
  },
  {
    id: 'liability',
    title: '10. Limitation of Liability',
    body: `TO THE FULLEST EXTENT PERMITTED BY LAW, LATENTPAY WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, ARISING FROM YOUR USE OF THE SERVICE.

LATENTPAY'S TOTAL LIABILITY TO YOU FOR ANY CLAIMS UNDER THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) $100 OR (B) THE AMOUNT PAID TO OR BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.`,
  },
  {
    id: 'termination',
    title: '11. Termination',
    body: `You may delete your account at any time from your dashboard settings. LatentPay may suspend or terminate your access to the Service at any time for any reason, including violation of these Terms, with or without notice.

Upon termination, your right to use the Service ceases immediately. Earned but unpaid balances above the minimum payout threshold will be disbursed within 30 days of termination unless the account was terminated for fraud.`,
  },
  {
    id: 'governing-law',
    title: '12. Governing Law',
    body: `These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Delaware.`,
  },
  {
    id: 'changes',
    title: '13. Changes to Terms',
    body: `We may update these Terms from time to time. Material changes will be communicated via email or a prominent notice in the Service at least 7 days before they take effect. Continued use of the Service after changes take effect constitutes your acceptance of the new Terms.`,
  },
  {
    id: 'contact',
    title: '14. Contact',
    body: `Questions about these Terms should be sent to:

LatentPay, Inc.
Email: legal@latentpay.io`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-[#f0f0f8]">
      <div className="mx-auto max-w-3xl px-5 pb-32 pt-36 sm:px-8 sm:pt-40">
        <div className="mb-12">
          <span className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#8b5cf6]">
            Legal
          </span>
          <h1 className="mt-4 font-heading text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Terms of Service
          </h1>
          <p className="mt-4 text-[rgba(240,240,248,0.45)]">
            Last updated: June 22, 2025
          </p>
          <div className="mt-6 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.05)] p-5 text-sm leading-relaxed text-[rgba(240,240,248,0.7)]">
            <strong className="text-[#8b5cf6]">Plain-language summary:</strong> Use LatentPay
            honestly. Do not game the system or run misleading ads. We can suspend accounts that violate
            these rules. Earners are paid as described in the dashboard. The full legal text follows.
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
