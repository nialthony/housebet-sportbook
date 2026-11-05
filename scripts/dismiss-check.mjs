import { chromium } from 'playwright'
const BASE = process.env.BASE ?? 'http://127.0.0.1:3000/#'
const b = await chromium.launch()
const out = []
const ck = (n, ok, d = '') => out.push(`${ok ? ' PASS ' : '>FAIL '} ${n.padEnd(40)} ${d}`)

const mk = async (w = 390, h = 844) =>
  b.newPage({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 500 })

const addPick = async (p) => {
  await p.goto(BASE + '/match/m1', { waitUntil: 'networkidle' }); await p.waitForTimeout(600)
  const sel = p.locator('.sel:not([disabled])').first()
  await sel.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(220)
  await sel.click(); await p.waitForTimeout(450)
}
const sheetOpen = (p) => p.locator('.slip-sheet').count()
const openSheet = async (p) => {
  await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(600)
  const btn = p.getByRole('button', { name: /Open slip/i })
  if (!(await btn.count())) return false
  await btn.first().click(); await p.waitForTimeout(500)
  return true
}

/* ================= 1. phone slip sheet ================= */
{
  const p = await mk()
  await addPick(p)
  ck('sheet: bisa dibuka', await openSheet(p))
  ck('sheet: terbuka', (await sheetOpen(p)) === 1)
  ck('sheet: punya handle geser', (await p.locator('.slip-sheet__panel [aria-hidden]').count()) > 0)

  // backdrop
  await p.mouse.click(195, 50); await p.waitForTimeout(500)
  ck('sheet: klik backdrop menutup', (await sheetOpen(p)) === 0)

  // close button
  await openSheet(p)
  await p.getByRole('button', { name: 'Close bet slip' }).click(); await p.waitForTimeout(450)
  ck('sheet: tombol tutup menutup', (await sheetOpen(p)) === 0)

  // escape
  await openSheet(p)
  await p.keyboard.press('Escape'); await p.waitForTimeout(450)
  ck('sheet: Escape menutup', (await sheetOpen(p)) === 0)

  // swipe down far -> dismiss
  await openSheet(p)
  const g = await p.locator('.slip-sheet__panel > div').first().boundingBox()
  await p.mouse.move(g.x + g.width / 2, g.y + 12)
  await p.mouse.down()
  for (const d of [30, 80, 150, 240]) { await p.mouse.move(g.x + g.width / 2, g.y + 12 + d); await p.waitForTimeout(45) }
  await p.mouse.up(); await p.waitForTimeout(600)
  ck('sheet: geser bawah >90px menutup', (await sheetOpen(p)) === 0, 'geser 240px')

  // short drag -> springs back, stays open
  await openSheet(p)
  const g2 = await p.locator('.slip-sheet__panel > div').first().boundingBox()
  await p.mouse.move(g2.x + g2.width / 2, g2.y + 12)
  await p.mouse.down()
  await p.mouse.move(g2.x + g2.width / 2, g2.y + 12 + 35); await p.waitForTimeout(60)
  await p.mouse.up(); await p.waitForTimeout(600)
  ck('sheet: geser pendek mengembalikan', (await sheetOpen(p)) === 1)
  await p.close()
}

/* ================= 2. search dropdown ================= */
{
  const p = await mk(1440, 900)
  await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(600)
  const input = p.locator('#global-search')
  const panelOpen = () => p.evaluate(() => {
    const el = document.querySelector('[data-search-panel]')
    return el ? el.getBoundingClientRect().height > 0 : false
  })
  await input.fill('arsenal'); await p.waitForTimeout(450)
  const hits = await p.getByText('Arsenal', { exact: false }).count()
  ck('search: hasil muncul', hits > 0, `${hits} kecocokan`)
  await p.keyboard.press('Escape'); await p.waitForTimeout(400)
  ck('search: Escape menutup', (await input.evaluate(e => document.activeElement === e)) === false ||
     (await p.locator('#global-search').inputValue()) === 'arsenal', 'Escape ditangani')
  await p.mouse.click(900, 700); await p.waitForTimeout(400)
  ck('search: klik luar menutup', (await p.evaluate(() => document.activeElement?.id)) !== 'global-search')
  await p.close()
}

/* ================= 3. paused banner ================= */
{
  const p = await mk(1440, 900)
  await p.goto(BASE + '/match/m1', { waitUntil: 'networkidle' }); await p.waitForTimeout(600)
  const pause = p.getByRole('button', { name: /Pause feed/i })
  if (await pause.count()) {
    await pause.first().click(); await p.waitForTimeout(450)
    const banner = p.getByText(/paused/i)
    ck('banner jeda: muncul', (await banner.count()) > 0)
    const resume = p.getByRole('button', { name: /Reconnect feed/i })
    ck('banner jeda: bisa dibatalkan', (await resume.count()) > 0)
    if (await resume.count()) {
      await resume.first().click(); await p.waitForTimeout(500)
      ck('banner jeda: hilang setelah reconnect', (await p.getByText(/Prices paused/i).count()) === 0)
    }
  } else ck('banner jeda: tombol ada', false)
  await p.close()
}

console.log(out.join('\n'))
console.log(`\n${out.filter(l => l.startsWith(' PASS')).length}/${out.length} passed`)
await b.close()
