# ycombinator

Fetch stories from [Hacker News](https://news.ycombinator.com/).

## Examples

### Hottest Stories

```ts
ycombinator()
```

### New Stories

```ts
ycombinator({ section: 'newest' })
```

## Options

#### section?
- _'hottest' | 'newest' | 'front' | 'ask' | 'show' | 'jobs'_

Optional section: hottest, newest, front (aka past), ask, show or jobs.

Defaults to `hottest`.
