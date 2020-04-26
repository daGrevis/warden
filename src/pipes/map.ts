import fp from 'lodash/fp'

import { Pipe, Result } from '../types'

type Options = {
  to: (result: Result) => Result
}

const map: Pipe<Options> = (options: Options) => fp.map(options.to)

export default map
