import _ from 'lodash'

import { Output } from '../types'

const output: Output = () => async (job, results) => {
  if (results.length === 0) {
    return
  }

  console.log(job.id, results)
}

export default output
