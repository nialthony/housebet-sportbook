import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://127.0.0.1:3000/#'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const out = []
for (const hash of ['/', '/live', '/football', '/match/m1', '/bets']) {
  await page.goto(`${BASE}${hash}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const r = await page.evaluate(() => {
    const shadows = []
    const clipped = []
    const lowContrast = []
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el)
      if (s.boxShadow !== 'none' && !s.boxShadow.includes('inset')) {
        shadows.push(el.className?.toString?.().slice(0, 40) + ' :: ' + s.boxShadow.slice(0, 40))
      }
      // horizontal clipping of text
      if (el.children.length === 0 && el.textContent?.trim()) {
        if (el.scrollWidth > el.clientWidth + 2 && s.overflow !== 'visible' && s.textOverflow !== 'ellipsis') {
          clipped.push((el.className?.toString?.() || el.tagName) + ' "' + el.textContent.trim().slice(0, 30) + '"')
        }
      }
    }
    return { shadows: [...new Set(shadows)].slice(0, 8), clipped: [...new Set(clipped)].slice(0, 8) }
  })
  out.push([hash, JSON.stringify(r, null, 1)])
}

/* -------- check the price-change + failure states actually render -------- */
await page.goto(`${BASE}/match/m1`, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.locator('.sel').first().scrollIntoViewIfNeeded()
await page.locator('.sel').first().click({ force: true })
await page.waitForTimeout(200)
await page.goto(`${BASE}/bets`, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.getByRole('button', { name: 'Move a price' }).click({ force: true })
await page.waitForTimeout(600)
const changed = await page.locator('.bets-col').innerText()
out.push(['PRICE CHANGE STATE', changed.replace(/\n+/g, ' | ').slice(0, 400)])

await browser.close()
console.log(out.map(([k, v]) => `\n### ${k}\n${v}`).join('\n'))
