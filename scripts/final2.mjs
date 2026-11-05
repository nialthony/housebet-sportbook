import { chromium } from 'playwright'
const BASE = process.env.BASE ?? 'http://127.0.0.1:3000/#'
const b = await chromium.launch()
const out = []
const ck = (n, ok, d='') => out.push(`${ok?' PASS ':'>FAIL '} ${n.padEnd(30)} ${d}`)

for (const [w,h,label] of [[1440,900,'1440'],[390,844,'390']]) {
  const p = await b.newPage({ viewport:{width:w,height:h} })
  await p.goto(BASE+'/match/m1',{waitUntil:'networkidle'}); await p.waitForTimeout(1000)
  const m = await p.evaluate(() => {
    const c=[...document.querySelectorAll('.scoreboard .crest')]
    return { crests:c.length, broken:c.filter(x=>x.tagName==='IMG'&&(!x.complete||x.naturalWidth===0)).length,
      sizes:[...new Set(c.map(x=>Math.round(x.getBoundingClientRect().width)))],
      overflow: document.documentElement.scrollWidth - window.innerWidth }
  })
  ck(`${label} match scoreboard`, m.crests===2 && m.broken===0 && m.overflow===0,
     `${m.crests} crest ukuran ${m.sizes.join('/')}px, rusak ${m.broken}, overflow ${m.overflow}px`)

  // add a selection so the slip/ledger renders, then inspect
  await p.goto(BASE+'/bets',{waitUntil:'networkidle'}); await p.waitForTimeout(900)
  const bl = await p.evaluate(() => {
    const c=[...document.querySelectorAll('.ledger-row .crest')]
    return { crests:c.length, broken:c.filter(x=>x.tagName==='IMG'&&(!x.complete||x.naturalWidth===0)).length,
      overflow: document.documentElement.scrollWidth - window.innerWidth }
  })
  ck(`${label} bets ledger`, bl.broken===0 && bl.overflow===0,
     `${bl.crests} crest (ledger), rusak ${bl.broken}, overflow ${bl.overflow}px`)
  await p.close()
}
console.log(out.join('\n'))
console.log(`\n${out.filter(l=>l.startsWith(' PASS')).length}/${out.length} passed`)
await b.close()
