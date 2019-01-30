export default {
  getCookie(cookieKey) {
    if (document.cookie.length > 0) {
      let cookieArray = document.cookie.split(';')
      if (cookieArray != undefined && cookieArray.length > 0) {
        let filters = cookieArray.filter(cookie => {
          return cookie.indexOf(cookieKey) != -1
        })


        if (filters != undefined && filters.length > 0) {
          let resultList = filters.map(cookie => {
            let c_start = cookie.indexOf('=')
            if (c_start != -1) {
              let c_end = cookie.indexOf(';')

              if (c_end === -1 || c_end == undefined) c_end = cookie.length
              let obj = cookie.substr(c_start + 1, c_end)
              let key = cookie.substr(0, c_start)
              //                  console.log(key+"   "+condition+"  "+c_start+ "   "+c_end);
              return {
                key: key.trim(),
                obj: JSON.parse(unescape(obj))
              }
            }
            return null
          })
          return resultList
        }
      }
    }
    return null
  },
  setCookie(key, cookieObj, expireDays = 180) {
    let d = new Date()
    let days = expireDays === undefined ? 180 : expireDays
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000))
    let expires = 'expires=' + d.toUTCString()
    document.cookie = key + '=' + escape(JSON.stringify(cookieObj)) + ';' + expires
  }
}
