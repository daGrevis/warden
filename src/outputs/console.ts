import _ from 'lodash'

import { Output } from '../types'

const output: Output = () => async (job, inputResults) => {
  if (inputResults.length === 0) {
    return
  }

  console.log(job.id, inputResults)
}

export default output
