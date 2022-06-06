# reddit

Fetch stories from [reddit](https://reddit.com/).

## Examples

### Hottest Stories

```ts
reddit()
```

### New Stories

```ts
reddit({ section: 'new' })
```

### Stories From Specific Subreddit

```ts
reddit({ r: 'programming' })
```

### All Time Top Stories

```ts
reddit({ section: 'top' })
```

### This Month Top Stories

```ts
reddit({
  section: 'top',
  top: 'month',
})
```

## Options

#### r?
- _string_

Optional subreddit. When empty, the front page is used.

#### section?
- _'hot' | 'new' | 'top'_

Optional section: hot, new or top.

Defaults to `hot`.

#### top?
- _'all' | 'year' | 'month' | 'week' | 'day' | 'hour'_

Optional top time interval.

Defaults to `all`.
