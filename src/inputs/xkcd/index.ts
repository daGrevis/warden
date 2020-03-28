import _ from 'lodash'

import { Input } from '../../types'
import withBrowser from '../../withBrowser'

type Result = {
  id: string
  name: string
  url: string
  description: string
  imageUrl: string
}

const HOST = 'https://xkcd.com/'

const input: Input = () => async () => {
  let results: Result[] = []

  await withBrowser(async ({ page }) => {
    await page.goto(HOST)

    const $title = await page.$('#ctitle')
    const $metaUrl = await page.$('meta[property="og:url"]')
    const $comic = await page.$('#comic img')

    const url = await $metaUrl!.evaluate($ => ($ as HTMLMetaElement).content!)

    const [, id] = url.match(/(\d+)\/$/)!

    const name = await $title!.evaluate($ => $.textContent!)

    const description = await $comic!.evaluate(
      $ => ($ as HTMLImageElement).title!,
    )

    const imageUrl = await $comic!.evaluate($ => ($ as HTMLImageElement).src!)

    results = [
      {
        id,
        name,
        url,
        description,
        imageUrl,
      },
    ]
  })

  return results
}

export default input
