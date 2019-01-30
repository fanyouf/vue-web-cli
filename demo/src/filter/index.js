const filters = {
  /**
   * val是个小数。如：0.9899113
   * @param val
   */
  percent: function(val, dig = 2) {
    if (isNaN(val) === true) {
      console.error(`${val} is not a Number`)
      return '0%'
    }
    let str = Number(point * 100).toFixed(dig)
    if ((str * 1) % 10 === 0) str = parsetInt(str)
    str += '%'
    return str

    // let _val = val*100;
    // if(_val === parseInt(val)){
    //   return _val + '%'
    // }
    // let valInt = Math.floor(_val);
    // let valFloat = _val - valInt; // 0.aaa
    // valFloat = valFloat.toString().substr(2,dig);
    // (parseInt(valFloat) === 0) && (valFloat = 0)
    // if(valFloat === 0 && valInt !==0)
    //   return valInt + '%'
    // return valInt+'.'+valFloat + '%'
  },
  int0: function(val) {
    return Math.round(val)
  }
}
export { filters as _filter }
export default {
  install: function(Vue, options) {
    Object.keys(filters).forEach(key => {
      Vue.filter(key, filters[key])
    })
  }
}
