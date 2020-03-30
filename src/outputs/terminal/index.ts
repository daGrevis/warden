import util from 'util'

import _ from 'lodash'

import { Output } from '../../types'

const output: Output = () => async (job, results) => {
  console.log(
    job.id,
    util.inspect(results, {
      depth: null,
      colors: true,
    }),
  )
}

export default output
