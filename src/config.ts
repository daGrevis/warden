import { Config } from './types'
import dummyInput from './inputs/dummy'
import lobstersInput from './inputs/lobsters'
import ssInput from './inputs/ss'
import { FuelType } from './inputs/ss/filters'
import consoleOutput from './outputs/console'

const config: Config = {
  driver: {
    // browser: 'chrome',
    // headless: false,
  },

  jobs: [
    {
      id: 'dummy',
      scheduleAt: '* * * * *',
      input: dummyInput(),
      outputs: [consoleOutput()],
    },

    {
      id: 'lobsters',
      scheduleAt: '* * * * *',
      input: lobstersInput({ scoreThreshold: 25 }),
      outputs: [consoleOutput()],
    },

    {
      id: 'ss-cars',
      scheduleAt: '*/5 * * * *',
      input: ssInput({
        section: 'transport/cars/bmw/5-series',
        filters: {
          fuelType: FuelType.Gasoline,
          priceMin: 20000,
        },
      }),
      outputs: [consoleOutput()],
    },

    {
      id: 'ss-flat',
      scheduleAt: null,
      input: ssInput({
        section: 'real-estate/flats/riga',
        filters: {
          priceMin: 500,
          priceMax: 900,
          floorMin: 5,
          roomsMin: 3,
        },
      }),
      outputs: [consoleOutput()],
    },
  ],
}

export default config
