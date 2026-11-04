import { chromium } from 'playwright'
const BASE = 'http://127.0.0.1:8899/housebets-sportsbook/'
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}})
const bad=[]; const fonts=[]
p.on('requestfailed', r => bad.push(r.url()))
p.on('response', r => { if(/\.woff2/.test(r.url())) fonts.push(r.status()+' '+r.url().split('/').pop()) })
for (const h of ['','#/live','#/football','#/match/m1','#/bets']) {
  await p.goto(BASE+h,{waitUntil:'networkidle'}); await p.waitForTimeout(900)
  const ok = await p.evaluate(async()=>{ await document.fonts.ready
    return { rows: document.querySelectorAll('.mrow,.sel,.ledger-row').length,
             fam: getComputedStyle(document.body).fontFamily.split(',')[0],
             loaded: [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family) } })
  console.log((h||'#/').padEnd(14), 'elements:', String(ok.rows).padEnd(4), 'body:', ok.fam, '| fonts:', [...new Set(ok.loaded)].join('+')||'NONE')
}
console.log('\nwoff2 responses:', fonts.length? [...new Set(fonts)].join(', ') : 'NONE')
console.log('failed requests:', bad.length? bad.slice(0,5).join('\n  ') : 'none')
await b.close()
