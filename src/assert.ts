function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw Error(message)
  }
}

export default assert
