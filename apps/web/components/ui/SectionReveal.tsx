'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

type Direction = 'up' | 'left' | 'right' | 'none'

function offset(direction: Direction) {
  switch (direction) {
    case 'left':  return { x: -32, y: 0 }
    case 'right': return { x: 32,  y: 0 }
    case 'none':  return { x: 0,   y: 0 }
    default:      return { x: 0,   y: 32 }
  }
}

export function SectionReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  direction?: Direction
  delay?: number
}) {
  const { x, y } = offset(direction)
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export default SectionReveal

export function StaggerContainer({
  children,
  className,
  stagger = 0.1,
  staggerDelay,
}: {
  children: ReactNode
  className?: string
  stagger?: number
  staggerDelay?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: staggerDelay ?? stagger } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 28 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}
