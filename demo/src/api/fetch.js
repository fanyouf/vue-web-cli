// require('es6-promise').polyfill()
// require('isomorphic-fetch')
import 'whatwg-fetch'
let basicUrl = process.env.SER_URL
const handleResponse = res => {
  // debugger
  let contentType = res.headers.get('Content-Type')
  if (res.ok) {
    if (contentType.includes('json')) {
      return res.json()
    } else if (contentType.includes('octet-stream')) {
      return res.blob()
    } else if (contentType.includes('application/vnd.ms-excel')) {
      return res.blob()
    } else {
      return res
    }
  } else if (res.status === 400) {
    return res.json()
  } else if (res.status === 404) {
    return Promise.resolve({ success: false, msg: '接口不存在:' })
    //throw new Error('res.status')
    ///return Object.assign({}, res.json(), { success: false })
  } else if (res.status === 503) {
    router.push({
      name: 'Error50x'
    })
  } else if (res.status === 401) {
    window.location.href = process.env.FRONT_URL
  } else {
    throw new Error(res.status)
  }
}

const get = function(url, params, config = {}) {
  url += '?' + new URLSearchParams(params)
  url = url.startsWith('http') ? url : basicUrl + url
  let defaultSetting = {
    method: 'get',
    credentials: 'include',
    mode: 'cors'
  }
  return fetch(url, Object.assign(defaultSetting, config)).then(handleResponse)
}

export default {
  fileDownloadByPost(url, cond) {
    let params = new URLSearchParams(cond)
    url = url.startsWith('http') ? url : basicUrl + url
    return fetch(url, {
      responseType: 'arraybuffer',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      method: 'post',
      credentials: 'include',
      mode: 'cors',
      body: params
    })
      .then(handleResponse)
      .then(res => {
        // 如果下载excel没有问题，则res是一个流对象，其中是没有sucess属性的。
        if ('success' in res) {
          return Promise.reject(res.message)
        } else {
          // 处理返回的文件流
          let a = document.createElement('a')
          let blob = new Blob([res], { type: 'application/vnd.ms-excel' })
          let ObjectUrl = URL.createObjectURL(blob)
          let fileName = cond.fileName ? cond.fileName : '下载.xlsx'
          a.href = ObjectUrl
          a.download = fileName
          a.click()
          return Promise.resolve('fileDownloadOk')
        }
      })

    // let config = {
    //   responseType: 'arraybuffer',
    //   credentials: 'include',
    //   mode: 'cors',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    //   }
    // }

    return get(url, cond, config).then(res => {
      // 如果下载excel没有问题，则res是一个流对象，其中是没有sucess属性的。
      if ('success' in res) {
        return Promise.reject(res.message)
      } else {
        // 处理返回的文件流
        let a = document.createElement('a')
        let blob = new Blob([res], { type: 'application/vnd.ms-excel' })
        let ObjectUrl = URL.createObjectURL(blob)
        let fileName = cond.fileName ? cond.fileName : '下载.xlsx'
        a.href = ObjectUrl
        a.download = fileName
        a.click()
        return Promise.resolve('fileDownloadOk')
      }
    })
  },
  fileDownload(url, cond) {
    let config = {
      responseType: 'arraybuffer',
      credentials: 'include',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }
    return get(url, cond, config).then(res => {
      // 如果下载excel没有问题，则res是一个流对象，其中是没有sucess属性的。
      if ('success' in res) {
        return Promise.reject(res.message)
      } else {
        // 处理返回的文件流
        let a = document.createElement('a')
        let blob = new Blob([res], { type: 'application/vnd.ms-excel' })
        let ObjectUrl = URL.createObjectURL(blob)
        let fileName = cond.fileName ? cond.fileName : '下载.xlsx'
        a.href = ObjectUrl
        a.download = fileName
        a.click()
        return Promise.resolve('fileDownloadOk')
      }
    })
  },
  fileUpload(url, cond) {
    url = url.startsWith('http') ? url : basicUrl + url
    let fileData = new FormData()
    for (let key in cond) {
      fileData.append(key, cond[key])
    }
    return fetch(url, {
      headers: {
        // 'content-type':'multipart/form-data',
      },
      method: 'post',
      credentials: 'include',
      mode: 'cors',
      body: fileData
    }).then(handleResponse)
  },
  post1(url, params) {
    params = JSON.stringify(params)
    url = url.startsWith('http') ? url : basicUrl + url
    return fetch(url, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      method: 'post',

      mode: 'cors',
      body: params
    }).then(handleResponse)
  },
  post(url, params) {
    params = new URLSearchParams(params)
    url = url.startsWith('http') ? url : basicUrl + url
    return fetch(url, {
      method: 'post',
      credentials: 'include',
      mode: 'cors',
      body: params
    }).then(handleResponse)
  },
  get
}
