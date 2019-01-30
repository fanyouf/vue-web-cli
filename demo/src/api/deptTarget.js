import http from './fetch.js'
let apiObj = {},
  modelName = '/deptTarget/',
  rs = {},
  alias = {
    // 别名
    // "download":"http://localhost:8081/sps/deptTarget/download",
    // "upload":"http://localhost:8081/sps/deptTarget/upload",
  }

;[
  'download', // 1.部门考核目标的 模版下载
  'upload' // 2. 部门考核目标的上传
].forEach(item => {
  apiObj[item] = modelName + item
})

apiObj = { ...apiObj, ...alias }

rs['download'] = function(cond) {
  return http.fileDownloadByPost(apiObj['download'], cond)
}

rs['upload'] = function(cond) {
  return http.fileUpload(apiObj['upload'], cond)
}
export default rs
