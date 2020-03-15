# Warden

Continuous Web Scraping Framework

---

Framework for easily creating web scrapers that continuously check for new
results and notify user on changes.

For example, you're interested in news from [lobste.rs](https://lobste.rs/) and
would like to receive daily email newsletter. You could use `lobsters` as input
and `sendgrid` as output to create a job like this:

```ts
{
  id: 'lobsters-daily',
  name: 'Lobste.rs Daily',
  scheduleAt: '0 12 * * *',
  inputs: [lobstersInput()],
  outputs: [
    sendgridOutput({
      apiKey: 'sekret',
      sender: 'warden@example.com',
      recipients: ['me@example.com'],
    }),
  ],
}
```

This job is scheduled to be run at noon (`0 12 * * *` is [cron
syntax](https://www.npmjs.com/package/node-schedule#cron-style-scheduling)) and
will send an email to `me@example.com` with latest news from
[lobste.rs](https://lobste.rs/).

It's possible to mix and match inputs/outputs in various ways. See
[`src/inputs/`](https://github.com/daGrevis/warden/tree/master/src/inputs) for
available inputs, see
[`src/outputs/`](https://github.com/daGrevis/warden/tree/master/src/outputs) for
available outputs.

It's also possible to quickly make a new input or output with TypeScript.

Here's a more complicated example that scrapes [ss.com](https://www.ss.com/) for
Audi, BMW and Mercedes with 3.0+ liter gasoline engine, manual transmission and
price starting from 10k EUR. Then it notifies user by printing out to console
and sending an email. It's scheduled to be run on every hour if it's 9-17 and
weekday.

```ts
{
  id: 'ss-audi-bmw-mercedes',
  name: 'SS Audi, BMW & Mercedes',
  scheduleAt: '0 9-17 * * 1-5',
  inputs: _.map(
    [
      'transport/cars/audi',
      'transport/cars/bmw',
      'transport/cars/mercedes',
    ],
    section =>
      ssInput({
        section,
        filters: {
          engineSizeMin: '3.0',
          fuelType: FuelType.Gasoline,
          transmission: Transmission.Manual,
          priceMin: 10000,
        },
      }),
  ),
  outputs: [
    consoleOutput(),
    sendgridOutput({
      apiKey: 'sekret',
      sender: 'warden@example.com',
      recipients: ['me@example.com'],
    }),
  ],
}
```
