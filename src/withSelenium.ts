import { WebDriver, Builder } from 'selenium-webdriver'
import * as firefox from 'selenium-webdriver/firefox'

export default async (fn: (driver: WebDriver) => Promise<any>) => {
  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(new firefox.Options().headless())
    .build()

  try {
    await fn(driver)
  } finally {
    await driver.quit()
  }
}
