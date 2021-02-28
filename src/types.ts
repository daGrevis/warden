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

interface Pipe<Options = undefined> {
  (...args: OptionalArgs<Options>): (
    results: Results,
  ) => Promise<Results> | Results
}

type PipeReturn = ReturnType<Pipe>

interface Input<Options = undefined> {
  (...args: OptionalArgs<Options>): (job: Job) => Promise<Results> | Results
}

type InputReturn = ReturnType<Input>

interface Output<Options = undefined> {
  (...args: OptionalArgs<Options>): (
    job: Job,
    results: Results,
  ) => Promise<void> | void
}

type OutputReturn = ReturnType<Output>

type Job = {
  id: string
  name: string
  runNow?: boolean
  scheduleAt?: string
  inputs: (InputReturn | [InputReturn, ...PipeReturn[]])[]
  pipes?: PipeReturn[]
  outputs: (OutputReturn | [OutputReturn, ...PipeReturn[]])[]
}

type Config = {
  timezone?: string
  browser?: {
    driver?: 'webkit' | 'firefox' | 'chromium'
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

export {
  State,
  JobState,
  Result,
  Results,
  Pipe,
  PipeReturn,
  Input,
  InputReturn,
  Output,
  OutputReturn,
  Job,
  Config,
}
