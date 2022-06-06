import _ from 'lodash'
import { Page, ElementHandle } from 'playwright'

import { Input } from '../../types'
import assert from '../../assert'
import withBrowser from '../../withBrowser'
import { FilterOptions, FilterDefinition, filterDefinitions } from './filters'

type Options = {
  section: string
  filters?: FilterOptions
}

type Result = {
  id: string
  name: string
  url: string
  description: string
  imageUrl: string
  extra: {
    price: string
  }
}

type Filter = FilterDefinition & { value: any }

const HOST = 'https://www.ss.com'

const ROUTE_BLACKLIST = [
  /hits/,
  /count/,
  /ads/,
  /reklama/,
  /google-analytics/,
  /set\.cookie\.php/,
  /get_remote_id\.php/,
  /chk\.php/,
]

const applyFilters = async (page: Page, filterOptions?: FilterOptions) => {
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
    const $filter = await page.$(filter.selector)
    assert($filter, 'Could not find $filter!')

    const tagName = await $filter.evaluate(($) => $.tagName)

    if (tagName === 'INPUT') {
      await $filter.type(`${filter.value}`)

      needsSubmitting = true
    } else if (tagName === 'SELECT') {
      await $filter.selectOption(`${filter.value}`)

      needsSubmitting = false
    }
  }

  if (needsSubmitting) {
    const $submitButton = await page.$('.s12')
    assert($submitButton, 'Could not find $submitButton!')

    await $submitButton.click()
  }
}

const getName = (url: string, section: string) => {
  let name = url

  // Remove host.
  name = name.slice(HOST.length)
  // Remove /msg/{language}/.
  name = name.replace(/^\/msg\/[^\/]+\//, '')
  // Remove /{id}.html.
  name = name.replace(/\/[^\/]+$/, '')

  const uniqParts = _.difference(name.split('/'), section.split('/'))

  if (uniqParts.length === 0) {
    return name
  } else {
    return uniqParts.join('/')
  }
}

const parseResults = async (page: Page, section: string) => {
  const $resultsTable = await page.$(
    '#filter_frm .filter_second_line_dv + table',
  )

  assert($resultsTable, 'Could not find $resultsTable!')

  const rows = await $resultsTable.$$('tr')

  return _.reject(
    await Promise.all(
      _.map(rows, async ($row: ElementHandle): Promise<Result | undefined> => {
        const $anchor = await $row.$('.am')

        if (!$anchor) {
          // If .am doesn't exist, we assume it's irrelevant for results.
          return undefined
        }

        const href = await $anchor.evaluate(($) =>
          ($ as HTMLAnchorElement).getAttribute('href'),
        )
        const url = `${HOST}${href}`

        const idMatch = url.match(/([^\/]+)\.html$/)
        assert(idMatch, 'Could not match id!')
        const [, id] = idMatch

        const name = getName(url, section)

        const description = await $anchor.evaluate(
          ($) => ($ as HTMLAnchorElement).textContent,
        )
        assert(description, 'Could not find description!')

        const $thumbnail = await $row.$('.msga2:nth-child(2) .isfoto')
        assert($thumbnail, 'Could not find $thumbnail!')
        const thumbnailUrl = await $thumbnail.evaluate(($) =>
          ($ as HTMLImageElement).getAttribute('src'),
        )
        assert(thumbnailUrl, 'Could not find thumbnailUrl!')
        const imageUrl = thumbnailUrl.replace('th2', '800')

        const cells = await $row.$$('td')

        const $priceCell = _.last(cells)
        assert($priceCell, 'Could not find $priceCell!')
        const $priceAnchor = await $priceCell.$('a')
        assert($priceAnchor, 'Could not find $priceAnchor!')
        const price = await $priceAnchor.evaluate(($) => $.textContent)
        assert(price, 'Could not find price!')

        return {
          id,
          name,
          url,
          description,
          imageUrl,
          extra: {
            price,
          },
        }
      }),
    ),
    _.isUndefined,
  ) as Result[]
}

const ss: Input<Options> = (options: Options) => async () => {
  let results: Result[] = []

  await withBrowser(async ({ page }) => {
    // Abort requests to ad pages and other junk.
    await Promise.all(
      _.map(ROUTE_BLACKLIST, (regex) =>
        page.route(regex, (route) => route.abort()),
      ),
    )

    await page.goto(`${HOST}/${options.section}/filter/`)

    await applyFilters(page, options.filters)

    results = await parseResults(page, options.section)
  })

  return results
}

export default ss
