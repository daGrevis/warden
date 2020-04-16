# coronavirus

Fetch number of total, deaths and recovered from
[worldometers.info/coronavirus](https://www.worldometers.info/coronavirus/).

## Examples

### Global

```ts
coronavirus()
```

### USA

```ts
coronavirus({ country: 'USA' })
```

### Baltic States

```ts
coronavirus({ countries: ['Estonia', 'Latvia', 'Lithuania'] })
```

## Options

#### country?
- _string_

Optionally filter by country.

#### countries?
- _string[]_

Optionally filter by countries.
