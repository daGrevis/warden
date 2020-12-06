const sleep = (durationMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, durationMs)
  })

export { sleep }
