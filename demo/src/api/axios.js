'use strict'

import axios from 'axios'
import qs from 'qs'

axios.defaults.baseURL = process.env.SER_URL

axios.defaults.withCredentials = true // 带cookie请求
const TIMEOUT = 5 * 60 * 1000

axios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    return Promise.resolve(error.response)
  }
)

function checkStatus(response) {
  // 如果http状态码正常，则直接返回数据
  if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
    return response
  } else if (response && response.status === 302) {
    return
  } else if (response && response.status === 401) {
    window.location.href = process.env.FRONT_URL // 此处是单点登陆地址
    return
  }
  // 异常状态下，把错误信息返回去
  return {
    status: -404,
    msg: '网络异常'
  }
}

function checkCode(res) {
  // 如果code异常(这里已经包括网络错误，服务器错误，后端抛出的错误)，可以弹出一个错误提示，告诉用户
  if (res.status === -404) {
    // alert(res.msg)
  }
  if (res.data && !res.data.success) {
    // alert(res.data.error_msg)
  }
  return res
}

export default {
  fileDownload(url, cond) {
    let params = new URLSearchParams(condition)
    return axios({
      method: 'get',
      url,
      params, // get 请求时带的参数
      timeout: TIMEOUT
    })
      .then(response => {
        return checkStatus(response)
      })
      .then(res => {
        return checkCode(res)
      })
      .then(res => {
        console.info(res)
      })
  },
  post(url, condition, setting = {}) {
    // alert('axios.js')
    // alert(window.document.cookie.indexOf('sso.jd.com'))
    let params = new URLSearchParams(condition)
    let defaultSetting = {
      method: 'post',
      url,
      data: params,
      timeout: TIMEOUT,
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
    defaultSetting = Object.assign({}, defaultSetting, setting)
    return axios(defaultSetting)
      .then(response => {
        // debugger
        return checkStatus(response)
      })
      .then(res => {
        return checkCode(res)
      })
  },
  get(url, condition) {
    let params = new URLSearchParams(condition)
    return axios({
      method: 'get',
      url,
      params, // get 请求时带的参数
      timeout: TIMEOUT
    })
      .then(response => {
        return checkStatus(response)
      })
      .then(res => {
        return checkCode(res)
      })
  }
}
