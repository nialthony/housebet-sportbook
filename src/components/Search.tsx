import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEARCH_INDEX } from '../data/fixtures'
import { IconSearch, IconClose } from './Icons'

export function Search({ compact }: { compact?: boolean }) {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        input.current?.focus()
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return { groups: [], total: 0 }
    const hits = SEARCH_INDEX.filter(
      (r) => r.label.toLowerCase().includes(t) || r.sub.toLowerCase().includes(t),
    ).slice(0, 12)
    const order = ['Event', 'Competition', 'Player', 'Market']
    const groups = order
      .map((k) => ({ kind: k, items: hits.filter((h) => h.kind === k) }))
      .filter((g) => g.items.length)
    return { groups, total: hits.length }
  }, [q])

  const go = (to: string) => {
    setOpen(false)
    setQ('')
    nav(to)
  }

  return (
    <div ref={box} style={{ position: 'relative', flex: compact ? 1 : '0 1 380px', minWidth: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 32,
          padding: '0 8px 0 9px',
          background: 'var(--ink-150)',
          border: '1px solid var(--line-2)',
          borderRadius: 'var(--r-row)',
          overflow: 'hidden',
        }}
      >
        <span style={{ color: 'var(--txt-lo)', display: 'flex', flex: '0 0 auto' }}>
          <IconSearch size={14} />
        </span>
        <input
          id="global-search"
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Teams, players, competitions, markets"
          aria-label="Search"
          style={{
            flex: 1,
            width: '100%',
            minWidth: 0,
            border: 0,
            outline: 0,
            background: 'none',
            color: 'var(--txt-hi)',
            fontSize: 'var(--fs-13)',
            textOverflow: 'ellipsis',
          }}
        />
        {q ? (
          <button
            onClick={() => {
              setQ('')
              input.current?.focus()
            }}
            aria-label="Clear search"
            style={{ color: 'var(--txt-lo)', display: 'flex', flex: '0 0 auto' }}
          >
            <IconClose size={13} />
          </button>
        ) : (
          <kbd
            className="mono search__kbd"
            style={{
              fontSize: 10,
              color: 'var(--txt-mute)',
              border: '1px solid var(--line-2)',
              borderRadius: 2,
              padding: '1px 4px',
              flex: '0 0 auto',
            }}
          >
            /
          </kbd>
        )}
      </div>

      {open && q.trim() && (
        <div
          data-search-panel
          style={{
            position: 'absolute',
            top: 38,
            left: 0,
            right: 0,
            minWidth: 'min(340px, calc(100vw - 24px))',
            background: 'var(--ink-100)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--r-card)',
            zIndex: 90,
            overflow: 'hidden',
          }}
        >
          {results.total === 0 && (
            <div style={{ padding: '14px 12px', fontSize: 'var(--fs-13)', color: 'var(--txt-lo)' }}>
              Nothing matches “{q}”. Try a club, a competition or a market like “over 2.5”.
            </div>
          )}
          {results.groups.map((g) => (
            <div key={g.kind}>
              <div
                className="eyebrow"
                style={{ padding: '8px 12px 4px', borderTop: '1px solid var(--line)', fontSize: 10 }}
              >
                {g.kind}
              </div>
              {g.items.map((r) => (
                <button
                  key={r.kind + r.label}
                  onClick={() => go(r.to)}
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'baseline',
                    gap: 8,
                    padding: '7px 12px',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ink-150)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: 'var(--txt-hi)', fontSize: 'var(--fs-13)' }}>{r.label}</span>
                  <span style={{ color: 'var(--txt-mute)', fontSize: 'var(--fs-11)', marginLeft: 'auto' }}>
                    {r.sub}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
