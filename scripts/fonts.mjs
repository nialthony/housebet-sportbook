import { chromium } from 'playwright'
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}})
await p.goto('http://127.0.0.1:3000/#/match/m1', {waitUntil:'networkidle'})
await p.waitForTimeout(1500)
const r = await p.evaluate(async () => {
  await document.fonts.ready
  const fams = [...new Set([...document.fonts].map(f => `${f.family} ${f.weight} ${f.status}`))]
  const g = s => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null }
  const sl = g('.scoreline__n'), od = g('.sel'), bd = getComputedStyle(document.body)
  return {
    loadedFonts: fams,
    body: bd.fontFamily,
    odds: od ? `${od.fontFamily} | ${od.fontVariantNumeric}` : 'n/a',
    scoreline: sl ? `${sl.fontFamily} | ${sl.fontVariantNumeric}` : 'n/a',
  }
})
console.log(JSON.stringify(r, null, 1))
const w = await p.evaluate(() => {
  const mk = t => { const s=document.createElement('span'); s.className='mono'
    s.style.cssText='position:absolute;visibility:hidden;font-size:15px'
    s.textContent=t; document.body.appendChild(s)
    const w=s.getBoundingClientRect().width; s.remove(); return +w.toFixed(2) }
  return { '1.11': mk('1.11'), '8.88': mk('8.88'), '2.00': mk('2.00'), '1.85': mk('1.85') }
})
console.log('tabular widths (should be identical):', JSON.stringify(w))
await b.close()
