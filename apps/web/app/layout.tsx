/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FloatingOrbs } from "../components/ui/FloatingOrbs";
import "./globals.css";

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LatentPay — Monetize the Wait",
  description:
    "Turn AI latency into passive income. LatentPay shows native sponsor ads during LLM processing time and pays you micro-rewards per query — automatically.",
  keywords: ["AI monetization", "passive income", "LLM ads", "latent pay", "earn while AI thinks"],
  openGraph: {
    title: "LatentPay — Monetize the Wait",
    description: "Turn AI latency into passive income.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} bg-background overflow-x-hidden`} suppressHydrationWarning>
        <body className="font-sans antialiased relative overflow-x-hidden min-h-screen w-full">
          <FloatingOrbs />
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
