const mockApiBaseURL = 'http://localhost:8988/'
import myFetch from './fetch.js'
/** 
 * const apiObjectList = [
  {
    apiName:"queryForecastTableData",
    apiType:"post1",
    isUseMockData:false,
    paraValidFunc:function(){
      return true;
    }
  }
]
 * modelName = '/salePlan/'
*/
function initApiList(apiObjectList, modelName) {
  let rsObj = {}

  apiObjectList.forEach(item => {
    // paraValidFuncObj[item] = function(){return true};  //接口默认 参数验证函数
    // apiObj[item]           = "/"+modelName+"/"+item
    // methodTypeObj[item]    = "post1"                   // 请求后端的方法的类型。要与 fetch.js中暴露的方法保持一致。

    rsObj[item.apiName] = (function(name, type, vFunc, isMock) {
      return (cond, that = null, loadingPara = '$_loading') => {
        let isPassValid = vFunc(cond)
        if (true === isPassValid) {
          console.group(name)
          console.info('条件:', cond)

          if (that && loadingPara in that && typeof that[loadingPara] === 'boolean') {
            that[loadingPara] = true
          }
          let url = isMock === false ? '/' + modelName + '/' + name : mockApiBaseURL + modelName + '/' + name
          return myFetch[type](url, cond).then(rs => {
            if (that && that[loadingPara] && typeof that[loadingPara] === 'boolean') that[loadingPara] = false

            console.info('结果:', rs)
            console.groupEnd()
            return rs
          })
        } else {
          return Promise.resolve({ success: false, msg: '参数错误:<br>' + isPassValid })
        }
      }
    })(item.apiName, item.apiType, item.paraValidFunc, item.isUseMockData)
  })
  return rsObj
}

export { initApiList }
