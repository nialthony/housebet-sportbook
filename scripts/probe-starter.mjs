import { chromium } from 'playwright'

const URLS = [
  'https://www.housebets.com/contests/sportsbook-design',
  'https://www.housebets.com/contests',
]

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  locale: 'en-US',
})
const page = await ctx.newPage()

for (const url of URLS) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(6000)
    const title = await page.title()
    const links = await page.evaluate(() =>
      [...document.querySelectorAll('a')]
        .map((a) => ({ href: a.href, text: (a.textContent || '').trim().slice(0, 60) }))
        .filter(
          (l) =>
            /starter|brand|kit|download|\.zip|figma|template|asset|shell|wireframe/i.test(
              l.href + ' ' + l.text,
            ),
        ),
    )
    const bodyHasStarter = await page.evaluate(() =>
      /starter files|brand pack|download the/i.test(document.body.innerText),
    )
    console.log(`\n### ${url}`)
    console.log('title:', title)
    console.log('mentions starter files:', bodyHasStarter)
    console.log('candidate links:', JSON.stringify(links, null, 1))
    // snippet of any sentence mentioning starter/brand
    const snip = await page.evaluate(() => {
      const t = document.body.innerText
      const i = t.search(/starter file|brand pack/i)
      return i < 0 ? '' : t.slice(Math.max(0, i - 200), i + 300).replace(/\n+/g, ' | ')
    })
    if (snip) console.log('context:', snip)
  } catch (e) {
    console.log(`\n### ${url}\nERROR: ${e.message.slice(0, 200)}`)
  }
}

await page.screenshot({ path: 'shots/probe-contest.png', fullPage: false })
await browser.close()
