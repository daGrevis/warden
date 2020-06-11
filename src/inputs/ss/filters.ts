enum Condition {
  New = '6751',
  Used = '6752',
}

enum FuelType {
  Gasoline = '493',
  Diesel = '494',
  NaturalGas = '495',
  Hybrid = '7434',
}

enum Transmission {
  Automatic = '497',
  Manual = '496',
}

enum BodyType {
  SUV = '477',
  Sedan = '484',
  Wagon = '483',
  Coupe = '487',
  Cabriolet = '488',
  Hatchback = '486',
  Pickup = '114301',
  Minivan = '476',
  Minibus = '114384',
  Other = '24775',
}

enum FridgeType {
  Below = '113051',
  Above = '113052',
  Standalone = '113054',
  SideBySide = '113053',
  French = '113151',
}

type AllRequiredFilterOptions = {
  // Generic
  priceMin: number
  priceMax: number
  yearMin: number
  yearMax: number
  condition: Condition

  // Real estate
  roomsMin: 1 | 2 | 3 | 4 | 5 | 6
  roomsMax: 1 | 2 | 3 | 4 | 5 | 6
  areaMin: number
  areaMax: number
  floorMin: number
  floorMax: number

  // Transport
  engineSizeLitersMin: number | string
  engineSizeLitersMax: number | string
  engineSizeCcMin: number
  engineSizeCcMax: number
  fuelType: FuelType
  transmission: Transmission
  bodyType: BodyType

  // Electronics
  fridgeType: FridgeType
}

type FilterOptions = Partial<AllRequiredFilterOptions>

type FilterDefinition = { selector: string; name: string }

type FilterDefinitions = {
  [key in keyof AllRequiredFilterOptions]: FilterDefinition
}

const filterDefinitions: FilterDefinitions = {
  priceMin: {
    selector: '#f_o_8_min',
    name: 'Price min',
  },
  priceMax: {
    selector: '#f_o_8_max',
    name: 'Price max',
  },
  yearMin: {
    selector: '#f_o_18_min',
    name: 'Year min',
  },
  yearMax: {
    selector: '#f_o_18_max',
    name: 'Year max',
  },
  condition: {
    selector: '#f_o_352',
    name: 'Condition',
  },

  roomsMin: {
    selector: "[name='topt[1][min]']",
    name: 'Rooms min',
  },
  roomsMax: {
    selector: "[name='topt[1][max]']",
    name: 'Rooms max',
  },
  areaMin: {
    selector: '#f_o_3_min',
    name: 'Area min',
  },
  areaMax: {
    selector: '#f_o_3_max',
    name: 'Area max',
  },
  floorMin: {
    selector: '#f_o_4_min',
    name: 'Floor min',
  },
  floorMax: {
    selector: '#f_o_4_max',
    name: 'Floor max',
  },

  engineSizeLitersMin: {
    selector: '#f_o_15_min',
    name: 'Engine size liters min',
  },
  engineSizeLitersMax: {
    selector: '#f_o_15_max',
    name: 'Engine size liters max',
  },
  engineSizeCcMin: {
    selector: '#f_o_989_min',
    name: 'Engine size cc min',
  },
  engineSizeCcMax: {
    selector: '#f_o_989_max',
    name: 'Engine size cc max',
  },
  fuelType: {
    selector: '#f_o_34',
    name: 'Fuel type',
  },
  transmission: {
    selector: '#f_o_35',
    name: 'Transmission',
  },
  bodyType: {
    selector: '#f_o_32',
    name: 'Body type',
  },

  fridgeType: {
    selector: '#f_o_1663',
    name: 'Fridge type',
  },
}

export {
  filterDefinitions,
  FilterDefinition,
  FilterDefinitions,
  FilterOptions,
  Condition,
  FuelType,
  Transmission,
  BodyType,
  FridgeType,
}
