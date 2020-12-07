import _ from 'lodash'

const formatNumber = (number: number) => {
  if (number % 1 !== 0) {
    return `${_.round(number * 100, 2)}%`
  }

  // https://stackoverflow.com/a/2901298/458610
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default formatNumber
