import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useStore } from '../state/store'
import { SPORTS } from '../data/fixtures'
import { Search } from './Search'
import { BetSlip, MobileSlipBar } from './BetSlip'
import { PausedBanner } from './StateBar'
import {
  SPORT_ICON,
  IconHome,
  IconLive,
  IconSlip,
  IconBets,
  IconWallet,
  IconStar,
  IconFootball,
  IconChevron,
} from './Icons'

/* ------------------------------------------------------------- wordmark */
export function Wordmark() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2.6 22 10.2h-2.6v11.2H4.6V10.2H2L12 2.6Z" fill="var(--hot)" />
        <path d="M9.4 21.4v-6.2h5.2v6.2" fill="var(--ink-000)" />
      </svg>
      <span
        style={{
          fontSize: 'var(--fs-15)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--txt-hi)',
        }}
      >
        housebets
      </span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.1em',
          color: 'var(--txt-mute)',
          borderLeft: '1px solid var(--line-2)',
          paddingLeft: 8,
        }}
      >
        SPORTS
      </span>
    </Link>
  )
}

/* --------------------------------------------------------------- top bar */
function TopBar() {
  const { s } = useStore()
  return (
    <header className="topbar">
      <Wordmark />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: 420, display: 'flex' }}>
          <Search compact />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            height: 32,
            padding: '0 10px',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--r-row)',
            background: 'var(--ink-150)',
          }}
          title="Available balance"
        >
          <span style={{ color: 'var(--cy)', display: 'flex' }}>
            <IconWallet size={13} />
          </span>
          <span className="mono" style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--txt-hi)' }}>
            {s.balance.toFixed(2)}
          </span>
          <span style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)' }}>USDT</span>
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--r-pill)',
            background: 'linear-gradient(180deg, #17414c, #0d2a33)',
            border: '1px solid var(--line-2)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--cy)',
          }}
          title="Signed in as a sample account"
        >
          JD
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------- left nav */
/** Sample figure for the on-chain house bankroll. Static, so it reads as a
 *  pool size rather than anything tied to an account. */
const HOUSE_BANKROLL = 3_447_450

function NavItem({ to, icon, label, badge }: { to: string; icon: ReactNode; label: string; badge?: number }) {
  return (
    <NavLink to={to} end={to === '/'} style={{ display: 'block' }}>
      {({ isActive }) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            height: 32,
            padding: '0 9px',
            borderRadius: 'var(--r-row)',
            background: isActive ? 'var(--ink-150)' : 'transparent',
            color: isActive ? 'var(--txt-hi)' : 'var(--txt-lo)',
            boxShadow: isActive ? 'inset 2px 0 0 var(--hot)' : 'none',
            fontSize: 'var(--fs-13)',
            fontWeight: isActive ? 600 : 500,
          }}
        >
          <span style={{ display: 'flex', color: isActive ? 'var(--hot)' : 'inherit' }}>{icon}</span>
          <span style={{ flex: 1 }}>{label}</span>
          {badge ? (
            <span className="mono" style={{ fontSize: 10, color: 'var(--txt-mute)' }}>
              {badge}
            </span>
          ) : null}
        </div>
      )}
    </NavLink>
  )
}

function LeftNav() {
  const { s } = useStore()
  return (
    <nav className="leftnav">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 14 }}>
        <NavItem to="/" icon={<IconHome size={15} />} label="Sports home" />
        <NavItem
          to="/live"
          icon={<IconLive size={15} />}
          label="Live"
          badge={s.matches.filter((m) => m.status === 'live').length}
        />
        <NavItem to="/football" icon={<IconFootball size={15} />} label="Football" />
        <NavItem to="/bets" icon={<IconSlip size={15} />} label="Bet slip & My bets" />
      </div>

      <div className="eyebrow" style={{ padding: '0 9px 6px' }}>
        Sports
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {SPORTS.map((sp) => {
          const Icon = SPORT_ICON[sp.id]
          const live = s.matches.filter((m) => m.sport === sp.id && m.status === 'live').length
          return (
            <NavLink key={sp.id} to={sp.id === 'football' ? '/football' : '/live?sport=' + sp.id} style={{ display: 'block' }}>
              {({ isActive }) => (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    height: 30,
                    padding: '0 9px',
                    borderRadius: 'var(--r-row)',
                    background: isActive ? 'var(--ink-150)' : 'transparent',
                    color: isActive ? 'var(--txt-hi)' : 'var(--txt)',
                    fontSize: 'var(--fs-13)',
                  }}
                >
                  <span style={{ color: live ? 'var(--hot)' : 'var(--txt-mute)', display: 'flex' }}>
                    <Icon size={14} />
                  </span>
                  <span style={{ flex: 1 }}>{sp.name}</span>
                  {live > 0 && (
                    <span
                      className="mono"
                      style={{ fontSize: 10, color: 'var(--hot)', fontWeight: 600 }}
                      title={`${live} live`}
                    >
                      {live}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          )
        })}
      </div>

      <div className="eyebrow" style={{ padding: '16px 9px 6px' }}>
        Your matches
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {s.matches
          .filter((m) => s.follows.includes(m.home) || s.follows.includes(m.comp))
          .slice(0, 4)
          .map((m) => (
            <NavLink key={m.id} to={m.markets?.length ? `/match/${m.id}` : '/live'} style={{ display: 'block' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 9px',
                  borderRadius: 'var(--r-row)',
                  fontSize: 'var(--fs-12)',
                  color: 'var(--txt)',
                }}
              >
                {m.status === 'live' && <span className="live-dot" style={{ width: 5, height: 5, flex: '0 0 5px' }} />}
                <span
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: m.status === 'live' ? 'var(--txt-hi)' : 'var(--txt-lo)',
                  }}
                >
                  {m.home} v {m.away}
                </span>
                {m.status === 'live' && (
                  <span className="mono" style={{ fontSize: 10, color: 'var(--txt-mute)' }}>
                    {m.minute}′
                  </span>
                )}
              </div>
            </NavLink>
          ))}
      </div>

      <div className="eyebrow" style={{ padding: '16px 9px 6px' }}>
        Following
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {s.follows.map((f) => (
          <div
            key={f}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              height: 30,
              padding: '0 9px',
              fontSize: 'var(--fs-13)',
              color: 'var(--txt)',
            }}
          >
            <span style={{ color: 'var(--hot)', display: 'flex' }}>
              <IconStar size={13} filled />
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</span>
            <IconChevron size={12} />
          </div>
        ))}
        {s.follows.length === 0 && (
          <div style={{ padding: '0 9px', fontSize: 'var(--fs-11)', color: 'var(--txt-mute)', lineHeight: 1.5 }}>
            Star a team or competition and it pins here.
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 18,
          marginInline: 4,
          padding: 10,
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-card)',
          background: 'var(--ink-100)',
        }}
      >
        <div className="eyebrow" style={{ fontSize: 9 }}>
          House bankroll
        </div>
        <div className="mono" style={{ fontSize: 'var(--fs-15)', color: 'var(--txt-hi)', fontWeight: 600 }}>
          {HOUSE_BANKROLL.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          <span style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)' }}> USDT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
          <span className="live-dot" style={{ width: 5, height: 5 }} />
          <span style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)' }}>
            On-chain · payouts guaranteed by the pool
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          marginInline: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 'var(--fs-10)',
          color: 'var(--txt-mute)',
        }}
      >
        <span className="kbd">/</span>
        <span>search</span>
        <span className="kbd">B</span>
        <span>bets</span>
        <span className="kbd">esc</span>
        <span>close</span>
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------ bottom nav */
function BottomNav() {
  const { s } = useStore()
  const items = [
    { to: '/', icon: <IconHome size={18} />, label: 'Home' },
    { to: '/live', icon: <IconLive size={18} />, label: 'Live' },
    { to: '/football', icon: <IconFootball size={18} />, label: 'Football' },
    { to: '/bets', icon: <IconBets size={18} />, label: 'My bets', badge: s.bets.filter((b) => b.status === 'open').length },
  ]
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: 'var(--ink-050)',
        borderTop: '1px solid var(--line)',
        display: 'none',
        zIndex: 80,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      className="bottomnav"
    >
      <div style={{ display: 'flex', height: 56 }}>
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.to === '/'} style={{ flex: 1 }}>
            {({ isActive }) => (
              <div
                style={{
                  height: 56,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  color: isActive ? 'var(--txt-hi)' : 'var(--txt-mute)',
                  position: 'relative',
                }}
              >
                <span style={{ display: 'flex', color: isActive ? 'var(--hot)' : 'inherit' }}>{i.icon}</span>
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500 }}>{i.label}</span>
                {i.badge ? (
                  <span
                    className="mono"
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: '50%',
                      marginRight: -22,
                      minWidth: 15,
                      height: 15,
                      padding: '0 4px',
                      borderRadius: 8,
                      background: 'var(--ink-200)',
                      border: '1px solid var(--line-2)',
                      fontSize: 9,
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--txt)',
                    }}
                  >
                    {i.badge}
                  </span>
                ) : null}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

/* -------------------------------------------------------------- toasts */
function Toasts() {
  const { s, d } = useStore()
  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(var(--topbar-h) + 12px)',
        right: 12,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 'min(340px, calc(100vw - 24px))',
      }}
    >
      {s.toasts.map((t) => (
        <ToastRow key={t.id} t={t} onDone={() => d({ t: 'dropToast', id: t.id })} />
      ))}
    </div>
  )
}

function ToastRow({ t, onDone }: { t: import('../state/store').Toast; onDone: () => void }) {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const a = setTimeout(() => setGone(true), 4600)
    const b = setTimeout(onDone, 4900)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [onDone])
  const color = t.kind === 'placed' ? 'var(--up)' : t.kind === 'failed' ? 'var(--hot)' : 'var(--cy)'
  return (
    <div
      className="toast-in"
      style={{
        border: `1px solid ${t.kind === 'failed' ? 'var(--hot-dim)' : 'var(--line-2)'}`,
        borderLeft: `2px solid ${color}`,
        background: 'var(--ink-150)',
        borderRadius: 'var(--r-card)',
        padding: '9px 11px',
        opacity: gone ? 0 : 1,
        transform: gone ? 'translateX(8px)' : 'none',
        transition: 'opacity 280ms var(--ease), transform 280ms var(--ease)',
      }}
    >
      <div style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--txt-hi)' }}>{t.title}</div>
      {t.body && (
        <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)', marginTop: 2, lineHeight: 1.5 }}>{t.body}</div>
      )}
    </div>
  )
}

/* --------------------------------------------------------------- shell */
export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const isBets = pathname.startsWith('/bets')

  // '/' focuses search, 'b' jumps to the slip. Small, but it is the
  // difference between a mock-up and something that feels shippable.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
      if (typing) return
      if (e.key === '/') {
        e.preventDefault()
        document.getElementById('global-search')?.focus()
      }
      if (e.key === 'b' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        window.location.hash = '#/bets'
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app">
      <TopBar />
      <PausedBanner />
      <div className="body">
        <LeftNav />
        <main className="main">{children}</main>
        {!isBets && (
          <aside className="sidepanel" aria-label="Bet slip">
            <BetSlip />
          </aside>
        )}
      </div>
      <BottomNav />
      <MobileSlipBar />
      <Toasts />
      <style>{`@media (max-width: 700px){ .bottomnav{ display:block !important; } }`}</style>
    </div>
  )
}
