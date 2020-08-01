# slack

Send messages to Slack channel.

Optionally use `meta.blocks` for customizing messages via [Block Kit](https://api.slack.com/block-kit).

## Examples

### Send to #general

```ts
slack({
  token: process.env.SLACK_TOKEN,
  channel: '#general',
})
```

### Custom Markdown and Image via meta.blocks

```ts
import map from './pipes/map'

const job = {
  pipes: [
    map({
      to: (result) => ({
        ...result,
        meta: {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: result.name,
              },
            },
            {
              type: 'image',
              image_url: result.imageUrl,
              alt_text: 'image',
            },
          ],
        },
      }),
    }),
  ],
  outputs: [
    slack({
      token: process.env.SLACK_TOKEN,
      channel: '#general',
    }),
  ],
}
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
