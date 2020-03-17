import _ from 'lodash'

import { Output } from '../../types'

const output: Output = () => async (job, results) => {
  console.log(job.id, results)
}

export default output
