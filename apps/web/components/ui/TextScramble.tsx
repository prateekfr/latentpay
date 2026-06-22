'use client'

import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&'

function randChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

export function TextScramble({
  text,
  delay = 200,
  duration = 1600,
  className,
}: {
  text: string
  delay?: number
  duration?: number
  className?: string
}) {
  const [display, setDisplay] = useState(text)
  const rafRef = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text)
      return
    }

    let start = 0
    const timeout = window.setTimeout(() => {
      const step = (now: number) => {
        if (!start) start = now
        const progress = Math.min((now - start) / duration, 1)
        const revealed = progress * text.length
        let out = ''
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') {
            out += ' '
          } else if (i < revealed) {
            out += text[i]
          } else {
            out += randChar()
          }
        }
        setDisplay(out)
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step)
        } else {
          setDisplay(text)
        }
      }
      rafRef.current = requestAnimationFrame(step)
    }, delay)

    return () => {
      window.clearTimeout(timeout)
      cancelAnimationFrame(rafRef.current)
    }
  }, [text, delay, duration])

  return (
    <span className={className} suppressHydrationWarning aria-label={text}>
      {display}
    </span>
  )
}

export default TextScramble
