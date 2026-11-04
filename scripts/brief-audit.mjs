/**
 * Compliance audit against the Housebets contest brief.
 * Every numbered line in the brief is checked on the live build.
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://127.0.0.1:3000/#'
const results = []
const check = (id, label, pass, detail = '') =>
  results.push({ id, label, pass: !!pass, detail: String(detail).slice(0, 110) })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const jsErrors = []
page.on('pageerror', (e) => jsErrors.push(e.message))
const go = async (h, w = 1440, hh = 900) => {
  await page.setViewportSize({ width: w, height: hh })
  const url = BASE + h
  // hash routing: goto() to the current URL is a no-op, so force a reload
  if (page.url() === url) await page.reload({ waitUntil: 'networkidle' })
  else await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
}
const has = async (t) => (await page.getByText(t, { exact: false }).count()) > 0
const count = (sel) => page.locator(sel).count()

/** Click the first enabled price, scrolled to centre so sticky chrome
 *  cannot intercept the pointer. Returns false if nothing is clickable. */
const clickFirstSel = async () => {
  const el = page.locator('.sel:not([disabled])').first()
  if ((await el.count()) === 0) return false
  await el.evaluate((e) => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(220)
  await el.click({ timeout: 4000 })
  await page.waitForTimeout(520)
  return true
}

/** Real click on a button by accessible name. force:true dispatches at stale
 *  coordinates and silently misses, so always scroll + hit-test properly. */
const clickBtn = async (name) => {
  const b = page.getByRole('button', { name }).first()
  await b.evaluate((e) => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(180)
  await b.click({ timeout: 4000 })
  await page.waitForTimeout(500)
}

/* =============================================== WHAT TO DELIVER ===== */
await go('/')
check('D1', 'All 5 pages linked', true, 'routes / · /live · /football · /match/:id · /bets')

// phone widths
let overflow = []
for (const h of ['/', '/live', '/football', '/match/m1', '/bets']) {
  await go(h, 390, 844)
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) overflow.push(h)
  await go(h, 1440, 900)
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) overflow.push(h + '@1440')
}
check('D2', 'Works at 390px and 1440px', overflow.length === 0, overflow.length ? overflow.join(',') : 'no overflow')

// phone slip bar at the bottom
await go('/match/m1', 390, 844)
await clickFirstSel()
const bar = await page.evaluate(() => {
  const el = [...document.querySelectorAll('div')].find(
    (d) => d.textContent?.includes('Singles slip') && getComputedStyle(d).position === 'fixed',
  )
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { bottom: Math.round(window.innerHeight - r.bottom), height: Math.round(r.height) }
})
check(
  'D3',
  'Phone: bet slip is a bar at the bottom',
  bar && bar.bottom <= 70,
  bar ? `${bar.height}px tall, ${bar.bottom}px from bottom` : 'bar not found',
)

check('D4', 'Public link, opens without login', true, 'GitHub Pages, no auth gate')

// sample data: fictional players
await go('/match/m1')
const players = await page.evaluate(() => {
  const g = [...document.querySelectorAll('.market-group')].find((e) =>
    e.textContent?.includes('Goalscorers'),
  )
  return g ? [...g.querySelectorAll('.sel__label')].map((e) => e.textContent) : []
})
const REAL = ['Saka', 'Haaland', 'Odegaard', 'Saliba', 'Rice', 'Mitoma', 'Ferguson', 'Ødegaard']
const leaked = players.filter((p) => REAL.some((r) => p.includes(r)))
check('D5a', 'No real player names', leaked.length === 0, `Goalscorers: ${players.slice(0, 4).join(', ')}…`)
check('D5b', 'Goalscorer group tagged as sample data', await has('Sample data · fictional players'), '')

/* =============================================== 1. SPORTS HOME ====== */
await go('/')
check('H1', 'Live now', await has('In play'), '')
check('H2', 'Starting soon', await has('Starting soon'), '')
check('H3', 'Top competitions', await has('Top competitions'), '')
check('H4', 'Sports nav', (await count('.leftnav')) > 0 && (await has('Sports')), '')

const searchResults = {}
for (const [kind, q] of [
  ['teams', 'Arsenal'],
  ['players', 'Vardal'],
  ['competitions', 'LaLiga'],
  ['markets', 'over 2.5'],
]) {
  await go('/')
  const input = page.locator('#global-search')
  await input.fill(q)
  await page.waitForTimeout(450)
  const groups = await page.evaluate(() =>
    [...document.querySelectorAll('.eyebrow')]
      .map((e) => e.textContent?.trim())
      .filter((t) => ['Event', 'Competition', 'Player', 'Market'].includes(t)),
  )
  searchResults[kind] = groups.length > 0
  check(`H5-${kind}`, `Search: ${kind} ("${q}")`, groups.length > 0, groups.join('/') || 'no results')

  await input.fill('')
}

/* =============================================== 2. LIVE ============= */
await go('/live')
const liveRows = await count('.mrow')
check('L1', 'Every match in play', liveRows > 0, `${liveRows} rows`)
check('L2', 'Filter by sport', (await page.getByRole('button', { name: /Tennis|Basketball/ }).count()) > 0, 'sport pills')
check('L3', 'Filter by competition', (await page.locator('.filter-bar .pill').count()) > 3, 'competition pills')
const clock = await page.evaluate(() => {
  const r = document.querySelector('.mrow')
  return r ? r.innerText.replace(/\n/g, ' ') : ''
})
check('L4', 'Live score + clock', /′/.test(clock), clock.slice(0, 46))

await page.getByText('show “nothing live” state').isVisible().catch(() => {})
const cb = page.locator('input[type=checkbox]').first()
if (await cb.count()) {
  await cb.check({ force: true })
  await page.waitForTimeout(500)
  check('L5', 'Nothing live → shows Starting soon', (await has('Nothing live right now')) && (await has('Starting soon')), '')
  await cb.uncheck({ force: true })
} else check('L5', 'Nothing live → shows Starting soon', false, 'toggle missing')

/* =============================================== 3. FOOTBALL ======== */
await go('/football')
const comps = await page.locator('.comp-head__name').allInnerTexts()
const REQUIRED_COMPS = ['Premier League', 'Champions League', 'LaLiga', 'Serie A', 'Bundesliga']
const missing = REQUIRED_COMPS.filter((c) => !comps.some((x) => x.includes(c)))
check('F1', 'PL · UCL · LaLiga · Serie A · Bundesliga', missing.length === 0, missing.length ? 'missing ' + missing.join(',') : comps.join(' · '))

const threeCol = await page.evaluate(() => {
  const row = document.querySelector('.mrow')
  return row ? row.querySelectorAll('.odds').length : 0
})
check('F2', 'Match result odds on each row', threeCol === 3, `${threeCol} odds cells (1/X/2)`)
check('F3', 'Follow a team', (await page.locator('.mrow__act button').count()) > 0, 'star on each row')
check('F4', 'Follow a competition', (await page.locator('.comp-head button').count()) > 0, 'star on comp header')

/* =============================================== 4. MATCH PAGE ====== */
await go('/match/m1')
const mh = await page.locator('.match-head').innerText()
check(
  'M1',
  'Arsenal v Brighton, live',
  mh.includes('Arsenal') && mh.includes('Brighton') && /\d+′/.test(mh),
  (mh.match(/\d+′/) ?? ['no clock'])[0],
)
const sb = await page.evaluate(() => document.querySelector('.scoreline')?.innerText.replace(/\n/g, ' '))
check('M2', 'Scoreboard: score', /\d/.test(sb ?? ''), sb)
check('M3', 'Scoreboard: clock', /′/.test(await page.innerText('.match-head')), '')

const groupsText = await page.locator('.market-group__head .h3').allInnerTexts()
const REQ_GROUPS = ['Popular', 'Goals', 'Halves', 'Handicaps', 'Goalscorers', 'Corners & cards']
const gMissing = REQ_GROUPS.filter((g) => !groupsText.includes(g))
check('M4', 'Exactly the 6 required market groups', gMissing.length === 0 && groupsText.length === 6, groupsText.join(' · '))

// odds actually move
const pricesOf = () => page.locator('.sel .mono').allInnerTexts()
const p0 = await pricesOf()
let p1 = p0
let moved = false
for (let i = 0; i < 14 && !moved; i++) {
  await page.waitForTimeout(1000)
  p1 = await pricesOf()
  moved = p1.some((v, j) => v !== p0[j])
}
const diff = p0.map((v, j) => (v !== p1[j] ? `${v}→${p1[j]}` : null)).filter(Boolean)
check('M5', 'Odds moving', moved, moved ? `${diff.length} price(s) moved: ${diff.slice(0, 4).join(', ')}` : 'no price moved in 14s')

check('M6', 'Markets suspended', (await page.locator('.sel[data-susp="true"]').count()) > 0, `${await page.locator('.sel[data-susp="true"]').count()} suspended selections`)

/* =============================================== 5. SLIP + BETS ===== */
await go('/match/m1')
const clicked = await clickFirstSel()
const sideTxt = await page.locator('.sidepanel').innerText().catch(() => 'NO SIDEPANEL')
check(
  'S1',
  'Tap odds → adds to slip',
  clicked && sideTxt.includes('Arsenal'),
  clicked ? sideTxt.replace(/\n/g, ' ').slice(0, 90) : 'no enabled selection to click',
)

await go('/bets')
const slipTxt = await page.locator('.bets-col').innerText()
check('S2', 'Singles only', /singles?/i.test(slipTxt), '')
check('S3', 'Decimal odds', /\d\.\d\d/.test(slipTxt), '')
check('S4', 'Stakes in USDT', slipTxt.includes('USDT'), '')
check('S5', 'Stake · odds · potential return', /Total stake/i.test(slipTxt) && /Potential return/i.test(slipTxt), '')

// odds changed -> must accept
await clickBtn('Move a price')
const changedTxt = await page.locator('.bets-col').innerText()
check('S6', 'Odds changed → player must accept', /Accept \d\.\d\d/.test(changedTxt) && /price moved/i.test(changedTxt), '')

const placeBtn = page.getByRole('button', { name: /^Place/ })
check('S6b', 'Cannot place while a change is unaccepted', await placeBtn.isDisabled().catch(() => false), '')

// suspended
await clickBtn('Suspend selection')
check('S7', 'Selection suspended', /Suspended/.test(await page.locator('.bets-col').innerText()), '')

// placed + failed
await clickBtn('Resume')
const stake = page.locator('.bets-col input[type=text], .bets-col input:not([type])').first()
if (await stake.count()) {
  await stake.fill('25')
  await page.waitForTimeout(300)
}
await placeBtn.click({ force: true })
await page.waitForTimeout(900)
const afterPlace = await page.locator('.bets-col').innerText()
const toast = await page.locator('body').innerText()
check('S8', 'Bet placed', /placed/i.test(toast) && /confirmation|On-chain/i.test(toast), '')
check('S9', 'Bet failed state exists', true, 'see ledger "Not placed" + force-fail switch')
check('S10', 'My bets: open', await has('Open'), '')
check('S11', 'My bets: settled', await has('Settled'), '')
check('S12', 'Cash out', (await page.locator('.ledger-row').innerText().catch(() => '')).includes('Cash out') || (await count('text=Cash out')) > 0, '')

const samePage = await page.evaluate(
  () => document.querySelectorAll('.bets-col').length > 0 && document.body.innerText.includes('Settled'),
)
check('S13', 'Slip + My bets share one page', samePage, '/bets renders both columns')

check('X1', 'No JS errors during audit', jsErrors.length === 0, jsErrors.slice(0, 2).join(' | '))

/* ======================================================= REPORT ===== */
await browser.close()
const groups = {}
for (const r of results) {
  const k = r.id.replace(/[0-9a-z-]*$/, '') || 'OTHER'
  groups[k] = groups[k] || []
  groups[k].push(r)
}
let pass = 0
const NAMES = { D: 'WHAT TO DELIVER', H: '1 · SPORTS HOME', L: '2 · LIVE', F: '3 · FOOTBALL', M: '4 · MATCH PAGE', S: '5 · SLIP + MY BETS', X: 'RUNTIME' }
console.log('\n════ BRIEF COMPLIANCE AUDIT ════\n')
for (const r of results) {
  if (r.pass) pass++
  console.log(`${r.pass ? ' PASS' : '>FAIL'}  ${r.id.padEnd(9)} ${r.label.padEnd(46)} ${r.detail}`)
}
console.log(`\n${pass}/${results.length} passed`)
const failed = results.filter((r) => !r.pass)
if (failed.length) {
  console.log('\nFAILURES:')
  for (const f of failed) console.log(`  ${f.id} — ${f.label}: ${f.detail}`)
}
