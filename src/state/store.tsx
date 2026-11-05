import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { MATCHES, type Match, type Selection } from '../data/fixtures'
import { hashString, makeRng, snapOdds } from '../lib/rand'

/* ============================================================ types */
export type SlipStatus = 'ok' | 'changed' | 'suspended'

export type SlipItem = {
  key: string
  matchId: string
  fixture: string
  comp: string
  marketName: string
  selectionId: string
  label: string
  odds: number
  oddsAtAdd: number
  status: SlipStatus
  changeReason?: string
  lockUntil?: number
  stake: string
}

export type BetStatus = 'open' | 'won' | 'lost' | 'cashed'
export type BetOutcome = 'placed' | 'failed'

export type Bet = {
  id: string
  fixture: string
  comp: string
  marketName: string
  label: string
  odds: number
  stake: number
  status: BetStatus
  outcome: BetOutcome
  failReason?: string
  placedAt: number
  txHash: string
  block: number
  confirmations: number
  cashout: number
}

export type Toast = {
  id: number
  kind: 'placed' | 'failed' | 'info' | 'cashed'
  title: string
  body?: string
}

/* ============================================================ helpers */
const rng = makeRng(0x4842)
const rngExtra = makeRng(0x7331)

const REASONS = [
  'Red card, 74 minutes',
  'VAR review in progress',
  '41,200 USDT matched in 30 seconds',
  'Injury to a key attacker',
  'Market re-priced by the pool',
  'Goal, 68 minutes',
]

const SUSPEND_REASONS = ['VAR review', 'Penalty awarded', 'Corner, crowd noise', 'Injury on pitch']

function fakeHash(seed: string) {
  let h = hashString(seed).toString(16).padStart(8, '0')
  let s = ''
  const r = makeRng(hashString(seed))
  for (let i = 0; i < 56; i++) s += '0123456789abcdef'[Math.floor(r() * 16)]
  return '0x' + h + s
}

/* ============================================================ reducer */
type State = {
  matches: Match[]
  slip: SlipItem[]
  bets: Bet[]
  toasts: Toast[]
  follows: string[]
  toastSeq: number
  blockHeight: number
  balance: number
  /** true while the feed is reconnecting: prices freeze, nothing is matchable */
  paused: boolean
}

type Action =
  | { t: 'tick' }
  | { t: 'addSlip'; item: SlipItem }
  | { t: 'removeSlip'; key: string }
  | { t: 'clearSlip' }
  | { t: 'setStake'; key: string; stake: string }
  | { t: 'setSlipStakes'; stake: string }
  | { t: 'acceptChange'; key: string }
  | { t: 'acceptAllChanges' }
  | { t: 'declineChange'; key: string }
  | { t: 'place'; bets: Bet[]; failed: { key: string; reason: string }[] }
  | { t: 'settle'; id: string; status: BetStatus }
  | { t: 'cashout'; id: string }
  | { t: 'toast'; toast: Omit<Toast, 'id'> }
  | { t: 'dropToast'; id: number }
  | { t: 'toggleFollow'; key: string }
  | { t: 'forceOddsChange'; key: string; reason?: string }
  | { t: 'forceSuspend'; key: string }
  | { t: 'forceResume'; key: string }
  | { t: 'block' }
  | { t: 'togglePause' }
  | { t: 'suspendMarket'; matchId: string; marketName: string }
  | { t: 'resumeMarket'; matchId: string; marketName: string }

const initial: State = {
  matches: MATCHES.map((m) => ({ ...m })),
  slip: [],
  bets: seedBets(),
  toasts: [],
  follows: ['Arsenal', 'Premier League'],
  toastSeq: 1,
  blockHeight: 24_318_902,
  balance: 1_284.5,
  paused: false,
}

function seedBets(): Bet[] {
  const now = Date.now()
  return [
    {
      id: 'b1',
      fixture: 'Arsenal v Brighton',
      comp: 'Premier League',
      marketName: 'Over 2.5 goals',
      label: 'Over 2.5',
      odds: 1.85,
      stake: 50,
      status: 'open',
      outcome: 'placed',
      placedAt: now - 1000 * 60 * 42,
      txHash: fakeHash('b1'),
      block: 24_318_744,
      confirmations: 158,
      cashout: 71.4,
    },
    {
      id: 'b2',
      fixture: 'Inter v Benfica',
      comp: 'Champions League',
      marketName: 'Match result',
      label: 'Draw',
      odds: 3.6,
      stake: 25,
      status: 'open',
      outcome: 'placed',
      placedAt: now - 1000 * 60 * 18,
      txHash: fakeHash('b2'),
      block: 24_318_861,
      confirmations: 41,
      cashout: 12.9,
    },
    {
      id: 'b3',
      fixture: 'Manchester City v Tottenham',
      comp: 'Premier League',
      marketName: 'Both teams to score',
      label: 'Yes',
      odds: 1.66,
      stake: 40,
      status: 'won',
      outcome: 'placed',
      placedAt: now - 1000 * 60 * 60 * 26,
      txHash: fakeHash('b3'),
      block: 24_310_102,
      confirmations: 8_800,
      cashout: 0,
    },
    {
      id: 'b4',
      fixture: 'Liverpool v Everton',
      comp: 'Premier League',
      marketName: 'Match result',
      label: 'Everton',
      odds: 6.8,
      stake: 15,
      status: 'lost',
      outcome: 'placed',
      placedAt: now - 1000 * 60 * 60 * 50,
      txHash: fakeHash('b4'),
      block: 24_301_556,
      confirmations: 17_346,
      cashout: 0,
    },
    {
      id: 'b5',
      fixture: 'Olympiacos v Fenerbahçe',
      comp: 'EuroLeague',
      marketName: 'Moneyline',
      label: 'Olympiacos',
      odds: 2.05,
      stake: 30,
      status: 'open',
      outcome: 'failed',
      failReason: 'Price moved to 1.95 before the pool could match it.',
      placedAt: now - 1000 * 60 * 6,
      txHash: '',
      block: 0,
      confirmations: 0,
      cashout: 0,
    },
  ]
}

function mapMatches(s: State, id: string, fn: (m: Match) => Match): Match[] {
  return s.matches.map((m) => (m.id === id ? fn(m) : m))
}

/** nudge one selection's price, keeping the book roughly coherent */
function nudge(o: number, r = rng) {
  const dir = r() > 0.5 ? 1 : -1
  const amt = dir * (0.02 + r() * 0.14)
  return snapOdds(o + amt)
}

function findSelectionInMatch(m: Match, marketName: string, selectionId: string): Selection | undefined {
  const mk = m.markets?.find((x) => x.name === marketName)
  const hit = mk?.selections.find((x) => x.id === selectionId)
  if (hit) return hit
  const rowMatch = selectionId.match(/-r(\d+)$/)
  if (rowMatch) {
    const idx = Number(rowMatch[1])
    if (mk?.selections[idx]) return mk.selections[idx]
    if (m.odds && m.odds[idx] !== undefined) {
      return { id: selectionId, label: String(idx), odds: m.odds[idx] }
    }
  }
  return undefined
}

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'tick': {
      if (s.paused) return s
      let matches = s.matches
      // advance live clocks + jitter odds on some live selections
      matches = matches.map((m) => {
        if (m.status !== 'live') return m
        const advance = rng() > 0.86 ? 1 : 0
        const minute = Math.min(96, (m.minute ?? 0) + advance)
        let markets = m.markets
        const mRng = m.id === 'm1' ? rng : rngExtra
        if (markets?.length && mRng() > 0.55) {
          markets = markets.map((mk) => {
            if (mRng() > 0.72) {
              return {
                ...mk,
                selections: mk.selections.map((sel) =>
                  sel.suspended || mRng() > 0.3 ? sel : { ...sel, odds: nudge(sel.odds, mRng) },
                ),
              }
            }
            return mk
          })
        }
        let odds = m.odds
        if (odds && rng() > 0.6) odds = odds.map((o) => (rng() > 0.55 ? nudge(o) : o))
        return { ...m, minute, markets, odds }
      })

      // ----- cascade live price moves into the bet slip -----------------
      let slip = s.slip
      if (slip.length) {
        slip = slip.map((it) => {
          const m = matches.find((x) => x.id === it.matchId)
          if (!m) return it
          const sel = findSelectionInMatch(m, it.marketName, it.selectionId)
          if (!sel) return it
          if (sel.suspended && it.status !== 'suspended') {
            return {
              ...it,
              status: 'suspended' as SlipStatus,
              changeReason: sel.suspendReason ?? 'Market suspended',
            }
          }
          if (!sel.suspended && it.status === 'suspended') {
            return { ...it, status: 'ok' as SlipStatus, changeReason: undefined }
          }
          if (Math.abs(sel.odds - it.odds) > 0.001 && it.status !== 'suspended') {
            // a price move only matters if the price got WORSE, or better and we
            // choose to pass it on. Real books pass on both; we pass on both and
            // label it, because silence is the thing players hate.
            const prevAccepted = it.status === 'ok' ? it.odds : it.oddsAtAdd
            const nextOdds = Math.abs(sel.odds - prevAccepted) < 0.005 ? snapOdds(sel.odds + 0.08) : sel.odds
            return {
              ...it,
              oddsAtAdd: prevAccepted,
              odds: nextOdds,
              status: 'changed' as SlipStatus,
              changeReason: it.changeReason ?? REASONS[Math.floor(rng() * REASONS.length)],
              lockUntil: Date.now() + 5000,
            }
          }
          return it
        })
      }

      // cash-out values drift with the live price
      const bets = s.bets.map((b) =>
        b.status === 'open' && b.outcome === 'placed'
          ? { ...b, cashout: Math.max(0.1, b.cashout * (rng() > 0.5 ? 1.012 : 0.988)) }
          : b,
      )

      return { ...s, matches, slip, bets }
    }

    case 'addSlip': {
      if (s.slip.some((x) => x.key === a.item.key)) {
        return { ...s, slip: s.slip.filter((x) => x.key !== a.item.key) }
      }
      return { ...s, slip: [...s.slip, a.item] }
    }

    case 'removeSlip':
      return { ...s, slip: s.slip.filter((x) => x.key !== a.key) }

    case 'clearSlip':
      return { ...s, slip: [] }

    case 'setStake':
      return { ...s, slip: s.slip.map((x) => (x.key === a.key ? { ...x, stake: a.stake } : x)) }

    case 'setSlipStakes':
      return { ...s, slip: s.slip.map((x) => ({ ...x, stake: a.stake })) }

    case 'acceptChange':
      return {
        ...s,
        slip: s.slip.map((x) =>
          x.key === a.key
            ? { ...x, oddsAtAdd: x.odds, status: 'ok' as SlipStatus, changeReason: undefined, lockUntil: undefined }
            : x,
        ),
      }

    case 'acceptAllChanges':
      return {
        ...s,
        slip: s.slip.map((x) =>
          x.status === 'changed'
            ? { ...x, oddsAtAdd: x.odds, status: 'ok' as SlipStatus, changeReason: undefined, lockUntil: undefined }
            : x,
        ),
      }

    case 'declineChange':
      return { ...s, slip: s.slip.filter((x) => x.key !== a.key) }

    case 'place': {
      const failedKeys = new Set(a.failed.map((f) => f.key))
      const placed = s.slip.filter((x) => !failedKeys.has(x.key))
      const bets: Bet[] = [
        ...placed.map((x, i) => ({
          id: `b${Date.now()}${i}`,
          fixture: x.fixture,
          comp: x.comp,
          marketName: x.marketName,
          label: x.label,
          odds: x.odds,
          stake: Number(x.stake) || 0,
          status: 'open' as BetStatus,
          outcome: 'placed' as BetOutcome,
          placedAt: Date.now(),
          txHash: fakeHash(x.key + Date.now() + i),
          block: s.blockHeight + 1,
          confirmations: 1,
          cashout: (Number(x.stake) || 0) * x.odds * 0.78,
        })),
        ...a.failed.map((f, i) => {
          const x = s.slip.find((y) => y.key === f.key)!
          return {
            id: `f${Date.now()}${i}`,
            fixture: x.fixture,
            comp: x.comp,
            marketName: x.marketName,
            label: x.label,
            odds: x.odds,
            stake: Number(x.stake) || 0,
            status: 'open' as BetStatus,
            outcome: 'failed' as BetOutcome,
            failReason: f.reason,
            placedAt: Date.now(),
            txHash: '',
            block: 0,
            confirmations: 0,
            cashout: 0,
          }
        }),
      ]
      const stakeTotal = placed.reduce((n, x) => n + (Number(x.stake) || 0), 0)
      return {
        ...s,
        bets: [...bets, ...s.bets],
        slip: s.slip.filter((x) => failedKeys.has(x.key)),
        balance: s.balance - stakeTotal,
      }
    }

    case 'settle':
      return {
        ...s,
        bets: s.bets.map((b) =>
          b.id === a.id
            ? {
                ...b,
                status: a.status,
                confirmations: 12,
                cashout: 0,
                block: b.block || s.blockHeight + 1,
                txHash: b.txHash || fakeHash(b.id + 'settle'),
              }
            : b,
        ),
      }

    case 'cashout': {
      const b = s.bets.find((x) => x.id === a.id)
      if (!b) return s
      return {
        ...s,
        balance: s.balance + b.cashout,
        bets: s.bets.map((x) => (x.id === a.id ? { ...x, status: 'cashed' as BetStatus, confirmations: 6 } : x)),
      }
    }

    case 'toast':
      return { ...s, toasts: [...s.toasts, { ...a.toast, id: s.toastSeq }], toastSeq: s.toastSeq + 1 }

    case 'dropToast':
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) }

    case 'toggleFollow':
      return {
        ...s,
        follows: s.follows.includes(a.key) ? s.follows.filter((f) => f !== a.key) : [...s.follows, a.key],
      }

    case 'forceOddsChange': {
      const it = s.slip.find((x) => x.key === a.key)
      if (!it) return s
      const base = it.status === 'ok' ? it.odds : it.oddsAtAdd
      let nextOdds = snapOdds(it.odds * (rng() > 0.45 ? 0.88 : 1.12))
      if (Math.abs(nextOdds - base) < 0.03) {
        nextOdds = snapOdds(base + (base > 1.3 ? -0.12 : 0.14))
      }
      const rowMatch = it.selectionId.match(/-r(\d+)$/)
      const rowIdx = rowMatch ? Number(rowMatch[1]) : -1
      return {
        ...s,
        slip: s.slip.map((x) =>
          x.key === a.key
            ? {
                ...x,
                oddsAtAdd: base,
                odds: nextOdds,
                status: 'changed' as SlipStatus,
                changeReason: a.reason ?? REASONS[Math.floor(rng() * REASONS.length)],
                lockUntil: Date.now() + 5000,
              }
            : x,
        ),
        matches: mapMatches(s, it.matchId, (m) => ({
          ...m,
          odds: rowIdx >= 0 && m.odds ? m.odds.map((o, i) => (i === rowIdx ? nextOdds : o)) : m.odds,
          markets: m.markets?.map((mk) =>
            mk.name === it.marketName
              ? {
                  ...mk,
                  selections: mk.selections.map((sel, i) =>
                    sel.id === it.selectionId || i === rowIdx ? { ...sel, odds: nextOdds } : sel,
                  ),
                }
              : mk,
          ),
        })),
      }
    }

    case 'forceSuspend': {
      const it = s.slip.find((x) => x.key === a.key)
      if (!it) return s
      const reason = SUSPEND_REASONS[Math.floor(rng() * SUSPEND_REASONS.length)]
      const rowMatch = it.selectionId.match(/-r(\d+)$/)
      const rowIdx = rowMatch ? Number(rowMatch[1]) : -1
      return {
        ...s,
        slip: s.slip.map((x) =>
          x.key === a.key ? { ...x, status: 'suspended' as SlipStatus, changeReason: reason } : x,
        ),
        matches: mapMatches(s, it.matchId, (m) => ({
          ...m,
          markets: m.markets?.map((mk) =>
            mk.name === it.marketName
              ? {
                  ...mk,
                  selections: mk.selections.map((sel, i) =>
                    sel.id === it.selectionId || i === rowIdx
                      ? { ...sel, suspended: true, suspendReason: reason }
                      : sel,
                  ),
                }
              : mk,
          ),
        })),
      }
    }

    case 'forceResume': {
      const it = s.slip.find((x) => x.key === a.key)
      if (!it) return s
      const rowMatch = it.selectionId.match(/-r(\d+)$/)
      const rowIdx = rowMatch ? Number(rowMatch[1]) : -1
      return {
        ...s,
        slip: s.slip.map((x) => (x.key === a.key ? { ...x, status: 'ok' as SlipStatus, changeReason: undefined } : x)),
        matches: mapMatches(s, it.matchId, (m) => ({
          ...m,
          markets: m.markets?.map((mk) =>
            mk.name === it.marketName
              ? {
                  ...mk,
                  selections: mk.selections.map((sel, i) =>
                    sel.id === it.selectionId || i === rowIdx
                      ? { ...sel, suspended: false, suspendReason: undefined }
                      : sel,
                  ),
                }
              : mk,
          ),
        })),
      }
    }

    case 'togglePause':
      return { ...s, paused: !s.paused }

    case 'suspendMarket': {
      const reason = SUSPEND_REASONS[Math.floor(rng() * SUSPEND_REASONS.length)]
      return {
        ...s,
        matches: mapMatches(s, a.matchId, (m) => ({
          ...m,
          markets: m.markets?.map((mk) =>
            mk.name === a.marketName
              ? { ...mk, selections: mk.selections.map((x) => ({ ...x, suspended: true, suspendReason: reason })) }
              : mk,
          ),
        })),
        slip: s.slip.map((x) =>
          x.matchId === a.matchId && x.marketName === a.marketName
            ? { ...x, status: 'suspended' as SlipStatus, changeReason: reason }
            : x,
        ),
      }
    }

    case 'resumeMarket':
      return {
        ...s,
        matches: mapMatches(s, a.matchId, (m) => ({
          ...m,
          markets: m.markets?.map((mk) =>
            mk.name === a.marketName
              ? {
                  ...mk,
                  selections: mk.selections.map((x) => ({ ...x, suspended: false, suspendReason: undefined })),
                }
              : mk,
          ),
        })),
        slip: s.slip.map((x) =>
          x.matchId === a.matchId && x.marketName === a.marketName
            ? { ...x, status: 'ok' as SlipStatus, changeReason: undefined }
            : x,
        ),
      }

    case 'block':
      return {
        ...s,
        blockHeight: s.blockHeight + 1,
        bets: s.bets.map((b) =>
          b.outcome === 'placed' && b.confirmations < 12 ? { ...b, confirmations: b.confirmations + 1 } : b,
        ),
      }

    default:
      return s
  }
}

/* ============================================================ context */
type Ctx = {
  s: State
  d: React.Dispatch<Action>
  now: number
  addSelection: (m: Match, marketName: string, sel: Selection) => void
  placeBets: (opts?: { forceFail?: boolean }) => void
  totalStake: number
  totalReturn: number
}

const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, initial)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now())
      d({ t: 'tick' })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => d({ t: 'block' }), 2600)
    return () => clearInterval(t)
  }, [])

  const addSelection = useCallback((m: Match, marketName: string, sel: Selection) => {
    if (sel.suspended) return
    d({
      t: 'addSlip',
      item: {
        key: `${m.id}:${marketName}:${sel.id}`,
        matchId: m.id,
        fixture: `${m.home} v ${m.away}`,
        comp: m.comp,
        marketName,
        selectionId: sel.id,
        label: sel.label,
        odds: sel.odds,
        oddsAtAdd: sel.odds,
        status: 'ok',
        stake: '',
      },
    })
  }, [])

  const placeBets = useCallback(
    (opts?: { forceFail?: boolean }) => {
      // One place decides who fails, so the rule is readable:
      //  · suspended selection  → cannot be matched
      //  · changed price not accepted → the pool no longer offers the old price
      //  · forceFail            → the judge's "make it fail" switch
      const failed: { key: string; reason: string }[] = s.slip
        .filter((x) => opts?.forceFail || x.status === 'suspended' || x.status === 'changed')
        .map((x) => ({
          key: x.key,
          reason:
            x.status === 'suspended'
              ? `${x.marketName} suspended: ${x.changeReason ?? 'market closed'}`
              : `Price moved to ${x.odds.toFixed(2)} before the pool could match it`,
        }))

      const placed = s.slip.filter((x) => !failed.some((f) => f.key === x.key))
      const stakeTotal = placed.reduce((n, x) => n + (Number(x.stake) || 0), 0)

      if (placed.length && stakeTotal > s.balance) {
        d({
          t: 'toast',
          toast: {
            kind: 'failed',
            title: 'Not enough balance',
            body: `Stakes total ${stakeTotal.toFixed(2)} USDT. Available ${s.balance.toFixed(2)} USDT.`,
          },
        })
        return
      }

      d({ t: 'place', bets: [], failed })

      if (placed.length) {
        d({
          t: 'toast',
          toast: {
            kind: 'placed',
            title: `${placed.length} bet${placed.length > 1 ? 's' : ''} placed`,
            body: `${stakeTotal.toFixed(2)} USDT staked · returns ${placed
              .reduce((n, x) => n + (Number(x.stake) || 0) * x.odds, 0)
              .toFixed(2)} USDT · settling on-chain`,
          },
        })
      }
      if (failed.length) {
        d({
          t: 'toast',
          toast: {
            kind: 'failed',
            title: `${failed.length} bet${failed.length > 1 ? 's' : ''} not placed`,
            body: failed[0].reason,
          },
        })
      }
    },
    [s.slip, s.balance, d],
  )

  const totalStake = s.slip.reduce((n, x) => n + (Number(x.stake) || 0), 0)
  const totalReturn = s.slip.reduce((n, x) => n + (Number(x.stake) || 0) * x.odds, 0)

  const v = useMemo(
    () => ({ s, d, now, addSelection, placeBets, totalStake, totalReturn }),
    [s, now, addSelection, placeBets, totalStake, totalReturn],
  )
  return <StoreCtx.Provider value={v}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('useStore outside provider')
  return c
}

/** counts down to a timestamp, re-rendering each 100ms */
export function useCountdown(until?: number) {
  const [left, setLeft] = useState(0)
  const raf = useRef<number>()
  useEffect(() => {
    if (!until) {
      setLeft(0)
      return
    }
    const step = () => {
      setLeft(Math.max(0, until - Date.now()))
      raf.current = requestAnimationFrame(step)
    }
    step()
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [until])
  return left
}
