import { useMemo, useState } from 'react'
import { useStore } from '../state/store'
import { FOOTBALL_COMPS } from '../data/fixtures'
import { CompetitionBlock } from '../components/MatchRow'
import { IconStar, IconChevron } from '../components/Icons'

const TIME_FILTERS = ['All', 'Live', 'Next 2h', 'Tomorrow'] as const

export default function Football() {
  const { s } = useStore()
  const [f, setF] = useState<(typeof TIME_FILTERS)[number]>('All')
  const [followOnly, setFollowOnly] = useState(false)

  const blocks = useMemo(() => {
    return FOOTBALL_COMPS.map((c) => {
      let list = s.matches.filter((m) => m.comp === c && m.sport === 'football')
      if (f === 'Live') list = list.filter((m) => m.status === 'live')
      if (f === 'Next 2h') list = list.filter((m) => m.status === 'upcoming' && m.kickoffOffsetMin <= 120)
      if (f === 'Tomorrow') list = list.filter((m) => m.status === 'upcoming' && m.kickoffOffsetMin > 120)
      if (followOnly) list = list.filter((m) => s.follows.includes(m.home) || s.follows.includes(m.comp))
      return { name: c, matches: list }
    }).filter((b) => b.matches.length > 0)
  }, [s.matches, s.follows, f, followOnly])

  const total = blocks.reduce((n, b) => n + b.matches.length, 0)
  const liveCount = s.matches.filter((m) => m.sport === 'football' && m.status === 'live').length

  return (
    <div>
      <div className="spread" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <h1 className="h1">Football</h1>
          <div style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)', marginTop: 3 }}>
            {total} events across {blocks.length} competitions
            {liveCount > 0 && (
              <>
                {' · '}
                <span style={{ color: 'var(--hot)' }}>{liveCount} live</span>
              </>
            )}
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {TIME_FILTERS.map((t) => (
            <button key={t} className="pill" data-on={f === t} onClick={() => setF(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 'var(--s-4)' }}>
        <button className="pill" data-on={followOnly} onClick={() => setFollowOnly((v) => !v)}>
          <span style={{ color: followOnly ? 'var(--hot)' : 'inherit', display: 'flex' }}>
            <IconStar size={12} filled={followOnly} />
          </span>
          Following only
        </button>
        {s.follows.length > 0 && (
          <span style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-mute)' }}>
            {s.follows.join(' · ')}
          </span>
        )}
      </div>

      {blocks.length === 0 && (
        <div className="panel" style={{ padding: 'var(--s-8) var(--s-5)', borderStyle: 'dashed' }}>
          <div className="h3">No events match that filter</div>
          <div style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)', marginTop: 4 }}>
            {followOnly
              ? 'You are not following anything in football yet. Star a team or a competition and it will pin here.'
              : 'Try “All” to see every fixture.'}
          </div>
        </div>
      )}

      {blocks.map((b) => (
        <CompetitionBlock key={b.name} name={b.name} matches={b.matches} />
      ))}

      <div
        className="row"
        style={{ gap: 6, paddingTop: 'var(--s-2)', fontSize: 'var(--fs-11)', color: 'var(--txt-mute)' }}
      >
        <IconChevron size={11} />
        Star a competition to pin it in the left rail. Result prices are 1 / X / 2.
      </div>
    </div>
  )
}
