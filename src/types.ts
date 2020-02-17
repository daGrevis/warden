type OptionalArgs<T> = T extends undefined ? [] : [T]

interface Input<Options = undefined> {
  (...args: OptionalArgs<Options>): (job: Job) => Promise<Results>
}

type Result = {
  id: string
  url: string
  name: string
  description?: string
  imageUrl?: string
  extra?: { [key: string]: any }
}

type Results = Result[]

type State = {
  [jobId: string]: JobState
}

type JobState = {
  results: { [resultId: string]: Result }
}

interface Output<Options = undefined> {
  (...args: OptionalArgs<Options>): (
    job: Job,
    results: Results,
  ) => Promise<void>
}

type Job = {
  id: string
  name: string
  scheduleAt: string | null
  inputs: ReturnType<Input>[]
  outputs: ReturnType<Output>[]
  runOutputsAtStart?: boolean
}

type Config = {
  driver?: {
    browser?: 'chrome' | 'firefox'
    headless?: boolean
  }
  jobs: Job[]
}

export {
  OptionalArgs,
  Input,
  Result,
  Results,
  State,
  JobState,
  Output,
  Job,
  Config,
}
