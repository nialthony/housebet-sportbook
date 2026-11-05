import { chromium } from 'playwright'
const B = 'https://nialthony.github.io/housebet-sportbook/'
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
let total = 0
for (const h of ['/', '/live', '/football', '/match/m1', '/bets']) {
  await p.goto(B + '#' + h, { waitUntil: 'networkidle' }); await p.waitForTimeout(900)
  const hits = await p.evaluate(() => {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const out = []
    let n
    while ((n = walk.nextNode())) {
      const t = n.nodeValue
      if (t && t.includes('—')) {
        const el = n.parentElement
        if (el && el.closest('script,style')) continue
        out.push(t.trim().slice(0, 60))
      }
    }
    return out
  })
  total += hits.length
  console.log(`  ${h.padEnd(12)} ${hits.length} em-dash ${hits.length ? ':: ' + hits.join(' | ') : ''}`)
}
console.log(`\nTOTAL em-dash yang terlihat: ${total}`)
await b.close()
