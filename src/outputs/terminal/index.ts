import util from 'util'

import _ from 'lodash'

import { Output } from '../../types'

const terminal: Output = () => async (job, results) => {
  console.log(
    job.id,
    util.inspect(results, {
      depth: null,
      colors: true,
    }),
  )
}

export default terminal
