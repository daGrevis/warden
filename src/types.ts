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

interface Pipe {
  (results: Results): Promise<Results> | Results
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
  pipes?: Pipe[]
  outputs: ReturnType<Output>[]
}

type Config = {
  timezone?: string
  browser?: {
    timeout?: number
    headless?: boolean
    slowMo?: number
    debug?: boolean
  }
  retry?: {
    retries?: number
    factor?: number
    minTimeout?: number
    maxTimeout?: number
    randomize?: boolean
  }
  jobs: Job[]
}

export { State, JobState, Input, Result, Results, Pipe, Output, Job, Config }
