# discord

Send message to Discord channel.

## Examples

### Send to #general

```ts
discord({
  token: process.env.DISCORD_TOKEN,
  channelId: '123456789000000000',
})
```

## Options

#### token
- _string_

Bot token from Discord app.

Create a Discord app & bot, get the bot token and add the bot to your servers.

See more on [Discord docs](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot).

#### channelId
- _string_

Channel ID, not name. You can extract the channel ID from channel link.
