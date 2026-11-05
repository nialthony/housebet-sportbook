import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../state/store'
import type { Market, Selection } from '../data/fixtures'
import { teamCode, compCountry } from '../data/fixtures'
import { fmtUsdt } from '../lib/rand'
import { useOddsTick, useOddsDirection } from '../lib/useOddsTick'
import { IconAlert, IconChevron, IconStar, IconLive, IconLock, IconSearch, IconClose } from '../components/Icons'
import { StateBar } from '../components/StateBar'
import { Crest } from '../components/Crest'

const GROUP_ORDER = ['Popular', 'Goals', 'Halves', 'Handicaps', 'Goalscorers', 'Corners & cards']

/* ------------------------------------------------------------ selection */
function SelButton({ marketName, sel, label }: { marketName: string; sel: Selection; label: string }) {
  const { s, addSelection } = useStore()
  const m = s.matches.find((x) => x.id === useParams().id)!
  const key = `${m.id}:${marketName}:${sel.id}`
  const selected = s.slip.some((x) => x.key === key)
  const ref = useOddsTick(sel.odds) as React.RefObject<HTMLButtonElement>
  const dir = useOddsDirection(sel.odds)

  return (
    <button
      ref={ref}
      className="sel"
      data-sel={selected}
      data-susp={sel.suspended}
      disabled={sel.suspended}
      onClick={() => addSelection(m, marketName, sel)}
      aria-label={`${label} at ${sel.odds.toFixed(2)}${sel.suspended ? ', suspended' : ''}`}
    >
      <span className="sel__label">{sel.label}</span>
      <span
        className="mono"
        style={{ fontWeight: 600, fontSize: 'var(--fs-13)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        {dir === 'up' && <span style={{ color: 'var(--up)', fontSize: 9 }}>▲</span>}
        {dir === 'down' && <span style={{ color: 'var(--hot)', fontSize: 9 }}>▼</span>}
        {sel.odds.toFixed(2)}
      </span>
      {sel.suspended && <span className="sel__strike" />}
    </button>
  )
}

/* --------------------------------------------------------------- market */
function MarketBlock({ market }: { market: Market }) {
  const allSuspended = market.selections.every((x) => x.suspended)
  const someSuspended = !allSuspended && market.selections.some((x) => x.suspended)
  const reason = market.selections.find((x) => x.suspendReason)?.suspendReason
  return (
    <div className="market">
      <div className="market__name">
        <span style={{ color: 'var(--txt-hi)', fontWeight: 500 }}>{market.name}</span>
        {allSuspended && (
          <span
            className="row mono"
            style={{ gap: 4, color: 'var(--hot)', fontSize: 'var(--fs-10)' }}
          >
            <IconAlert size={11} />
            suspended: {reason}
          </span>
        )}
        {someSuspended && (
          <span
            className="row mono"
            style={{ gap: 4, color: 'var(--txt-lo)', fontSize: 'var(--fs-10)' }}
          >
            1 selection suspended ({reason})
          </span>
        )}
        <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--txt-mute)' }}>
          HOUSE <span style={{ color: 'var(--txt-lo)' }}>{fmtUsdt(market.exposure)}</span> USDT
        </span>
      </div>
      <div
        className={market.selections.length > 0 && market.selections.length <= 3 ? 'sel-grid sel-grid--3' : 'sel-grid'}
      >
        {market.selections.map((sel) => (
          <SelButton key={sel.id} marketName={market.name} sel={sel} label={sel.label} />
        ))}
      </div>
    </div>
  )
}

/* ================================================================ PAGE */
export default function MatchPage() {
  const { id } = useParams()
  const { s, d } = useStore()
  const m = s.matches.find((x) => x.id === id) ?? s.matches[0]
  const [group, setGroup] = useState<string>('Popular')
  const [q, setQ] = useState('')
  const refs = useRef<Record<string, HTMLDivElement | null>>({})

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const g = new Map<string, Market[]>()
    for (const mk of m.markets ?? []) {
      if (needle) {
        const hitName = mk.name.toLowerCase().includes(needle)
        const hitSel = mk.selections.some((x) => x.label.toLowerCase().includes(needle))
        if (!hitName && !hitSel) continue
      }
      if (!g.has(mk.group)) g.set(mk.group, [])
      g.get(mk.group)!.push(mk)
    }
    return GROUP_ORDER.filter((x) => g.has(x)).map((x) => ({ name: x, markets: g.get(x)! }))
  }, [m.markets, q])

  const followed = s.follows.includes(m.home)
  const totalSelections = (m.markets ?? []).reduce((n, x) => n + x.selections.length, 0)

  useEffect(() => {
    const onScroll = () => {
      for (const g of groups) {
        const el = refs.current[g.name]
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top < 200 && top > -200) {
          setGroup(g.name)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [groups])

  return (
    <div>
      <StateBar matchId={m.id} />

      {/* breadcrumb reads like theirs: Football › England › Premier League */}
      <div className="breadcrumb">
        <Link to="/">Sports</Link>
        <IconChevron size={10} />
        <Link to="/football">Football</Link>
        <IconChevron size={10} />
        <Link to="/football">{compCountry(m.comp)}</Link>
        <IconChevron size={10} />
        <Link to="/football">{m.comp}</Link>
        <IconChevron size={10} />
        <span style={{ color: 'var(--txt-lo)' }}>
          {m.home} v {m.away}
        </span>
      </div>

      {/* ---------------------------------------------------- scoreboard */}
      <div className="match-head">
        <div className="scoreboard">
          <div className="scoreboard__side">
            <div className="scoreboard__badges">
              <Crest team={m.home} size={36} />
              <span className="team-code">{teamCode(m.home)}</span>
            </div>
            <div className="scoreboard__meta">
              <div className="h2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.home}
              </div>
              <div className="row" style={{ gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                <span className="mono" style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)' }}>
                  {m.markets?.[0]?.selections[0]?.odds.toFixed(2) ?? '–'}
                </span>
                <span style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-mute)' }}>implied favourite</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '0 4px' }}>
            <div className="row" style={{ gap: 6 }}>
              {m.status === 'live' && <span className="live-dot" />}
              <span
                className="mono"
                style={{
                  fontSize: 'var(--fs-12)',
                  fontWeight: 600,
                  color: m.status === 'live' ? 'var(--hot)' : 'var(--txt-lo)',
                }}
              >
                {m.status === 'live' ? `${m.minute}′` : `Kick-off in ${m.kickoffOffsetMin}m`}
              </span>
            </div>
            <div className="scoreline">
              <span className="scoreline__n">{m.scoreHome}</span>
              <span className="scoreline__sep">–</span>
              <span className="scoreline__n">{m.scoreAway}</span>
            </div>
            <div className="mono" style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-mute)', textAlign: 'center' }}>
              {m.comp}
              {m.period ? ` · ${m.period}` : ''}
            </div>
          </div>

          <div className="scoreboard__side scoreboard__side--away">
            <div className="scoreboard__meta">
              <div className="h2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.away}
              </div>
              <div className="row" style={{ gap: 6, marginTop: 3, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => d({ t: 'toggleFollow', key: m.home })}
                  className="row"
                  style={{ gap: 4, fontSize: 'var(--fs-11)', color: followed ? 'var(--hot)' : 'var(--txt-lo)' }}
                  aria-pressed={followed}
                >
                  <IconStar size={12} filled={followed} />
                  {followed ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
            <div className="scoreboard__badges">
              <span className="team-code">{teamCode(m.away)}</span>
              <Crest team={m.away} size={36} />
            </div>
          </div>
        </div>

        {/* the Housebets line: the pool backing this match is visible */}
        <div
          className="spread"
          style={{
            padding: '8px 16px',
            background: 'var(--ink-100)',
            fontSize: 'var(--fs-11)',
            color: 'var(--txt-lo)',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span className="row" style={{ gap: 7 }}>
            <span className="live-dot" style={{ width: 5, height: 5 }} />
            House bankroll backing this match{' '}
            <span className="mono" style={{ color: 'var(--txt-hi)', fontWeight: 600 }}>
              {fmtUsdt((m.markets ?? []).reduce((n, x) => n + x.exposure, 0))} USDT
            </span>
          </span>
          <span className="row" style={{ gap: 5 }}>
            <IconLock size={11} />
            Payouts guaranteed on-chain · singles only · {totalSelections} selections
          </span>
        </div>
      </div>

      {m.note && (
        <div
          className="row"
          style={{
            gap: 7,
            margin: 'var(--s-3) 0',
            padding: '8px 10px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-card)',
            background: 'var(--ink-100)',
            fontSize: 'var(--fs-12)',
            color: 'var(--txt)',
          }}
        >
          <span style={{ color: 'var(--hot)', display: 'flex', flex: '0 0 auto' }}>
            <IconLive size={13} />
          </span>
          {m.note}
        </div>
      )}

      {/* --------------------------------------- market search + groups */}
      <div
        style={{
          position: 'sticky',
          top: 'var(--topbar-h)',
          zIndex: 6,
          background: 'var(--ink-000)',
          paddingTop: 'var(--s-3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 34,
            padding: '0 10px',
            marginBottom: 8,
            background: 'var(--ink-150)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--r-row)',
          }}
        >
          <span style={{ color: 'var(--txt-lo)', display: 'flex' }}>
            <IconSearch size={14} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search markets or players"
            aria-label="Search markets or players"
            style={{
              flex: 1,
              minWidth: 0,
              border: 0,
              outline: 0,
              background: 'none',
              color: 'var(--txt-hi)',
              fontSize: 'var(--fs-13)',
            }}
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear" style={{ color: 'var(--txt-lo)', display: 'flex' }}>
              <IconClose size={13} />
            </button>
          )}
          <span className="mono" style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-mute)' }}>
            {groups.reduce((n, g) => n + g.markets.length, 0)}/{m.markets?.length ?? 0}
          </span>
        </div>

        <div className="filter-bar" style={{ paddingBottom: 10 }}>
          {groups.map((g) => (
            <button
              key={g.name}
              className="pill"
              data-on={group === g.name}
              onClick={() => {
                setGroup(g.name)
                refs.current[g.name]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              {g.name}
              <span className="mono" style={{ fontSize: 10, color: 'var(--txt-mute)' }}>
                {g.markets.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && (
        <div className="panel" style={{ padding: 'var(--s-8) var(--s-5)', borderStyle: 'dashed' }}>
          <div className="h3">No market matches “{q}”</div>
          <div style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)', marginTop: 4 }}>
            Try “over”, “corner”, or a player name like “Vardal”.
          </div>
        </div>
      )}

      <div className="stagger">
        {groups.map((g) => (
          <div
            key={g.name}
            ref={(el) => {
              refs.current[g.name] = el
            }}
            style={{ scrollMarginTop: 'calc(var(--topbar-h) + 108px)' }}
          >
            <div className="market-group">
              <div className="market-group__head">
                <span className="h3">{g.name}</span>
                {g.name === 'Goalscorers' && <span className="tag tag-cy">Sample data · fictional players</span>}
                <span className="mono" style={{ marginLeft: 'auto', fontSize: 'var(--fs-10)', color: 'var(--txt-mute)' }}>
                  POOL <span style={{ color: 'var(--txt-lo)' }}>{fmtUsdt(g.markets.reduce((n, x) => n + x.exposure, 0))}</span> ·{' '}
                  {g.markets.reduce((n, x) => n + x.selections.length, 0)} selections
                </span>
              </div>
              {g.markets.map((mk) => (
                <MarketBlock key={mk.id} market={mk} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-mute)', lineHeight: 1.6, marginTop: 'var(--s-2)' }}>
        Prices move while the match is in play. If a price moves after you add it, the slip holds it for 5 seconds
        and tells you why.
      </div>
    </div>
  )
}
