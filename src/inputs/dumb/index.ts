import { Input, Results } from '../../types'

type Options = {
  data?: Results[]
}

const input: Input<Options | undefined> = (options?: Options) => {
  let index = -1

  return async () => {
    index += 1

    const data = options?.data

    if (!data) {
      return []
    }

    return data[index] ?? []
  }
}

export default input
