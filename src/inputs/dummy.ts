let counter = 0

export default () => async () => {
  if (counter === 1) {
    return {
      3: {
        id: '3',
        url: 'https://example.com/3',
        name: 'Example 3',
      },
    }
  }

  counter += 1

  return {
    1: {
      id: '1',
      url: 'https://example.com/1',
      name: 'Example 1',
    },
    2: {
      id: '2',
      url: 'https://example.com/2',
      name: 'Example 2',
    },
  }
}
