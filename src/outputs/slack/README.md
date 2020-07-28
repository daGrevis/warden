# slack

Send messages to Slack channel.

## Examples

### Send to #general

```ts
mySlack({
  token: process.env.SLACK_TOKEN,
  channel: '#general',
})
```

## Options

#### token
- _string_

Bot user OAuth access token from Slack app.

#### channel
- _string_

Channel name or ID.
