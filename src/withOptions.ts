const withOptions = <T, U extends Partial<T>, R>(
  fn: (options: T) => R,
  partialOptions: U,
) => (restOpts: Omit<T, keyof U>) =>
  fn({
    ...partialOptions,
    ...restOpts,
  } as any)

export default withOptions
