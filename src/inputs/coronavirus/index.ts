import _ from 'lodash'
import { ElementHandle } from 'playwright'

import { Input, JobState } from '../../types'
import withBrowser from '../../withBrowser'

const URL = 'https://www.worldometers.info/coronavirus/'

type Options = {
  country?: string
}

enum CounterType {
  Infected = 'infected',
  Deaths = 'deaths',
  Recovered = 'recovered',
}

type Result = {
  id: string
  name: string
  url: string
  meta?: {
    type: CounterType
    value: number
    diff: number
    valueText: string
    diffText: string
  }
}

const formatNumber = (number: number) => {
  // https://stackoverflow.com/a/2901298/458610
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getNumberFrom$Counter = async ($counter: ElementHandle) => {
  let text = await $counter.evaluate($ => ($ as HTMLSpanElement).innerText!)

  if (!text) {
    return 0
  }

  text = text.replace(/,/g, '')

  return _.parseInt(text)
}

const getPreviousNumber = async (
  counterType: CounterType,
  jobState?: JobState,
) => {
  if (!jobState) {
    return undefined
  }

  const maxResult = _.maxBy(
    _.filter(jobState.results, result => result.meta!.type === counterType),
    result => result.meta!.value,
  )

  if (!maxResult) {
    return undefined
  }

  return maxResult.meta!.value
}

const createResult = (
  counterType: CounterType,
  value: number,
  prevValue?: number,
): Result => {
  const diff = prevValue ? value - prevValue : 0

  const valueText = formatNumber(value)
  const diffText = formatNumber(diff)

  return {
    id: `${counterType}-${value}`,
    name:
      `${valueText} ${counterType}` +
      (diff ? ` (${diff > 0 ? '+' + diffText : diffText})` : ''),
    url: URL,
    meta: {
      type: counterType,
      value,
      diff,
      valueText,
      diffText,
    },
  }
}

const input: Input<Options | undefined> = (options?: Options) => async (
  job,
  jobState,
) => {
  let results: Result[] = []

  await withBrowser(async ({ page }) => {
    await page.goto(URL)

    let $infectedCounter
    let $deathsCounter
    let $recoveredCounter

    if (options?.country) {
      await page.type(
        '#main_table_countries_today_filter input',
        options.country,
      )

      const $row = await page.$(
        '#main_table_countries_today tr.even, #main_table_countries_today tr.odd',
      )

      const columns = await $row!.$$('td')

      $infectedCounter = columns[1]
      $deathsCounter = columns[3]
      $recoveredCounter = columns[5]
    } else {
      const counters = await page.$$('.maincounter-number span')

      $infectedCounter = counters[0]
      $deathsCounter = counters[1]
      $recoveredCounter = counters[2]
    }

    results = [
      createResult(
        CounterType.Infected,
        await getNumberFrom$Counter($infectedCounter),
        await getPreviousNumber(CounterType.Infected, jobState),
      ),
      createResult(
        CounterType.Deaths,
        await getNumberFrom$Counter($deathsCounter),
        await getPreviousNumber(CounterType.Deaths, jobState),
      ),
      createResult(
        CounterType.Recovered,
        await getNumberFrom$Counter($recoveredCounter),
        await getPreviousNumber(CounterType.Recovered, jobState),
      ),
    ]
  })

  return results
}

export default input
