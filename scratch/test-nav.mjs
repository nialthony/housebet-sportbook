import { chromium } from 'playwright'

const b = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' })
const page = await b.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:3000/#/')
await page.waitForTimeout(600)

console.log('--- Test 1: clicking basketball in sidebar ---')
const bballLink = page.locator('a[href*="sport=basketball"]').first()
console.log('Found link href:', await bballLink.getAttribute('href'))
await bballLink.click()
await page.waitForTimeout(600)
console.log('Current URL after click:', page.url())
console.log('H1:', await page.locator('.h1').innerText())
console.log('mrow count:', await page.locator('.mrow').count())
console.log('Active pill text:', await page.locator('.pill[data-on="true"]').allInnerTexts())

console.log('--- Test 2: clicking tennis in sidebar while already in /live ---')
const tennisLink = page.locator('a[href*="sport=tennis"]').first()
await tennisLink.click()
await page.waitForTimeout(600)
console.log('Current URL after tennis click:', page.url())
console.log('mrow count:', await page.locator('.mrow').count())
console.log('Active pill text:', await page.locator('.pill[data-on="true"]').allInnerTexts())

console.log('--- Test 3: clicking Football in sidebar ---')
const fbLink = page.locator('.leftnav a[href="#/football"]').first()
await fbLink.click()
await page.waitForTimeout(600)
console.log('Current URL after football click:', page.url())

await b.close()

