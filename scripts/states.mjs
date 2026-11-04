import { chromium } from 'playwright'
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}})
const errs=[]; p.on('pageerror',e=>errs.push(e.message))
const click = async (name) => { const l=p.getByRole('button',{name}); if(await l.count()){ await l.first().click({force:true}); await p.waitForTimeout(500); return true } return false }
const has = async (t) => (await p.getByText(t, {exact:false}).count()) > 0

await p.goto('http://127.0.0.1:3000/#/match/m1',{waitUntil:'networkidle'}); await p.waitForTimeout(700)
console.log('StateBar on match page:', await p.locator('.simbar').count() === 1)

// pick a selection first so slip controls work
await p.locator('.sel').first().scrollIntoViewIfNeeded()
await p.locator('.sel').first().click({force:true}); await p.waitForTimeout(300)

console.log('changed  :', await click('Move a price'), '->', await has('price moved'))
console.log('suspended:', await click('Suspend selection'), '->', await has('Suspended'))
await click('Resume')
console.log('market   :', await click('Suspend market'), '->', await has('suspended —'))
await click('Reopen market')
console.log('paused   :', await click('Pause feed'), '->', await has('Prices paused'))
// confirm prices actually freeze
const before = await p.locator('.sel .mono').first().innerText()
await p.waitForTimeout(2500)
const after = await p.locator('.sel .mono').first().innerText()
console.log('prices frozen while paused:', before === after, `(${before} -> ${after})`)
await click('Reconnect feed')

console.log('\nleft nav "Your matches":', await has('Your matches'))
console.log('American Football:', await has('American Football'))
console.log('errors:', errs.length?errs.join(' | '):'none')
await b.close()
