import _ from 'lodash'

import { Config } from './types'
import staticInput from './inputs/static'
import consoleOutput from './outputs/console'

const config: Config = {
  jobs: [
    {
      id: '3-heartbeats',
      name: '3 Heartbeats (1 bpm)',
      scheduleAt: '* * * * *',
      inputs: [
        staticInput({
          data: [
            [],
            [
              {
                id: '1',
                url: 'https://example.com/1.html',
                name: 'First',
              },
            ],
            [
              {
                id: '2',
                url: 'https://example.com/2.html',
                name: 'Second',
              },
            ],
            [
              {
                id: '3',
                url: 'https://example.com/3.html',
                name: 'Third',
              },
            ],
          ],
        }),
      ],
      outputs: [consoleOutput()],
    },
  ],
}

export default config
