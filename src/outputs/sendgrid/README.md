# sendgrid

Send email via [SendGrid API](https://sendgrid.com/) with nice templating.

## Options

#### apiKey
- _string_

API key from [sendgrid.com](https://app.sendgrid.com/settings/api_keys).

#### sender
- _string_

Sender email.

#### recipients
- _string[]_

Recipient emails.

#### template?
- _string_

Optional path to template.

Defaults to `'./template.html'`.

Template is run through [Handlebars](https://handlebarsjs.com/) compiler.

#### asMjml?
- _boolean_

Optional flag for [MJML](https://mjml.io/) mode.

Defaults to `true` for default [template](#template), otherwise `false`.

#### debug?
- _boolean_

Optional flag for debug mode.

Defaults to `false`.

Saves email to `./debug-template.html`.

## Examples

```ts
import _ from 'lodash'

import { Config } from './types'
import dumb from './inputs/dumb'
import ss from './inputs/ss'
import sendgrid from './outputs/sendgrid'
import withOptions from './withOptions'

const mySendgrid = withOptions(sendgrid, {
  apiKey: process.env.SENDGRID_API_KEY,
  sender: 'warden@example.com',
  recipients: ['me@example.com'],
})

const config: Config = {
  jobs: [
    {
      id: 'hello-world-to-sendgrid',
      name: 'Hello World to SendGrid',
      inputs: [dumb({ data: [[{ id: '1', name: 'Hello, world!' }]] })],
      outputs: [mySendgrid({})],
    },

    {
      id: 'ss-flats-to-sendgrid',
      name: 'SS Flats to SendGrid',
      scheduleAt: '0 * * * *',
      inputs: [ss({ section: 'real-estate/flats/riga/centre' })],
      outputs: [
        mySendgrid({
          recipients: ['me@example.com', 'friend@example.com'],
        }),
      ],
    },

    {
      id: 'ss-flats-to-sendgrid-with-template',
      name: 'SS Flats to SendGrid with Template',
      scheduleAt: '0 * * * *',
      inputs: [ss({ section: 'real-estate/flats/riga/centre' })],
      outputs: [
        mySendgrid({
          template: './my-template.html',
        }),
      ],
    },

    {
      id: 'ss-flats-to-sendgrid-debug',
      name: 'SS Flats to SendGrid Debug',
      inputs: [ss({ section: 'real-estate/flats/riga/centre' })],
      outputs: [
        mySendgrid({
          recipients: [],
          debug: true,
        }),
      ],
    },
  ],
}

export default config
```
