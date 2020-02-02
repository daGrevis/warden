type Input<Options = undefined> = (
  options?: Options,
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

type Output = () => (inputResults: InputResults) => Promise<void>

type Job = {
  id: string
  scheduleAt: string
  input: ReturnType<Input>
  outputs: ReturnType<Output>[]
}

type Config = {
  driverBrowser: string
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
