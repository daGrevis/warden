import _ from 'lodash'

import { Input } from '../types'
import withBrowser from '../withBrowser'

type Options = {
  section?: 'hottest' | 'recent' | 'newest'
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
  const section = options?.section ?? 'hottest'

  let stories: Story[] = []

  await withBrowser(async ({ page }) => {
    await page.goto(`http://lobste.rs/${section === 'hottest' ? '' : section}`)

    stories = await Promise.all(
      _.map(await page.$$('.story'), async $story => {
        const $url = await $story.$('.u-url')
        const $commentsUrl = await $story.$('.comments_label a')
        const $score = await $story.$('.score')

        return {
          id: await $story!.evaluate($ => $.getAttribute('data-shortid')!),
          url: await $url!.evaluate(
            $ => ($ as HTMLAnchorElement).getAttribute('href')!,
          ),
          name: await $url!.evaluate($ => $.textContent!),
          extra: {
            score: _.parseInt(await $score!.evaluate($ => $.textContent!)),
            commentsUrl: await $commentsUrl!.evaluate($ =>
              ($ as HTMLAnchorElement).getAttribute('href'),
            ),
          },
        }
      }),
    )
  })

  return stories
}

export default input
