//文件：/server/poemRouter.js
let express = require('express')
let router = express.Router()
const moment = require('moment')
let Mock = require('mockjs')
letconstData = require('./constData')
const _ = require('lodash')
function sleep(delay = 1000) {
  let start = new Date().getTime()
  while (new Date().getTime() - start < delay) {
    continue
  }
}

function createDateArray(start, end) {
  letstart = moment(start)
  letend = moment(end)
  let arr = []
  while (end - start > 0) {
    arr.push(start.format('YYYY-MM-DD'))
    start.add(1, 'days')
  }
  return arr
}

const R = function() {
  return Math.ceil(Math.random() * 2000)
}
// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.post('/', function(req, res) {
  res.send('销售计划！')
})

// 销售计划页：预测选项卡
// {
// 	startDate: yyyy-QQ|yyyy-MM|yyyy-WW|yyyy-MM-dd, //查询开始日期
//     endDate:  yyyy-QQ|yyyy-MM|yyyy-WW|yyyy-MM-dd, //查询结束日期
// 	saler：zhangsan,//选中节点所属的采销erp
// 	parentLevel: saler | cate1 | cate2 | cate3 | brand | sku,//选中节点对应的父节点级别
// 	parentId: 111, //选中节点对应的父节点，有且只有1个
// 	childrenLevel: saler | cate1 | cate2 | cate3 | brand | sku, //选中节点的级别
// 	childrenIdList: [123, 456, 789], //查询级别对应的id列表
// 	dataType: gmv | saleVolume, //查询数据类型
// 	dateDimension: q | m | w | d //查询时间维度
// }

// 1.预测tab卡上的数据
router.post('/queryForecastTableData', function(req, res) {
  sleep()
  console.info('asdffffffffffffffffffffffasdfsfs')
  // letmonthToSplit = req.param('monthToSplit');
  // letversionType = req.param('versionType');
  let dateDimension = 'M' //req.body.dateDimension
  // letlevel = req.body.level;
  let year = 2018
  // letchildrenIdList = req.body.childrenIdList;
  // letchildrenLevel = req.body.childrenLevel;
  // letparentId = req.body.parentId;
  // letparentLevel = req.body.parentLevel;
  let count = 5

  let rs = {}

  let endMonth = 12
  // console.dir(req.body.data) //这里是重点，我终于于得到的结果了
  let type = 'M'
  rs.total = []
  rs.columns = [{ label: '品牌', prop: 'col1' }, { label: '品类', prop: 'col2' }, { label: '销售', prop: 'col3' }]

  let _sum = 0,
    _otherSum = 0,
    _sumyoy = 0,
    _summom = 0
  for (let i = 1; i <= endMonth; i++) {
    let _t = { dateDimension: 'M' + i, val: R() * 5, otherSum: R(), editable: i > 9, modified: false }
    _sum += _t.val
    _otherSum += _t.otherSum
    rs.total.push(_t)
    if (i % 3 === 0) {
      rs.total.push({ dateDimension: 'Q' + i / 3, val: _sum, otherSum: _otherSum, editable: false, modified: false })
      _sum = 0
      _otherSum = 0
    }
  }
  rs.detail = []

  for (let i = 1; i <= count; i++) {
    let _obj = {}
    _obj.col1 = { name: 'Xcol1X' + parseInt(i / 3), id: 'icol1d' + parseInt(i / 3) }
    _obj.col2 = { name: 'XXcol2' + parseInt(i / 2), id: 'col2id' + parseInt(i / 2) }
    _obj.col3 = { name: 'Xcol3X' + i, id: 'col3id' + i }
    _obj.data = []
    for (let j = 1; j <= endMonth; j++) {
      let _t = { dateDimension: 'M' + j, yoy: R(), mom: R(), val: R(), editable: j > 3, modified: false }
      _sum += _t.val
      _sumyoy += _t.yoy
      _summom += _t.mom
      _obj.data.push(_t)
      if (j % 3 === 0) {
        _obj.data.push({ dateDimension: 'Q' + j / 3, val: _sum, mom: _summom, yoy: _sumyoy, editable: false, modified: false })
        _sum = 0
        _sumyoy = 0
        _summom = 0
      }
    }
    rs.detail.push(_obj)
  }
  rs.type = type
  res.send({ data: rs, success: true, info: '成功' })
})
// 2.计划tab卡上的数据
router.post('/queryAdjustTableData', function(req, res) {
  sleep()

  // letmonthToSplit = req.param('monthToSplit');
  // letversionType = req.param('versionType');
  let dateDimension = req.body.dateDimension
  // letlevel = req.body.level;
  let year = req.body.year
  // letchildrenIdList = req.body.childrenIdList;
  // letchildrenLevel = req.body.childrenLevel;
  // letparentId = req.body.parentId;
  // letparentLevel = req.body.parentLevel;

  let count = req.body.idList.length

  let rs = {}
  if (dateDimension === 'M') {
    let endMonth = 12
    // console.dir(req.body.data) //这里是重点，我终于于得到的结果了
    let type = 'M'
    rs.total = []
    rs.columns = [{ label: '品牌', prop: 'col1' }, { label: '品类', prop: 'col2' }, { label: '销售', prop: 'col3' }]

    let _sum = 0,
      _otherSum = 0,
      _sumyoy = 0,
      _summom = 0
    for (let i = 1; i <= endMonth; i++) {
      let _t = { dateDimension: 'M' + i, val: R() * 5, otherSum: R(), editable: i > 9, modified: false }
      _sum += _t.val
      _otherSum += _t.otherSum
      rs.total.push(_t)
      if (i % 3 === 0) {
        rs.total.push({ dateDimension: 'Q' + i / 3, val: _sum, otherSum: _otherSum, editable: false, modified: false })
        _sum = 0
        _otherSum = 0
      }
    }
    rs.detail = []

    for (let i = 1; i <= 4; i++) {
      let _obj = {}
      _obj.col1 = { name: 'Xcol1X' + parseInt(i / 3), id: 'icol1d' + parseInt(i / 3) }
      _obj.col2 = { name: 'XXcol2' + parseInt(i / 2), id: 'col2id' + parseInt(i / 2) }
      _obj.col3 = { name: 'Xcol3X' + i, id: 'col3id' + i }
      _obj.data = []
      for (let j = 1; j <= endMonth; j++) {
        let _t = { dateDimension: 'M' + j, yoy: R(), mom: R(), val: R(), editable: j > 3, modified: false }
        _sum += _t.val
        _sumyoy += _t.yoy
        _summom += _t.mom
        _obj.data.push(_t)
        if (j % 3 === 0) {
          _obj.data.push({ dateDimension: 'Q' + j / 3, val: _sum, mom: _summom, yoy: _sumyoy, editable: false, modified: false })
          _sum = 0
          _sumyoy = 0
          _summom = 0
        }
      }
      rs.detail.push(_obj)
    }
    rs.type = type
  } else if (dateDimension === 'Q') {
    // console.dir(req.body.data) //这里是重点，我终于于得到的结果了
    let type = 'Q'

    rs.total = []
    for (let i = 1; i <= 4; i++) {
      let _t = { dateDimension: 'Q' + i, val: R() * 5, editable: false, modified: false }
      rs.total.push(_t)
    }
    rs.detail = []
    for (let i = 1; i <= count; i++) {
      let _obj = { name: 'XX' + i, id: 'id' + i, data: [] }
      for (let j = 1; j <= 4; j++) {
        let _t = { dateDimension: 'Q' + j, val: R(), editable: j > 3, modified: false }
        _obj.data.push(_t)
      }
      rs.detail.push(_obj)
    }
    rs.type = type
  } else if (dateDimension === 'W') {
    let endMonth = 5
    // console.dir(req.body.data) //这里是重点，我终于于得到的结果了
    let type = 'W'
    rs.total = []
    let _sum = 0
    for (let i = 1; i <= endMonth; i++) {
      let _t = { dateDimension: 'W' + i, val: R() * 2, yoy: R(), mom: R(), editable: false, modified: false }
      rs.total.push(_t)
    }
    rs.detail = []
    for (let i = 1; i <= count; i++) {
      let _obj = { name: 'XX' + i, id: 'id' + i, data: [] }
      for (let j = 1; j <= endMonth; j++) {
        let _t = { dateDimension: 'W' + j, val: R(), yoy: R(), mom: R(), editable: j > 3, modified: false }
        _obj.data.push(_t)
      }
      rs.detail.push(_obj)
    }
    rs.type = type
  } else if (dateDimension === 'D') {
    let endMonth = 30
    // console.dir(req.body.data) //这里是重点，我终于于得到的结果了
    let type = 'D'
    rs.total = []
    let _sum = 0
    for (let i = 1; i <= endMonth; i++) {
      let _t = { dateDimension: 'D' + i, val: R() * 5, editable: false, modified: false }
      _sum += _t.val
      rs.total.push(_t)
      if (i % 7 === 0) {
        rs.total.push({ dateDimension: 'W' + i / 7, val: _sum, editable: false, modified: false })
        _sum = 0
      }
    }
    rs.detail = []
    for (let i = 1; i <= count; i++) {
      let _obj = { name: 'XX' + i, id: 'id' + i, data: [] }
      for (let j = 1; j <= endMonth; j++) {
        let _t = { dateDimension: 'd' + j, val: R(), editable: j > 24, modified: false }
        _sum += _t.val
        _obj.data.push(_t)
        if (j % 7 === 0) {
          _obj.data.push({ dateDimension: 'w' + j / 7, val: _sum, editable: false, modified: false })
          _sum = 0
        }
      }
      rs.detail.push(_obj)
    }
    rs.type = type
  }
  res.send({ data: rs, success: true, info: '成功' })
})
// 3.漏斗图和气泡图使用
router.post('/queryAnalysisSaleStructureData', function(req, res) {
  sleep()
  let childrenIdList = req.body.childrenIdList

  console.info('0001111111111111111111', req.body.childrenIdList)
  // letmonthToSplit = req.param('monthToSplit');
  // letversionType = req.param('versionType');
  // letdateDimension = req.param('dateDimension');
  // letlevel = req.param('level');
  // letyear = req.param('year');
  // letchildrenIdList = req.param('childrenIdList').split(",");
  letchildrenLevel = req.body.childrenLevel
  // letparentId = req.param('parentId');
  // letparentLevel = req.param('parentLevel');

  let ids = []
  let rs = childrenIdList.map((idName, index) => {
    let obj = { id: idName }
    obj.name = 'x' + index
    obj.val = Math.ceil(10000 * Math.random())
    obj.yoy = Math.ceil(10000 * Math.random())
    return obj
  })
  res.send({ data: rs, success: true })
})
// 4.趋势分析图使用
router.post('/queryAnalysisSaleTrendData', function(req, res) {
  sleep()
  letchildrenIdList = req.body.childrenIdList
  let list = childrenIdList.split(',').map((id, index) => {
    return 'x' + index + id
  })
  let str = 'data|' + childrenIdList.length
  let rs = Mock.mock({
    [str]: [
      {
        'name|+1': list,
        'data|30': [
          {
            year: 2018,
            quarter: 2,
            month: 4,
            week: 10,
            'day|+1': 1,
            'val|200-1200': 200
          }
        ]
      }
    ]
  })
  res.send({ data: rs.data, success: true })
})
// 5.组合分析图使用
router.post('/queryAdjustAnalysisCombinationData', function(req, res) {
  sleep()
  // letmonthToSplit = req.param('monthToSplit');
  // letversionType = req.param('versionType');
  // letdateDimension = req.param('dateDimension');
  // letlevel = req.param('level');
  // letyear = req.param('year');
  // letchildrenIdList = req.param('childrenIdList');
  // letchildrenLevel = req.param('childrenLevel');
  // letparentId = req.param('parentId');
  // letparentLevel = req.param('parentLevel');
  //
  // letcount = childrenIdList.split(",").length;

  let rs = Mock.mock({
    'name|+1': ['美的1', '美的2', '美的3', '美的4', '美的5', '美的6'],
    ...Mock.mock({
      'data|30': [
        {
          year: 2018,
          quarter: 2,
          month: 4,
          week: 10,
          'day|+1': 1,
          'val|1000-1200': 1000,
          'mom|1000-1200': 1000,
          'yoy|1000-1200': 1000,
          dataType: this.day > 18 ? 'history' : 'forecast',
          'hasExtendVal|1-2': true,
          'extendVal|1000-1200': 1000
        }
      ]
    })
  })
  res.send({ data: rs, success: true })
})
// 6.预测tab上的组合分析图
router.post('/queryForecastAnalysisCombinationData', function(req, res) {
  sleep()
  letyear = 2018
  letdateDimension = req.param('dateDimension')
  letstart = req.body.startDate.split('-')[1] * 1
  letend = req.body.endDate.split('-')[1] * 1
  let data = _.range(start, end + 1).map(i => {
    let quarter = dateDimension === 'Q' ? i : ''
    let month = dateDimension === 'M' ? i : ''
    let week = dateDimension === 'W' ? i : ''
    let day = dateDimension === 'D' ? i : ''
    return {
      year,
      quarter,
      month,
      week,
      day,
      val: _.random(100, 200),
      mom: _.random(100, 200),
      yoy: _.random(100, 200),
      dataType: i < (start + end) / 2 ? 'history' : 'forecast',
      hasExtendVal: i > (start + end) / 2,
      extendVal: _.random(100, 200) // 目标，或者是计划
    }
  })

  let rs = {
    name: '汇总',
    data
  }
  res.send({ data: rs, success: true })
})

router.post('/querySKUAdjustTableData', function(req, res) {
  let rs = {
    columns: [{ label: '品牌', prop: 'col1' }, { label: '品类', prop: 'col2' }, { label: '采销', prop: 'col3' }, { label: 'SKU', prop: 'sku' }], // 表头 ,
    target: [
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '美的', id: 111 },
        col3: { name: '张三', id: 3499885 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 10, editable: false },
          { year: 2018, month: 9, day: 2, dateDimension: 'D9-2', value: 10, editable: false },
          { year: 2018, month: 9, day: 3, dateDimension: 'D9-3', value: 10, editable: false },
          { year: 2018, month: 9, day: 4, dateDimension: 'D9-4', value: 10, editable: false },
          { year: 2018, month: 9, day: 5, dateDimension: 'D9-5', value: 10, editable: false },
          { year: 2018, month: 9, day: 6, dateDimension: 'D9-6', value: 10, editable: false }
        ]
      },
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '松下', id: 345 },
        col3: { name: '张三', id: 3499885 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 16, editable: false },
          { year: 2018, month: 9, day: 2, dateDimension: 'D9-2', value: 15, editable: false },
          { year: 2018, month: 9, day: 3, dateDimension: 'D9-3', value: 14, editable: false },
          { year: 2018, month: 9, day: 4, dateDimension: 'D9-4', value: 13, editable: false },
          { year: 2018, month: 9, day: 5, dateDimension: 'D9-5', value: 14, editable: false },
          { year: 2018, month: 9, day: 6, dateDimension: 'D9-6', value: 11, editable: false }
        ]
      },
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '松下', id: 345 },
        col3: { name: '李四', id: 34998815 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 16, editable: false },
          { year: 2018, month: 9, day: 2, dateDimension: 'D9-2', value: 15, editable: false },
          { year: 2018, month: 9, day: 3, dateDimension: 'D9-3', value: 14, editable: false },
          { year: 2018, month: 9, day: 4, dateDimension: 'D9-4', value: 13, editable: false },
          { year: 2018, month: 9, day: 5, dateDimension: 'D9-5', value: 14, editable: false },
          { year: 2018, month: 9, day: 6, dateDimension: 'D9-6', value: 11, editable: false }
        ]
      },
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '美的', id: 111 },
        col3: { name: '张三', id: 3499885 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 16, editable: false },
          { year: 2018, month: 9, day: 2, dateDimension: 'D9-2', value: 15, editable: false },
          { year: 2018, month: 9, day: 3, dateDimension: 'D9-3', value: 14, editable: false },
          { year: 2018, month: 9, day: 4, dateDimension: 'D9-4', value: 13, editable: false },
          { year: 2018, month: 9, day: 5, dateDimension: 'D9-5', value: 14, editable: false },
          { year: 2018, month: 9, day: 6, dateDimension: 'D9-6', value: 11, editable: false }
        ]
      },
      {
        col1: { name: '电视', id: 871 },
        col2: { name: '长虹', id: 348 },
        col3: { name: '张三', id: 3499885 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 2, dateDimension: 'D9-2', value: 2, yoy: 2, plan: _.random(5, 8), editable: true },
          { year: 2018, month: 9, day: 3, dateDimension: 'D9-3', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 4, dateDimension: 'D9-4', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 5, dateDimension: 'D9-5', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 6, dateDimension: 'D9-6', value: 2, yoy: 2, plan: _.random(5, 8), editable: false }
        ]
      }
    ],
    rows: [
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '美的', id: 111 },
        col3: { name: '张三', id: 3499885 },
        sku: { name: '美的1号', id: 3451 },
        dataType: '新增||删除',
        data: [
          {
            year: 2018,
            month: 9,
            day: 1,
            dateDimension: 'D9-1',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: [{ label: '活动1' }, { label: '活动2' }, { label: '活动3' }],
            editable: true
          },
          {
            year: 2018,
            month: 9,
            day: 2,
            dateDimension: 'D9-2',
            value: 2,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 20,
            volume: 4,
            pagePrice: 4.5,
            price: 5,
            promotionList: [{ label: '活动11' }, { label: '活动21' }, { label: '活动31' }],
            editable: true
          },
          {
            year: 2018,
            month: 9,
            day: 3,
            dateDimension: 'D9-3',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: [{ label: '活动1' }, { label: '活动2' }, { label: '活动3' }],
            editable: true
          },
          {
            year: 2018,
            month: 9,
            day: 4,
            dateDimension: 'D9-4',
            value: 3,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: [{ label: '活动1' }, { label: '活动2' }, { label: '活动3' }],
            editable: true
          },
          {
            year: 2018,
            month: 9,
            day: 5,
            dateDimension: 'D9-5',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: [{ label: '活动1' }, { label: '活动2' }, { label: '活动3' }],
            editable: true
          },
          {
            year: 2018,
            month: 9,
            day: 6,
            dateDimension: 'D9-6',
            value: 5,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: [{ label: '活动1' }, { label: '活动2' }, { label: '活动3' }],
            editable: true
          }
        ]
      },
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '美的', id: 111 },
        col3: { name: '张三', id: 3499885 },

        sku: { name: '美的2号', id: 3452 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 1, yoy: 1, plan: _.random(5, 8), editable: true },
          {
            year: 2018,
            month: 9,
            day: 2,
            dateDimension: 'D9-2',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: [{ label: '活动1' }, { label: '活动2' }, { label: '活动3' }],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 3,
            dateDimension: 'D9-3',
            value: 3,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: [{ label: '活动1' }, { label: '活动2' }, { label: '活动3' }],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 4,
            dateDimension: 'D9-4',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: [{ label: '活动1' }, { label: '活动2' }, { label: '活动3' }],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 5,
            dateDimension: 'D9-5',
            value: 6,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: [{ label: '活动1' }, { label: '活动2' }, { label: '活动3' }],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 6,
            dateDimension: 'D9-6',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: [{ label: '活动1' }, { label: '活动2' }, { label: '活动3' }],
            editable: false
          }
        ]
      },
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '美的', id: 111 },
        col3: { name: '张三', id: 3499885 },

        sku: { name: '其他', id: 3452 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 1, yoy: 1, plan: _.random(5, 8), editable: true },
          {
            year: 2018,
            month: 9,
            day: 2,
            dateDimension: 'D9-2',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 3,
            dateDimension: 'D9-3',
            value: 3,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 4,
            dateDimension: 'D9-4',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 5,
            dateDimension: 'D9-5',
            value: 6,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 6,
            dateDimension: 'D9-6',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          }
        ]
      },
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '美的', id: 111 },
        col3: { name: '李四', id: 34998815 },

        sku: { name: '其他', id: 3452 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 1, yoy: 1, plan: _.random(5, 8), editable: true },
          {
            year: 2018,
            month: 9,
            day: 2,
            dateDimension: 'D9-2',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 3,
            dateDimension: 'D9-3',
            value: 3,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 4,
            dateDimension: 'D9-4',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 5,
            dateDimension: 'D9-5',
            value: 6,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 6,
            dateDimension: 'D9-6',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          }
        ]
      },
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '松下', id: 345 },
        col3: { name: '张三', id: 3499885 },
        sku: { name: '红色1号', id: 3451 },
        data: [
          {
            year: 2018,
            month: 9,
            day: 1,
            dateDimension: 'D9-1',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 2,
            dateDimension: 'D9-2',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 3,
            dateDimension: 'D9-3',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 4,
            dateDimension: 'D9-4',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 5,
            dateDimension: 'D9-5',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          },
          {
            year: 2018,
            month: 9,
            day: 6,
            dateDimension: 'D9-6',
            value: 1,
            yoy: 1,
            plan: _.random(5, 8),
            GMV: 10,
            volume: 2,
            pagePrice: 4.5,
            price: 5,
            promotionList: ['活动1', '活动2', '活动3'],
            editable: false
          }
        ]
      },
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '松下', id: 345 },
        col3: { name: '张三', id: 3499885 },

        sku: { name: '红色2号', id: 3452 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 1, yoy: 1, plan: _.random(5, 8), editable: true },
          { year: 2018, month: 9, day: 2, dateDimension: 'D9-2', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 3, dateDimension: 'D9-3', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 4, dateDimension: 'D9-4', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 5, dateDimension: 'D9-5', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 6, dateDimension: 'D9-6', value: 1, yoy: 1, plan: _.random(5, 8), editable: false }
        ]
      },
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '松下', id: 345 },
        col3: { name: '张三', id: 3499885 },

        sku: { name: '红色3号', id: 3452 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 2, dateDimension: 'D9-2', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 3, dateDimension: 'D9-3', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 4, dateDimension: 'D9-4', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 5, dateDimension: 'D9-5', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 6, dateDimension: 'D9-6', value: 1, yoy: 1, plan: _.random(5, 8), editable: false }
        ]
      },
      {
        col1: { name: '空调', id: 870 },
        col2: { name: '松下', id: 345 },
        col3: { name: '李四', id: 34998815 },
        sku: { name: '红色4号', id: 4452 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 2, dateDimension: 'D9-2', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 3, dateDimension: 'D9-3', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 4, dateDimension: 'D9-4', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 5, dateDimension: 'D9-5', value: 1, yoy: 1, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 6, dateDimension: 'D9-6', value: 1, yoy: 1, plan: _.random(5, 8), editable: false }
        ]
      },
      {
        col1: { name: '电视', id: 871 },
        col2: { name: '长虹', id: 348 },
        col3: { name: '张三', id: 3499885 },

        sku: { name: '长虹1号', id: 34521 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 2, dateDimension: 'D9-2', value: 2, yoy: 2, plan: _.random(5, 8), editable: true },
          { year: 2018, month: 9, day: 3, dateDimension: 'D9-3', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 4, dateDimension: 'D9-4', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 5, dateDimension: 'D9-5', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 6, dateDimension: 'D9-6', value: 2, yoy: 2, plan: _.random(5, 8), editable: false }
        ]
      },
      {
        col1: { name: '电视', id: 871 },
        col2: { name: '长虹', id: 348 },
        col3: { name: '张三', id: 3499885 },

        sku: { name: '长虹2号', id: 34529 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 2, dateDimension: 'D9-2', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 3, dateDimension: 'D9-3', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 4, dateDimension: 'D9-4', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 5, dateDimension: 'D9-5', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 6, dateDimension: 'D9-6', value: 2, yoy: 2, plan: _.random(5, 8), editable: false }
        ]
      },
      {
        col1: { name: '电视', id: 871 },
        col2: { name: '长虹', id: 348 },
        col3: { name: '张三', id: 3499885 },

        sku: { name: '长虹3号', id: 34528 },
        data: [
          { year: 2018, month: 9, day: 1, dateDimension: 'D9-1', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 2, dateDimension: 'D9-2', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 3, dateDimension: 'D9-3', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 4, dateDimension: 'D9-4', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 5, dateDimension: 'D9-5', value: 2, yoy: 2, plan: _.random(5, 8), editable: false },
          { year: 2018, month: 9, day: 6, dateDimension: 'D9-6', value: 2, yoy: 2, plan: _.random(5, 8), editable: false }
        ]
      }
      // ....
    ]
    //rows1:[],
  }
  res.send({ data: rs, success: true })
})

router.get('/queryDiffData', function(req, res) {
  let rs = {
    uploadSuccess: false,
    uploadErrorList: {
      notExist: {
        columns: ['skuID', 'skuName'],
        rows: [{ skuId: '', skuName: '' }]
      }
    }
  }
  res.send({ data: rs, success: true })
})

router.get('/querySKUAdjustTableData', function(req, res) {
  let rs = {
    name: '汇总',
    data: [1, 2, 3]
  }
  res.send({ data: rs, success: true })
})

// 'saveAdjustTableData',                  // 7.计划tab卡的明细表格数据进行保存
// 'saveForecastToAdjustTable',            // 8.预测tab卡的明细表格数据进行保存
// 'resetAdjustToLastOrForecast',          // 9.计划tab卡的明细表格数据重置
// 'resetToForecast',                      // 10.预测页面的明细表格数据重置为原始预测数据
// 'querySalePriceTableData',              // 11.查询sku售价数据

module.exports = router
