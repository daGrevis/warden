import _ from 'lodash'
import { ElementHandle } from 'playwright'

import { Input, JobState } from '../../types'
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
    diff: number
    valueText: string
    diffText: string
  }
}

const isOptionsForCountry = (
  options?: Options,
): options is OptionsForCountry => {
  return options !== undefined && 'country' in options
}

const isOptionsForCountries = (
  options?: Options,
): options is OptionsForCountries => {
  return options !== undefined && 'countries' in options
}

const formatNumber = (number: number) => {
  // https://stackoverflow.com/a/2901298/458610
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const parseNumber = (string: string) => {
  if (!string || string === 'N/A') {
    return 0
  }

  string = string.replace(/,/g, '')

  return _.parseInt(string)
}

const getPreviousNumber = (
  counterType: CounterType,
  country: string | undefined,
  jobState?: JobState,
) => {
  if (!jobState) {
    return undefined
  }

  const maxResult = _.maxBy(
    _.filter(
      jobState.results,
      (result) =>
        result.meta!.counterType === counterType &&
        result.meta!.country === country,
    ),
    (result) => result.meta!.value,
  )

  if (!maxResult) {
    return undefined
  }

  return maxResult.meta!.value
}

const createResult = (
  counterType: CounterType,
  country: string | undefined,
  value: number,
  jobState: JobState | undefined,
): Result => {
  const prevValue = getPreviousNumber(counterType, country, jobState)

  const diff = prevValue ? value - prevValue : 0

  const valueText = formatNumber(value)

  let diffText = formatNumber(diff)
  diffText = diff > 0 ? '+' + diffText : diffText

  return {
    id: JSON.stringify({ counterType, country, value }),
    name: `${valueText} ${counterType}` + (diff ? ` (${diffText})` : ''),
    url: URL,
    meta: {
      counterType,
      country,
      value,
      diff,
      valueText,
      diffText,
    },
  }
}

const getText = async ($: ElementHandle) =>
  $.evaluate(($) => ($ as HTMLElement).innerText!)

const input: Input<Options | undefined> = (options?: Options) => async (
  job,
  jobState,
) => {
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

    if (countries && countries.length > 1) {
      const countryRows = _.filter(rows, (columns) =>
        _.includes(countries, columns[0]),
      )

      results = _.flatMap(countryRows, (columns) => {
        const countryName = columns[0]

        const infected = parseNumber(columns[1])
        const deaths = parseNumber(columns[3])
        const recovered = parseNumber(columns[5])
        const tested = parseNumber(columns[10])

        return [
          createResult(CounterType.Infected, countryName, infected, jobState),
          createResult(CounterType.Deaths, countryName, deaths, jobState),
          createResult(CounterType.Recovered, countryName, recovered, jobState),
          createResult(CounterType.Tested, countryName, tested, jobState),
        ]
      })
    } else {
      const counters = await page.$$('.maincounter-number span')

      const infected = parseNumber(await getText(counters[0]))
      const deaths = parseNumber(await getText(counters[1]))
      const recovered = parseNumber(await getText(counters[2]))
      const tested = _.sumBy(rows, (columns) => parseNumber(columns[10]))

      results = [
        createResult(CounterType.Infected, undefined, infected, jobState),
        createResult(CounterType.Deaths, undefined, deaths, jobState),
        createResult(CounterType.Recovered, undefined, recovered, jobState),
        createResult(CounterType.Tested, undefined, tested, jobState),
      ]
    }
  })

  return results
}

export default input
