import fp from 'lodash/fp'

import { Pipe, Result } from '../types'

type Options = {
  by: string | { [key: string]: string } | ((result: Result) => boolean)
}

const filter: Pipe<Options> = (options: Options) => fp.filter(options.by)

export default filter
