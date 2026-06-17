import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "LatentPay - Earn rewards while LLMs think",
  description:
    "Opt-in to view native, non-intrusive sponsor ads during LLM latency and earn passive micro-rewards per query.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#07070d] text-gray-100 antialiased`}
      >
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#07070d]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 font-extrabold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                  L
                </div>
                <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-lg font-bold tracking-tight text-transparent group-hover:opacity-95 transition-opacity">
                  LatentPay
                </span>
              </Link>

              {/* Navigation Links */}
              <nav className="flex items-center gap-6 text-sm font-medium text-gray-400">
                <Link
                  href="/"
                  className="hover:text-gray-100 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className="hover:text-gray-100 transition-colors"
                >
                  Dashboard
                </Link>
              </nav>
            </div>

            {/* User Badge */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.05)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                mock-user-123
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
