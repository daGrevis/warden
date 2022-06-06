const withOptions =
  <T, U extends Partial<T>, R>(fn: (options: T) => R, partialOptions: U) =>
  (restOpts: Omit<T, keyof U> & Partial<T>) =>
    fn({
      ...partialOptions,
      ...restOpts,
    } as any)

export default withOptions
