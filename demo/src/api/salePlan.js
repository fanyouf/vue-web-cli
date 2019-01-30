import myFetch from './fetch.js'

import { initApiList } from './apiTools'
import vFunc from '../utils/validate'
const modelName = 'salePlan'

/**
 * @file api模块/salePlan
 * @module api/salePlan
 */

const apiObjectList = [
  {
    apiName: 'queryForecastTableData', // 1.查询预测页面表格中的数据
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('year', '年份')
        .noNull('monthList', '查询月份')
        .noNull('dept3Id', '三级部门')
        .noNull('salerId', '采销人员')
        .noNull('dataDimensionList', '结构维度')
        .noNull('idList', '节点')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .beIn('dataType', ['GMV', 'SALE_VOLUME'], '查询类型')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .end()
    }
  },
  {
    apiName: 'queryAdjustTableData', // 2.计划tab卡上的数据
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('year', '年份')
        .noNull('monthList', '查询月份')
        .noNull('dept3Id', '三级部门')
        .noNull('salerId', '采销人员')
        .noNull('dataDimensionList', '结构维度')
        .noNull('idList', '节点')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .beIn('dataType', ['GMV', 'SALE_VOLUME'], '查询类型')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .end()
    }
  },
  {
    apiName: 'querySKUAdjustTableData', // 3 查询计划页面的SKU计划数据
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('year', '年份')
        .noNull('monthList', '查询月份')
        .noNull('dept3Id', '三级部门')
        .noNull('salerId', '采销人员')
        .noNull('dataDimensionList', '结构维度')
        .noNull('idList', '节点')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .beIn('dataType', ['GMV', 'SALE_VOLUME'], '查询类型')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .end()
    }
  },
  {
    apiName: 'queryForecastInAdjust', // 4. 获取预测功能
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('year', '年份')
        .noNull('monthList', '查询月份')
        .noNull('dept3Id', '三级部门')
        .noNull('salerId', '采销人员')
        .noNull('dataDimensionList', '结构维度')
        .noNull('idList', '节点')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .beIn('dataType', ['GMV', 'SALE_VOLUME'], '查询类型')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .boolean('isSKU', '计划类型')
        .end()
    }
  },
  {
    apiName: 'saveAdjustTableData', // 5.将当前计划页面内的明细表格数据进行保存
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('year', '年份')
        .noNull('monthList', '查询月份')
        .noNull('dept3Id', '三级部门')
        .noNull('salerId', '采销人员')
        .noNull('dataDimensionList', '结构维度')
        .noNull('idList', '节点')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .beIn('dataType', ['GMV', 'SALE_VOLUME'], '查询类型')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .boolean('isSKU', '计划类型')
        .end()
    }
  },
  {
    apiName: 'queryHolidayYoy', // 6. 农历节假日同比校准
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('year', '年份')
        .noNull('monthList', '查询月份')
        .noNull('dept3Id', '三级部门')
        .noNull('salerId', '采销人员')
        .noNull('dataDimensionList', '结构维度')
        .noNull('idList', '节点')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .beIn('dataType', ['GMV', 'SALE_VOLUME'], '查询类型')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .boolean('isSKU', '计划类型')
        .end()
    }
  },
  {
    apiName: 'downloadSumPlanTemplate', // 7. 计划页面下载用于上传的excel模板，包含根据查询条件查到的数据
    apiType: 'fileDownload',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('year', '年份')
        .noNull('monthList', '查询月份')
        .noNull('dept3Id', '三级部门')
        .noNull('salerId', '采销人员')
        .noNull('dataDimensionList', '结构维度')
        .noNull('idList', '节点')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .beIn('dataType', ['GMV', 'SALE_VOLUME'], '查询类型')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .end()
    }
  },
  {
    apiName: 'uploadPromotionPlanExcel', // 8. 上传的sku促销计划excel模板
    apiType: 'fileUpload',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('salerId', '采销人员')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .end()
    }
  },
  {
    apiName: 'queryCoreSkuFrameworkDiffTable', // 9.变动差异
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('year', '年份')
        .noNull('monthList', '查询月份')
        .noNull('dept3Id', '三级部门')
        .noNull('salerId', '采销人员')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .beIn('dataType', ['GMV', 'SALE_VOLUME'], '查询类型')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .end()
    }
  },
  {
    apiName: 'exportPromotionPlanExcel', // 10. 导出sku促销计划
    apiType: 'fileDownloadByPost',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('year', '年份')
        .noNull('monthList', '查询月份')
        .noNull('dept3Id', '三级部门')
        .noNull('salerId', '采销人员')
        .noNull('dataDimensionList', '结构维度')
        .noNull('idList', '节点')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .beIn('dataType', ['GMV', 'SALE_VOLUME'], '查询类型')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .end()
    }
  },

  {
    apiName: 'exportCommonPlanExcel', // 11. 导出计划明细数据
    apiType: 'fileDownloadByPost',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('year', '年份')
        .noNull('monthList', '查询月份')
        .noNull('dept3Id', '三级部门')
        .noNull('salerId', '采销人员')
        .noNull('dataDimensionList', '结构维度')
        .noNull('idList', '节点')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .beIn('dataType', ['GMV', 'SALE_VOLUME'], '查询类型')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .end()
    }
  },
  {
    apiName: 'saveCoreSkuFrameworkDiffTable', // 12. 保存差异
    apiType: 'post',
    isUseMockData: false,
    paraValidFunc: function(cond) {
      return vFunc(cond)
        .noNull('year', '年份')
        .noNull('monthList', '查询月份')
        .noNull('dept3Id', '三级部门')
        .noNull('salerId', '采销人员')
        .noNull('dataDimensionList', '结构维度')
        .noNull('idList', '节点')
        .beIn('roleType', ['SALER', 'DEPT_MANAGER'], '角色类型')
        .beIn('dataType', ['GMV', 'SALE_VOLUME'], '查询类型')
        .beIn('dateDimension', ['Q', 'M', 'W', 'D'], '时间维度')
        .end()
    }
  }
]

const apiObj = initApiList(apiObjectList, modelName)

/*--------单独设置某个接口的实现---start--- */
apiObj['upload'] = function(cond) {
  return myFetch.fileUpload('/' + modelName + '/upload', cond)
}
apiObj['downloadTemplate'] = function(cond) {
  return myFetch.fileDownload('/' + modelName + '/downloadTemplate', cond).then(d => {
    console.info('downloadTemplate', d)
  })
}
/*--------单独设置某个接口的实现---end--- */

export default apiObj
