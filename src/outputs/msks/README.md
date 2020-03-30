# msks

Send messages to IRC server via [msks API](https://github.com/daGrevis/msks).

## Options

#### apiRoot
- _string_

API root like `https://dagrev.is/msks/api` without trailing slash.

#### sessionId
- _string_

Session ID for authentication.

#### token
- _string_

Token for authentication.

#### connectionId
- _string_

Connection ID of IRC server.

#### channelName
- _string_

Channel name or nick where messages will be sent to.

#### getTexts?
- _(results: Results) => string[]_

Optional hook for modifying what texts are sent.

Defaults to sending `name` of each result as is.

## Examples

```ts
import _ from 'lodash'

import { Config } from './types'
import dumb from './inputs/dumb'
import lobsters from './inputs/lobsters'
import msks from './outputs/msks'
import withOptions from './withOptions'

const myMsks = withOptions(msks, {
  apiRoot: 'https://dagrev.is/msks/api',
  sessionId: process.env.MSKS_SESSION_ID,
  token: process.env.MSKS_TOKEN,
  connectionId: process.env.MSKS_CONNECTION_ID,
})

const config: Config = {
  jobs: [
    {
      id: 'hello-world-to-msks',
      name: 'Hello World to Msks',
      inputs: [dumb({ data: [[{ id: '1', name: 'Hello, world!' }]] })],
      outputs: [
        myMsks({
          channelName: '#meeseekeria',
        }),
      ],
    },

    {
      id: 'lobsters-newest-to-msks',
      name: 'Lobsters Newest to Msks',
      scheduleAt: '*/5 * * * *',
      inputs: [lobsters({ section: 'newest' })],
      outputs: [
        myMsks({
          channelName: '#meeseekeria',
          getTexts: results =>
            _.map(results, result => `${result.name} ${result.url}`),
        }),
      ],
    },

    {
      id: 'lobsters-top-to-msks',
      name: 'Lobsters Top to Msks',
      scheduleAt: '0 * * *',
      inputs: [lobsters()],
      outputs: [
        myMsks({
          channelName: '#meeseekeria',
          getTexts: results => {
            const topResult = _.maxBy(results, result => result.extra?.score)!
            return ['Top from Lobsters:', `${topResult.name} ${topResult.url}`]
          },
        }),
      ],
    },
  ],
}

export default config
```
