import { chromium } from 'playwright'
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}})
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())})
const txt = async (sel) => (await p.locator(sel).first().innerText().catch(()=>'(none)')).replace(/\n+/g,' | ')

await p.goto('http://127.0.0.1:3000/#/live',{waitUntil:'networkidle'}); await p.waitForTimeout(700)
console.log('LIVE groups:', await p.locator('.sec-head h2').count())
console.log('LIVE first head:', await txt('.sec-head'))
console.log('LIVE has View all:', await p.getByText('View all').count())

await p.goto('http://127.0.0.1:3000/#/bets',{waitUntil:'networkidle'}); await p.waitForTimeout(700)
console.log('\nBETS time filters:', await p.locator('.filter-bar .pill').allInnerTexts().then(a=>a.join(' / ')))
console.log('BETS header row:', await txt('.panel .eyebrow'))
const rows = await p.locator('.ledger-row').count(); console.log('BETS ledger rows:', rows)
if (rows) console.log('BETS row 1:', await txt('.ledger-row'))

// filter interaction
const today = p.getByRole('button',{name:'Today'})
if (await today.count()) { await today.click({force:true}); await p.waitForTimeout(400)
  console.log('BETS rows after Today filter:', await p.locator('.ledger-row').count()) }

await p.setViewportSize({width:390,height:844})
for (const h of ['/','/live','/football','/match/m1','/bets']) {
  await p.goto('http://127.0.0.1:3000/#'+h,{waitUntil:'networkidle'}); await p.waitForTimeout(500)
  const ov = await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)
  console.log(`phone ${h} overflow:`, ov)
}
console.log('\nerrors:', errs.length? errs.slice(0,3).join(' | ') : 'none')
await b.close()
