type State = {
  [jobId: string]: JobState
}

type JobState = {
  results: { [resultId: string]: Result }
}

type Result = {
  id: string
  name: string
  url?: string
  description?: string
  imageUrl?: string
  extra?: { [key: string]: any }
  meta?: { [key: string]: any }
}

type Results = Result[]

type OptionalArgs<T> = T extends undefined ? [] : [T]

interface Input<Options = undefined> {
  (...args: OptionalArgs<Options>): (
    job: Job,
    jobState?: JobState,
  ) => Promise<Results>
}

interface Filter {
  (results: Results): Promise<Results>
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
  scheduleAt?: string
  inputs: ReturnType<Input>[]
  filters?: Filter[]
  outputs: ReturnType<Output>[]
}

type Config = {
  browser?: {
    headless?: boolean
    slowMo?: number
    debug?: boolean
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
