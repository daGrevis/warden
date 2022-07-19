import _ from 'lodash'
import { Client, IntentsBitField, TextChannel } from 'discord.js'

import { Output } from '../../types'
import assert from '../../assert'

type Options = {
  token: string
  channelId: string
}

const discord: Output<Options> = (options: Options) => (_job, results) =>
  new Promise((resolve, reject) => {
    const client = new Client({ intents: [IntentsBitField.Flags.Guilds] })

    client.on('error', (e) => {
      reject(e)
    })

    client.on('ready', async () => {
      const channel = client.channels.cache.get(
        options.channelId,
      ) as TextChannel

      assert(channel, `Channel ${options.channelId} not found!`)

      for (const result of results) {
        await channel.send(result.name)
      }

      resolve()
    })

    client.login(options.token)
  })

export default discord
