# sendgrid

Send email via [SendGrid API](https://sendgrid.com/) with nice templating.

## Examples

### withOptions Helper

```ts
import sendgrid from './outputs/sendgrid'
import withOptions from './withOptions'

const mySendgrid = withOptions(sendgrid, {
  apiKey: process.env.SENDGRID_API_KEY,
  sender: 'warden@example.com',
  recipients: ['me@example.com'],
})
```

### Send Email

```ts
mySendgrid({
})
```

### Multiple Recipients

```ts
mySendgrid({
  recipients: ['me@example.com', 'friend@example.com'],
})
```

### Custom Template

```ts
mySendgrid({
  template: './my-template.html',
})
```

### MJML Template

```ts
mySendgrid({
  template: './my-template.html',
  asMjml: true,
})
```

### Debug Mode

```ts
mySendgrid({
  recipients: [],
  debug: true,
})
```

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
