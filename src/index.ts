import _ from 'lodash'
import * as schedule from 'node-schedule'
import promiseRetry from 'promise-retry'

import {
  Config,
  State,
  Job,
  Results,
  PipeReturn,
  InputReturn,
  OutputReturn,
} from './types'
import config from './config'

const isInput = (input: Job['inputs'][0]): input is InputReturn =>
  _.isFunction(input)

const isOutput = (output: Job['outputs'][0]): output is OutputReturn =>
  _.isFunction(output)

const runPipes = async (results: Results, pipes: PipeReturn[]) => {
  for (const pipe of pipes) {
    results = await pipe(results)
  }

  return results
}

const runInputs = async (job: Job): Promise<Results> =>
  promiseRetry(
    (retry) =>
      (async () => {
        console.log(`Running inputs for ${job.id}`)
        const resultGroups = await Promise.all(
          _.map(job.inputs, async (inputConfig) => {
            let input
            let pipes: PipeReturn[] = []

            if (isInput(inputConfig)) {
              input = inputConfig
              pipes = []
            } else {
              input = inputConfig[0]
              pipes = _.slice(inputConfig, 1) as PipeReturn[]
            }

            let results = await input(job)

            if (pipes.length) {
              console.log(`Running pipes for ${job.id} input`)
              results = await runPipes(results, pipes)
              console.log(`Ran pipes for ${job.id} input`)
            }

            return results
          }),
        )
        console.log(`Ran inputs for ${job.id}`)

        let results = _.flatMap(resultGroups, (results, index) => {
          if (resultGroups.length) {
            // Prefix ID with index to avoid duplicates between inputs.
            return _.map(results, (result) => ({
              ...result,
              id: `${index}-${result.id}`,
            }))
          }

          return results
        })

        if (job.pipes) {
          console.log(`Running pipes for ${job.id}`)
          results = await runPipes(results, job.pipes)
          console.log(`Ran pipes for ${job.id}`)
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
        if (!results.length) {
          return
        }

        console.log(`Running outputs for ${job.id}`)
        await Promise.all(
          _.map(job.outputs, async (outputConfig) => {
            let output
            let pipes: PipeReturn[] = []

            if (isOutput(outputConfig)) {
              output = outputConfig
              pipes = []
            } else {
              output = outputConfig[0]
              pipes = _.slice(outputConfig, 1) as PipeReturn[]
            }

            if (pipes.length) {
              console.log(`Running pipes for ${job.id} output`)
              results = await runPipes(results, pipes)
              console.log(`Ran pipes for ${job.id} output`)
            }

            if (!results.length) {
              return
            }

            await output(job, results)
          }),
        )
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

  if (!jobs.length) {
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

    if (job.runNow || !job.scheduleAt) {
      console.log(`Running ${job.id} at start once`)

      await runOutputs(job, startResults)
      console.log(`Ran ${job.id} at start`)
    }
    if(job.scheduleAt) {
      console.log(`Scheduling ${job.id} at ${job.scheduleAt}`)

      const schedulerJob = new schedule.Job(job.id, async () => {
        console.log(`Running ${job.id} as scheduled`)

        const results = await runInputs(job)

        const resultsById = _.keyBy(results, 'id')

        const newIds = _.difference(
          _.map(results, 'id'),
          _.map(state[job.id].results, 'id'),
        )

        if (!newIds.length) {
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
