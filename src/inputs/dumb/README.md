# dumb

Return options as results in a dumb manner.

## Examples

### Return Nothing

```ts
dumb()
```

### Return Some Fake Data

```ts
dumb({
  data: [
    [],
    [{ id: '1', name: '1' }, { id: '2', name: '2' }],
    [{ id: '3', name: '3' }],
  ],
}),
```

## Options

#### data?
- _Results[]_

Data list with results for each run. Zero-th item is results for start run,
first item is results for first run, second item is results for second run and
so on...
