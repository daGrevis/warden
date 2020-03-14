import _ from 'lodash'
import * as schedule from 'node-schedule'
import promiseRetry from 'promise-retry'

import { Config, State, JobState, Job, Results } from './types'
import config from './config'

const runInputs = async (job: Job, jobState?: JobState) => {
  const allResults = await Promise.all(
    _.map(job.inputs, (input): Promise<Results> => input(job, jobState)),
  )

  return _.flatMap(allResults, (results, index) => {
    return _.map(results, result => ({
      ...result,
      // Prefix ID to avoid duplicates between inputs.
      id: `${index}-${result.id}`,
    }))
  })
}

const runOutputs = async (job: Job, results: Results) => {
  let filteredResults = results
  for (const filter of job.filters ?? []) {
    filteredResults = await filter(filteredResults)
  }

  if (filteredResults.length === 0) {
    return
  }

  await Promise.all(_.map(job.outputs, output => output(job, filteredResults)))
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

  const retryConfig = {
    ...config?.retry,
  }

  for (const job of config.jobs) {
    console.log(`Starting ${job.id}`)

    let startResults: Results = []

    try {
      startResults = await promiseRetry(
        retry =>
          runInputs(job, state[job.id]).catch(e => {
            console.log(e)
            console.log(`Retrying runInputs for ${job.id}`)

            return retry(e)
          }),
        retryConfig,
      )
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

      await promiseRetry(
        retry =>
          runOutputs(job, startResults).catch(e => {
            console.log(e)
            console.log(`Retrying runOutputs for ${job.id}`)

            return retry(e)
          }),
        retryConfig,
      )
    } else {
      console.log(`Scheduling ${job.id} at ${job.scheduleAt}`)

      schedule.scheduleJob(job.scheduleAt, async () => {
        console.log(`Running ${job.id} as scheduled`)

        const results = await promiseRetry(
          retry =>
            runInputs(job, state[job.id]).catch(e => {
              console.log(e)
              console.log(`Retrying runInputs for ${job.id}`)

              return retry(e)
            }),
          retryConfig,
        )

        const resultsById = _.keyBy(results, 'id')

        const newIds = _.difference(
          _.map(results, 'id'),
          _.map(state[job.id].results, 'id'),
        )

        if (newIds.length === 0) {
          return
        }

        const newResults = _.map(newIds, id => resultsById[id])

        state[job.id] = {
          results: {
            ...resultsById,
            ..._.keyBy(newResults, 'id'),
          },
        }

        await promiseRetry(
          retry =>
            runOutputs(job, newResults).catch(e => {
              console.log(e)
              console.log(`Retrying runOutputs for ${job.id}`)

              return retry(e)
            }),
          retryConfig,
        )
      })
    }
  }
}

main()
