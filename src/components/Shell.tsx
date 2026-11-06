import { useState, useEffect, useRef, createContext, useContext } from 'react'
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
  IconClose,
  IconMenu,
} from './Icons'

/* ------------------------------------------------------------- nav context */
interface NavContextType {
  collapsed: boolean
  toggleCollapsed: () => void
  drawerOpen: boolean
  setDrawerOpen: (v: boolean) => void
  toggleDrawer: () => void
}

const NavContext = createContext<NavContextType>({
  collapsed: false,
  toggleCollapsed: () => {},
  drawerOpen: false,
  setDrawerOpen: () => {},
  toggleDrawer: () => {},
})

export const useNav = () => useContext(NavContext)

/* ------------------------------------------------------------- wordmark */
export function Wordmark() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto', textDecoration: 'none' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2.6 22 10.2h-2.6v11.2H4.6V10.2H2L12 2.6Z" fill="var(--hot)" />
        <path d="M9.4 21.4v-6.2h5.2v6.2" fill="var(--ink-000)" />
      </svg>
      <span
        style={{
          fontSize: 'var(--fs-17)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--txt-hi)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 1,
        }}
      >
        house<span style={{ color: 'var(--hot)' }}>bets</span>
      </span>
      <span
        className="wordmark__sub"
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'var(--cy)',
          borderLeft: '1px solid var(--line-2)',
          paddingLeft: 8,
          textTransform: 'uppercase',
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
  const { collapsed, toggleCollapsed, toggleDrawer } = useNav()

  const handleToggle = () => {
    if (window.innerWidth < 1080) {
      toggleDrawer()
    } else {
      toggleCollapsed()
    }
  }

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
        <button
          type="button"
          onClick={handleToggle}
          className="topbar__menu-btn"
          aria-label={collapsed ? 'Expand navigation menu' : 'Collapse navigation menu'}
          title="Toggle menu ([)"
        >
          <IconMenu size={16} />
        </button>
        <Wordmark />
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: 440, display: 'flex', minWidth: 0 }}>
          <Search compact />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
        <Link
          to="/bets"
          className="topbar__wallet"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            height: 34,
            padding: '0 12px',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--r-pill)',
            background: 'var(--ink-150)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            transition: 'border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease)',
          }}
          title="Available on-chain balance · view ledger"
        >
          <span style={{ color: 'var(--cy)', display: 'flex' }}>
            <IconWallet size={14} />
          </span>
          <span className="mono" style={{ fontSize: 'var(--fs-13)', fontWeight: 700, color: 'var(--txt-hi)' }}>
            {s.balance.toFixed(2)}
          </span>
          <span className="topbar__unit" style={{ fontSize: 'var(--fs-10)', fontWeight: 700, color: 'var(--cy)', letterSpacing: '0.04em' }}>
            USDT
          </span>
        </Link>
        <div
          className="topbar__avatar"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--r-pill)',
            background: 'var(--ink-200)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
            border: '1px solid var(--line-2)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--txt-hi)',
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
            gap: 10,
            height: 36,
            padding: '0 12px',
            borderRadius: 'var(--r-row)',
            background: isActive ? 'var(--ink-150)' : 'transparent',
            color: isActive ? '#fff' : 'var(--txt-lo)',
            boxShadow: isActive ? 'inset 3px 0 0 var(--hot), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
            fontSize: 'var(--fs-13)',
            fontWeight: isActive ? 600 : 500,
            transition: 'all var(--t-fast) var(--ease)',
          }}
        >
          <span style={{ display: 'flex', color: isActive ? 'var(--hot)' : 'inherit' }}>{icon}</span>
          <span style={{ flex: 1 }}>{label}</span>
          {badge ? (
            <span
              className="mono"
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 'var(--r-pill)',
                background: isActive ? 'var(--hot-wash)' : 'var(--ink-100)',
                color: isActive ? 'var(--hot)' : 'var(--txt-mute)',
              }}
            >
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
  const { collapsed, toggleCollapsed } = useNav()

  if (collapsed) {
    return (
      <nav className="leftnav leftnav--collapsed" aria-label="Collapsed sports navigation">
        <span style={{ display: 'none' }}>Sports</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          <NavLink
            to="/"
            end
            title="Sports home"
            className={({ isActive }) => `rail-icon-btn ${isActive ? 'active' : ''}`}
          >
            <IconHome size={18} />
          </NavLink>
          <NavLink
            to="/live"
            title={`Live (${s.matches.filter((m) => m.status === 'live').length} matches)`}
            className={({ isActive }) => `rail-icon-btn ${isActive ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            <IconLive size={18} />
            {s.matches.filter((m) => m.status === 'live').length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 7,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--hot)',
                }}
              />
            )}
          </NavLink>
          <NavLink
            to="/football"
            title="Football"
            className={({ isActive }) => `rail-icon-btn ${isActive ? 'active' : ''}`}
          >
            <IconFootball size={18} />
          </NavLink>
          <NavLink
            to="/bets"
            title="Bet slip & My bets"
            className={({ isActive }) => `rail-icon-btn ${isActive ? 'active' : ''}`}
          >
            <IconSlip size={18} />
          </NavLink>
        </div>

        <div className="hr" style={{ margin: '8px 4px 10px' }} />

        {/* Sports icons rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SPORTS.map((sp) => {
            const Icon = SPORT_ICON[sp.id]
            const live = s.matches.filter((m) => m.sport === sp.id && m.status === 'live').length
            return (
              <NavLink
                key={sp.id}
                to={sp.id === 'football' ? '/football' : '/live?sport=' + sp.id}
                title={`${sp.name}${live ? ` (${live} live)` : ''}`}
                className={({ isActive }) => `rail-icon-btn ${isActive ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                <Icon size={16} />
                {live > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 7,
                      right: 7,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--hot)',
                    }}
                  />
                )}
              </NavLink>
            )
          })}
        </div>

        <div className="hr" style={{ margin: '10px 4px' }} />

        {/* Following shortcut */}
        <Link
          to="/football"
          title={`Following (${s.follows.length} pinned)`}
          className="rail-icon-btn"
          style={{ color: 'var(--hot)' }}
        >
          <IconStar size={16} filled />
        </Link>

        {/* Expand button at bottom */}
        <div style={{ marginTop: 'auto', paddingTop: 14 }}>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="rail-icon-btn"
            title="Expand menu ([)"
            aria-label="Expand sidebar menu"
          >
            <IconChevron size={14} />
          </button>
        </div>
      </nav>
    )
  }

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
        {s.follows.map((f) => {
          const teamMatch = s.matches.find((m) => m.home === f || m.away === f)
          const to = teamMatch ? `/match/${teamMatch.id}` : '/football'
          return (
            <Link
              key={f}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                height: 30,
                padding: '0 9px',
                borderRadius: 'var(--r-row)',
                fontSize: 'var(--fs-13)',
                color: 'var(--txt)',
              }}
            >
              <span style={{ color: 'var(--hot)', display: 'flex' }}>
                <IconStar size={13} filled />
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</span>
              <IconChevron size={12} />
            </Link>
          )
        })}
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

      {/* Collapse button */}
      <div style={{ marginTop: 12, marginInline: 4 }}>
        <button
          type="button"
          onClick={toggleCollapsed}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            height: 32,
            padding: '0 10px',
            borderRadius: 'var(--r-row)',
            border: '1px solid var(--line-2)',
            background: 'var(--ink-100)',
            color: 'var(--txt-lo)',
            fontSize: 'var(--fs-12)',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            transition: 'all var(--t-fast) var(--ease)',
          }}
          title="Collapse menu ([)"
        >
          <span style={{ transform: 'rotate(180deg)', display: 'flex' }}>
            <IconChevron size={12} />
          </span>
          <span>Collapse menu</span>
          <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--txt-mute)' }}>
            [
          </span>
        </button>
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
        <span className="kbd">[</span>
        <span>menu</span>
        <span className="kbd">B</span>
        <span>bets</span>
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
      {s.toasts.slice(-3).map((t) => (
        <ToastRow key={t.id} t={t} onDone={() => d({ t: 'dropToast', id: t.id })} />
      ))}
    </div>
  )
}

const SWIPE_DISMISS_PX = 64

function ToastRow({ t, onDone }: { t: import('../state/store').Toast; onDone: () => void }) {
  const [gone, setGone] = useState(false)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startT = useRef(0)
  const done = useRef(onDone)
  done.current = onDone

  // Schedule ONCE, on mount. `onDone` is a fresh arrow on every parent render
  // and the store ticks once a second, so depending on it here restarted the
  // 4.6s timer every second — the toast then never expired at all and could
  // only be cleared by reloading. Hence the ref and the empty dep list.
  useEffect(() => {
    const a = setTimeout(() => setGone(true), 4600)
    const b = setTimeout(() => done.current(), 4900)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [])

  const finish = () => {
    setGone(true)
    setTimeout(() => done.current(), 260)
  }

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    startX.current = e.clientX
    startT.current = Date.now()
    setDragging(true)
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const dist = Math.max(0, e.clientX - startX.current)
    // capture lazily, past a slop threshold: grabbing on mousedown would
    // retarget the click away from the close button
    if (dist > 4) e.currentTarget.setPointerCapture?.(e.pointerId)
    setDx(dist)
  }
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    setDragging(false)
    const dist = Math.abs(e.clientX - startX.current)
    const speed = dist / Math.max(1, Date.now() - startT.current)
    // a short fast flick counts as much as a long slow drag
    if (dist > SWIPE_DISMISS_PX || speed > 0.55) finish()
    else setDx(0)
  }

  const color = t.kind === 'placed' ? 'var(--up)' : t.kind === 'failed' ? 'var(--hot)' : 'var(--cy)'
  const moved = dx > 0

  return (
    <div
      className="toast-in"
      role="status"
      aria-live="polite"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{
        border: `1px solid ${t.kind === 'failed' ? 'var(--hot-dim)' : 'var(--line-2)'}`,
        borderLeft: `2px solid ${color}`,
        background: 'var(--ink-150)',
        borderRadius: 'var(--r-card)',
        padding: '9px 11px',
        paddingRight: 26,
        position: 'relative',
        cursor: dragging ? 'grabbing' : 'grab',
        touchAction: 'pan-y',
        userSelect: 'none',
        opacity: gone ? 0 : moved ? Math.max(0.4, 1 - dx / 240) : 1,
        transform: gone
          ? 'translateX(120%)'
          : moved
            ? `translateX(${dx}px) rotate(${dx * 0.02}deg)`
            : 'none',
        transition: dragging
          ? 'none'
          : 'opacity 280ms var(--ease), transform 280ms var(--ease)',
      }}
    >
      <div style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--txt-hi)' }}>{t.title}</div>
      {t.body && (
        <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)', marginTop: 2, lineHeight: 1.5 }}>{t.body}</div>
      )}
      <button
        onClick={finish}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Dismiss notification"
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 18,
          height: 18,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--txt-mute)',
          borderRadius: 4,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        <IconClose size={11} />
      </button>
    </div>
  )
}

/* -------------------------------------------------------- mobile drawer */
function MobileDrawer() {
  const { drawerOpen, setDrawerOpen } = useNav()
  const { s } = useStore()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen, setDrawerOpen])

  if (!drawerOpen) return null

  return (
    <div
      className="drawer-backdrop"
      onClick={() => setDrawerOpen(false)}
    >
      <div
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Wordmark />
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
            style={{
              width: 32,
              height: 32,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 'var(--r-row)',
              background: 'var(--ink-150)',
              border: '1px solid var(--line-2)',
              color: 'var(--txt-hi)',
              cursor: 'pointer',
            }}
          >
            <IconClose size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }} onClick={() => setDrawerOpen(false)}>
          <NavItem to="/" icon={<IconHome size={16} />} label="Sports home" />
          <NavItem
            to="/live"
            icon={<IconLive size={16} />}
            label="Live"
            badge={s.matches.filter((m) => m.status === 'live').length}
          />
          <NavItem to="/football" icon={<IconFootball size={16} />} label="Football" />
          <NavItem to="/bets" icon={<IconSlip size={16} />} label="Bet slip & My bets" />
        </div>

        <div className="eyebrow" style={{ padding: '0 9px 8px' }}>
          Sports
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }} onClick={() => setDrawerOpen(false)}>
          {SPORTS.map((sp) => {
            const Icon = SPORT_ICON[sp.id]
            const live = s.matches.filter((m) => m.sport === sp.id && m.status === 'live').length
            return (
              <NavLink
                key={sp.id}
                to={sp.id === 'football' ? '/football' : '/live?sport=' + sp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  height: 34,
                  padding: '0 10px',
                  borderRadius: 'var(--r-row)',
                  color: 'var(--txt-hi)',
                  fontSize: 'var(--fs-13)',
                }}
              >
                <span style={{ color: live ? 'var(--hot)' : 'var(--txt-mute)', display: 'flex' }}>
                  <Icon size={15} />
                </span>
                <span style={{ flex: 1 }}>{sp.name}</span>
                {live > 0 && (
                  <span className="mono" style={{ fontSize: 11, color: 'var(--hot)', fontWeight: 700 }}>
                    {live}
                  </span>
                )}
              </NavLink>
            )
          })}
        </div>

        <div
          style={{
            marginTop: 'auto',
            padding: 12,
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--r-card)',
            background: 'var(--ink-100)',
          }}
        >
          <div className="eyebrow" style={{ fontSize: 9 }}>House bankroll</div>
          <div className="mono" style={{ fontSize: 'var(--fs-15)', color: 'var(--txt-hi)', fontWeight: 700 }}>
            {HOUSE_BANKROLL.toLocaleString('en-US', { maximumFractionDigits: 0 })} USDT
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <span className="live-dot" style={{ width: 5, height: 5 }} />
            <span style={{ fontSize: 10, color: 'var(--txt-lo)' }}>On-chain guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- shell */
export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const isBets = pathname.startsWith('/bets')
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleCollapsed = () => setCollapsed((v) => !v)
  const toggleDrawer = () => setDrawerOpen((v) => !v)

  // '/' focuses search, 'b' jumps to the slip, '[' toggles menu
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
      if (e.key === '[' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        if (window.innerWidth < 1080) {
          toggleDrawer()
        } else {
          toggleCollapsed()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <NavContext.Provider
      value={{
        collapsed,
        toggleCollapsed,
        drawerOpen,
        setDrawerOpen,
        toggleDrawer,
      }}
    >
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
        {!isBets && <MobileSlipBar />}
        <MobileDrawer />
        <Toasts />
        <style>{`
          @media (max-width: 700px){
            .bottomnav{ display:block !important; }
            .wordmark__sub, .topbar__avatar{ display:none !important; }
            .topbar{ gap: var(--s-2); padding: 0 var(--s-3); }
            .topbar__wallet{ padding: 0 8px !important; gap: 5px !important; }
          }
        `}</style>
      </div>
    </NavContext.Provider>
  )
}
