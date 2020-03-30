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
myMsks({
  channelName: '#meeseekeria',
  getTexts: results =>
    _.map(results, result => `${result.name} ${result.url}`),
})
```

### Prepend Message

```ts
myMsks({
  channelName: '#meeseekeria',
  getTexts: results =>
    ['Results:', ...results.map(result => result.name)],
})
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

#### getTexts?
- _(results: Results) => string[]_

Optional hook for modifying what texts are sent.

Defaults to sending `name` of each result as is.
