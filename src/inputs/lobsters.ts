import _ from 'lodash'
import { By } from 'selenium-webdriver'

import { Input } from '../types'
import withSelenium from '../withSelenium'

type Options = {
}

type Story = {
  id: string
  url: string
  name: string
  extra: {
    score: number
  }
}

const input: Input<Options | undefined> = (options?: Options) => async () => {
  let stories: Story[] = []

  await withSelenium(async driver => {
    await driver.get('http://lobste.rs/')

    stories = await Promise.all(
      _.map(await driver.findElements(By.className('story')), async $ => {
        const $url = await $.findElement(By.className('u-url'))
        return {
          id: await $.getAttribute('data-shortid'),
          url: await $url.getAttribute('href'),
          name: await $url.getText(),
          extra: {
            score: _.parseInt(
              await $.findElement(By.className('score')).getText(),
            ),
          },
        }
      }),
    )
  })

  return stories
}

export default input
export { Options }
