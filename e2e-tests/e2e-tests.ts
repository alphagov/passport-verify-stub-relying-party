const assert = require('assert')
const puppeteer = require('puppeteer')

let browser
let page
let host = process.env.E2E_TEST_ENVIRONMENT

function browserOptions () {
  if (process.env.PUPPETEER_INSIDE_CONTAINER) {
    return {
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
    }
  } else {
    return {}
  }
}

before(async () => {
  const browser = await puppeteer.launch(browserOptions())
  page = await browser.newPage()
})

function delay (timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

describe('A non-matching journey', () => {
  it('should succeed', async () => {
    await journey().then(async function () {
      const heading = await page.$eval('h2#heading-non-matching', e => e.innerHTML)
      assert(heading.includes('Attributes for user with pid:'),'Actual: ' + heading)
    })
  }).timeout(10000)
})

describe('A matching journey', () => {
  it('should succeed', async () => {
    await journey(true).then(async function () {
      // matching/user creation happening
      await delay(2000)
      const heading = await page.$eval('h1', e => e.innerHTML)
      assert(heading.includes('Success'), 'Actual: ' + heading)
    })
  }).timeout(12000)
})

async function journey (matchUser?: boolean) {
  await page.goto(host, { waitUntil: 'networkidle2' })
  await page.click('a.button-start')
  await page.waitForSelector('input#start_form_selection_false')
  await page.click('input#start_form_selection_false')
  await page.click('input#next-button')
  await page.waitForSelector("button[value='Stub Idp Demo One']")
  await page.click("button[value='Stub Idp Demo One']")
  await page.waitForSelector('input#username')
  await page.type('input#username', `stub-idp-demo-one${matchUser ? '-elms' : ''}`)
  await page.type('input#password', 'bar')
  await page.click('input#login')
  await page.waitForSelector('input#agree')
  await page.click('input#agree')
  // Due to multiple redirects at this stage we need to delay
  await delay(1500)
}
