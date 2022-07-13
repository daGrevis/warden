import _ from 'lodash'
import assert from '../../assert'

import { Input } from '../../types'
import withBrowser from '../../withBrowser'

type Options = {
  r?: string
  section?: 'hot' | 'new' | 'top'
  top?: 'all' | 'year' | 'month' | 'week' | 'day' | 'hour'
}

type Result = {
  id: string
  name: string
  url: string
  extra: {
    r: string
    score: number
    commentsUrl: string
  }
}

const HOST = 'https://old.reddit.com'

const parseUrl = (url: string) => {
  const { pathname } = new URL(url)

  const segments = pathname.split('/')

  return {
    r: segments[2],
    rId: segments[4],
  }
}

const reddit: Input<Options> = (options: Options) => async () => {
  const section = options?.section ?? 'hot'
  const top = options?.top ?? 'all'

  let results: Result[] = []

  await withBrowser(async ({ page }) => {
    const pageUrl = `${HOST}/${options.r ? `r/${options.r}/` : ''}${section}/${
      options.section === 'top' ? `?t=${top}` : ''
    }`

    await page.goto(pageUrl)

    const $things = await page.$$('.thing:not(.promotedlink)')

    results = await Promise.all(
      _.map($things, async ($thing): Promise<Result> => {
        const $title = await $thing.$('a.title')
        assert($title, 'Title element not found!')

        const $comments = await $thing.$('a.comments')
        assert($comments, 'Comments element not found!')

        const commentsUrl = await $comments.evaluate(
          ($) => ($ as HTMLAnchorElement).href,
        )

        const { r, rId } = parseUrl(commentsUrl)

        const id = `r/${r}/${rId}`

        const name = await $title.evaluate(($) => $.textContent!)

        const url = await $title.evaluate(($) => ($ as HTMLAnchorElement).href)

        const $score = await $thing.$('.score')
        const score = _.parseInt(
          await $score!.evaluate(($: HTMLDivElement) => $.title),
        )

        return {
          id,
          name,
          url,
          extra: {
            r,
            score,
            commentsUrl,
          },
        }
      }),
    )
  })

  return results
}

export default reddit
