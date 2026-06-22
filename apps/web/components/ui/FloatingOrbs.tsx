'use client'

import { ParticleField } from './ParticleField'

const orbs = [
  {
    color: 'rgba(139,92,246,0.22)',
    size: 720,
    top: '-12%',
    left: '-8%',
    anim: 'float-aurora-1 11s ease-in-out infinite',
  },
  {
    color: 'rgba(236,72,153,0.18)',
    size: 640,
    top: '6%',
    right: '-10%',
    anim: 'float-aurora-2 13s ease-in-out infinite',
  },
  {
    color: 'rgba(34,211,238,0.15)',
    size: 600,
    bottom: '4%',
    left: '-6%',
    anim: 'float-aurora-3 14s ease-in-out infinite',
  },
  {
    color: 'rgba(52,211,153,0.14)',
    size: 560,
    bottom: '-10%',
    right: '-4%',
    anim: 'float-aurora-1 12s ease-in-out infinite',
  },
  {
    color: 'rgba(168,85,247,0.16)',
    size: 760,
    top: '38%',
    left: '34%',
    anim: 'float-aurora-2 10s ease-in-out infinite',
  },
] as const

export function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            top: 'top' in orb ? orb.top : undefined,
            bottom: 'bottom' in orb ? orb.bottom : undefined,
            left: 'left' in orb ? orb.left : undefined,
            right: 'right' in orb ? orb.right : undefined,
            background: `radial-gradient(circle at center, ${orb.color}, transparent 70%)`,
            filter: 'blur(80px)',
            animation: orb.anim,
          }}
        />
      ))}
      <ParticleField />
    </div>
  )
}

export default FloatingOrbs
