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

Create a Slack app, go to "OAuth & Permissions" and add these bot token scopes:

* `chat:write`
* `chat:write.public`

Then install the app to workspace to obtain the bot user OAuth access token.

#### channel
- _string_

Channel name or ID. See more on [Slack docs](https://api.slack.com/methods/chat.postMessage).
