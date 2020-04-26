import fp from 'lodash/fp'

import { Pipe, Result } from '../types'

type Options = {
  get: string | string[] | ((result: Result) => any)
  set: string | string[]
  predicate: (result: Result, prevResult: Result) => boolean
}

const prev: Pipe<Options> = (options: Options) => {
  let prevResults: Result[] = []

  return (results) => {
    const newResults = fp.map((result) => {
      const prevResult = fp.find(
        (prevResult) => options.predicate(result, prevResult),
        prevResults,
      )

      if (!prevResult) {
        return result
      }

      const prevValue =
        typeof options.get === 'function'
          ? options.get(prevResult)
          : fp.get(options.get, prevResult)

      return fp.set(options.set, prevValue, result)
    }, results)

    prevResults = results

    return newResults
  }
}

export default prev
