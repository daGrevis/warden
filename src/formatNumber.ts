const formatNumber = (number: number) =>
  // https://stackoverflow.com/a/2901298/458610
  number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export default formatNumber
