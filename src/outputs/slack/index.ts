import _ from 'lodash'
import axios from 'axios'

import { Output } from '../../types'

const API_ROOT = 'https://slack.com/api'

type Options = {
  token: string
  channel: string
}

const slack: Output<Options> = (options: Options) => async (job, results) => {
  const sendMessage = (text: string) =>
    axios.post(
      `${API_ROOT}/chat.postMessage`,
      {
        channel: options.channel,
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${options.token}`,
        },
      },
    )

  const texts = _.map(results, (result) => result.name)

  for (const text of texts) {
    await sendMessage(text)
  }
}

export default slack
