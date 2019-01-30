
const filter = {
  moneyUnit: function(val, type = 'yuan') {},
  formatCurrency(num, type = 'yuan') {
    if (type === 'yuan') {
      num = num
    } else if (type === 'thousand') {
      num = num / 1000
    } else if (type === 'wan') {
      num = num / 10000
    } else if (type === 'million') {
      num = num / 1000 / 1000
    }

    let c = num.toString().indexOf('.') !== -1 ? num.toLocaleString() : num.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
    return c
  },
  formatCurrency1: function(num, type = 'yuan') {
    if (!num || isNaN(num)) {
      return num
    }
    if (type === 'yuan') {
      num = num
    } else if (type === 'thousand') {
      num = num / 1000
    } else if (type === 'wan') {
      num = num / 10000
    } else if (type === 'million') {
      num = num / 1000 / 1000
    }
    num = num.toString().replace(/\$|\,/g, '')
    let sign = num >= 0
    num = Math.floor(num * 10 + 0.50000000001)
    let cents = Math.abs(num % 10)
    num = Math.floor(num / 10).toString()
    for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
      num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3))
    }
    return num + '.' + cents
  },
  /**
   * val是个小数。如：0.9899113
   * @param val
   */
  percent: function(val, dig = 1) {
    let _val = val * 100
    return _val.toFixed(dig) + '%'
  },
  int: function(val, dig = 0) {
    if (isNaN(val)) {
      console.error(`${val}不是数值，不能用int过滤器`)
      return val
    }
    return Number(val).toFixed(dig)
  }
}

export default filter
