/**
 * 历史数据上传
 */
import http from './fetch.js'
export default {
  downloadSupplementTemplate: params => http.fileDownloadByPost('/saleTarget/downloadSupplementTemplate', params), //历史目标下载模板
  uploadSupplement: params => http.fileUpload('/saleTarget/uploadSupplement', params) //历史目标上传
}
