import _ from 'lodash'
import { ElementHandle } from 'playwright'

import { Input } from '../../types'
import assert from '../../assert'
import withBrowser from '../../withBrowser'

const URL = 'https://www.worldometers.info/coronavirus/'

type OptionsForCountry = {
  country: string
}

type OptionsForCountries = {
  countries: [string, ...string[]]
}

type Options = OptionsForCountry | OptionsForCountries

enum CounterType {
  Infected = 'infected',
  Deaths = 'deaths',
  Recovered = 'recovered',
  Tested = 'tested',
}

type Result = {
  id: string
  name: string
  url: string
  meta?: {
    counterType: CounterType
    country: string | undefined
    value: number
  }
}

enum ColumnIndex {
  Name = 1,
  Infected = 2,
  Deaths = 4,
  Recovered = 6,
  Tested = 11,
}

const isOptionsForCountry = (options?: Options): options is OptionsForCountry =>
  options !== undefined && 'country' in options

const isOptionsForCountries = (
  options?: Options,
): options is OptionsForCountries =>
  options !== undefined && 'countries' in options

const parseNumber = (string: string) => {
  if (!string || string === 'N/A') {
    return 0
  }

  string = string.replace(/,/g, '')

  return _.parseInt(string)
}

const getText = async ($: ElementHandle) =>
  $.evaluate(($) => ($ as HTMLElement).innerText)

const createResult = (
  counterType: CounterType,
  country: string | undefined,
  value: number,
): Result => {
  return {
    id: JSON.stringify({ counterType, country, value }),
    name: `${value} ${counterType}`,
    url: URL,
    meta: {
      counterType,
      country,
      value,
    },
  }
}

const coronavirus: Input<Options | undefined> = (
  options?: Options,
) => async () => {
  let results: Result[] = []

  await withBrowser(async ({ page }) => {
    await page.goto(URL)

    let countries: undefined | string[]

    if (isOptionsForCountry(options)) {
      countries = [options.country]
    } else if (isOptionsForCountries(options)) {
      countries = options.countries
    } else {
      countries = undefined
    }

    const rows = await Promise.all(
      _.map(
        await page.$$(
          '#main_table_countries_today tr.even, #main_table_countries_today tr.odd',
        ),
        async ($row) =>
          Promise.all(
            _.map(await $row.$$('td'), async ($column) => getText($column)),
          ),
      ),
    )

    if (countries && countries.length > 0) {
      const countryRows = _.filter(rows, (columns) =>
        _.includes(countries, columns[ColumnIndex.Name]),
      )

      assert(
        countryRows.length === countries.length,
        'Not all countries found!',
      )

      results = _.flatMap(countryRows, (columns) => {
        const countryName = columns[ColumnIndex.Name]

        const infected = parseNumber(columns[ColumnIndex.Infected])
        const deaths = parseNumber(columns[ColumnIndex.Deaths])
        const recovered = parseNumber(columns[ColumnIndex.Recovered])
        const tested = parseNumber(columns[ColumnIndex.Tested])

        return [
          createResult(CounterType.Infected, countryName, infected),
          createResult(CounterType.Deaths, countryName, deaths),
          createResult(CounterType.Recovered, countryName, recovered),
          createResult(CounterType.Tested, countryName, tested),
        ]
      })
    } else {
      const counters = await page.$$('.maincounter-number span')

      const infected = parseNumber(await getText(counters[0]))
      const deaths = parseNumber(await getText(counters[1]))
      const recovered = parseNumber(await getText(counters[2]))
      const tested = _.sumBy(rows, (columns) =>
        parseNumber(columns[ColumnIndex.Tested]),
      )

      results = [
        createResult(CounterType.Infected, undefined, infected),
        createResult(CounterType.Deaths, undefined, deaths),
        createResult(CounterType.Recovered, undefined, recovered),
        createResult(CounterType.Tested, undefined, tested),
      ]
    }
  })

  return results
}

export default coronavirus
