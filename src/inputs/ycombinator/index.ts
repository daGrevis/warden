import _ from 'lodash'

import { Input } from '../../types'
import assert from '../../assert'
import withBrowser from '../../withBrowser'

type Options = {
  section?: 'hottest' | 'newest' | 'front' | 'ask' | 'show' | 'jobs'
}

type Result = {
  id: string
  name: string
  url: string
  extra: {
    score: number
    commentsUrl: string
  }
}

const HOST = 'https://news.ycombinator.com'

const ycombinator: Input<Options | undefined> =
  (options?: Options) => async () => {
    const section = options?.section ?? 'hottest'

    let results: Result[] = []

    await withBrowser(async ({ page }) => {
      const pageUrl = `${HOST}/${section === 'hottest' ? '' : section}`

      await page.goto(pageUrl)

      const rows = await page.$$(
        '.itemlist tr.athing, .itemlist tr.athing + tr',
      )

      results = await Promise.all(
        _.map(_.chunk(rows, 2), async ([$story, $meta]): Promise<Result> => {
          const id = await $story.evaluate(($) => $.id)

          const $link = await $story.$('.titlelink')

          assert($link, 'Link element not found!')

          const $score = await $meta.$('.score')

          let score = 0
          if ($score) {
            let scoreText = await $score!.evaluate(($) => $.textContent!)
            scoreText = scoreText.replace(/ points?$/, '')
            score = _.parseInt(scoreText)
          }

          return {
            id,
            name: await $link.evaluate(($) => $.textContent!),
            url: await $link.evaluate(($) => ($ as HTMLAnchorElement).href),
            extra: {
              score,
              commentsUrl: `${HOST}/item?id=${id}`,
            },
          }
        }),
      )
    })

    return results
  }

export default ycombinator
