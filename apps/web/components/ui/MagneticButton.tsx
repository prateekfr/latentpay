'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function MagneticButton({
  children,
  className,
  strength = 0.28,
  href,
  onClick,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  strength?: number
  href?: string
  onClick?: () => void
  ariaLabel?: string
}) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springConfig = { stiffness: 300, damping: 20, mass: 0.5 }
  const sx = useSpring(x, springConfig)
  const sy = useSpring(y, springConfig)

  const handleMove = (e: React.MouseEvent) => {
    if (window.matchMedia('(hover: none)').matches) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) * strength)
    y.set((e.clientY - cy) * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  const MotionTag = (href ? motion.a : motion.button) as typeof motion.button

  return (
    <MotionTag
      // @ts-expect-error polymorphic ref
      ref={ref}
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}

export default MagneticButton
