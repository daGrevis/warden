import { WebDriver, Builder, Capabilities } from 'selenium-webdriver'
import * as firefox from 'selenium-webdriver/firefox'
import * as chrome from 'selenium-webdriver/chrome'

import config from './config'

export default async (fn: (driver: WebDriver) => Promise<void>) => {
  const browser = config.driver?.browser ?? 'firefox'
  const headless = config.driver?.headless ?? true

  const builder = new Builder().forBrowser(browser)

  if (browser === 'firefox') {
    const options = new firefox.Options()

    if (headless) {
      options.headless()
    }

    builder.setFirefoxOptions(options)
  } else if (browser === 'chrome') {
    const chromeCapabilities = Capabilities.chrome()
    chromeCapabilities
      .set('goog:chromeOptions', {
        w3c: false,
      })

    const options = new chrome.Options()

    if (headless) {
      options.headless()
    }

    builder
      .withCapabilities(chromeCapabilities)
      .setChromeOptions(options)
  }

  const driver = await builder.build()

  try {
    await fn(driver)
  } finally {
    await driver.quit()
  }
}
