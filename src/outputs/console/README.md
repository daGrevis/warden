# console

Print results with job ID to console.

## Options

None.

## Examples

```ts
import _ from 'lodash'

import { Config } from './types'
import staticInput from './inputs/static'
import lobstersInput from './inputs/lobsters'
import consoleOutput from './outputs/console'

const config: Config = {
  jobs: [
    {
      id: 'hello-world-to-console',
      name: 'Hello World to Console',
      inputs: [staticInput({ data: [[{ id: '1', name: 'Hello, world!' }]] })],
      outputs: [consoleOutput()],
    },

    {
      id: 'lobsters-to-console',
      name: 'Lobsters to Console',
      scheduleAt: '0 * * * *',
      inputs: [lobstersInput()],
      outputs: [consoleOutput()],
    },
  ],
}

export default config
```
