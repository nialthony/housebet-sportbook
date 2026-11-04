import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE ?? 'http://127.0.0.1:3000/#'
const OUT = 'shots'
mkdirSync(OUT, { recursive: true })

const errors = []
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const page = await ctx.newPage()
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[console] ${m.text()}`)
})
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))

const clickSafe = async (locator) => {
  await locator.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150)
  await locator.click({ timeout: 6000, force: true })
  await page.waitForTimeout(250)
}

const go = async (hash, name, w = 1440, h = 900) => {
  await page.setViewportSize({ width: w, height: h })
  await page.goto(`${BASE}${hash}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
  return page
}

const text = async (sel) => (await page.locator(sel).first().innerText().catch(() => '(missing)')).slice(0, 200)

const report = []

/* ---------------------------------------------------------------- home */
await go('/', '01-home-desktop')
report.push(['home h1', await text('.h1')])
report.push(['home rows', String(await page.locator('.mrow').count())])
report.push(['home overflowX', String(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))])

/* ---------------------------------------------------------------- live */
await go('/live', '02-live-desktop')
report.push(['live rows', String(await page.locator('.mrow').count())])

/* ------------------------------------------------------------ football */
await go('/football', '03-football-desktop')
report.push(['football comps', String(await page.locator('.comp-head').count())])
report.push(['football rows', String(await page.locator('.mrow').count())])

/* ---------------------------------------------------------- match page */
await go('/match/m1', '04-match-desktop')
report.push(['match groups', String(await page.locator('.market-group').count())])
report.push(['match sels', String(await page.locator('.sel').count())])
report.push(['match score', await text('.scoreline')])

/* --------------------------------------------------------------- bets */
await go('/bets', '05-bets-desktop')
report.push(['bets rows', String(await page.locator('.ledger-row').count())])

/* -------------------------------------------------- interaction: slip */
await go('/match/m1', '06-match-desktop')
const odds = page.locator('.sel').first()
await clickSafe(odds)
report.push(['after click, slip count', String(await page.locator('.sidepanel .tag, .sidepanel').count())])
await page.screenshot({ path: `${OUT}/06-match-selected.png` })

// force a price change via the bets page simulator
await page.goto(`${BASE}/bets`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const moveBtn = page.getByRole('button', { name: 'Move a price' })
if (await moveBtn.count()) {
  await clickSafe(moveBtn)
  await page.waitForTimeout(400)
  report.push(['price change banner', await text('.simbar')])
}
await page.screenshot({ path: `${OUT}/07-bets-price-changed.png` })

const suspendBtn = page.getByRole('button', { name: 'Suspend selection' })
if (await suspendBtn.count()) {
  await clickSafe(suspendBtn)
  await page.waitForTimeout(400)
}
await page.screenshot({ path: `${OUT}/08-bets-suspended.png` })
report.push(['suspended copy', await text('.bets-col')])

/* ---------------------------------------------------------- phone pass */
for (const [hash, name] of [
  ['/', '10-home-phone'],
  ['/live', '11-live-phone'],
  ['/football', '12-football-phone'],
  ['/match/m1', '13-match-phone'],
  ['/bets', '14-bets-phone'],
]) {
  await go(hash, name, 390, 844)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  report.push([`${name} overflowX`, String(overflow)])
}

/* ------------------------------------------------------- style checks */
await go('/', '20-style-check', 1440, 900)
const style = await page.evaluate(() => {
  const cs = getComputedStyle(document.body)
  const odds = document.querySelector('.odds')
  const oc = odds ? getComputedStyle(odds) : null
  return {
    bodyFont: cs.fontFamily,
    bodyBg: cs.backgroundColor,
    oddsFont: oc?.fontFamily,
    oddsW: oc?.width,
    shadowUsers: [...document.querySelectorAll('*')].filter((e) => {
      const s = getComputedStyle(e)
      return s.boxShadow !== 'none' && !s.boxShadow.includes('inset')
    }).length,
    gradientUsers: [...document.querySelectorAll('*')].filter((e) =>
      getComputedStyle(e).backgroundImage.includes('gradient'),
    ).length,
    emojiish: document.body.innerText.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu)?.length ?? 0,
  }
})
report.push(['style', JSON.stringify(style)])

await browser.close()

console.log('=== REPORT ===')
for (const [k, v] of report) console.log(`${k.padEnd(28)} ${v}`)
console.log('\n=== ERRORS ===')
console.log(errors.length ? errors.join('\n') : 'none')
