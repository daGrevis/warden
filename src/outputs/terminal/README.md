# terminal

Print job ID with results to standard output.

## Options

None.

## Examples

```ts
import _ from 'lodash'

import { Config } from './types'
import dumb from './inputs/dumb'
import lobsters from './inputs/lobsters'
import terminal from './outputs/terminal'

const config: Config = {
  jobs: [
    {
      id: 'hello-world-to-terminal',
      name: 'Hello World to Terminal',
      inputs: [dumb({ data: [[{ id: '1', name: 'Hello, world!' }]] })],
      outputs: [terminal()],
    },

    {
      id: 'lobsters-to-terminal',
      name: 'Lobsters to Terminal',
      scheduleAt: '0 * * * *',
      inputs: [lobsters()],
      outputs: [terminal()],
    },
  ],
}

export default config
```
