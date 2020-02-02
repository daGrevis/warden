type Input = () => () => Promise<InputResults>

type InputResult = {
  id: string
  url: string
  name: string
}

type InputResults = { [id: string]: InputResult }

type InputResultsByJob = { [jobId: string]: InputResults }

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
