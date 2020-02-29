import _ from 'lodash'
import { ElementHandle } from 'playwright'

import { Input, JobState } from '../types'
import withBrowser from '../withBrowser'

enum CounterType {
  Cases = 'cases',
  Deaths = 'deaths',
  Recovered = 'recovered',
}

type Result = {
  id: string
  name: string
  meta?: {
    type: CounterType
    value: number
  }
}

const getNumberFrom$Counter = async ($counter: ElementHandle) => {
  let text = await $counter.evaluate($ => ($ as HTMLSpanElement).innerText!)

  text = text.replace(',', '')

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

  return {
    id: `${counterType}-${value}`,
    name: `${value} ${counterType}` + (diff ? ` (+${diff})` : ''),
    meta: {
      type: counterType,
      value,
    },
  }
}

const input: Input = () => async (job, jobState) => {
  let results: Result[] = []

  await withBrowser(async ({ page }) => {
    await page.goto('https://www.worldometers.info/coronavirus/')

    const [$casesCounter, $deathsCounter, $recoveredCounter] = await page.$$(
      '.maincounter-number span',
    )

    results = [
      createResult(
        CounterType.Cases,
        await getNumberFrom$Counter($casesCounter),
        await getPreviousNumber(CounterType.Cases, jobState),
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
