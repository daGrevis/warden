import _ from 'lodash'

import { Input } from '../../types'
import withBrowser from '../../withBrowser'

type Options = {
  page: string
}

type Result = {
  id: string
  name: string
  url: string
}

const HOST = 'https://www.facebook.com'

const POSTS_SELECTOR = '._1xnd' // This will probably break any time now.

const facebook: Input<Options> = (options: Options) => async () => {
  let results: Result[] = []

  await withBrowser(async ({ page }) => {
    await page.goto(`${HOST}/pg/${options.page}/posts/?ref=page_internal`)

    await page.waitForSelector(POSTS_SELECTOR)

    results = _.reject(
      await Promise.all(
        _.map(
          await page.$$('._1xnd > div'),
          async ($post): Promise<Result | undefined> => {
            const $description = await $post.$(
              '.userContent span span:nth-child(2)',
            )
            const $timestamp = await $post.$('[data-testid="story-subtitle"] a')

            if (!$description || !$timestamp) {
              return undefined
            }

            let url = await $timestamp.evaluate(
              ($) => ($ as HTMLAnchorElement).href,
            )
            url = url.replace(/\?.*/, '')

            const segments = _.split(new URL(url).pathname, '/')

            if (segments[1] === 'events') {
              return undefined
            }

            const id = _.last(segments)!

            const name = await $description!.evaluate(($) => $.textContent!)

            return {
              id,
              name,
              url,
            }
          },
        ),
      ),
      _.isUndefined,
    ) as Result[]
  })

  return results
}

export default facebook
