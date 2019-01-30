/**
 * 销售明细分析
 */
// import http from './fetch'
//
// export default{
//   //查询stockCover数据
//   queryStockCover(condi){
//     return http.get('/stockCover/queryStockCover',condi).then (res => {
//       return res.data;
//     });
//   },
//   //上传可用周期设置
//   uploadAvailableSetting(condi){
//     return http.post('/stockCover/uploadAvailableSetting',condi).then (res => {
//       return res.data;
//     });
//   },
// }

import http from './fetch.js'
let apiObj = {},
  modelName = '/stockCover/',
  rs = {},
  alias = {

  }; // 别名
[ 'uploadAvailableSetting',   //上传可用周期设置
  'queryStockCover',  //查询stockCover数据
].forEach(item=>{ apiObj[item]= modelName+item });

apiObj = {...apiObj,...alias}

for(var name in apiObj){
  rs[name] = function(name){ return (p) => http.get(apiObj[name],p) }(name);
}

export default rs;

