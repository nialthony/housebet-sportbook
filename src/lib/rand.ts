/** Deterministic PRNG (mulberry32) so the prototype behaves identically on every
 *  reload for a given seed — judges comparing screenshots see the same thing. */
export function makeRng(seed: number) {
  let a = seed >>> 0
  return function rng() {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const pick = <T,>(rng: () => number, arr: readonly T[]) => arr[Math.floor(rng() * arr.length)]

/** Round to a plausible decimal-odds step (1.01–2.00 → .01, 2–5 → .05, 5+ → .1) */
export function snapOdds(n: number) {
  const v = Math.max(1.01, n)
  if (v < 2) return Math.round(v * 100) / 100
  if (v < 5) return Math.round(v * 20) / 20
  return Math.round(v * 10) / 10
}

export function fmtOdds(n: number) {
  return n.toFixed(2)
}

export function fmtUsdt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
