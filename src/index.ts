import _ from 'lodash'
import * as schedule from 'node-schedule'

import { State, Job, Results } from './types'
import config from './config'

const runInputs = async (job: Job) => {
  const results = await Promise.all(
    _.map(job.inputs, (input): Promise<Results> => input(job)),
  )
  return _.uniqBy(_.flatten(results), 'id')
}

const runOutputs = async (job: Job, results: Results) =>
  Promise.all(_.map(job.outputs, output => output(job, results)))

const main = async () => {
  const state: State = {}

  for (const job of config.jobs) {
    console.log(`starting ${job.id}`)

    const startResults = await runInputs(job)

    state[job.id] = {
      results: _.keyBy(startResults, 'id'),
    }

    if (job.runOutputsAtStart) {
      console.log(`running ${job.id} at start`)

      await runOutputs(job, startResults)
    }

    if (job.scheduleAt) {
      console.log(`scheduling ${job.id} at ${job.scheduleAt}`)

      schedule.scheduleJob(job.scheduleAt, async () => {
        console.log(`running ${job.id}`)

        const results = await runInputs(job)

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
