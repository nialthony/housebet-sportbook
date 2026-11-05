import { Link } from 'react-router-dom'
import { useStore } from '../state/store'
import { SPORTS, TOP_COMPS, type Match } from '../data/fixtures'
import { MatchRow, rowSelections, rowMarketName } from '../components/MatchRow'
import { SPORT_ICON, IconChevron, IconLive, IconClock, IconStar, IconLock } from '../components/Icons'
import { fmtUsdt } from '../lib/rand'
import { useOddsTick, useOddsDirection } from '../lib/useOddsTick'
import { Crest } from '../components/Crest'

/* ------------------------------------------------------------------ rail */
function LiveRail({ matches }: { matches: Match[] }) {
  return (
    <div className="rail" aria-label="Live scores">
      {matches.map((m) => (
        <Link
          key={m.id}
          to={m.markets?.length ? `/match/${m.id}` : '#'}
          onClick={(e) => {
            if (!m.markets?.length) e.preventDefault()
          }}
          className="rail-card"
        >
          <div className="rail-card__top">
            <span className="live-dot" />
            <span style={{ color: 'var(--hot)', fontWeight: 600 }}>{m.minute}′</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.compShort}</span>
            {m.period && <span style={{ marginLeft: 'auto' }}>{m.period}</span>}
          </div>
          <div className="rail-card__team" style={{ color: m.scoreHome > m.scoreAway ? 'var(--txt-hi)' : undefined }}>
            <Crest team={m.home} size={16} />
            {m.home}
          </div>
          <div className="rail-card__score">
            {m.scoreHome}
            <span style={{ color: 'var(--txt-mute)', margin: '0 4px', fontSize: 'var(--fs-17)' }}>–</span>
            {m.scoreAway}
          </div>
          <div className="rail-card__team" style={{ color: m.scoreAway > m.scoreHome ? 'var(--txt-hi)' : undefined }}>
            <Crest team={m.away} size={16} />
            {m.away}
          </div>
          {m.odds && (
            <div
              className="mono"
              style={{
                display: 'flex',
                gap: 4,
                marginTop: 2,
                paddingTop: 6,
                borderTop: '1px solid var(--line)',
                fontSize: 10,
                color: 'var(--txt-lo)',
                justifyContent: 'space-between',
              }}
            >
              {m.odds.map((o, i) => (
                <span key={i}>
                  <span style={{ color: 'var(--txt-mute)', marginRight: 2 }}>
                    {m.odds!.length === 2 ? (i === 0 ? '1' : '2') : ['1', 'X', '2'][i]}
                  </span>
                  <b style={{ color: 'var(--txt-hi)', fontWeight: 600 }}>{o.toFixed(2)}</b>
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}

/* ------------------------------------------------------- hero price button */
function HeroPrice({
  m,
  label,
  odds,
  suspended,
  selected,
  onPick,
}: {
  m: Match
  label: string
  odds: number
  suspended?: boolean
  selected: boolean
  onPick: () => void
}) {
  const ref = useOddsTick(odds) as React.RefObject<HTMLButtonElement>
  const dir = useOddsDirection(odds)
  return (
    <button
      ref={ref}
      className="hero__price"
      data-sel={selected}
      data-susp={suspended}
      disabled={suspended}
      onClick={onPick}
      aria-label={`${label} at ${odds.toFixed(2)}${suspended ? ', suspended' : ''} · ${m.home} v ${m.away}`}
    >
      <span style={{ color: 'var(--txt)' }}>{label}</span>
      <span className="mono" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        {!suspended && dir === 'up' && <span style={{ color: 'var(--up)', fontSize: 8 }}>▲</span>}
        {!suspended && dir === 'down' && <span style={{ color: 'var(--hot)', fontSize: 8 }}>▼</span>}
        {odds.toFixed(2)}
      </span>
    </button>
  )
}

/* --------------------------------------------------------- time grouping */
function groupByKickoff(list: Match[]) {
  const now: { label: string; items: Match[] }[] = []
  const buckets: { label: string; test: (m: Match) => boolean }[] = [
    { label: 'Kick-off within the hour', test: (m) => m.kickoffOffsetMin < 60 },
    { label: 'Later today', test: (m) => m.kickoffOffsetMin < 300 },
    { label: 'Tomorrow', test: () => true },
  ]
  for (const b of buckets) {
    const items = list.filter(b.test)
    if (items.length) now.push({ label: b.label, items })
    list = list.filter((m) => !b.test(m))
  }
  return now
}

/* ================================================================= PAGE */
export default function SportsHome() {
  const { s, addSelection } = useStore()
  const live = s.matches.filter((m) => m.status === 'live')
  const soon = s.matches.filter((m) => m.status === 'upcoming').sort((a, b) => a.kickoffOffsetMin - b.kickoffOffsetMin)
  const featured = s.matches[0]
  const featuredSels = rowSelections(featured)
  const soonGroups = groupByKickoff(soon)
  const liveCount = live.length

  return (
    <div>
      <h1 className="h1" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        Housebets Sports
      </h1>

      {/* ------------------------------------------------------ live rail */}
      <div className="sec" style={{ marginBottom: 'var(--s-5)' }}>
        <div className="sec-head">
          <span className="row" style={{ gap: 7 }}>
            <span className="live-dot" />
            <h2>In play</h2>
          </span>
          <span className="count">{liveCount}</span>
          <Link
            to="/live"
            className="row"
            style={{ marginLeft: 'auto', fontSize: 'var(--fs-12)', color: 'var(--cy)', fontWeight: 600, gap: 4 }}
          >
            All live <IconChevron size={12} />
          </Link>
        </div>
        {liveCount > 0 ? (
          <LiveRail matches={live} />
        ) : (
          <div className="panel" style={{ padding: '14px', borderStyle: 'dashed', fontSize: 'var(--fs-12)', color: 'var(--txt-lo)' }}>
            Nothing in play right now. Next kick-off in {Math.floor((soon[0]?.kickoffOffsetMin ?? 0) / 60)}h{' '}
            {(soon[0]?.kickoffOffsetMin ?? 0) % 60}m.
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------- hero */}
      <div
        className="hero"
        style={{ marginBottom: 'var(--s-6)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 'var(--s-5)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', minWidth: 0 }}>
          <div className="spread">
            <span className="row" style={{ gap: 7 }}>
              <span className="live-dot" />
              <span className="eyebrow" style={{ color: 'var(--hot)' }}>
                Featured · {featured.minute}′
              </span>
              <span style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)' }}>{featured.comp}</span>
            </span>
            <span className="tag tag-cy">On-chain settlement</span>
          </div>

          <div className="scoreline" style={{ justifyContent: 'flex-start' }}>
            <span className="row" style={{ gap: 8 }}>
              <Crest team={featured.home} size={22} />
              <span style={{ fontSize: 'var(--fs-17)', fontWeight: 600, color: 'var(--txt-hi)' }}>{featured.home}</span>
            </span>
            <span className="scoreline__n">{featured.scoreHome}</span>
            <span className="scoreline__sep">–</span>
            <span className="scoreline__n">{featured.scoreAway}</span>
            <span className="row" style={{ gap: 8 }}>
              <span style={{ fontSize: 'var(--fs-17)', fontWeight: 600, color: 'var(--txt-hi)' }}>{featured.away}</span>
              <Crest team={featured.away} size={22} />
            </span>
          </div>

          <div style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)', lineHeight: 1.55 }}>
            {featured.note} The house is{' '}
            <span className="mono" style={{ color: 'var(--txt-hi)' }}>
              {fmtUsdt(featured.markets?.[0]?.exposure ?? 0)} USDT
            </span>{' '}
            deep on the match result. Payouts are guaranteed by the pool, not by a bookie's balance sheet.
          </div>

          <div className="hero__prices">
            {featuredSels.map((sel) => {
              const nm = rowMarketName(featured)
              const key = `${featured.id}:${nm}:${sel.id}`
              const on = s.slip.some((x) => x.key === key)
              const label = sel.label === '1' ? featured.home : sel.label === '2' ? featured.away : 'Draw'
              return (
                <HeroPrice
                  key={sel.id}
                  m={featured}
                  label={label}
                  odds={sel.odds}
                  suspended={sel.suspended}
                  selected={on}
                  onPick={() => addSelection(featured, nm, sel)}
                />
              )
            })}
          </div>

          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <Link to={`/match/${featured.id}`} className="btn btn-primary" style={{ height: 34, padding: '0 16px', gap: 6 }}>
              Open match <IconChevron size={12} />
            </Link>
            <span style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)' }}>
              {featured.markets?.length} market groups · singles only
            </span>
          </div>
        </div>

        {/* right: bankroll + live prices panel */}
        <div
          style={{
            width: 240,
            borderLeft: '1px solid var(--line)',
            paddingLeft: 'var(--s-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--s-3)',
          }}
          className="hero__side"
        >
          <div>
            <div className="eyebrow" style={{ fontSize: 9 }}>
              House bankroll backing this match
            </div>
            <div className="mono" style={{ fontSize: 'var(--fs-20)', fontWeight: 700, color: 'var(--txt-hi)' }}>
              {fmtUsdt((featured.markets ?? []).reduce((n, x) => n + x.exposure, 0))}
            </div>
            <div className="row" style={{ gap: 5, marginTop: 4 }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              <span style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)' }}>On-chain · verifiable</span>
            </div>
          </div>

          <hr className="hr" />

          <div>
            <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>
              Moving now
            </div>
            {featured.markets?.slice(0, 3).map((mk) => {
              const sel = mk.selections[0]
              return (
                <Link
                  key={mk.id}
                  to={`/match/${featured.id}`}
                  className="spread"
                  style={{
                    padding: '5px 0',
                    borderBottom: '1px solid var(--line)',
                    fontSize: 'var(--fs-11)',
                    gap: 8,
                  }}
                >
                  <span style={{ color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {mk.name}
                  </span>
                  <span className="mono" style={{ color: 'var(--txt-hi)', fontWeight: 600 }}>
                    {sel.odds.toFixed(2)}
                  </span>
                </Link>
              )
            })}
          </div>

          <div className="row" style={{ gap: 6, marginTop: 'auto', fontSize: 'var(--fs-10)', color: 'var(--txt-mute)' }}>
            <IconLock size={11} />
            Prices update as the pool re-prices
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------ live now */}
      <div className="sec">
        <div className="sec-head">
          <span className="row" style={{ gap: 7 }}>
            <IconLive size={13} />
            <h2>Live now</h2>
          </span>
          <span className="count">{liveCount}</span>
          <Link
            to="/live"
            className="row"
            style={{ marginLeft: 'auto', fontSize: 'var(--fs-12)', color: 'var(--cy)', fontWeight: 600, gap: 4 }}
          >
            Filter by sport <IconChevron size={12} />
          </Link>
        </div>
        <div className="panel stagger" style={{ overflow: 'hidden' }}>
          {live.slice(0, 6).map((m) => (
            <MatchRow key={m.id} m={m} showComp />
          ))}
        </div>
      </div>

      {/* -------------------------------------------------- starting soon */}
      <div className="sec">
        <div className="sec-head">
          <span className="row" style={{ gap: 7 }}>
            <IconClock size={13} />
            <h2>Starting soon</h2>
          </span>
          <span className="count">{soon.length}</span>
        </div>
        {soonGroups.map((g) => (
          <div key={g.label} style={{ marginBottom: 'var(--s-4)' }}>
            <div
              className="eyebrow"
              style={{
                padding: '6px 8px',
                background: 'var(--ink-150)',
                borderBottom: '1px solid var(--line)',
                fontSize: 9,
              }}
            >
              {g.label}
            </div>
            <div className="panel" style={{ overflow: 'hidden', borderTop: 0, borderRadius: 0 }}>
              {g.items.slice(0, 5).map((m) => (
                <MatchRow key={m.id} m={m} showComp />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------ sports nav */}
      <div className="sec">
        <div className="sec-head">
          <h2>Sports</h2>
          <span className="count">{SPORTS.reduce((n, x) => n + x.live, 0)} live</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 'var(--s-2)' }}>
          {SPORTS.map((sp) => {
            const Icon = SPORT_ICON[sp.id]
            const n = s.matches.filter((m) => m.sport === sp.id && m.status === 'live').length
            return (
              <Link
                key={sp.id}
                to={sp.id === 'football' ? '/football' : `/live?sport=${sp.id}`}
                className="comp-card"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}
              >
                <span style={{ color: n ? 'var(--hot)' : 'var(--txt-mute)', display: 'flex' }}>
                  <Icon size={15} />
                </span>
                <span style={{ flex: 1, fontSize: 'var(--fs-12)', fontWeight: 600, color: 'var(--txt-hi)' }}>
                  {sp.name}
                </span>
                {n > 0 && (
                  <span className="mono" style={{ fontSize: 10, color: 'var(--hot)', fontWeight: 600 }}>
                    {n}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------ top competitions */}
      <div className="sec">
        <div className="sec-head">
          <h2>Top competitions</h2>
        </div>
        <div className="comp-grid">
          {TOP_COMPS.map((c) => {
            const live_ = s.matches.filter((m) => m.comp === c.name && m.status === 'live').length
            return (
              <Link key={c.name} to="/football" className="comp-card">
                <div className="spread" style={{ marginBottom: 10 }}>
                  <span className="comp-card__badge">{c.short}</span>
                  {live_ > 0 ? (
                    <span className="row" style={{ gap: 4, fontSize: 10, color: 'var(--hot)' }}>
                      <IconLive size={11} />
                      <span className="mono">{live_}</span>
                    </span>
                  ) : (
                    <IconStar size={13} />
                  )}
                </div>
                <div style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--txt-hi)' }}>{c.name}</div>
                <div className="mono" style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-mute)', marginTop: 2 }}>
                  {c.events} events
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------ following */}
      {s.follows.length > 0 && (
        <div className="sec">
          <div className="sec-head">
            <h2>Following</h2>
            <span className="count">{s.follows.length}</span>
          </div>
          <div className="panel stagger" style={{ overflow: 'hidden' }}>
            {s.matches
              .filter((m) => s.follows.includes(m.home) || s.follows.includes(m.comp))
              .slice(0, 5)
              .map((m) => (
                <MatchRow key={m.id} m={m} showComp />
              ))}
          </div>
        </div>
      )}

      <div className="row" style={{ gap: 6, paddingTop: 'var(--s-2)', fontSize: 'var(--fs-11)', color: 'var(--txt-mute)' }}>
        <IconClock size={12} />
        Prices move with the pool. Sample data: fictional players, no real money.
      </div>

      <style>{`
        @media (max-width: 860px){
          .hero{ grid-template-columns: minmax(0,1fr) !important; }
          .hero__side{ width:auto !important; border-left:0 !important; padding-left:0 !important;
            border-top:1px solid var(--line); padding-top:var(--s-4); }
        }
      `}</style>
    </div>
  )
}
