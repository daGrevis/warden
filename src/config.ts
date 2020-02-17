import { Config } from './types'
import staticInput from './inputs/static'
import lobstersInput from './inputs/lobsters'
import ssInput from './inputs/ss'
import { FuelType } from './inputs/ss/filters'
import consoleOutput from './outputs/console'
import sendgridOutput from './outputs/sendgrid'
import withOptions from './withOptions'

const mySendgridOutput = withOptions(sendgridOutput, {
  apiKey: 'sekret',
  sender: 'warden@dagrev.is',
})

const config: Config = {
  driver: {
    browser: 'firefox',
    headless: true,
  },

  jobs: [
    {
      id: 'static',
      name: 'SS cars',
      scheduleAt: null,
      inputs: [
        staticInput({
          data: [
            [
              {
                id: 'aedgn',
                url:
                  'https://www.ss.com/msg/lv/transport/cars/bmw/x5/aedgn.html',
                name: 'bmw/x5',
                description:
                  'Automašīna ar pārbaudītu vēsturi. BMW X5 30d 265zs M Sport package I',
                imageUrl:
                  'https://i.ss.com/gallery/4/627/156600/31319987.800.jpg',
                extra: { price: '72,900 €' },
              },
              {
                id: 'bpnbkp',
                url:
                  'https://www.ss.com/msg/lv/transport/cars/audi/q8/bpnbkp.html',
                name: 'audi/q8',
                description:
                  'Audi centrs Moller Auto Lidosta Kalnciema ielā 170a piedāvā- Cena ar Pvn',
                imageUrl:
                  'https://i.ss.com/gallery/3/513/128039/25607634.800.jpg',
                extra: { price: '72,900 €' },
              },
              {
                id: 'ggnmj',
                url:
                  'https://www.ss.com/msg/lv/transport/cars/mercedes/gl420/ggnmj.html',
                name: 'mercedes/gl420',
                description:
                  'Mb gls 400d, amg pakotne, head up, panorāma, airmatic, distronic, burmes',
                imageUrl:
                  'https://i.ss.com/gallery/4/627/156638/31327522.800.jpg',
                extra: { price: '94,985 €' },
              },
            ],
          ],
        }),
      ],
      outputs: [consoleOutput()],
      runOutputsAtStart: true,
    },

    {
      id: 'ss-bmw-audi-mercedes',
      name: 'SS bmw/audi/mercedes',
      scheduleAt: '* * * * *',
      inputs: [
        ssInput({ section: 'transport/cars/bmw' }),
        ssInput({ section: 'transport/cars/audi' }),
        ssInput({ section: 'transport/cars/mercedes' }),
      ],
      outputs: [
        consoleOutput(),
        mySendgridOutput({ recipients: ['dagrevis@gmail.com'] }),
      ],
    },

    {
      id: 'ss-bmw-5-series',
      name: 'SS bmw/5-series',
      scheduleAt: '*/5 * * * *',
      inputs: [
        ssInput({
          section: 'transport/cars/bmw/5-series',
          filters: {
            fuelType: FuelType.Gasoline,
            priceMin: 20000,
          },
        }),
      ],
      outputs: [consoleOutput()],
    },

    {
      id: 'ss-flats-riga',
      name: 'SS flats/riga',
      scheduleAt: null,
      inputs: [
        ssInput({
          section: 'real-estate/flats/riga',
          filters: {
            priceMin: 500,
            priceMax: 900,
            floorMin: 5,
            roomsMin: 3,
          },
        }),
      ],
      outputs: [consoleOutput()],
    },
  ],
}

export default config
