import _ from 'lodash'
import * as schedule from 'node-schedule'
import promiseRetry from 'promise-retry'

import { Config, State, Job, Results } from './types'
import config from './config'

const runInputs = async (job: Job): Promise<Results> =>
  promiseRetry(
    (retry) =>
      (async () => {
        console.log(`Running inputs for ${job.id}`)
        const resultGroups = await Promise.all(
          _.map(job.inputs, (input): Promise<Results> => input(job)),
        )
        console.log(`Ran inputs for ${job.id}`)

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

        console.log(`Running pipes for ${job.id}`)
        for (const pipe of job.pipes ?? []) {
          results = await pipe(results)
        }
        console.log(`Ran pipes for ${job.id}`)

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

        console.log(`Running outputs for ${job.id}`)
        await Promise.all(_.map(job.outputs, (output) => output(job, results)))
        console.log(`Ran outputs for ${job.id}`)
      })().catch((e) => {
        console.log(e)
        console.log(`Retrying runOutputs for ${job.id}`)

        return retry(e)
      }),
    { ...config?.retry },
  )
}

const checkConfig = (config: Config) => {
  const { jobs } = config

  if (jobs.length === 0) {
    console.log('Error: No jobs to run, nothing to do')
    process.exit(1)
  }

  const jobIds = new Set()
  for (const job of jobs) {
    if (jobIds.has(job.id)) {
      console.log(`Error: Job ${job.id} is already defined`)
      process.exit(1)
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
      console.log(`Ran ${job.id} at start`)
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
