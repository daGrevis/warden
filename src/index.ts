import _ from 'lodash'
import * as schedule from 'node-schedule'

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

  for (const job of config.jobs) {
    console.log(`Starting ${job.id}`)

    const startResults = await runInputs(job, state[job.id])

    state[job.id] = {
      results: _.keyBy(startResults, 'id'),
    }

    if (!job.scheduleAt) {
      console.log(`Running ${job.id} at start once`)

      await runOutputs(job, startResults)
    } else {
      console.log(`Scheduling ${job.id} at ${job.scheduleAt}`)

      schedule.scheduleJob(job.scheduleAt, async () => {
        console.log(`Running ${job.id} as scheduled`)

        const results = await runInputs(job, state[job.id])

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

        await runOutputs(job, newResults)
      })
    }
  }
}

process.on('SIGINT', () => {
  process.exit()
})

main()
