import _ from 'lodash'

import { Config } from './types'
import dumb from './inputs/dumb'
import terminal from './outputs/terminal'

const config: Config = {
  jobs: [
    {
      id: '3-heartbeats',
      name: '3 Heartbeats (1 bpm)',
      scheduleAt: '* * * * *',
      inputs: [
        dumb({
          data: [
            [],
            [{ id: '1', name: 'First' }],
            [{ id: '2', name: 'Second' }],
            [{ id: '3', name: 'Third' }],
          ],
        }),
      ],
      outputs: [terminal()],
    },

    // TODO: Add your jobs here...
  ],
}

export default config
