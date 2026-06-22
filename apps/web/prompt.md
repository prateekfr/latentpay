# LatentPay — Next-Level Landing Page Prompt

## MISSION
Build the most visually stunning SaaS landing page ever made for LatentPay — an AI latency monetization platform. The page must feel like a live piece of software, not a static website. Every pixel should communicate "this is the future." Think Linear.app meets Vercel meets Raycast, but darker, more cinematic, and more alive.

---

## DESIGN SYSTEM

### Color Palette
```
Background:     #07070d  (near-black, slightly blue)
Surface:        #0d0d1a  (cards, panels)
Surface-2:      #13101f  (elevated elements)

Violet:         #8b5cf6  (primary brand)
Purple:         #7c3aed  (deep anchor)
Fuchsia:        #a855f7  (mid tone)
Pink:           #ec4899  (accent, energy)
Cyan:           #22d3ee  (tech, data)
Emerald:        #34d399  (success, money)
Amber:          #fbbf24  (warning, premium)

Text Primary:   #f0f0f8
Text Secondary: rgba(240,240,248,0.6)
Text Muted:     rgba(240,240,248,0.35)
```

### Typography
```
Display font:   Space Grotesk  (headings, buttons, labels)
Body font:      Inter           (body text, descriptions)
Mono font:      Geist Mono      (code, counters, data)

H1 hero:   clamp(4rem, 10vw, 8rem) — tracking: -0.04em — weight: 800
H1 large:  clamp(3rem, 8vw, 6.5rem) — tracking: -0.035em
H2:        clamp(2rem, 5vw, 3.5rem) — tracking: -0.03em
H3:        1.25rem — tracking: -0.02em — weight: 700
Body:      1rem / 1.7 line-height
Small:     0.875rem
Micro:     0.75rem — letter-spacing: 0.08em — uppercase

All headings: font-weight 700-800, tight letter-spacing, slightly purple-tinted
```

### Card System
```
card-surface:
  background: linear-gradient(145deg, rgba(22,14,50,0.92), rgba(12,8,26,0.96))
  border: 1px solid rgba(139,92,246,0.2)
  box-shadow: 0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)

card-surface on hover:
  border: rgba(139,92,246,0.5)
  box-shadow: 0 12px 48px rgba(0,0,0,0.55), 0 0 36px rgba(139,92,246,0.2)
  transform: translateY(-6px)
```

---

## ANIMATION LAYER SYSTEM (8 Layers)

### Layer 1 — Aurora Background (CSS, always running)
- 5 massive blurred blobs (600–800px, filter: blur(80px)) positioned at corners and center
- Colors: violet, pink, cyan, emerald — very low opacity (0.12–0.22)
- Each blob floats with a unique 7–14s CSS animation: `translateY + rotate + scale`
- They are FIXED position so they persist across the entire scroll journey
- Creates the impression of a living, breathing aurora borealis behind the page

```css
@keyframes float-aurora-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(40px, -30px) scale(1.04) rotate(3deg); }
  66%       { transform: translate(-20px, 20px) scale(0.97) rotate(-2deg); }
}
```

### Layer 2 — Canvas Particle Field (WebGL-level detail, requestAnimationFrame)
- 80–100 particles drifting upward in brand colors (violet, pink, cyan, white)
- Each particle: random size (0.6–2.5px), random velocity, pulsing opacity (sine wave)
- Larger particles (>1.8px) get a radial-gradient glow halo (4× size)
- Particles wrap around the canvas edges — infinite field effect
- Only rendered on desktop (window.matchMedia("(min-width: 768px)"))
- Canvas resizes with ResizeObserver
- Total: 60 lines of tight canvas code, zero dependencies

### Layer 3 — Dot/Grid Background Pattern (CSS, subtle)
- `radial-gradient(rgba(139,92,246,0.14) 1px, transparent 1px)` at 36px grid
- 25% opacity so it's barely perceptible — adds depth without distraction
- This is the "infinite space" feel

### Layer 4 — Hero Text Animations (Framer Motion + RAF)

**TextScramble on main headline word:**
- On page load (200ms delay), trigger a character scramble reveal
- Characters cycle through: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&`
- Progress-based: characters resolve left-to-right over 1.6s
- Easing: linear progress, each character snaps to final value when its threshold passes
- Effect: like the word is being "decoded" from digital noise

**Gradient text on "the Wait." line:**
- `linear-gradient(135deg, #c4b5fd, #f472b6, #a78bfa, #38bdf8, #c4b5fd)`
- `background-size: 300% 300%`
- `animation: grad-flow 7s ease infinite` — flows color continuously

**Word-stagger subtitle:**
- Break subtitle into 2–3 phrases
- Each phrase fades in with `translateY(12px) → 0` staggered by 0.18s
- Total subtitle reveal: 0.6s per phrase

**Scan-line sweep (once on load):**
- A 2px horizontal gradient line sweeps down the hero section over 2.8s
- `linear-gradient(90deg, transparent, violet, pink, violet, transparent)`
- Plays once with `animation-fill-mode: forwards`
- Gives a "system initializing" feel

### Layer 5 — Magnetic Cursor Buttons (Framer Motion springs)
- CTA buttons have `useMotionValue` + `useSpring` tracking cursor position
- On hover: button pulls toward cursor (strength 0.28 for primary, 0.22 for secondary)
- Springs: `stiffness: 300, damping: 20, mass: 0.5`
- Released on mouse leave: springs back to origin
- Primary button also has a bouncing animated arrow: `animate={{ x: [0, 5, 0] }}`

### Layer 6 — 3D Tilt Cards (Framer Motion + mouse tracking)
- All cards: feature bento, step cards, ad mockup — have 3D mouse-tracking tilt
- On mouse move: `rotateX` and `rotateY` spring to ±12° based on cursor position within card
- Spring config: `stiffness: 200, damping: 20`
- Glare overlay: radial gradient that follows cursor position at 14% opacity
- On mouse leave: all values spring back to 0
- `transformStyle: "preserve-3d"` + `perspective: 900px`

### Layer 7 — Scroll-Triggered Reveals (Framer Motion whileInView)
- Every section uses `SectionReveal` component
- Default: fade up from `y: 32, opacity: 0` → `y: 0, opacity: 1` in 0.65s
- Easing: `[0.22, 1, 0.36, 1]` (custom spring-ease)
- Directional variants: `direction="left"` → slides in from left 32px
- Feature cards: `StaggerContainer` + `StaggerItem` with 0.1s between each
- Stats: individual `whileInView` scale: `0.88 → 1` with stagger
- Viewport margin: `-80px` (triggers slightly before element enters view)

### Layer 8 — Animated Counters (RAF-based, no flicker)
- Pure `requestAnimationFrame` loop — no framer-motion (avoids hydration issues)
- `useInView` from framer-motion to trigger when visible
- Easing: `easeOutExpo` — `1 - Math.pow(2, -10 * t)`
- Numbers animate from 0 to final value over 2.5s
- Format: `toFixed(decimals)` with comma separators
- `suppressHydrationWarning` on the span to avoid SSR mismatch

---

## PAGE SECTIONS (Complete Breakdown)

### NAVBAR
```
Position: fixed, top-0, z-50
State 0 (top): fully transparent, no blur
State 1 (scrolled >16px): bg-[#07070d]/85 + backdrop-blur-xl + border-bottom
Transition: 500ms ease

Logo: rotating gradient ring + "L" letter + "Latent" + gradient "Pay"
Links: "Home" "Earn" "Advertise" — active dot indicator (violet-400 dot below active)
Right: auth state (Clerk) — signed in shows "Earning" pulse badge + UserButton
Mobile: hamburger → X animation (3 bars, middle fades, top/bottom rotate 45°)
Mobile menu: slide down panel with backdrop-blur-xl
```

### HERO SECTION (100svh, cinematic)
```
Background stack (bottom to top):
  1. dot-grid at 30% opacity
  2. radial gradient: purple 80% ellipse from top center
  3. radial gradient: pink 40% ellipse at bottom-right
  4. particle field canvas (hidden on mobile)
  5. scan-line (runs once, then gone)

Content (centered, max-w-5xl):
  Badge: "● NOW LIVE — JOIN THE WAIT ECONOMY" (shimmer tag)
  H1: "Monetize" (TextScramble) + "the Wait." (gradient-text, gradient block)
  Subtitle: 3 staggered phrases at text/45 → text/80 → text/40
  CTAs: Primary (magnetic, gradient, 54px tall) + Ghost (magnetic, purple-bordered)
  Social proof: 3 pills (glass, rounded-full) — earners, campaigns, rating
  Scroll indicator: bouncing vertical line + "SCROLL" mono text

Parallax: hero content fades to opacity:0 and moves Y:-60px on scroll out (useScroll + useTransform)
```

### LIVE TICKER (between hero and content)
```
Full-width band: bg-[#0a0a14]/80 + backdrop-blur
Infinite scroll: 8 data points × 2 (seamless loop)
Points: Total Paid Out, Impressions Served, Active Earners, Avg Latency Gap, etc.
Speed: 30s linear infinite, mask-image fades edges
Items: value in gradient-text, label in white/40
```

### HOW IT WORKS
```
Section header (centered):
  Tag: "Process" (cyan)
  H2: "How It" + gradient "Works"
  Subtitle: max-w-md centered

3-column grid (mobile: stack):
  Connecting gradient line between icon circles on desktop
  Each card: card-surface + TiltCard + StaggerItem reveal
  Icon: 52×52px gradient circle (color-coded per step)
  Number: "01" "02" "03" mono, white/25
  Title: white, bold, 1.25rem
  Body: white/55

Step 1 (violet→fuchsia): "You Use AI"
Step 2 (pink→rose):      "We Fill the Gap"
Step 3 (emerald→cyan):   "You Get Paid"
```

### LIVE AD PREVIEW (2-col)
```
Left column (SectionReveal direction="left"):
  Tag: "Live Preview" (purple)
  H2: "Ads that feel like" + gradient "features, not friction."
  Description: white/50
  Feature list: 4 checkmarks (violet circle ✓)

Right column (SectionReveal direction="right", TiltCard):
  Browser mockup window (card-surface, purple border)
  Chrome bar: 3 traffic lights + URL bar
  Chat message (right-aligned glass bubble)
  Thinking state: 3 pulsing dots + "GPT-4o is thinking..."
  AD BANNER: sponsored tag + ad copy + "Try Free →" button (violet)
  Earning indicator: green pulse dot + "+$0.01 earned"
```

### FEATURES BENTO GRID
```
Section header (centered):
  Tag: "Features" (amber)
  H2: "Everything you need," + cyan "nothing you don't."

3-column bento (md breakpoint):
  Large (col-span-2): "Native Integration" + "Advertiser Dashboard"
  Small (col-span-1): "Context-Aware Ads" + "Privacy First" + "Real-time Wallet"
  
Each card: card-surface + TiltCard + whileInView fade-up
  Emoji icon (2rem, mb-5)
  Color-coded tag badge
  Bold title (1.25rem)
  Description (white/55)
  
Reveal: staggered by 0.08s per card
```

### STATS SECTION
```
Full-width card-surface container (rounded-3xl, purple border, glow):
  Radial gradient overlay inside
  Blurred accent circles in corners (violet top-right, pink bottom-left)

H2: "Numbers that" + gradient "speak loud."

4-column grid (2×2 on mobile):
  AnimatedCounter (RAF, easeOutExpo, 2.5s duration)
  $14,820+ / 1.8M / 2,341 / $0.01/view
  Label (white/70) + Sub-label (white/30, hidden on mobile)
  Reveal: scale 0.88→1 + opacity 0→1, staggered 0.1s
```

### PLATFORMS MARQUEE
```
Label: "WORKS SEAMLESSLY WITH" (white/25, uppercase, tracked)
Infinite marquee: 6 platforms × 2, 22s loop
Each pill: purple-tinted background + purple border + violet-to-pink dot + name
mask-image: fades left and right edges
```

### TESTIMONIAL
```
✦ in gradient-text (large, centered)
Blockquote: Space Grotesk medium, 2.5–3rem, white/80
Highlighted amount in gradient-text font-semibold
Avatar: violet→pink gradient circle with initial
Name + title underneath
```

### CTA SECTION
```
Full-width card (deep purple gradient, purple border, heavy glow):
  Spinning orbit rings (absolute, top-right + bottom-left, 22s)
  Radial gradient overlay (violet center)
  
Tag: "Free to Join" (emerald)
H2: "Ready to get paid" + gradient "for waiting?"
Subtitle: white/40, max-w-md centered
2 CTAs: primary (full shimmer gradient) + ghost (purple bordered)
Legal line: "Works with Chrome · No card required · Cancel anytime" white/25
```

### FOOTER
```
4-column layout: Brand + Product + Company + Legal
Brand: logo + tagline + "All systems operational" green status
Gradient top border (violet→pink→violet, 1px)
Social links: Twitter, GitHub, Discord (icon buttons, ghost style)
Bottom bar: copyright + links
```

---

## BUTTON SYSTEM

### Primary (btn-gradient)
```css
background: linear-gradient(to right, #6d28d9, #8b5cf6, #a855f7, #c026d3, #ec4899, #c026d3, #a855f7, #8b5cf6, #6d28d9)
background-size: 300% 100%
animation: btn-pan 7s linear infinite  /* smooth horizontal panning */

box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.22),
  0 0 0 1px rgba(139,92,246,0.4),
  0 4px 20px rgba(139,92,246,0.55),
  0 8px 40px rgba(139,92,246,0.28)

::before — diagonal shine sweep:
  60px wide band, rgba(255,255,255,0.38), skewX(-18deg)
  animates left:-75% → right:280%, 3.8s ease infinite

::after — top glass gloss:
  height: 50%, linear-gradient(to bottom, rgba(255,255,255,0.16), transparent)

hover: brightness(1.1) saturate(1.08), translateY(-2.5px), stronger glow
active: scale(0.975), brightness(0.94)

Size: px-9 py-4 rounded-2xl min-height:54px font-size:0.9rem
```

### Ghost (btn-ghost)
```css
background: rgba(139,92,246,0.1)
border: 1px solid rgba(139,92,246,0.35)
box-shadow: 0 0 0 1px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.08)

::before — hover fill:
  linear-gradient(135deg, rgba(139,92,246,0.22), rgba(236,72,153,0.15))
  opacity: 0 → 1 on hover

hover: border rgba(139,92,246,0.65), translateY(-2px), purple glow ring
active: scale(0.98)

Same size as primary
```

---

## COMPONENT ARCHITECTURE

```
app/
  layout.tsx          — ClerkProvider, fonts (Space Grotesk + Inter + Geist Mono), Navbar, Footer
  page.tsx            — "use client", full home page, useScroll parallax
  globals.css         — @import "tailwindcss", @theme tokens, all keyframes, utility classes
  dashboard/
    page.tsx          — server component (Prisma fetch) → <DashboardClient>
    DashboardClient.tsx — "use client", charts, counters, tables
  advertiser/
    page.tsx          — server component → <AdvertiserClient>
    AdvertiserClient.tsx — "use client", campaigns, KPIs, ad builder

components/
  Navbar.tsx          — "use client", scroll detection, Clerk auth, mobile menu
  Footer.tsx          — server component, 4-col layout
  ui/
    FloatingOrbs.tsx  — "use client", 5 fixed aurora blobs, CSS animations
    ParticleField.tsx — "use client", Canvas 2D, 70 particles, RAF loop, ResizeObserver
    TextScramble.tsx  — "use client", RAF scramble reveal, randChar helper
    MagneticButton.tsx — "use client", useMotionValue + useSpring cursor pull
    TiltCard.tsx      — "use client", rotateX/rotateY springs + glare overlay
    SectionReveal.tsx — "use client", motion.div whileInView, direction variants
    AnimatedCounter.tsx — "use client", RAF easeOutExpo, useInView trigger
```

---

## PERFORMANCE RULES

1. **ParticleField**: hidden on `window.matchMedia("(min-width: 640px)").matches` — mobile gets aurora orbs only
2. **TiltCard**: `@media (hover: none) { transform: none }` — touch devices skip tilt
3. **MagneticButton**: no touch events registered, spring math only runs on pointer devices
4. **AnimatedCounter**: uses RAF not framer-motion springs to avoid hydration mismatch
5. **suppressHydrationWarning** on all dynamic text (counters, scramble display)
6. **`"use client"` only where needed**: Dashboard/Advertiser pages are server components, only the *Client.tsx files are client
7. **next/font/google** for Space Grotesk + Inter (no network request, subset-optimized)
8. **@media (prefers-reduced-motion: reduce)**: disables all animations, hides scan-line
9. Canvas: `ResizeObserver` for responsive resize, single RAF loop with cleanup on unmount
10. All animation values use `will-change: transform` implicitly via framer-motion

---

## CSS KEYFRAMES REFERENCE

```css
@keyframes grad-flow {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}

@keyframes btn-pan {
  0%   { background-position: 0%   50%; }
  100% { background-position: 300% 50%; }
}

@keyframes btn-shine {
  0%        { transform: translateX(-180%) skewX(-18deg); }
  60%, 100% { transform: translateX(280%)  skewX(-18deg); }
}

@keyframes scan-line {
  0%   { transform: translateY(0);    opacity: 0; }
  3%   { opacity: 0.75; }
  85%  { opacity: 0.35; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  33%       { transform: translateY(-22px) rotate(3deg) scale(1.02); }
  66%       { transform: translateY(-10px) rotate(-2deg) scale(0.99); }
}

@keyframes pulse-ring {
  0%   { box-shadow: 0 0 0 0   rgba(139,92,246,0.65); }
  70%  { box-shadow: 0 0 0 10px rgba(139,92,246,0); }
  100% { box-shadow: 0 0 0 0   rgba(139,92,246,0); }
}

@keyframes shimmer-sweep {
  0%        { transform: translateX(-200%); }
  60%, 100% { transform: translateX(350%); }
}

@keyframes ticker   { to { transform: translateX(-50%); } }
@keyframes marquee  { to { transform: translateX(-50%); } }
@keyframes spin-slow { to { transform: rotate(360deg); } }
```

---

## WHAT MAKES THIS NEXT-LEVEL

| Ordinary site | This site |
|---|---|
| Static hero image | 8-layer live animation stack |
| `hover: bg-gray-100` | Magnetic cursor pull + spring physics |
| CSS transitions | Framer Motion spring curves `[0.22, 1, 0.36, 1]` |
| Plain cards | 3D perspective tilt + radial glare |
| Numbers appear | RAF easeOutExpo counter animation |
| Fade in on scroll | Directional reveal + stagger orchestration |
| Static gradient | Animated background-position panning |
| Plain button | Diagonal shine sweep + brightness filter |
| One background color | Aurora orbs + particle field + dot grid |
| Left-aligned text | Purposeful alignment — center for hero/sections, left for cards |

---

## TECH STACK

```
Framework:    Next.js 16 (App Router, React 19)
Styling:      Tailwind CSS v4 (@import "tailwindcss", @theme {} in CSS)
Animation:    Framer Motion v11 (motion, useSpring, useMotionValue, useInView, useScroll, useTransform)
Auth:         Clerk (ClerkProvider, useUser, SignInButton, UserButton, auth())
Database:     Prisma + SQLite (server components only)
Fonts:        next/font/google (Space Grotesk, Inter) + next/font/local (Geist Mono)
Monorepo:     Turborepo ("ui": "stream" for Windows)
Canvas:       Native Canvas 2D API (no three.js, no pixi.js — pure performance)
```

---

*Use this prompt to generate the entire codebase from scratch, or feed individual sections to improve specific components. Every design decision above has a reason — the color choices create brand identity, the animation layers create depth without distraction, the performance rules keep it fast.*
