import * as _ from 'lodash'
import * as schedule from 'node-schedule'

import { Config, InputResultsByJob } from './types'
import dummyInput from './inputs/dummy'
import consoleOutput from './outputs/console'

const config: Config = {
  driverBrowser: 'firefox',
  jobs: [
    {
      id: 'dummy',
      scheduleAt: '* * * * *',
      input: dummyInput(),
      outputs: [consoleOutput()],
    },
  ],
}

const main = async () => {
  const inputResultsByJob: InputResultsByJob = {}

  _.forEach(config.jobs, async job => {
    console.log(`initiating ${job.id}`)

    inputResultsByJob[job.id] = await job.input()

    schedule.scheduleJob(job.scheduleAt, async () => {
      console.log(`running ${job.id}`)

      const previousInputResults = inputResultsByJob[job.id]
      const currentInputResults = await job.input()

      const newInputResultIds = _.difference(
        _.map(currentInputResults, 'id'),
        _.map(previousInputResults, 'id'),
      )

      if (newInputResultIds.length === 0) {
        return
      }

      const newInputResults = _.keyBy(
        _.map(newInputResultIds, id => currentInputResults[id]),
        'id',
      )

      inputResultsByJob[job.id] = { ...currentInputResults, ...newInputResults }

      _.forEach(job.outputs, output => {
        output(newInputResults)
      })
    })
  })
}

main()
