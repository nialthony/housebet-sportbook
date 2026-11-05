import { chromium } from 'playwright'
const B = 'https://nialthony.github.io/housebet-sportbook/'
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const PAGES = { 'Sports home': '/', 'Live': '/live', 'Football': '/football', 'Match page': '/match/m1', 'Bet slip + My bets': '/bets' }
let ok = 0
for (const [name, h] of Object.entries(PAGES)) {
  await p.goto(B + '#' + h, { waitUntil: 'networkidle' }); await p.waitForTimeout(900)
  const els = await p.evaluate(() => document.querySelectorAll('a,button').length)
  const h1 = await p.locator('h1').first().innerText().catch(() => '')
  const good = els > 15
  if (good) ok++
  console.log(`${good ? ' PASS ' : '>FAIL '} ${name.padEnd(22)} ${els} elemen  h1: "${h1.slice(0, 34)}"`)
}
console.log(`\n${ok}/5 halaman render di publik`)
await b.close()
