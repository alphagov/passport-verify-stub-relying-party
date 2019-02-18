const assert = require('assert')
const puppeteer = require('puppeteer')

let browser
let page
let host = process.env.E2E_TEST_ENVIRONMENT

before(async () => {
  browser = await puppeteer.launch()
  page = await browser.newPage()
})

after(async () => {
  await browser.close()
})

function delay (timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

describe('A full non-matching journey', () => {
  it('should succeed', async () => {
    await page.goto(host, { waitUntil: 'networkidle2' })
    await page.click('a.button-start')
    await page.waitForSelector('input#start_form_selection_false')
    await page.click('input#start_form_selection_false')
    await page.click('input#next-button')
    await page.waitForSelector("button[value='Stub Idp Demo One']")
    await page.click("button[value='Stub Idp Demo One']")
    await page.waitForSelector('input#username')
    await page.type('input#username', 'stub-idp-demo-one')
    await page.type('input#password', 'bar')
    await page.click('input#login')
    await page.waitForSelector('input#agree')
    await page.click('input#agree')
    // Due to multiple redirects at this stage we need to delay
    await delay(1500)
    const heading = await page.$eval('h2#heading-non-matching', e => e.innerHTML)
    assert(heading.includes('Attributes for user with pid:'))
  }).timeout(10000)
})

describe('A full matching journey', () => {
  it('should succeed', async () => {
    // TODO: once we deploy the compoments in a matching mode
  }).timeout(10000)
})
