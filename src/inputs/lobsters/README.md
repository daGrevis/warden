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
