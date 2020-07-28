import fp from 'lodash/fp'

import { Pipe } from '../types'

type Options = {
  start?: number
  end?: number
}

const slice: Pipe<Options> = (options: Options) => (xs) =>
  fp.slice(options.start ?? 0, options.end ?? xs.length)(xs)

export default slice
