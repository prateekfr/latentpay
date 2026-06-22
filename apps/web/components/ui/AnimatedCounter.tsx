'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function AnimatedCounter({
  value,
  decimals = 0,
  duration = 2500,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number
  decimals?: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    let start = 0
    const step = (now: number) => {
      if (!start) start = now
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(2, -10 * t)
      setDisplay(value * (t === 1 ? 1 : eased))
      if (t < 1) rafRef.current = requestAnimationFrame(step)
      else setDisplay(value)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [inView, value, duration])

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {prefix}{formatted}{suffix}
    </span>
  )
}

export default AnimatedCounter
