import * as _ from 'lodash'
import * as schedule from 'node-schedule'

import { Config, InputResultsByJob } from './types'
import dummyInput from './inputs/dummy'
import lobstersInput from './inputs/lobsters'
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
    {
      id: 'lobsters',
      scheduleAt: '* * * * *',
      input: lobstersInput({ scoreThreshold: 25 }),
      outputs: [consoleOutput()],
    },
  ],
}

const main = async () => {
  const inputResultsByJob: InputResultsByJob = {}

  _.forEach(config.jobs, async job => {
    console.log(`initiating ${job.id}`)

    inputResultsByJob[job.id] = _.keyBy(await job.input(), 'id')

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
        output(newInputResultsOriginal)
      })
    })
  })
}

process.on('SIGINT', () => {
  process.exit()
})

main()
