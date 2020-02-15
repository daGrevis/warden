import { Input, InputResults } from '../types'

let index = -1

type Options = {
  data?: InputResults[]
}

const input: Input<Options | undefined> = (options?: Options) => async () => {
  index += 1

  const data = options?.data

  if (!data) {
    return []
  }

  return data[index] ?? []
}

export default input
