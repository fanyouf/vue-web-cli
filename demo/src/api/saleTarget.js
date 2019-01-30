/**
销售目标页中需要用到的api
*/
import myFetch from './fetch.js'

import { initApiList } from './apiTools'
import { version } from 'punycode'

import vFunc from '../utils/validate'

const modelName = 'saleTarget'

const apiObjectList = [
  {
    apiName: 'queryAdjustTableData', // 1.查询目标
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      // { dateDimension, dataDimensionList, idList, roleType, dept3Id, year, monthList, versionType }
      return vFunc(cond)
        .noNull('dept3Id', '部门信息')
        .beIn('roleType', ['DEPT_MANAGER', 'SALER'], '角色')
        .noNull('year', '年份')
        .noNull('monthList', '月份')
        .noNull('dataDimensionList', '维度')
        .noNull('idList', '节点')
        .noNull('dateDimension', '时间维度')
        .beIn('versionType', ['CHALLENGE', 'ASSESSMENT'], '版本信息')
        .end()
    }
  },
  {
    apiName: 'saveAdjustTableData', // 2. 保存目标
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('dept3Id', '部门信息')
        .beIn('roleType', ['DEPT_MANAGER', 'SALER'], '角色')
        .noNull('year', '年份')
        .noNull('monthList', '月份')
        .noNull('dataDimensionList', '维度')
        .noNull('idList', '节点')
        .noNull('dateDimension', '时间维度')
        .beIn('versionType', ['CHALLENGE', 'ASSESSMENT'], '版本信息')
        .noNull('detail', '数据')
        .end()
    }
  },
  {
    apiName: 'effectTarget', // 3. 目标生效
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('dept3Id', '部门信息')
        .beIn('roleType', ['DEPT_MANAGER', 'SALER'], '角色')
        .noNull('year', '年份')
        .noNull('monthList', '月份')
        .noNull('dataDimensionList', '维度')
        .noNull('idList', '节点')
        .noNull('dateDimension', '时间维度')
        .beIn('versionType', ['CHALLENGE', 'ASSESSMENT'], '版本信息')
        .end()
    }
  },
  {
    apiName: 'queryForecastTableData', // 4. 查看预测
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('dept3Id', '部门信息')
        .beIn('roleType', ['DEPT_MANAGER', 'SALER'], '角色')
        .noNull('year', '年份')
        .noNull('monthList', '月份')
        .noNull('dataDimensionList', '维度')
        .noNull('idList', '节点')
        .noNull('dateDimension', '时间维度')
        .end()
    }
  },

  {
    apiName: 'queryForecastTableData', // 5.预测tab卡上的数据
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('versionType', '版本信息')
        .noNull('dateDimension', '时间维度')
        .end()
      //return true
    }
  },
  {
    apiName: 'queryAnalysisSaleStructureData', // 6.漏斗图和气泡图使用
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return true
    }
  },
  {
    apiName: 'queryAnalysisSaleTrendData', // 7.趋势分析图使用
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return true
    }
  },
  {
    apiName: 'queryAdjustAnalysisCombinationData', // 8.组合分析图使用
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return true
    }
  },
  {
    apiName: 'queryForecastAnalysisCombinationData', // 9.预测tab上的组合分析图
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return true
    }
  },
  {
    apiName: 'saveForecastToAdjustTable', // 10.预测tab卡的明细表格数据进行保存
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return true
    }
  },
  {
    apiName: 'resetAdjustToLastOrForecast', // 11.目标tab卡的明细表格数据重置
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return true
    }
  },
  {
    apiName: 'resetToForecast', // 12.预测页面的明细表格数据重置为原始预测数据
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return true
    }
  },
  {
    apiName: 'update', // 14.目标制定上传
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return true
    }
  },
  {
    apiName: 'queryHolidayYoy', // 12. 阴历节假日校准
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('dataDimensionList', '维度')
        .noNull('dateDimension', '时间维度')
        .noNull('dept3Id', '部门信息')
        .noNull('idList', '节点')
        .noNull('monthList', '月份')
        .beIn('roleType', ['DEPT_MANAGER', 'SALER'], '角色')
        .beIn('versionType', ['CHALLENGE', 'ASSESSMENT'], '版本信息')
        .noNull('year', '年份')
        .noNull('holiday', '节日')
        .end()
    }
  },
  {
    apiName: 'queryJieqi', // 16.节气标注
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return true
    }
  },
  {
    apiName: 'saveForecastToAdjustTable', // 17.预测页面的生成目标草稿
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return true
    }
  },
  {
    apiName: 'getTreeDiff', // 14. 查询因为组织结构树调整之后，数据存在的差异。
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .noNull('dept3Id', '部门信息')
        .beIn('versionType', ['CHALLENGE', 'ASSESSMENT'], '版本信息')
        .noNull('year', '年份')
        .noNull('monthList', '月份')
        .end()
    }
  },
  {
    apiName: 'updateTreeDiff', //15. 保存这个差异
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .noNull('dept3Id', '部门信息')
        .beIn('versionType', ['CHALLENGE', 'ASSESSMENT'], '版本信息')
        .noNull('year', '年份')
        .noNull('monthList', '月份')
        .noNull('detail', '数据')
        .end()
    }
  },
  {
    apiName: 'queryForecastInAdjust', // 13. 目标页面拉取预测数据
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('dataDimensionList', '维度')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .noNull('dept3Id', '部门信息')
        .noNull('idList', '节点')
        .beIn('roleType', ['DEPT_MANAGER', 'SALER'], '角色')
        .noNull('year', '年份')
        .noNull('monthList', '月份')
        .end()
    }
  },
  {
    apiName: 'queryAdjustOnlyTableData', // 7 . 从版本页面点击去查看目标数据(纯调整目标,无历史,无预测)
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('dataDimensionList', '维度')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .noNull('dept3Id', '部门信息')
        .noNull('idList', '节点')
        .beIn('roleType', ['DEPT_MANAGER', 'SALER'], '角色')
        .noNull('year', '年份')
        .beIn('versionType', ['CHALLENGE', 'ASSESSMENT'], '版本信息')
        .end()
    }
  },
  {
    apiName: 'downloadSaleTargetTemplate', //
    apiType: 'fileDownloadByPost',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('dept3Id', '部门信息')
        .beIn('roleType', ['DEPT_MANAGER', 'SALER'], '角色')
        .noNull('year', '年份')
        .noNull('monthList', '月份')
        .noNull('dataDimensionList', '维度')
        .noNull('idList', '节点')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '月份')
        .beIn('versionType', ['CHALLENGE', 'ASSESSMENT'], '版本信息')
        .end()
    }
  }
]

const apiObj = initApiList(apiObjectList, modelName)

// /*--------单独设置某个接口的实现---start--- */
apiObj['upload'] = function(cond) {
  return myFetch.fileUpload('/' + modelName + '/upload', cond)
}
apiObj['downloadTemplate'] = function(cond) {
  return myFetch.fileDownloadByPost('/' + modelName + '/downloadTemplate', cond).then(d => {
    console.info('downloadTemplate', d)
  })
}

// apiObj['downloadSaleTargetTemplate'] = function(cond) {
//   return myFetch.fileDownload('/' + modelName + '/downloadSaleTargetTemplate', cond).then(d => {
//     return d
//   })
// }
// /*--------单独设置某个接口的实现---end--- */
export default apiObj
