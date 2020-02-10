import { By, until, WebDriver } from 'selenium-webdriver'

const untilReload = async (driver: WebDriver) => {
  await driver.wait(until.stalenessOf(driver.findElement(By.tagName('html'))))
  await driver.wait(() =>
    driver.executeScript('return document.readyState === "complete"'),
  )
}

export default untilReload
