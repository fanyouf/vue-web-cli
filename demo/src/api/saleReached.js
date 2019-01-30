import { initApiList } from './apiTools'

const apiObjectList = [
  {
    apiName: 'getSaleReachedData', //查询达成分析数据
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  },
  {
    apiName: 'getTrendAnalysisData', //查询达成页面趋势分析数据
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  },
  {
    apiName: 'getStockDetailAnalysisData', //查询PV现货率表格
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  },
  {
    apiName: 'getStockDetailAnalysisData', //查询库存周转表格
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  },
  {
    apiName: 'getIndicationAnalysisData', //查询指标分析数据
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  },
  {
    apiName: 'getTheMonthDetail', //查询本月概况数据
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  },
  {
    apiName: 'queryStockGMV', //查询GMV分仓排名及同比分析
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  },
  {
    apiName: 'queryStockPie', //查询仓库占比分析
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  },
  {
    apiName: 'queryStockDetailTable', //查询库存健康指标数据
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  },
  {
    apiName: 'getGMVYoy', //查询gmv及同比信息
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  },
  {
    apiName: 'getDetailTrendAnalysisData', //查询明细页面趋势分析
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  },
  {
    apiName: 'getSaleBoardData', //查询达成看板概览数据s
    apiType: 'post1',
    isUseMockData: false,
    paraValidFunc: function() {
      return true
    }
  }
]

const apiObj = initApiList(apiObjectList, 'saleAnalysis')
// /*--------单独设置某个接口的实现---开始--- */
// /*--------单独设置某个接口的实现---end--- */
export default apiObj
