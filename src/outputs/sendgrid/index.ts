import fs from 'fs'
import path from 'path'

import _ from 'lodash'

import sendgridMail from '@sendgrid/mail'
import handlebars from 'handlebars'
import mjml2html from 'mjml'

import { Output } from '../../types'

type Options = {
  apiKey: string
  sender: string
  recipients: string[]
  template?: string
  asMjml?: boolean
  debug?: boolean
}

const FILE_OPTIONS = {
  encoding: 'utf8' as const,
}

const MJML_OPTIONS = {
  validationLevel: 'strict' as const,
  keepComments: false,
  minify: true,
}

const sendgrid: Output<Options> = (options: Options) => async (
  job,
  results,
) => {
  const { apiKey, sender, recipients, debug } = options
  const template = options.template ?? './template.html'
  const asMjml = options.asMjml ?? options.template === undefined

  sendgridMail.setApiKey(apiKey)

  const templateFile = await fs.promises.readFile(
    path.resolve(__dirname, template),
    FILE_OPTIONS,
  )

  let html = handlebars.compile(templateFile)({ job, results })

  if (asMjml) {
    const mjmlResult = mjml2html(html, MJML_OPTIONS)

    html = mjmlResult.html
  }

  if (debug) {
    await fs.promises.writeFile(
      path.resolve(__dirname, './debug-template.html'),
      html,
      FILE_OPTIONS,
    )
  }

  if (recipients.length > 0) {
    await sendgridMail.send({
      to: recipients,
      from: sender,
      subject: job.name,
      html,
    })
  }
}

export default sendgrid
