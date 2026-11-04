import { useEffect, useRef, useState } from 'react'

/** Flashes an element green when a price lengthens, pink when it shortens.
 *  The flash decays to neutral in 900ms — colour in this UI is an event,
 *  never a permanent state. */
export function useOddsTick(odds: number) {
  const ref = useRef<HTMLElement>(null)
  const prev = useRef(odds)

  useEffect(() => {
    const el = ref.current
    if (!el || prev.current === odds) return
    const cls = odds > prev.current ? 'tick-up' : 'tick-dn'
    el.classList.remove('tick-up', 'tick-dn')
    void el.offsetWidth // restart the animation
    el.classList.add(cls)
    prev.current = odds
  }, [odds])

  return ref
}

/** 'up' | 'down' | null — holds the direction for `ms` after a move so the row
 *  can show a caret. Players need to see which way a price went, not just that
 *  it went. */
export function useOddsDirection(odds: number, ms = 3000) {
  const [dir, setDir] = useState<'up' | 'down' | null>(null)
  const prev = useRef(odds)
  useEffect(() => {
    if (prev.current === odds) return
    const d = odds > prev.current ? 'up' : 'down'
    prev.current = odds
    setDir(d)
    const t = setTimeout(() => setDir(null), ms)
    return () => clearTimeout(t)
  }, [odds, ms])
  return dir
}
