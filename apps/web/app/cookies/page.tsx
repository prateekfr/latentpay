import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy — LatentPay',
  description: 'How LatentPay uses cookies and similar tracking technologies.',
}

const cookieTypes = [
  {
    name: 'Strictly Necessary',
    required: true,
    color: '#34d399',
    description:
      'These cookies are essential for the Service to function. They enable core functionality like authentication sessions and security. The Service cannot work properly without them.',
    examples: [
      { name: '__clerk_session', purpose: 'Authentication session token — identifies you as logged in', duration: 'Session' },
      { name: 'csrf_token', purpose: 'Cross-site request forgery protection', duration: 'Session' },
      { name: 'pref_cookie_consent', purpose: 'Stores your cookie consent choice', duration: '1 year' },
    ],
  },
  {
    name: 'Functional',
    required: false,
    color: '#8b5cf6',
    description:
      'Functional cookies remember your preferences and settings to provide a more personalised experience — such as your dashboard layout or selected payout currency.',
    examples: [
      { name: 'lp_locale', purpose: 'Your preferred language/region setting', duration: '1 year' },
      { name: 'lp_theme', purpose: 'UI theme preference', duration: '1 year' },
    ],
  },
  {
    name: 'Analytics',
    required: false,
    color: '#22d3ee',
    description:
      'Analytics cookies help us understand how the Service is used so we can improve it. We use privacy-respecting analytics that do not build cross-site profiles or fingerprint your device.',
    examples: [
      { name: '_plausible', purpose: 'Aggregate page view analytics (Plausible Analytics — no PII)', duration: '1 day' },
    ],
  },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-[#f0f0f8]">
      <div className="mx-auto max-w-3xl px-5 pb-32 pt-36 sm:px-8 sm:pt-40">
        {/* Header */}
        <div className="mb-12">
          <span className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#22d3ee]">
            Legal
          </span>
          <h1 className="mt-4 font-heading text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Cookie Policy
          </h1>
          <p className="mt-4 text-[rgba(240,240,248,0.45)]">
            Last updated: June 22, 2025
          </p>
          <div className="mt-6 rounded-2xl border border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.05)] p-5 text-sm leading-relaxed text-[rgba(240,240,248,0.7)]">
            <strong className="text-[#22d3ee]">Short version:</strong> We use only necessary cookies
            by default. Optional analytics cookies can be declined. We do not use advertising cookies
            or third-party tracking.
          </div>
        </div>

        {/* What are cookies */}
        <div className="mb-12">
          <h2 className="font-heading text-xl font-bold tracking-[-0.02em]">What Are Cookies?</h2>
          <p className="mt-4 leading-relaxed text-[rgba(240,240,248,0.55)]">
            Cookies are small text files stored on your device by your browser when you visit a website.
            They are widely used to make websites work, to remember your preferences, and to provide
            analytics information to site owners. LatentPay uses cookies and similar technologies
            (such as local storage) for the purposes described below.
          </p>
        </div>

        {/* Cookie types */}
        <div className="mb-12 space-y-8">
          <h2 className="font-heading text-xl font-bold tracking-[-0.02em]">
            Cookies We Use
          </h2>
          {cookieTypes.map((type) => (
            <div key={type.name} className="card-surface overflow-hidden rounded-3xl">
              <div
                className="flex items-center justify-between px-7 py-5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: type.color }}
                  />
                  <h3 className="font-heading font-bold" style={{ color: type.color }}>
                    {type.name}
                  </h3>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 font-mono text-xs"
                  style={{
                    background: type.required ? `${type.color}18` : 'rgba(255,255,255,0.05)',
                    color: type.required ? type.color : 'rgba(240,240,248,0.4)',
                  }}
                >
                  {type.required ? 'Required' : 'Optional'}
                </span>
              </div>
              <div className="p-7">
                <p className="text-sm leading-relaxed text-[rgba(240,240,248,0.55)]">
                  {type.description}
                </p>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {['Name', 'Purpose', 'Duration'].map((h) => (
                          <th
                            key={h}
                            className="pb-3 pr-4 text-left font-heading text-xs font-bold uppercase tracking-wider text-[rgba(240,240,248,0.3)]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                      {type.examples.map((ex) => (
                        <tr key={ex.name}>
                          <td className="py-3 pr-4 font-mono text-xs text-[rgba(240,240,248,0.7)]">
                            {ex.name}
                          </td>
                          <td className="py-3 pr-4 text-xs text-[rgba(240,240,248,0.5)]">
                            {ex.purpose}
                          </td>
                          <td className="py-3 text-xs text-[rgba(240,240,248,0.5)]">
                            {ex.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Third party */}
        <div className="mb-12">
          <h2 className="font-heading text-xl font-bold tracking-[-0.02em]">Third-Party Cookies</h2>
          <p className="mt-4 leading-relaxed text-[rgba(240,240,248,0.55)]">
            LatentPay does not permit third-party advertising networks to set cookies on our site.
            The browser extension does not inject any third-party tracking scripts into AI tool pages.
            Authentication is handled by Clerk, which may set its own session cookies governed by
            their privacy policy.
          </p>
        </div>

        {/* Managing cookies */}
        <div className="mb-12">
          <h2 className="font-heading text-xl font-bold tracking-[-0.02em]">Managing Your Cookie Preferences</h2>
          <p className="mt-4 leading-relaxed text-[rgba(240,240,248,0.55)]">
            You can accept or decline optional cookies when you first visit the site. You can also
            change your preferences at any time in your account settings. Strictly Necessary cookies
            cannot be disabled as they are required for the Service to function.
          </p>
          <p className="mt-4 leading-relaxed text-[rgba(240,240,248,0.55)]">
            You may also control cookies through your browser settings. Note that disabling cookies
            may affect the functionality of the Service, including your ability to stay logged in.
          </p>
        </div>

        {/* Contact */}
        <div className="mb-12">
          <h2 className="font-heading text-xl font-bold tracking-[-0.02em]">Contact</h2>
          <p className="mt-4 leading-relaxed text-[rgba(240,240,248,0.55)]">
            If you have questions about our use of cookies, please contact us at{' '}
            <a href="mailto:privacy@latentpay.io" className="text-[#22d3ee] hover:underline underline-offset-2">
              privacy@latentpay.io
            </a>
            .
          </p>
        </div>

        {/* Links to other policies */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/privacy"
            className="text-sm text-[rgba(240,240,248,0.4)] hover:text-[rgba(240,240,248,0.7)] transition-colors"
          >
            ← Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-[rgba(240,240,248,0.4)] hover:text-[rgba(240,240,248,0.7)] transition-colors"
          >
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  )
}
