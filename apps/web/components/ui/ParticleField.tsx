'use client'

import { useEffect, useRef } from 'react'

const COLORS = ['139,92,246', '236,72,153', '34,211,238', '240,240,248']

type Particle = {
  x: number
  y: number
  size: number
  vy: number
  vx: number
  phase: number
  speed: number
  color: string
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    if (!mq.matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let raf = 0

    const init = () => {
      const count = Math.min(100, Math.floor((width * height) / 16000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.6 + Math.random() * 1.9,
        vy: -(0.15 + Math.random() * 0.45),
        vx: (Math.random() - 0.5) * 0.18,
        phase: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.015,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] || '139,92,246',
      }))
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      init()
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.phase += p.speed
        if (p.y < -10) p.y = height + 10
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        const opacity = 0.25 + (Math.sin(p.phase) + 1) * 0.3

        if (p.size > 1.8) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
          glow.addColorStop(0, `rgba(${p.color},${opacity * 0.5})`)
          glow.addColorStop(1, `rgba(${p.color},0)`)
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = `rgba(${p.color},${opacity})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(render)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    render()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}

export default ParticleField
