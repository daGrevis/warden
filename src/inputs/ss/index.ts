import _ from 'lodash'
import { By, WebDriver, WebElement } from 'selenium-webdriver'

import { Input } from '../../types'
import withSelenium from '../../withSelenium'
import untilReload from '../../untilReload'
import { FilterOptions, FilterDefinition, filterDefinitions } from './filters'

type Options = {
  section: string
  filters?: FilterOptions
}

type Result = {
  id: string
  url: string
  name: string
  description: string
  imageUrl: string
  extra: {
    price: string
  }
}

type Filter = FilterDefinition & { value: any }

const HOST = 'https://www.ss.com/'

const applyFilters = async (
  driver: WebDriver,
  filterOptions?: FilterOptions,
) => {
  // Always submit just to be sure because sections like transport/cars don't show the results until form has been submitted.
  let needsSubmitting = true

  const filters = _.map<any, Filter>(
    filterOptions,
    (value: any, key: string) => {
      const definition = (filterDefinitions as { [key: string]: any })[key]
      return {
        ...definition,
        value,
      }
    },
  )

  for (const filter of filters) {
    const $ = await driver.findElement(By.css(filter.selector))
    const tagName = await $.getTagName()

    if (tagName === 'input') {
      await $.sendKeys(filter.value)

      needsSubmitting = true
    } else if (tagName === 'select') {
      const $option = await $.findElement(
        By.css(`option[value='${filter.value}']`),
      )
      $option.click()

      await untilReload(driver)

      needsSubmitting = false
    }
  }

  if (needsSubmitting) {
    const $submitButton = await driver.findElement(By.className('s12'))
    $submitButton.click()

    await untilReload(driver)
  }
}

const getName = (url: string, section: string) => {
  let name = url

  // Remove host.
  name = name.slice(HOST.length)
  // Remove msg/{language}/.
  name = name.replace(/^msg\/[^\/]+\//, '')
  // Remove /{id}.html.
  name = name.replace(/\/[^\/]+$/, '')

  const uniqParts = _.difference(name.split('/'), section.split('/'))

  if (uniqParts.length === 0) {
    return name
  } else {
    return uniqParts.join('/')
  }
}

const parseResults = async (driver: WebDriver, section: string) => {
  const $resultsTable = await driver.findElement(
    By.css('#filter_frm .filter_second_line_dv + table'),
  )

  let rows = await $resultsTable.findElements(By.css('tr'))

  return _.reject(
    await Promise.all(
      _.map(
        rows,
        async ($row): Promise<Result | undefined> => {
          let $anchor: WebElement
          try {
            $anchor = await $row.findElement(By.className('am'))
          } catch (e) {
            // If .am doesn't exist, we assume it's irrelevant for results.
            return undefined
          }

          const url = await $anchor.getAttribute('href')

          const [, id] = url.match(/([^\/]+)\.html$/)!

          const name = getName(url, section)

          const description = await $anchor.getText()

          const thumbnailUrl = await (
            await $row.findElement(By.css('.msga2:nth-child(2) .isfoto'))
          ).getAttribute('src')
          const imageUrl = thumbnailUrl.replace('th2', '800')

          const cells = await $row.findElements(By.tagName('td'))

          const $priceCell = _.last(cells) as WebElement
          const price = await (
            await $priceCell.findElement(By.tagName('a'))
          ).getText()

          return {
            id,
            url,
            name,
            description,
            imageUrl,
            extra: {
              price,
            },
          }
        },
      ),
    ),
    _.isUndefined,
  ) as Result[]
}

const input: Input<Options> = (options: Options) => async () => {
  let results: Result[] = []

  await withSelenium(async driver => {
    await driver.get(`${HOST}${options.section}/filter/`)

    await applyFilters(driver, options.filters)

    results = await parseResults(driver, options.section)
  })

  return results
}

export default input
