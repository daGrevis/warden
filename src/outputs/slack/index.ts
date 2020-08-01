import _ from 'lodash'
import axios from 'axios'

import { Output } from '../../types'

const API_ROOT = 'https://slack.com/api'

type Options = {
  token: string
  channel: string
}

type Result = {
  id: string
  name: string
  meta?: {
    blocks?: (Block | undefined)[]
  }
}

type Block = {
  [key: string]: any
  type: string
}

type RequestData = {
  channel: string
  text: string
  blocks?: Block[]
}

const slack: Output<Options> = (options: Options) => async (job, results) => {
  const sendMessage = (result: Result) => {
    const data: RequestData = {
      channel: options.channel,
      text: result.name,
    }

    if (result.meta?.blocks) {
      data.blocks = _.compact(result.meta!.blocks)
    }

    return axios.post(`${API_ROOT}/chat.postMessage`, data, {
      headers: {
        Authorization: `Bearer ${options.token}`,
      },
    })
  }

  for (const result of results) {
    const response = await sendMessage(result)

    if (response.status !== 200 || !response.data?.ok) {
      console.log(response)
      throw Error('Could not send message via outputs/slack')
    }
  }
}

export default slack
