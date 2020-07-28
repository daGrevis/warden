const sleep = (durationMs: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, durationMs)
  })

export { sleep }
