import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Match, Selection } from '../data/fixtures'
import { useStore } from '../state/store'
import { IconStar, IconChevron, IconAlert } from './Icons'

/** The odds shown on a list row are the match-result market. We synthesise stable
 *  selection ids so a row and the match page address the same thing. */
export function rowMarketName(m: Match) {
  return m.odds && m.odds.length === 2 ? 'Moneyline' : 'Match result'
}

export function rowSelections(m: Match): Selection[] {
  const n = m.odds?.length ?? 0
  const labels = n === 2 ? [m.home, m.away] : ['1', 'X', '2']
  return (m.odds ?? []).map((o, i) => ({
    id: `${m.id}-r${i}`,
    label: labels[i],
    odds: o,
    suspended: m.status === 'live' && i === 2 && m.id === 'm1',
    suspendReason: 'Line review',
  }))
}

/* ------------------------------------------------------------ odds button */
export function OddsButton({
  m,
  sel,
  marketName,
  wide,
}: {
  m: Match
  sel: Selection
  marketName: string
  wide?: boolean
}) {
  const { s, addSelection } = useStore()
  const key = `${m.id}:${marketName}:${sel.id}`
  const selected = s.slip.some((x) => x.key === key)
  const ref = useRef<HTMLButtonElement>(null)
  const prev = useRef(sel.odds)

  useEffect(() => {
    const el = ref.current
    if (!el || prev.current === sel.odds) return
    const cls = sel.odds > prev.current ? 'tick-up' : 'tick-dn'
    el.classList.remove('tick-up', 'tick-dn')
    void el.offsetWidth
    el.classList.add(cls)
    prev.current = sel.odds
  }, [sel.odds])

  return (
    <button
      ref={ref}
      className="odds"
      data-sel={selected}
      data-suspended={sel.suspended}
      disabled={sel.suspended}
      aria-label={`${sel.label} at ${sel.odds.toFixed(2)}${sel.suspended ? ' (suspended)' : ''}`}
      title={sel.suspended ? `Suspended — ${sel.suspendReason ?? 'market closed'}` : undefined}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        addSelection(m, marketName, sel)
      }}
      style={wide ? { width: 'auto', flex: '1 1 auto' } : undefined}
    >
      {!sel.suspended && <span className="mono">{sel.odds.toFixed(2)}</span>}
      {sel.suspended && (
        <span style={{ position: 'relative', width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
          <span className="mono" style={{ opacity: 0.28 }}>
            {sel.odds.toFixed(2)}
          </span>
          <span
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              height: 1,
              background: 'var(--txt-mute)',
              transform: 'rotate(-13deg)',
            }}
          />
        </span>
      )}
    </button>
  )
}

/* --------------------------------------------------------------- clock */
export function MatchClock({ m }: { m: Match }) {
  if (m.status === 'live') {
    return (
      <span className="row" style={{ gap: 5 }}>
        <span className="live-dot" />
        <b>{m.minute ?? 0}′</b>
        {m.addedTime ? <span>+{m.addedTime}</span> : null}
      </span>
    )
  }
  const mins = m.kickoffOffsetMin
  if (mins < 60) {
    return (
      <span className="row" style={{ gap: 4 }}>
        <b style={{ color: 'var(--cy)' }}>{mins}′</b>
      </span>
    )
  }
  const h = Math.floor(mins / 60)
  return (
    <span className="mono" style={{ color: 'var(--txt-lo)' }}>
      {h}h {mins % 60}m
    </span>
  )
}

/* ------------------------------------------------------------ match row */
export function MatchRow({ m, showComp }: { m: Match; showComp?: boolean }) {
  const { s, d } = useStore()
  const sels = rowSelections(m)
  const followed = s.follows.includes(m.home)
  const live = m.status === 'live'

  return (
    <Link
      to={m.markets?.length ? `/match/${m.id}` : '#'}
      onClick={(e) => {
        if (!m.markets?.length) e.preventDefault()
      }}
      className="mrow"
      style={{ textDecoration: 'none' }}
    >
      <span className="mrow__time">
        <MatchClock m={m} />
      </span>

      <span className="mrow__teams">
        {showComp && (
          <span className="mono" style={{ fontSize: 9, color: 'var(--txt-mute)', flex: '0 0 auto' }}>
            {m.compShort}
          </span>
        )}
        <span className="mrow__team" style={{ fontWeight: live && m.scoreHome > m.scoreAway ? 700 : 500 }}>
          {m.home}
        </span>
        {live ? (
          <span className="mrow__score">
            {m.scoreHome}–{m.scoreAway}
          </span>
        ) : (
          <span className="mrow__vs">v</span>
        )}
        <span className="mrow__team away" style={{ fontWeight: live && m.scoreAway > m.scoreHome ? 700 : 500 }}>
          {m.away}
        </span>
        {m.period && (
          <span className="mono" style={{ fontSize: 10, color: 'var(--txt-mute)', flex: '0 0 auto' }}>
            {m.period}
          </span>
        )}
      </span>

      <span className="mrow__odds">
        {sels.map((sel) => (
          <OddsButton key={sel.id} m={m} sel={sel} marketName={rowMarketName(m)} />
        ))}
      </span>

      <span className="mrow__act">
        <button
          aria-label={followed ? `Unfollow ${m.home}` : `Follow ${m.home}`}
          aria-pressed={followed}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            d({ t: 'toggleFollow', key: m.home })
          }}
          style={{
            color: followed ? 'var(--hot)' : 'var(--txt-mute)',
            display: 'grid',
            placeItems: 'center',
            width: 24,
            height: 24,
          }}
        >
          <IconStar size={13} filled={followed} />
        </button>
        {m.markets?.length ? (
          <span style={{ color: 'var(--txt-mute)', display: 'flex' }}>
            <IconChevron size={13} />
          </span>
        ) : (
          <span style={{ width: 13 }} />
        )}
      </span>
    </Link>
  )
}

/** One competition block: sticky header + rows (football page) */
export function CompetitionBlock({ name, matches }: { name: string; matches: Match[] }) {
  const { s, d } = useStore()
  const followed = s.follows.includes(name)
  const live = matches.filter((m) => m.status === 'live').length
  return (
    <div className="sec">
      <div className="comp-head">
        <span />
        <span className="comp-head__name">
          {name}
          {live > 0 && (
            <span className="mono" style={{ fontSize: 10, color: 'var(--hot)', fontWeight: 600 }}>
              {live} live
            </span>
          )}
        </span>
        <span className="comp-head__cols">1</span>
        <span className="comp-head__cols">X</span>
        <span className="comp-head__cols">2</span>
        <button
          onClick={() => d({ t: 'toggleFollow', key: name })}
          aria-label={followed ? `Unfollow ${name}` : `Follow ${name}`}
          style={{ color: followed ? 'var(--hot)' : 'var(--txt-mute)', display: 'grid', placeItems: 'center' }}
        >
          <IconStar size={13} filled={followed} />
        </button>
      </div>
      {matches.map((m) => (
        <MatchRow key={m.id} m={m} />
      ))}
    </div>
  )
}

export function SuspendedNotice({ text }: { text: string }) {
  return (
    <span
      className="row"
      style={{ gap: 5, fontSize: 'var(--fs-10)', color: 'var(--hot)', fontFamily: 'var(--num)' }}
    >
      <IconAlert size={11} />
      {text}
    </span>
  )
}
