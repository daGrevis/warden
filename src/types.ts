type OptionalArgs<T> = T extends undefined ? [] : [T]

interface Input<Options = undefined> {
  (...args: OptionalArgs<Options>): () => Promise<InputResults>
}

type InputResult = {
  id: string
  url: string
  name: string
  score?: number
}

type InputResults = InputResult[]

type InputResultsByJob = {
  [jobId: string]: { [resultId: string]: InputResult }
}

interface Output<Options = undefined> {
  (...args: OptionalArgs<Options>): (
    job: Job,
    inputResults: InputResults,
  ) => Promise<void>
}

type Job = {
  id: string
  scheduleAt: string | null
  input: ReturnType<Input>
  outputs: ReturnType<Output>[]
}

type Config = {
  driver?: {
    browser?: 'chrome' | 'firefox'
    headless?: boolean
  }
  jobs: Job[]
}

export {
  Input,
  InputResult,
  InputResults,
  InputResultsByJob,
  Output,
  Job,
  Config,
}
