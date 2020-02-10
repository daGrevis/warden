type Input<Options = undefined> = (
  options: Options,
) => () => Promise<InputResults>

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

type Output = () => (job: Job, inputResults: InputResults) => Promise<void>

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
