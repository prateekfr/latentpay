"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { LatentPayLogo } from "./ui/LatentPayLogo";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Earn" },
  { href: "/advertiser", label: "Advertise" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#07070d]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity">
          <LatentPayLogo markHeight={34} wordmarkSize="17px" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-white"
                    : "text-white/50 hover:text-white/90 hover:bg-white/[0.05]"
                }`}
              >
                {label}
                {active && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <NavAuth />

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-px bg-current transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[6px]" : "mb-1.5"}`} />
            <span className={`block w-5 h-px bg-current transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : "mb-1.5"}`} />
            <span className={`block h-px bg-current transition-all duration-300 origin-center ${menuOpen ? "w-5 -rotate-45 -translate-y-[6px]" : "w-3.5"}`} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d0d16]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 pb-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium mt-1 transition-colors ${
                pathname === href
                  ? "gradient-text bg-violet-500/10"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function NavAuth() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-ring-green" />
          Earning
        </span>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 ring-1 ring-violet-500/40 ring-offset-1 ring-offset-[#07070d]",
            },
          }}
        />
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className="btn-gradient px-4 py-2 rounded-lg text-sm cursor-pointer">
        Sign In
      </button>
    </SignInButton>
  );
}
