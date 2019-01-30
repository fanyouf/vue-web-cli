/**
 * 权限控制
 */
import http from './fetch.js'
// import http from './axios.js'
export default {
  getRole: params => http.post1('/saleTree/getRole', params),
  getBaseDeptInfo: params => http.post('/saleTree/getBaseDeptInfo', params),
  getAuthoritySettings: params => http.get('/saleTree/getAuthoritySettings', params),
  saveAuthoritySetting: params => http.post('/saleTree/saveAuthoritySetting', params),
  deleteAuthoritySetting: params => http.post('/saleTree/deleteAuthoritySetting', params),
  getSalerList: params => http.get('/saleTree/getSalerList', params)
}
