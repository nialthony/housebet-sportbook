import { chromium } from 'playwright'
const BASE = 'https://nialthony.github.io/housebet-sportbook/'
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}})
const fails=[]
p.on('requestfailed', r => fails.push(r.url()+' :: '+r.failure()?.errorText))
p.on('pageerror', e => fails.push('JS ERROR: '+e.message))
const fonts=[]
p.on('response', r => { if(/\.woff2/.test(r.url())) fonts.push(r.status()) })

for (const h of ['','#/live','#/football','#/match/m1','#/bets']) {
  await p.goto(BASE+h,{waitUntil:'networkidle'}); await p.waitForTimeout(1200)
  const r = await p.evaluate(async () => {
    await document.fonts.ready
    return {
      els: document.querySelectorAll('.mrow,.sel,.ledger-row').length,
      font: getComputedStyle(document.body).fontFamily.split(',')[0],
      loaded: [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),
      title: document.title,
    }
  })
  console.log((h||'#/').padEnd(14), 'els:', String(r.els).padEnd(4), '| font:', r.font.padEnd(8), '|', [...new Set(r.loaded)].join('+')||'NO FONTS')
}

// interaction check on the live site
await p.goto(BASE+'#/match/m1',{waitUntil:'networkidle'}); await p.waitForTimeout(800)
await p.locator('.sel').first().scrollIntoViewIfNeeded(); await p.locator('.sel').first().click({force:true})
await p.waitForTimeout(400)
const slip = await p.locator('.sidepanel').innerText().catch(()=>'')
console.log('\nlive bet slip after click:', slip.replace(/\n+/g,' | ').slice(0,150))

// phone
await p.setViewportSize({width:390,height:844})
for (const h of ['','#/match/m1','#/bets']) {
  await p.goto(BASE+h,{waitUntil:'networkidle'}); await p.waitForTimeout(600)
  console.log('phone', (h||'#/').padEnd(12), 'overflow:', await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1))
}
console.log('\nfont responses:', [...new Set(fonts)].join(',') || 'NONE')
console.log('failed / errors:', fails.length? fails.slice(0,5).join('\n  ') : 'none')
await b.close()
