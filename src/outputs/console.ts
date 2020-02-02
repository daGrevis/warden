import * as _ from 'lodash'

import { InputResults } from '../types'

export default () => async (inputResults: InputResults) => {
  console.log(`new IDs: ${_.map(inputResults, 'id').join(', ')}`)
}
