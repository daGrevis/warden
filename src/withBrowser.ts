import playwright, { Browser, BrowserContext, Page } from 'playwright'

import config from './config'

export default async (
  fn: (args: {
    browser: Browser
    context: BrowserContext
    page: Page
  }) => Promise<void>,
) => {
  const driver = playwright.webkit
  const browser = await driver.launch({
    headless: config.browser?.headless ?? true,
    slowMo: config.browser?.slowMo ?? 0,
    dumpio: config.browser?.debug ?? false,
  })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await fn({
      browser,
      context,
      page,
    })
  } finally {
    await browser.close()
  }
}
