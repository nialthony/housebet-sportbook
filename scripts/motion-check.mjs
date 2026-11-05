import { chromium } from 'playwright'
const BASE = process.env.BASE ?? 'http://127.0.0.1:3000/#'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const out = []
const ck = (n, ok, d = '') => out.push(`${ok ? ' PASS ' : '>FAIL '} ${n.padEnd(34)} ${d}`)

await p.goto(BASE + '/match/m1', { waitUntil: 'networkidle' }); await p.waitForTimeout(900)

const css = (sel, prop, i = 0) =>
  p.locator(sel).nth(i).evaluate((e, pr) => getComputedStyle(e)[pr], prop)

ck('page-enter animation', (await css('.page-enter', 'animationName')) === 'pageIn',
   await css('.page-enter', 'animationDuration'))

const delays = await p.locator('.stagger > *').evaluateAll(
  els => els.slice(0, 5).map(e => getComputedStyle(e).animationDelay))
ck('stagger delays', delays[0] === '0s' && delays[1] === '0.024s', delays.join(' '))

ck('live-dot pulse', (await css('.live-dot', 'animationName')) === 'liveDot')
ck('sel has transform transition',
   (await css('.sel', 'transitionProperty')).includes('transform'))

// the filter pills must still sit on one row
const ys = await p.locator('.filter-bar .pill').evaluateAll(
  els => els.map(e => Math.round(e.getBoundingClientRect().top)))
ck('filter pills still horizontal', new Set(ys).size === 1, `${ys.length} pil, ${new Set(ys).size} baris`)

// market groups must still be stacked, not side by side
const gy = await p.locator('.stagger > div').evaluateAll(
  els => els.map(e => Math.round(e.getBoundingClientRect().top)))
ck('market groups still vertical', new Set(gy).size === gy.length, `${gy.length} grup`)

// reduced motion must flatten everything
const p2 = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
await p2.goto(BASE + '/match/m1', { waitUntil: 'networkidle' }); await p2.waitForTimeout(700)
const rd = await p2.locator('.page-enter').evaluate(e => getComputedStyle(e).animationDuration)
ck('prefers-reduced-motion respected', parseFloat(rd) < 0.01, rd)

console.log(out.join('\n'))
console.log(`\n${out.filter(l => l.startsWith(' PASS')).length}/${out.length} passed`)
await b.close()
