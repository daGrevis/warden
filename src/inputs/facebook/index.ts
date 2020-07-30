import _ from 'lodash'
import { ElementHandle } from 'playwright'

import { Input } from '../../types'
import withBrowser from '../../withBrowser'

type Options = {
  page: string
}

type Result = {
  id: string
  name: string
  url: string
  imageUrl?: string
}

const HOST = 'https://www.facebook.com'

const POSTS_SELECTOR = '._1xnd' // This will probably break any time now.

const parseResult = async (
  $post: ElementHandle,
): Promise<Result | undefined> => {
  const $timestamp = await $post.$('[data-testid="story-subtitle"] a')

  if (!$timestamp) {
    return undefined
  }

  let url = await $timestamp.evaluate(($) => ($ as HTMLAnchorElement).href)

  const urlObject = new URL(url)

  // Gets rid of query params.
  url = urlObject.origin + urlObject.pathname

  const segments = _.reject(
    _.split(urlObject.pathname, '/'),
    (segment) => segment === '' || segment === '/',
  )

  if (segments[0] === 'events') {
    // TODO: Handle events.
    return undefined
  }

  const id = _.last(segments)!

  const $userContent = await $post.$('.userContent')

  if (!$userContent) {
    return undefined
  }

  let name = ''
  const $textImage = await $userContent.$('span:nth-child(2) span')
  if ($textImage) {
    name = await $textImage.evaluate(($) => $.textContent!)
  } else {
    name = await $userContent.evaluate(($) => $.textContent!)
  }

  const $image = await $post.$('.mtm img')
  let imageUrl = undefined
  if ($image) {
    imageUrl = await $image.evaluate(
      ($) => ($ as HTMLImageElement).getAttribute('src')!,
    )
  }

  let result: Result = {
    id,
    name,
    url,
  }

  if (imageUrl) {
    result.imageUrl = imageUrl
  }

  return result
}

const facebook: Input<Options> = (options: Options) => async () => {
  let results: Result[] = []

  await withBrowser(async ({ page }) => {
    await page.goto(`${HOST}/pg/${options.page}/posts/?ref=page_internal`)

    await page.waitForSelector(POSTS_SELECTOR)

    results = _.reject(
      await Promise.all(
        _.map(await page.$$(`${POSTS_SELECTOR} > div`), parseResult),
      ),
      _.isUndefined,
    ) as Result[]
  })

  return results
}

export default facebook
