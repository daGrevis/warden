import _ from 'lodash'

import { Input } from '../types'
import withBrowser from '../withBrowser'

type OptionsForSection = {
  section?: 'hottest' | 'recent' | 'newest'
}

type OptionsForTags = {
  section: 'tags'
  tags: [string, ...string[]]
}

type Options = OptionsForSection | OptionsForTags

type Result = {
  id: string
  name: string
  url: string
  extra: {
    score: number
    commentsUrl: string
    tags: string[]
  }
}

const HOST = 'http://lobste.rs'

const isOptionsForTags = (options?: Options): options is OptionsForTags => {
  return options !== undefined && 'tags' in options
}

const input: Input<Options | undefined> = (options?: Options) => async () => {
  const section = options?.section ?? 'hottest'

  let results: Result[] = []

  await withBrowser(async ({ page }) => {
    let pageUrl

    if (isOptionsForTags(options)) {
      const { tags } = options

      pageUrl = `${HOST}/t/${tags.join(',')}`
    } else {
      pageUrl = `${HOST}/${section === 'hottest' ? '' : section}`
    }

    await page.goto(pageUrl)

    results = await Promise.all(
      _.map(
        await page.$$('.story'),
        async ($story): Promise<Result> => {
          const $url = await $story.$('.u-url')
          const $commentsUrl = await $story.$('.comments_label a')
          const $score = await $story.$('.score')
          const $tags = await $story.$('.tags')

          return {
            id: await $story!.evaluate($ => $.getAttribute('data-shortid')!),
            name: await $url!.evaluate($ => $.textContent!),
            url: await $url!.evaluate($ => ($ as HTMLAnchorElement).href),
            extra: {
              score: _.parseInt(await $score!.evaluate($ => $.textContent!)),
              commentsUrl: await $commentsUrl!.evaluate(
                $ => ($ as HTMLAnchorElement).href,
              ),
              tags: await Promise.all(
                _.map(await $tags!.$$('.tag'), $tag =>
                  $tag.evaluate($ => $.textContent!),
                ),
              ),
            },
          }
        },
      ),
    )
  })

  return results
}

export default input
