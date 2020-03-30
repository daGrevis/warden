# ss

Fetch items from [ss.com](https://www.ss.com/) with custom filters.

## Examples

### Any Car

```ts
ss({ section: 'transport/cars' })
```

### Lexus IS with Filters

```ts
ss({
  section: 'transport/cars/lexus/is',
  filters: {
    yearMin: 2014,
    fuelType: FuelType.Gasoline,
  },
})
```

### Riga Center with Filters

```ts
ss({
  section: 'real-estate/flats/riga/centre',
  filters: {
    priceMin: 500,
    priceMax: 700,
    roomsMin: 3,
    areaMin: 70,
    floorMin: 3,
  },
})
```

### Programming Job

```ts
ss({ section: 'work/are-required/programmer' })
```

## Options

#### section
- _string_

Section part of URL. Some sections can be filtered with only two categories
provided like `transport/cars`, but some like `real-estate/flats` won't work and
you have to be more explicit.

#### filters
- _FilterOptions_

See `filters.ts` for available filters. It should be possible to easily add new
filters in most cases.
