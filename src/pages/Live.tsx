import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../state/store'
import { SPORTS, type SportId } from '../data/fixtures'
import { MatchRow } from '../components/MatchRow'
import { SPORT_ICON, IconFilter, IconLive, IconClock, IconChevron } from '../components/Icons'

/** The official wireframe lists live matches grouped by competition, each block
 *  ending in a "View all" link. Matched here. */
function groupByComp(list: import('../data/fixtures').Match[]) {
  const out: { name: string; matches: import('../data/fixtures').Match[] }[] = []
  for (const m of list) {
    const hit = out.find((g) => g.name === m.comp)
    if (hit) hit.matches.push(m)
    else out.push({ name: m.comp, matches: [m] })
  }
  return out
}

export default function Live() {
  const { s } = useStore()
  const [params, setParams] = useSearchParams()
  const sport = (params.get('sport') as SportId | null) ?? null
  const [comp, setComp] = useState<string | null>(null)
  const [demoEmpty, setDemoEmpty] = useState(false)

  const live = useMemo(() => {
    let list = s.matches.filter((m) => m.status === 'live')
    if (sport) list = list.filter((m) => m.sport === sport)
    if (comp) list = list.filter((m) => m.comp === comp)
    return list.sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0))
  }, [s.matches, sport, comp])

  const comps = useMemo(() => {
    const set = new Set(s.matches.filter((m) => m.status === 'live').map((m) => m.comp))
    return [...set]
  }, [s.matches])

  const soon = useMemo(
    () =>
      s.matches
        .filter((m) => m.status === 'upcoming')
        .filter((m) => !sport || m.sport === sport)
        .sort((a, b) => a.kickoffOffsetMin - b.kickoffOffsetMin),
    [s.matches, sport],
  )

  const setSport = (id: SportId | null) => {
    const next = new URLSearchParams(params)
    if (id) next.set('sport', id)
    else next.delete('sport')
    setParams(next)
    setComp(null)
  }

  const empty = demoEmpty || live.length === 0

  return (
    <div>
      <div className="spread" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <h1 className="h1">Live</h1>
          <div className="row" style={{ gap: 6, marginTop: 3, fontSize: 'var(--fs-12)', color: 'var(--txt-lo)' }}>
            <span className="live-dot" />
            {empty ? 'Nothing in play right now' : `${live.length} in play · clocks and prices update live`}
          </div>
        </div>
        <label
          className="row"
          style={{ gap: 6, fontSize: 'var(--fs-11)', color: 'var(--txt-mute)', cursor: 'pointer' }}
          title="Prototype switch: show the empty state"
        >
          <input
            type="checkbox"
            checked={demoEmpty}
            onChange={(e) => setDemoEmpty(e.target.checked)}
            style={{ accentColor: 'var(--hot)' }}
          />
          show “nothing live” state
        </label>
      </div>

      {/* -------------------------------------------------------- filters */}
      <div className="filter-bar" style={{ marginBottom: 'var(--s-2)' }}>
        <span className="row" style={{ gap: 5, color: 'var(--txt-mute)', marginRight: 4 }}>
          <IconFilter size={13} />
        </span>
        <button className="pill" data-on={!sport} onClick={() => setSport(null)}>
          All sports
          <span className="mono" style={{ fontSize: 10, color: 'var(--txt-mute)' }}>
            {s.matches.filter((m) => m.status === 'live').length}
          </span>
        </button>
        {SPORTS.map((sp) => {
          const Icon = SPORT_ICON[sp.id]
          const n = s.matches.filter((m) => m.sport === sp.id && m.status === 'live').length
          return (
            <button key={sp.id} className="pill" data-on={sport === sp.id} onClick={() => setSport(sp.id)}>
              <Icon size={12} />
              {sp.name}
              <span className="mono" style={{ fontSize: 10, color: 'var(--txt-mute)' }}>
                {n}
              </span>
            </button>
          )
        })}
      </div>

      {comps.length > 0 && (
        <div className="filter-bar" style={{ marginBottom: 'var(--s-4)' }}>
          <span className="eyebrow" style={{ fontSize: 9, marginRight: 4 }}>
            Competition
          </span>
          <button className="pill" data-on={!comp} onClick={() => setComp(null)}>
            All
          </button>
          {comps.map((c) => (
            <button key={c} className="pill" data-on={comp === c} onClick={() => setComp(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* -------------------------------------------------------- content */}
      {!empty ? (
        <div>
          {groupByComp(live).map((g) => (
            <div key={g.name} className="sec" style={{ marginBottom: 'var(--s-5)' }}>
              <div className="sec-head">
                <h2 style={{ fontSize: 'var(--fs-13)' }}>{g.name}</h2>
                <span className="count">
                  {g.matches.length} match{g.matches.length === 1 ? '' : 'es'}
                </span>
                <button
                  className="row"
                  style={{
                    marginLeft: 'auto',
                    fontSize: 'var(--fs-11)',
                    color: 'var(--cy)',
                    fontWeight: 600,
                    gap: 4,
                  }}
                  onClick={() => setComp(g.name)}
                >
                  View all <IconChevron size={11} />
                </button>
              </div>
              <div className="panel" style={{ overflow: 'hidden' }}>
                {g.matches.map((m) => (
                  <MatchRow key={m.id} m={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div
            className="panel"
            style={{
              padding: 'var(--s-8) var(--s-5)',
              borderStyle: 'dashed',
              textAlign: 'left',
              marginBottom: 'var(--s-6)',
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--txt-mute)', marginTop: 2, display: 'flex' }}>
                <IconLive size={16} />
              </span>
              <div>
                <div className="h3">Nothing live right now</div>
                <div style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)', marginTop: 4, lineHeight: 1.55 }}>
                  {sport
                    ? `No ${SPORTS.find((x) => x.id === sport)?.name} match is in play. Next one kicks off in ${Math.floor(
                        (soon[0]?.kickoffOffsetMin ?? 0) / 60,
                      )}h ${(soon[0]?.kickoffOffsetMin ?? 0) % 60}m.`
                    : 'No match is in play. Here is what starts next.'}
                </div>
                {sport && (
                  <button className="btn" style={{ marginTop: 12, height: 30 }} onClick={() => setSport(null)}>
                    Show all sports
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="sec-head">
            <h2>Starting soon</h2>
            <span className="count">{soon.length}</span>
          </div>
          <div className="panel" style={{ overflow: 'hidden' }}>
            {soon.slice(0, 8).map((m) => (
              <MatchRow key={m.id} m={m} showComp />
            ))}
          </div>
        </div>
      )}

      <div
        className="row"
        style={{ gap: 6, paddingTop: 'var(--s-4)', fontSize: 'var(--fs-11)', color: 'var(--txt-mute)' }}
      >
        <IconClock size={12} />
        Live rows keep their clock and score; suspended prices stay in place with a reason.
      </div>
    </div>
  )
}
