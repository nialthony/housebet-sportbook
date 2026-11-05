import { chromium } from 'playwright'
const BASE = process.env.BASE ?? 'http://127.0.0.1:3000/#'
const b = await chromium.launch()
const out = []
const ck = (n, ok, d = '') => out.push(`${ok ? ' PASS ' : '>FAIL '} ${n.padEnd(40)} ${d}`)

/** place a bet so a toast appears */
async function fire(p) {
  await p.goto(BASE + '/match/m1', { waitUntil: 'networkidle' }); await p.waitForTimeout(600)
  const sel = p.locator('.sel:not([disabled])').first()
  await sel.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(220)
  await sel.click(); await p.waitForTimeout(400)
  await p.evaluate(() => { location.hash = '#/bets' }); await p.waitForTimeout(600)
  const acc = p.getByRole('button', { name: /^Accept/ })
  if (await acc.count()) { await acc.first().click(); await p.waitForTimeout(400) }
  const st = p.locator('.bets-col input[type=text], .bets-col input:not([type])').first()
  await st.fill('25'); await p.waitForTimeout(300)
  await p.getByRole('button', { name: /^Place/ }).click(); await p.waitForTimeout(400)
  return p.locator('.toast-in').count()
}

const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

// 1. auto-dismiss
ck('muncul saat place bet', (await fire(p)) === 1)
await p.waitForTimeout(6000)
ck('hilang sendiri <6.5s', (await p.locator('.toast-in').count()) === 0, 'timer sekali jalan')

// 2. close button
await fire(p)
const close = p.getByRole('button', { name: 'Dismiss notification' })
ck('punya tombol tutup', (await close.count()) === 1)
await close.first().click(); await p.waitForTimeout(600)
ck('tombol tutup menghilangkannya', (await p.locator('.toast-in').count()) === 0)

// 3. swipe to dismiss
await fire(p)
const box = await p.locator('.toast-in').first().boundingBox()
await p.mouse.move(box.x + box.width - 30, box.y + box.height / 2)
await p.mouse.down()
for (const s of [20, 60, 120, 190]) { await p.mouse.move(box.x + box.width - 30 + s, box.y + box.height / 2); await p.waitForTimeout(45) }
await p.mouse.up(); await p.waitForTimeout(700)
ck('geser >64px menutup', (await p.locator('.toast-in').count()) === 0, 'geser 190px')

// 4. a short drag must spring back, not dismiss
await fire(p)
const box2 = await p.locator('.toast-in').first().boundingBox()
await p.mouse.move(box2.x + box2.width - 30, box2.y + box2.height / 2)
await p.mouse.down()
await p.mouse.move(box2.x + box2.width - 30 + 25, box2.y + box2.height / 2); await p.waitForTimeout(50)
await p.mouse.up(); await p.waitForTimeout(600)
const back = await p.locator('.toast-in').first().evaluate(e => getComputedStyle(e).transform).catch(() => 'none')
ck('geser pendek mengembalikan', (await p.locator('.toast-in').count()) === 1, `transform ${back}`)

// 5. vertical scroll must still work while the toast is up
const y0 = await p.evaluate(() => window.scrollY)
await p.mouse.move(box2.x + 20, box2.y + 20)
await p.mouse.wheel(0, 300); await p.waitForTimeout(400)
ck('halaman tetap bisa discroll', (await p.evaluate(() => window.scrollY)) > y0)

console.log(out.join('\n'))
console.log(`\n${out.filter(l => l.startsWith(' PASS')).length}/${out.length} passed`)
await b.close()
