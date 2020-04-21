import _ from 'lodash'
import * as schedule from 'node-schedule'
import promiseRetry from 'promise-retry'

import { Config, State, Job, Results } from './types'
import config from './config'

const runInputs = async (job: Job): Promise<Results> =>
  promiseRetry(
    (retry) =>
      (async () => {
        const resultGroups = await Promise.all(
          _.map(job.inputs, (input): Promise<Results> => input(job)),
        )

        let results = _.flatMap(resultGroups, (results, index) => {
          if (resultGroups.length > 1) {
            // Prefix ID with index to avoid duplicates between inputs.
            return _.map(results, (result) => ({
              ...result,
              id: `${index}-${result.id}`,
            }))
          }

          return results
        })

        for (const pipe of job.pipes ?? []) {
          results = await pipe(results)
        }

        return results
      })().catch((e) => {
        console.log(e)
        console.log(`Retrying runInputs for ${job.id}`)

        return retry(e)
      }),
    { ...config?.retry },
  )

const runOutputs = async (job: Job, results: Results): Promise<void> => {
  return promiseRetry(
    (retry) =>
      (async () => {
        if (results.length === 0) {
          return
        }

        await Promise.all(_.map(job.outputs, (output) => output(job, results)))
      })().catch((e) => {
        console.log(e)
        console.log(`Retrying runOutputs for ${job.id}`)

        return retry(e)
      }),
    { ...config?.retry },
  )
}

const checkConfig = (config: Config) => {
  const jobIds = new Set()
  for (const job of config.jobs) {
    if (jobIds.has(job.id)) {
      throw Error(`Job ${job.id} is already defined`)
    }
    jobIds.add(job.id)
  }
}

const main = async () => {
  const state: State = {}

  checkConfig(config)

  for (const job of config.jobs) {
    console.log(`Starting ${job.id}`)

    let startResults: Results = []

    try {
      startResults = await runInputs(job)
    } catch (e) {
      console.log(e)
      console.log(`Could not start ${job.id}`)

      continue
    }

    state[job.id] = {
      results: _.keyBy(startResults, 'id'),
    }

    if (!job.scheduleAt) {
      console.log(`Running ${job.id} at start once`)

      await runOutputs(job, startResults)
    } else {
      console.log(`Scheduling ${job.id} at ${job.scheduleAt}`)

      const schedulerJob = new schedule.Job(job.id, async () => {
        console.log(`Running ${job.id} as scheduled`)

        const results = await runInputs(job)

        const resultsById = _.keyBy(results, 'id')

        const newIds = _.difference(
          _.map(results, 'id'),
          _.map(state[job.id].results, 'id'),
        )

        if (newIds.length === 0) {
          return
        }

        const newResults = _.map(newIds, (id) => resultsById[id])

        await runOutputs(job, newResults)

        state[job.id] = {
          results: {
            ...state[job.id].results,
            ..._.keyBy(newResults, 'id'),
          },
        }
      })

      schedulerJob.schedule({
        rule: job.scheduleAt,
        tz: config.timezone,
      })
    }
  }
}

main()
