import * as _ from 'lodash'
import * as schedule from 'node-schedule'

import { InputResultsByJob } from './types'
import config from './config'

const main = async () => {
  const inputResultsByJob: InputResultsByJob = {}

  _.forEach(config.jobs, async job => {
    console.log(`starting ${job.id}`)

    inputResultsByJob[job.id] = _.keyBy(await job.input(), 'id')

    if (job.scheduleAt) {
      console.log(`scheduling ${job.id} at ${job.scheduleAt}`)

      schedule.scheduleJob(job.scheduleAt, async () => {
        console.log(`running ${job.id}`)

        const previousInputResults = inputResultsByJob[job.id]
        const currentInputResults = _.keyBy(await job.input(), 'id')

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

        inputResultsByJob[job.id] = { ...currentInputResults, ...newInputResults }

        _.forEach(job.outputs, output => {
          output(job, newInputResultsOriginal)
        })
      })
    }
  })
}

process.on('SIGINT', () => {
  process.exit()
})

main()
