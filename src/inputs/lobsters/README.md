# lobsters

Fetch stories from [Lobsters](https://lobste.rs/).

## Examples

### Hottest Stories

```ts
lobsters()
```

### Recent Stories

```ts
lobsters({ section: 'recent' })
```

### Stories Tagged JavaScript or Web

```ts
lobsters({
  section: 'tags',
  tags: ['javascript', 'web'],
})
```

### Stories with Some Score

```ts
import filter from './pipes/filter'

const job = {
  inputs: [
    lobsters(),
  ],
  pipes: [
    filter({ by: (result) => result.extra?.score > 40 }),
  ],
}
```

## Options

#### section?
- _'hottest' | 'recent' | 'newest'_

Optional section: hottest, recent or newest.

Defaults to `hottest`.

#### section?
- _'tags'_

Optional section for tags. You must also set `options.tags` when using this!

#### tags?
- _string[]_

Optional tags when `options.section` is set to `tags`.
