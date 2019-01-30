import myFetch from './fetch.js'

import { initApiList } from './apiTools'
import { version } from 'punycode'

import vFunc from '../utils/validate'

const modelName = 'saleTargetVersion'

const apiObjectList = [
  {
    apiName: 'listVersion', //
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      // { dateDimension, dataDimensionList, idList, roleType, dept3Id, year, monthList, versionType }
      return vFunc(cond)
        .noNull('dept3Id', '部门信息')
        .beIn('roleType', ['DEPT_MANAGER', 'SALER'], '角色')
        .end()
    }
  },
  {
    apiName: 'getVersion', //
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      // { dateDimension, dataDimensionList, idList, roleType, dept3Id, year, monthList, versionType }
      return vFunc(cond)
        .noNull('dept3Id', '部门信息')
        .beIn('roleType', ['DEPT_MANAGER', 'SALER'], '角色')
        .beIn('versionType', ['CHALLENGE', 'ASSESSMENT'], '版本信息')
        .end()
    }
  },
  {
    apiName: 'updateVersion', // 1.查询目标
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      // { dateDimension, dataDimensionList, idList, roleType, dept3Id, year, monthList, versionType }
      return vFunc(cond)
        .noNull('dept3Id', '部门信息')
        .beIn('roleType', ['DEPT_MANAGER', 'SALER'], '角色')
        .noNull('remark', '备注信息')
        .beIn('versionType', ['CHALLENGE', 'ASSESSMENT'], '版本信息')
        .end()
    }
  }
]

const apiObj = initApiList(apiObjectList, modelName)
export default apiObj
