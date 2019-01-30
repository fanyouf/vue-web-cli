/**
 * nihao:public
 */
import http from './fetch.js'
export default {
  getTree: params => http.post('/saleTree/getTree', params),
  getSku: params => http.post('/saleTree/getSku', params),
  getExpandList: params => http.get('/common/getExpandList', params).then(d => d.data)
}
