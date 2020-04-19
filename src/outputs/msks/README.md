# msks

Send messages to IRC server via [msks API](https://github.com/daGrevis/msks).

## Examples

### withOptions Helper

```ts
import msks from './outputs/msks'
import withOptions from './withOptions'

const myMsks = withOptions(msks, {
  apiRoot: 'https://dagrev.is/msks/api',
  sessionId: process.env.MSKS_SESSION_ID,
  token: process.env.MSKS_TOKEN,
  connectionId: process.env.MSKS_CONNECTION_ID,
})
```

### Send Message

```ts
myMsks({
  channelName: '#meeseekeria',
})
```

### Send Name & URL

```ts
import fp from 'lodash/fp'

const job = {
  pipes: [
    fp.map((result) => ({ ...result, name: `${result.name} ${result.url}` })),
  ],
  outputs: [
    myMsks({ channelName: '#meeseekeria' }),
  ],
}
```

### Prepend Message

```ts
import fp from 'lodash/fp'

const job = {
  pipes: [
    fp.concat({ id: '', name: 'Results:' }),
  ],
  outputs: [
    myMsks({ channelName: '#meeseekeria' }),
  ],
}
```

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
