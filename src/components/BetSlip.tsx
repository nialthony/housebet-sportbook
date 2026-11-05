import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, useCountdown } from '../state/store'
import type { Bet, SlipItem } from '../state/store'
import { IconClose, IconLock, IconAlert, IconCheck, IconLink, IconCash, IconSlip, IconBets } from './Icons'
import { fmtUsdt } from '../lib/rand'
import { FixtureLine } from './Crest'

/* ------------------------------------------------------------ atoms */

function LockRing({ until }: { until: number }) {
  const left = useCountdown(until)
  const pct = Math.max(0, Math.min(1, left / 5000))
  const r = 9
  const c = 2 * Math.PI * r
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--hot)' }}
      title="Price held for you"
    >
      <svg width="22" height="22" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r={r} fill="none" stroke="var(--hot-dim)" strokeWidth="2" />
        <circle
          cx="11"
          cy="11"
          r={r}
          fill="none"
          stroke="var(--hot)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform="rotate(-90 11 11)"
        />
      </svg>
      <span className="mono" style={{ fontSize: 'var(--fs-11)', fontWeight: 600 }}>
        {(left / 1000).toFixed(1)}s
      </span>
    </span>
  )
}

function OddsCell({ item }: { item: SlipItem }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(item.odds)
  useEffect(() => {
    const el = ref.current
    if (!el || prev.current === item.odds) return
    const cls = item.odds > prev.current ? 'tick-up' : 'tick-dn'
    el.classList.remove('tick-up', 'tick-dn')
    void el.offsetWidth
    el.classList.add(cls)
    prev.current = item.odds
  }, [item.odds])
  return (
    <span
      ref={ref}
      className="mono"
      style={{ fontSize: 'var(--fs-15)', fontWeight: 600, color: 'var(--txt-hi)', padding: '0 4px' }}
    >
      {item.odds.toFixed(2)}
    </span>
  )
}

function StakeInput({ item, all }: { item: SlipItem; all?: boolean }) {
  const { s, d } = useStore()
  const QUICK = [10, 25, 50, 100]
  return (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            className="field mono"
            inputMode="decimal"
            value={item.stake}
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d.]/g, '')
              if (all) d({ t: 'setSlipStakes', stake: v })
              else d({ t: 'setStake', key: item.key, stake: v })
            }}
            placeholder="0.00"
            aria-label={`Stake for ${item.label}`}
            style={{ height: 38, paddingRight: 44, textAlign: 'right' }}
          />
          <span
            className="mono"
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 'var(--fs-11)',
              color: 'var(--txt-mute)',
            }}
          >
            USDT
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
        {QUICK.map((v) => (
          <button
            key={v}
            className="pill mono"
            style={{ height: 22, fontSize: 'var(--fs-11)', padding: '0 8px' }}
            onClick={() => {
              if (all) d({ t: 'setSlipStakes', stake: String(v) })
              else d({ t: 'setStake', key: item.key, stake: String(v) })
            }}
          >
            {v}
          </button>
        ))}
        <button
          className="pill"
          style={{ height: 22, fontSize: 'var(--fs-11)', padding: '0 8px', marginLeft: 'auto' }}
          onClick={() => {
            const others = s.slip.filter((x) => x.key !== item.key).reduce((n, x) => n + (Number(x.stake) || 0), 0)
            const v = Math.max(0, s.balance - others).toFixed(2)
            if (all) d({ t: 'setSlipStakes', stake: v })
            else d({ t: 'setStake', key: item.key, stake: v })
          }}
        >
          Max
        </button>
      </div>
    </div>
  )
}

function SlipRow({ item }: { item: SlipItem }) {
  const { d } = useStore()
  const changed = item.status === 'changed'
  const suspended = item.status === 'suspended'
  return (
    <div
      style={{
        border: '1px solid',
        borderColor: suspended ? 'var(--hot-dim)' : changed ? 'var(--hot)' : 'var(--line)',
        borderRadius: 'var(--r-card)',
        background: suspended ? 'rgba(242,32,80,0.05)' : 'var(--ink-100)',
        padding: '10px 10px 12px',
        opacity: suspended ? 0.86 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--fs-13)', color: 'var(--txt-hi)', fontWeight: 600 }}>{item.label}</div>
          <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)' }}>
            {item.marketName} · <FixtureLine fixture={item.fixture} />
          </div>
        </div>
        <OddsCell item={item} />
        <button
          onClick={() => d({ t: 'removeSlip', key: item.key })}
          aria-label="Remove selection"
          style={{ color: 'var(--txt-mute)', padding: 2, marginTop: -2 }}
        >
          <IconClose size={13} />
        </button>
      </div>

      {/* ---- changed price: old struck through, new, reason, 5s lock ---- */}
      {changed && (
        <div
          style={{
            marginTop: 8,
            borderTop: '1px solid var(--line)',
            paddingTop: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="mono"
              style={{
                fontSize: 'var(--fs-13)',
                color: 'var(--txt-mute)',
                textDecoration: 'line-through',
              }}
            >
              {item.oddsAtAdd.toFixed(2)}
            </span>
            <span style={{ color: 'var(--txt-mute)', fontSize: 11 }}>→</span>
            <OddsCell item={item} />
            <span style={{ marginLeft: 'auto' }}>
              {item.lockUntil ? <LockRing until={item.lockUntil} /> : null}
            </span>
          </div>
          <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)' }}>{item.changeReason}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, height: 30, fontSize: 'var(--fs-12)' }}
              onClick={() => d({ t: 'acceptChange', key: item.key })}
            >
              Accept {item.odds.toFixed(2)}
            </button>
            <button
              className="btn"
              style={{ height: 30, fontSize: 'var(--fs-12)' }}
              onClick={() => d({ t: 'declineChange', key: item.key })}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* ---- suspended: stays in place, explains itself ---- */}
      {suspended && (
        <div
          style={{
            marginTop: 8,
            borderTop: '1px solid var(--hot-dim)',
            paddingTop: 8,
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ color: 'var(--hot)', marginTop: 1, display: 'flex' }}>
            <IconAlert size={13} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--fs-12)', color: 'var(--hot)', fontWeight: 600 }}>
              Suspended: {item.changeReason}
            </div>
            <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)', marginTop: 2 }}>
              Kept in your slip at {item.odds.toFixed(2)}. It re-opens when play resumes.
            </div>
          </div>
        </div>
      )}

      {!suspended && !changed && <div style={{ marginTop: 10 }}><StakeInput item={item} /></div>}
    </div>
  )
}

/* ------------------------------------------------------ on-chain receipt */
function Receipt({ bet }: { bet: Bet }) {
  const [copied, setCopied] = useState(false)
  const short = bet.txHash ? `${bet.txHash.slice(0, 10)}…${bet.txHash.slice(-6)}` : '–'
  const conf = Math.min(12, bet.confirmations)
  return (
    <div
      style={{
        marginTop: 8,
        borderTop: '1px dashed var(--line-2)',
        paddingTop: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="eyebrow" style={{ fontSize: 9 }}>
          Settlement
        </span>
        <span className="tag tag-cy" style={{ fontSize: 9 }}>
          On-chain
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="mono" style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)' }}>
          {short}
        </span>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(bet.txHash)
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
          }}
          style={{ color: 'var(--cy)', display: 'flex', alignItems: 'center', gap: 3 }}
          title="Copy transaction hash"
        >
          {copied ? <IconCheck size={11} /> : <IconLink size={11} />}
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{ flex: 1, height: 3, background: 'var(--ink-200)', borderRadius: 2, overflow: 'hidden' }}
          title={`${conf} of 12 confirmations`}
        >
          <div
            style={{
              width: `${(conf / 12) * 100}%`,
              height: '100%',
              background: conf >= 12 ? 'var(--up)' : 'var(--cy)',
              transition: 'width 400ms var(--ease)',
            }}
          />
        </div>
        <span className="mono" style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-mute)' }}>
          {conf}/12
        </span>
      </div>
      <div className="mono" style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-mute)' }}>
        Block {bet.block.toLocaleString('en-US')}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- my bets */
function BetRow({ bet }: { bet: Bet }) {
  const { d } = useStore()
  const open = bet.status === 'open'
  const failed = bet.outcome === 'failed'
  const ret = bet.stake * bet.odds

  const statusChip = () => {
    if (failed) return <span className="tag tag-hot">Not placed</span>
    if (bet.status === 'won') return <span className="tag" style={{ color: 'var(--up)', borderColor: 'var(--up)' }}>Won</span>
    if (bet.status === 'lost') return <span className="tag" style={{ color: 'var(--txt-mute)' }}>Lost</span>
    if (bet.status === 'cashed') return <span className="tag" style={{ color: 'var(--cy)', borderColor: 'var(--cy-dim)' }}>Cashed out</span>
    return <span className="tag">Open</span>
  }

  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-card)',
        background: 'var(--ink-100)',
        padding: '10px',
        opacity: bet.status === 'lost' ? 0.62 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--fs-13)', color: 'var(--txt-hi)', fontWeight: 600 }}>{bet.label}</div>
          <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)' }}>
            {bet.marketName} · {bet.fixture}
          </div>
        </div>
        <span
          className="mono"
          style={{ fontSize: 'var(--fs-13)', color: 'var(--txt-hi)', fontWeight: 600, padding: '0 4px' }}
        >
          {bet.odds.toFixed(2)}
        </span>
        {statusChip()}
      </div>

      <div
        className="mono"
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 8,
          fontSize: 'var(--fs-11)',
          color: 'var(--txt-lo)',
        }}
      >
        <span>Stake {fmtUsdt(bet.stake)}</span>
        <span style={{ color: 'var(--txt-hi)' }}>Returns {fmtUsdt(ret)}</span>
      </div>

      {failed && (
        <div
          style={{
            marginTop: 8,
            padding: '7px 8px',
            background: 'var(--hot-wash)',
            border: '1px solid var(--hot-dim)',
            borderRadius: 'var(--r-row)',
            display: 'flex',
            gap: 7,
          }}
        >
          <span style={{ color: 'var(--hot)', display: 'flex', marginTop: 1 }}>
            <IconAlert size={12} />
          </span>
          <div style={{ fontSize: 'var(--fs-11)' }}>
            <div style={{ color: 'var(--hot)', fontWeight: 600 }}>Bet not placed</div>
            <div style={{ color: 'var(--txt)', marginTop: 1 }}>{bet.failReason}</div>
            <div style={{ color: 'var(--txt-lo)', marginTop: 3 }}>
              Nothing was taken from your balance. Re-add the selection to try the new price.
            </div>
          </div>
        </div>
      )}

      {open && !failed && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ fontSize: 9 }}>
              Cash out
            </div>
            <div className="mono" style={{ fontSize: 'var(--fs-17)', color: 'var(--txt-hi)', fontWeight: 600 }}>
              {fmtUsdt(bet.cashout)}
              <span style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-mute)' }}> USDT</span>
            </div>
          </div>
          <button
            className="btn"
            style={{ height: 32 }}
            onClick={() => {
              d({ t: 'cashout', id: bet.id })
              d({
                t: 'toast',
                toast: {
                  kind: 'cashed',
                  title: 'Cashed out',
                  body: `${fmtUsdt(bet.cashout)} USDT returned to your balance.`,
                },
              })
            }}
          >
            <IconCash size={13} />
            Cash out
          </button>
        </div>
      )}

      {!failed && <Receipt bet={bet} />}
    </div>
  )
}

/* ============================================================== BET SLIP */
export function BetSlip({ variant = 'panel' }: { variant?: 'panel' | 'page' }) {
  const { s, d, placeBets, totalStake, totalReturn } = useStore()
  const [tab, setTab] = useState<'slip' | 'bets'>('slip')
  const [betTab, setBetTab] = useState<'open' | 'settled' | 'failed'>('open')
  const [forceFail, setForceFail] = useState(false)

  const open = s.bets.filter((b) => b.status === 'open' && b.outcome === 'placed')
  const settled = s.bets.filter((b) => b.status !== 'open' && b.outcome === 'placed')
  const failed = s.bets.filter((b) => b.outcome === 'failed')

  const blocked = s.slip.some((x) => x.status === 'suspended')
  const needsAction = s.slip.filter((x) => x.status === 'changed').length
  const canPlace = s.slip.length > 0 && totalStake > 0 && !blocked

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--line)',
          position: 'sticky',
          top: 0,
          background: 'var(--ink-000)',
          zIndex: 5,
        }}
      >
        {(
          [
            ['slip', 'Bet slip', s.slip.length, IconSlip],
            ['bets', 'My bets', open.length, IconBets],
          ] as const
        ).map(([k, label, count, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              flex: 1,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              fontSize: 'var(--fs-13)',
              fontWeight: 600,
              color: tab === k ? 'var(--txt-hi)' : 'var(--txt-lo)',
              borderBottom: tab === k ? '2px solid var(--hot)' : '2px solid transparent',
            }}
          >
            <Icon size={14} />
            {label}
            {count > 0 && (
              <span
                className="mono"
                style={{
                  minWidth: 18,
                  height: 17,
                  padding: '0 5px',
                  borderRadius: 9,
                  background: k === 'slip' ? 'var(--hot)' : 'var(--ink-200)',
                  color: k === 'slip' ? '#fff' : 'var(--txt)',
                  fontSize: 10,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------- bet slip tab */}
      {tab === 'slip' && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {s.slip.length === 0 && (
              <div
                style={{
                  border: '1px dashed var(--line-2)',
                  borderRadius: 'var(--r-card)',
                  padding: '20px 14px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 'var(--fs-13)', color: 'var(--txt-hi)', fontWeight: 600 }}>
                  Your slip is empty
                </div>
                <div style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)', marginTop: 4, lineHeight: 1.5 }}>
                  Tap any price to add it. Singles only. One stake, one return, settled on-chain.
                </div>
                <Link
                  to="/live"
                  style={{
                    display: 'inline-block',
                    marginTop: 10,
                    fontSize: 'var(--fs-12)',
                    color: 'var(--cy)',
                    fontWeight: 600,
                  }}
                >
                  Browse live markets →
                </Link>
              </div>
            )}

            {s.slip.map((i) => (
              <SlipRow key={i.key} item={i} />
            ))}

            {s.slip.length > 1 && (
              <>
                <div
                  className="eyebrow"
                  style={{ fontSize: 9, padding: '2px 2px 0' }}
                >
                  {s.slip.length} singles selections
                </div>
                <button
                  className="btn btn-ghost"
                  style={{ height: 28, fontSize: 'var(--fs-11)', alignSelf: 'flex-start' }}
                  onClick={() => d({ t: 'clearSlip' })}
                >
                  Clear all {s.slip.length}
                </button>
              </>
            )}
          </div>

          {/* footer */}
          <div style={{ borderTop: '1px solid var(--line)', padding: 10, background: 'var(--ink-050)' }}>
            {needsAction > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 7,
                  alignItems: 'center',
                  padding: '7px 8px',
                  marginBottom: 8,
                  background: 'var(--hot-wash)',
                  border: '1px solid var(--hot-dim)',
                  borderRadius: 'var(--r-row)',
                  fontSize: 'var(--fs-11)',
                  color: 'var(--hot)',
                }}
              >
                <IconAlert size={13} />
                {needsAction} price{needsAction > 1 ? 's' : ''} moved. Accept to place at the new price.
              </div>
            )}
            {blocked && (
              <div
                style={{
                  display: 'flex',
                  gap: 7,
                  alignItems: 'center',
                  padding: '7px 8px',
                  marginBottom: 8,
                  background: 'var(--hot-wash)',
                  border: '1px solid var(--hot-dim)',
                  borderRadius: 'var(--r-row)',
                  fontSize: 'var(--fs-11)',
                  color: 'var(--hot)',
                }}
              >
                <IconAlert size={13} />
                A selection is suspended. Remove it to place the rest.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)' }}>
                Total stake ({s.slip.length} single{s.slip.length === 1 ? '' : 's'})
              </span>
              <span className="mono" style={{ fontSize: 'var(--fs-13)', color: 'var(--txt-hi)' }}>
                {fmtUsdt(totalStake)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)' }}>Potential return</span>
              <span className="mono" style={{ fontSize: 'var(--fs-17)', fontWeight: 700, color: 'var(--up)' }}>
                {fmtUsdt(totalReturn)}
              </span>
            </div>

            <button
              className="btn btn-primary btn-lg"
              disabled={!canPlace}
              onClick={() => placeBets({ forceFail })}
            >
              <IconLock size={14} />
              Place {s.slip.length || ''} bet{s.slip.length === 1 ? '' : 's'}
            </button>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
                fontSize: 'var(--fs-10)',
                color: 'var(--txt-mute)',
              }}
            >
              <span>Balance {fmtUsdt(s.balance)} USDT</span>
              {variant === 'page' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={forceFail}
                    onChange={(e) => setForceFail(e.target.checked)}
                    style={{ accentColor: 'var(--hot)' }}
                  />
                  force fail
                </label>
              )}
            </div>
          </div>
        </>
      )}

      {/* ----------------------------------------------------- my bets tab */}
      {tab === 'bets' && (
        <>
          <div style={{ display: 'flex', gap: 6, padding: '10px 10px 0' }}>
            {(
              [
                ['open', 'Open', open.length],
                ['settled', 'Settled', settled.length],
                ...(failed.length ? [['failed', 'Not placed', failed.length] as const] : []),
              ] as const
            ).map(([k, label, n]) => (
              <button key={k} className="pill" data-on={betTab === k} onClick={() => setBetTab(k)}>
                {label}
                <span className="mono" style={{ fontSize: 10, color: 'var(--txt-mute)' }}>
                  {n}
                </span>
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {betTab === 'open' && open.length === 0 && (
              <EmptyBets text="No open bets. Placed singles show here with a live cash-out price." />
            )}
            {betTab === 'settled' && settled.length === 0 && (
              <EmptyBets text="Nothing settled yet. Settled bets keep their transaction hash." />
            )}
            {betTab === 'open' && open.map((b) => <BetRow key={b.id} bet={b} />)}
            {betTab === 'settled' && settled.map((b) => <BetRow key={b.id} bet={b} />)}
            {betTab === 'failed' && failed.map((b) => <BetRow key={b.id} bet={b} />)}
          </div>

          <div
            style={{
              borderTop: '1px solid var(--line)',
              padding: '8px 10px',
              background: 'var(--ink-050)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'var(--fs-11)',
              color: 'var(--txt-mute)',
            }}
          >
            <span>
              Staked <span className="mono">{fmtUsdt(open.reduce((n, b) => n + b.stake, 0))}</span>
            </span>
            <span>
              Cash-out value{' '}
              <span className="mono" style={{ color: 'var(--txt-hi)' }}>
                {fmtUsdt(open.reduce((n, b) => n + b.cashout, 0))}
              </span>
            </span>
          </div>
        </>
      )}
    </div>
  )
}

function EmptyBets({ text }: { text: string }) {
  return (
    <div
      style={{
        border: '1px dashed var(--line-2)',
        borderRadius: 'var(--r-card)',
        padding: '18px 14px',
        fontSize: 'var(--fs-12)',
        color: 'var(--txt-lo)',
        lineHeight: 1.55,
      }}
    >
      {text}
    </div>
  )
}

/* -------------------------------------------- mobile slip bar + sheet */
const SHEET_DISMISS_PX = 90

export function MobileSlipBar() {
  const { s, totalStake } = useStore()
  const [open, setOpen] = useState(false)
  const [dy, setDy] = useState(0)
  const [dragging, setDragging] = useState(false)
  const grabY = useRef(0)
  const nav = useNavigate()
  const n = s.slip.length

  // pull the sheet down to close it. Only the handle starts the drag, so
  // scrolling the slip itself is never hijacked.
  const onGrabDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    grabY.current = e.clientY
    setDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onGrabMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    setDy(Math.max(0, e.clientY - grabY.current))
  }
  const onGrabUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    setDragging(false)
    setDy(0)
    // measure from the event, not from state that may be a frame behind
    if (Math.max(0, e.clientY - grabY.current) > SHEET_DISMISS_PX) setOpen(false)
  }

  // close on Escape too — every overlay should answer the same key
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {n > 0 && (
        <div
          className="slip-bar"
          style={{
            position: 'fixed',
            bottom: 56,
            left: 0,
            right: 0,
            zIndex: 70,
            background: 'var(--ink-150)',
            borderTop: '1px solid var(--line-2)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
          }}
        >
          <span
            className="mono"
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              background: 'var(--hot)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '0 0 22px',
            }}
          >
            {n}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)' }}>Singles slip</div>
            <div className="mono" style={{ fontSize: 'var(--fs-13)', color: 'var(--txt-hi)', fontWeight: 600 }}>
              {fmtUsdt(totalStake)} USDT staked
            </div>
          </div>
          <button className="btn btn-primary" style={{ height: 34 }} onClick={() => setOpen(true)}>
            Open slip
          </button>
        </div>
      )}

      {open && (
        <div
          className="slip-sheet"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div
            className="slip-sheet__backdrop"
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(3,16,21,0.72)', backdropFilter: 'blur(3px)' }}
          />
          <div
            className="slip-sheet__panel"
            style={{
              position: 'relative',
              background: 'var(--ink-000)',
              borderTop: '1px solid var(--line-2)',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              height: '86vh',
              display: 'flex',
              flexDirection: 'column',
              transform: dragging ? `translateY(${dy}px)` : undefined,
              transition: dragging ? 'none' : 'transform 280ms var(--ease)',
            }}
          >
            {/* drag handle: pull down to dismiss, the gesture every phone
                user tries first on a bottom sheet */}
            <div
              onPointerDown={onGrabDown}
              onPointerMove={onGrabMove}
              onPointerUp={onGrabUp}
              onPointerCancel={onGrabUp}
              style={{
                padding: '7px 10px 8px',
                borderBottom: '1px solid var(--line)',
                touchAction: 'none',
                cursor: dragging ? 'grabbing' : 'grab',
              }}
            >
              <span
                aria-hidden
                style={{
                  display: 'block',
                  width: 34,
                  height: 4,
                  borderRadius: 2,
                  background: 'var(--line-3)',
                  margin: '0 auto 8px',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="eyebrow">Bet slip</span>
                <button
                  onClick={() => setOpen(false)}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ marginLeft: 'auto', color: 'var(--txt-lo)' }}
                  aria-label="Close bet slip"
                >
                  <IconClose size={16} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <BetSlip />
            </div>
            <button
              className="btn"
              style={{ margin: 10 }}
              onClick={() => {
                setOpen(false)
                nav('/bets')
              }}
            >
              Open full page
            </button>
          </div>
        </div>
      )}
    </>
  )
}
