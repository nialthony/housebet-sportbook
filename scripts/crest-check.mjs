import { chromium } from 'playwright'
const BASE = process.env.BASE ?? 'http://127.0.0.1:3000/#'
const b = await chromium.launch()
const out = []
const ck = (n, ok, d = '') => out.push(`${ok ? ' PASS ' : '>FAIL '} ${n.padEnd(38)} ${d}`)

for (const [w, h, label, want] of [[1440, 900, '1440', 18], [390, 844, '390', 16]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  for (const page of ['/football', '/live', '/']) {
    await p.goto(BASE + page, { waitUntil: 'networkidle' }); await p.waitForTimeout(900)
    const r = await p.evaluate((want) => {
      const crests = [...document.querySelectorAll('.mrow__team img, .mrow__team svg')]
      const imgs = [...document.querySelectorAll('.mrow__team img')]
      const rows = [...document.querySelectorAll('.mrow')]
      const teams = [...document.querySelectorAll('.mrow__team')]
      return {
        crests: crests.length,
        broken: imgs.filter(i => !i.complete || i.naturalWidth === 0).length,
        wrongSize: crests.filter(c => Math.round(c.getBoundingClientRect().width) !== want).length,
        rowH: rows.length ? Math.round(rows[0].getBoundingClientRect().height) : 0,
        truncated: teams.filter(t => t.scrollWidth > t.clientWidth + 1).length,
        teams: teams.length,
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 1
          ? document.documentElement.scrollWidth - window.innerWidth : 0,
      }
    }, want)
    const tag = `${label} ${page}`.padEnd(38)
    ck(tag, r.crests > 0 && r.broken === 0 && r.wrongSize === 0 && r.overflowX === 0,
       `${r.crests} crest, rusak ${r.broken}, ukuran salah ${r.wrongSize}, ` +
       `baris ${r.rowH}px, crest ${want}px, terpotong ${r.truncated}/${r.teams}, overflow ${r.overflowX}px`)
  }
  await p.close()
}

// every team on the football page must have SOME mark (real or generated)
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(BASE + '/football', { waitUntil: 'networkidle' }); await p.waitForTimeout(900)
const noMark = await p.evaluate(() =>
  [...document.querySelectorAll('.mrow__team')].filter(t => !t.querySelector('img,svg')).length)
ck('setiap tim punya mark', noMark === 0, `${noMark} tanpa mark`)

// fictional clubs must fall back to generated SVG
await p.goto(BASE + '/live', { waitUntil: 'networkidle' }); await p.waitForTimeout(900)
const gen = await p.evaluate(() => {
  const t = [...document.querySelectorAll('.mrow__team')]
  return { svg: t.filter(x => x.querySelector('svg')).length, img: t.filter(x => x.querySelector('img')).length }
})
ck('fallback crest buatan jalan', gen.svg > 0, `${gen.img} logo asli / ${gen.svg} crest buatan`)

console.log(out.join('\n'))
console.log(`\n${out.filter(l => l.startsWith(' PASS')).length}/${out.length} passed`)
await b.close()
