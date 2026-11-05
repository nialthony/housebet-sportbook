import { useState } from 'react'
import { useStore } from '../state/store'
import type { Bet } from '../state/store'
import { BetSlip } from '../components/BetSlip'
import { StateBar } from '../components/StateBar'
import { IconAlert, IconCheck, IconCash, IconLink, IconLock } from '../components/Icons'
import { fmtUsdt } from '../lib/rand'
import { FixtureLine } from '../components/Crest'

/* --------------------------------------------------------- time filters */
const TIME_FILTERS = [
  { id: 'all', label: 'All time', days: Infinity },
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: 'custom', label: 'Custom', days: Infinity },
] as const

const GRID = '88px minmax(0,1fr) 62px 92px 104px 128px'

/* ------------------------------------------------------------- ledger row */
function LedgerRow({ bet }: { bet: Bet }) {
  const { d } = useStore()
  const [copied, setCopied] = useState(false)
  const ret = bet.stake * bet.odds
  const failed = bet.outcome === 'failed'
  const open = bet.status === 'open' && !failed

  const d0 = new Date(bet.placedAt)
  const placed = `${d0.toLocaleString('en-US', { month: 'short' })} ${d0.getDate()} · ${String(
    d0.getHours(),
  ).padStart(2, '0')}:${String(d0.getMinutes()).padStart(2, '0')}`

  const state =
    failed ? (
      <span className="tag tag-hot">Not placed</span>
    ) : bet.status === 'won' ? (
      <span className="tag" style={{ color: 'var(--up)', borderColor: 'var(--up)' }}>
        Won
      </span>
    ) : bet.status === 'lost' ? (
      <span className="tag">Lost</span>
    ) : bet.status === 'cashed' ? (
      <span className="tag" style={{ color: 'var(--cy)', borderColor: 'var(--cy-dim)' }}>
        Cashed out
      </span>
    ) : (
      <span className="tag">Open</span>
    )

  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          gap: 'var(--s-2)',
          alignItems: 'center',
          minHeight: 52,
          padding: '8px var(--s-3) 6px',
          opacity: bet.status === 'lost' ? 0.6 : 1,
        }}
        className="ledger-row"
      >
        {/* Placed */}
        <span className="mono" style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)' }}>
          {placed}
        </span>

        {/* Bet */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'var(--fs-13)', color: 'var(--txt-hi)', fontWeight: 600 }}>{bet.label}</div>
          <div
            style={{
              fontSize: 'var(--fs-11)',
              color: 'var(--txt-lo)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              minWidth: 0,
              marginTop: 2,
            }}
          >
            <span style={{ whiteSpace: 'nowrap' }}>{bet.marketName} ·</span>
            <FixtureLine fixture={bet.fixture} />
          </div>
        </div>

        {/* Odds */}
        <span className="mono" style={{ fontSize: 'var(--fs-13)', color: 'var(--txt-hi)', textAlign: 'right' }}>
          {bet.odds.toFixed(2)}
        </span>

        {/* Stake */}
        <span className="mono" style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)', textAlign: 'right' }}>
          {fmtUsdt(bet.stake)}
        </span>

        {/* Returns */}
        <div style={{ textAlign: 'right' }}>
          {open && !failed ? (
            <div className="mono" style={{ fontSize: 'var(--fs-13)', color: 'var(--up)', fontWeight: 600 }}>
              {fmtUsdt(bet.cashout)}
            </div>
          ) : (
            <div className="mono" style={{ fontSize: 'var(--fs-13)', color: 'var(--txt)' }}>
              {bet.status === 'won'
                ? `+${fmtUsdt(ret)}`
                : bet.status === 'cashed'
                  ? fmtUsdt(bet.cashout)
                  : '–'}
            </div>
          )}
          {open && !failed && (
            <div className="mono" style={{ fontSize: 9, color: 'var(--txt-mute)' }}>
              cash out
            </div>
          )}
        </div>

        {/* Result */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          {open && !failed && (
            <button
              className="pill"
              style={{ height: 26 }}
              onClick={() => {
                d({ t: 'cashout', id: bet.id })
                d({
                  t: 'toast',
                  toast: { kind: 'cashed', title: 'Cashed out', body: `${fmtUsdt(bet.cashout)} USDT returned.` },
                })
              }}
            >
              <IconCash size={11} />
              Cash out
            </button>
          )}
          {state}
        </div>
      </div>

      {/* second line: settlement receipt or failure reason */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 var(--s-3) 9px',
          flexWrap: 'wrap',
        }}
      >
        {failed ? (
          <span className="row" style={{ gap: 6, fontSize: 'var(--fs-11)', color: 'var(--hot)' }}>
            <IconAlert size={11} />
            {bet.failReason}
            <span style={{ color: 'var(--txt-mute)' }}>· nothing was taken from your balance</span>
          </span>
        ) : (
          <>
            <span className="row" style={{ gap: 5 }}>
              <span className="tag tag-cy" style={{ fontSize: 9 }}>
                On-chain
              </span>
              <span className="mono" style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)' }}>
                {bet.txHash ? `${bet.txHash.slice(0, 12)}…${bet.txHash.slice(-6)}` : 'pending'}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(bet.txHash)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1400)
                }}
                style={{ color: copied ? 'var(--up)' : 'var(--cy)', display: 'flex' }}
                title="Copy transaction hash"
              >
                {copied ? <IconCheck size={10} /> : <IconLink size={10} />}
              </button>
            </span>
            <span className="mono" style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-mute)' }}>
              Block {bet.block.toLocaleString('en-US')} · {Math.min(12, bet.confirmations)}/12 confirmations
            </span>
            {bet.confirmations < 12 && (
              <span className="row" style={{ gap: 5, fontSize: 'var(--fs-10)', color: 'var(--cy)' }}>
                <IconLock size={10} />
                settling
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ================================================================= PAGE */
export default function BetsPage() {
  const { s } = useStore()
  const [timeF, setTimeF] = useState<string>('all')
  const [sportF, setSportF] = useState<string>('all')

  const withinDays = (b: Bet) => {
    const f = TIME_FILTERS.find((x) => x.id === timeF)!
    if (f.days === Infinity) return true
    return Date.now() - b.placedAt <= f.days * 86400_000
  }

  const all = s.bets.filter(withinDays).filter((b) => sportF === 'all' || b.comp === sportF)
  const open = all.filter((b) => b.status === 'open' && b.outcome === 'placed')
  const settled = all.filter((b) => b.status !== 'open' && b.outcome === 'placed')
  const failed = all.filter((b) => b.outcome === 'failed')

  const sports = [...new Set(s.bets.map((b) => b.comp))]

  const staked = open.reduce((n, b) => n + b.stake, 0)
  const cashout = open.reduce((n, b) => n + b.cashout, 0)
  const settledPnl = settled.reduce(
    (n, b) =>
      n + (b.status === 'won' ? b.stake * b.odds - b.stake : b.status === 'cashed' ? b.cashout - b.stake : -b.stake),
    0,
  )

  return (
    <div>
      <h1 className="h1" style={{ marginBottom: 4 }}>
        Bet slip &amp; My bets
      </h1>
      <div style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)', marginBottom: 'var(--s-4)' }}>
        Singles only. Stakes in USDT. Every settled bet keeps its transaction hash.
      </div>

      <StateBar />

      <div className="bets-layout">
        <div className="bets-col">
          <BetSlip variant="page" />
        </div>

        <div>
          {/* ------------------------------------------------ summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 'var(--s-2)',
              marginBottom: 'var(--s-4)',
            }}
          >
            {[
              ['Open stake', fmtUsdt(staked), 'var(--txt-hi)'],
              ['Cash-out value', fmtUsdt(cashout), 'var(--up)'],
              [
                'Settled P&L',
                `${settledPnl >= 0 ? '+' : ''}${fmtUsdt(settledPnl)}`,
                settledPnl >= 0 ? 'var(--up)' : 'var(--hot)',
              ],
              ['Balance', fmtUsdt(s.balance), 'var(--txt-hi)'],
            ].map(([k, v, c]) => (
              <div key={k} className="panel" style={{ padding: '10px 12px' }}>
                <div className="eyebrow" style={{ fontSize: 9 }}>
                  {k}
                </div>
                <div className="mono" style={{ fontSize: 'var(--fs-20)', fontWeight: 700, color: c, marginTop: 3 }}>
                  {v}
                </div>
              </div>
            ))}
          </div>

          {/* ---------------------------------------------- filter bar */}
          <div
            className="filter-bar"
            style={{ gap: 6, marginBottom: 'var(--s-2)', flexWrap: 'wrap' }}
          >
            {TIME_FILTERS.map((t) => (
              <button key={t.id} className="pill" data-on={timeF === t.id} onClick={() => setTimeF(t.id)}>
                {t.label}
              </button>
            ))}
            <span style={{ width: 1, height: 16, background: 'var(--line-2)', margin: '0 4px' }} />
            <button className="pill" data-on={sportF === 'all'} onClick={() => setSportF('all')}>
              All sports
            </button>
            {sports.map((sp) => (
              <button key={sp} className="pill" data-on={sportF === sp} onClick={() => setSportF(sp)}>
                {sp}
              </button>
            ))}
          </div>

          {/* --------------------------------------------------- open */}
          <div className="sec-head">
            <h2 className="h3">Open</h2>
            <span className="count">{open.length}</span>
          </div>
          <LedgerTable rows={open} empty="No open bets in this period. Placed singles show here with a live cash-out price." />

          {/* --------------------------------------------- not placed */}
          {failed.length > 0 && (
            <>
              <div className="sec-head" style={{ marginTop: 'var(--s-6)' }}>
                <h2 className="h3">Not placed</h2>
                <span className="count">{failed.length}</span>
              </div>
              <LedgerTable rows={failed} empty="" />
            </>
          )}

          {/* ------------------------------------------------ settled */}
          <div className="sec-head" style={{ marginTop: 'var(--s-6)' }}>
            <h2 className="h3">Settled</h2>
            <span className="count">{settled.length}</span>
          </div>
          <LedgerTable rows={settled} empty="Nothing settled in this period. Settled bets keep their transaction hash." />
        </div>
      </div>

      <style>{`
        @media (max-width: 820px){
          .ledger-row{ grid-template-columns: minmax(0,1fr) auto !important;
            height:auto !important; padding: 10px 12px !important; gap: 6px 8px !important; }
          .ledger-row > :nth-child(3), .ledger-row > :nth-child(4){ display:none; }
        }
      `}</style>
    </div>
  )
}

function LedgerTable({ rows, empty }: { rows: Bet[]; empty: string }) {
  return (
    <div className="panel stagger" style={{ overflow: 'hidden' }}>
      <div
        className="eyebrow"
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          gap: 'var(--s-2)',
          alignItems: 'center',
          height: 30,
          padding: '0 var(--s-3)',
          background: 'var(--ink-150)',
          borderBottom: '1px solid var(--line)',
          fontSize: 9,
        }}
      >
        <span>Placed</span>
        <span>Bet</span>
        <span style={{ textAlign: 'right' }}>Odds</span>
        <span style={{ textAlign: 'right' }}>Stake</span>
        <span style={{ textAlign: 'right' }}>Returns</span>
        <span style={{ textAlign: 'right' }}>Result</span>
      </div>
      {rows.length === 0 && empty ? (
        <div style={{ padding: '16px 14px', fontSize: 'var(--fs-12)', color: 'var(--txt-lo)' }}>{empty}</div>
      ) : (
        rows.map((b) => <LedgerRow key={b.id} bet={b} />)
      )}
    </div>
  )
}
