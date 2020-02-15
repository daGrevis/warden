type OptionalArgs<T> = T extends undefined ? [] : [T]

interface Input<Options = undefined> {
  (...args: OptionalArgs<Options>): () => Promise<InputResults>
}

type InputResult = {
  id: string
  url: string
  name: string
  description?: string
  imageUrl?: string
  extra?: { [key: string]: any }
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
  name: string
  scheduleAt: string | null
  input: ReturnType<Input>
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
  InputResult,
  InputResults,
  InputResultsByJob,
  Output,
  Job,
  Config,
}
