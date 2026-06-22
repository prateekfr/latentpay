'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'

export function TiltCard({
  children,
  className,
  max = 12,
  maxTilt,
}: {
  children: ReactNode
  className?: string
  max?: number
  maxTilt?: number
}) {
  const tiltMax = maxTilt ?? max
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)

  const handleMove = (e: React.MouseEvent) => {
    if (window.matchMedia('(hover: none)').matches) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    rotateY.set((px - 0.5) * 2 * tiltMax)
    rotateX.set((0.5 - py) * 2 * tiltMax)
    glareX.set(px * 100)
    glareY.set(py * 100)
  }

  const reset = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.14), transparent 55%)`

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 900 }}
      className={className}
    >
      <div style={{ transform: 'translateZ(0)' }} className="relative h-full">
        {children}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glare }}
        />
      </div>
    </motion.div>
  )
}

export default TiltCard
