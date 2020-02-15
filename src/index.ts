import _ from 'lodash'
import * as schedule from 'node-schedule'

import { Job, InputResults, InputResultsByJob } from './types'
import config from './config'

const runInput = async (job: Job) => job.input()

const runOutputs = async (job: Job, inputResults: InputResults) =>
  Promise.all(_.map(job.outputs, output => output(job, inputResults)))

const main = async () => {
  const inputResultsByJob: InputResultsByJob = {}

  _.forEach(config.jobs, async job => {
    console.log(`starting ${job.id}`)

    const startInputResults = await runInput(job)

    inputResultsByJob[job.id] = _.keyBy(startInputResults, 'id')

    if (job.runOutputsAtStart) {
      console.log(`running ${job.id} at start`)

      await runOutputs(job, startInputResults)
    }

    if (job.scheduleAt) {
      console.log(`scheduling ${job.id} at ${job.scheduleAt}`)

      schedule.scheduleJob(job.scheduleAt, async () => {
        console.log(`running ${job.id}`)

        const previousInputResults = inputResultsByJob[job.id]
        const currentInputResults = _.keyBy(await runInput(job), 'id')

        const newInputResultIds = _.difference(
          _.map(currentInputResults, 'id'),
          _.map(previousInputResults, 'id'),
        )

        if (newInputResultIds.length === 0) {
          return
        }

        const newInputResultsOriginal = _.map(
          newInputResultIds,
          id => currentInputResults[id],
        )

        const newInputResults = _.keyBy(newInputResultsOriginal, 'id')

        inputResultsByJob[job.id] = {
          ...currentInputResults,
          ...newInputResults,
        }

        await runOutputs(job, newInputResultsOriginal)
      })
    }
  })
}

process.on('SIGINT', () => {
  process.exit()
})

main()
