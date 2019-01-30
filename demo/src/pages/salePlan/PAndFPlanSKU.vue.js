/**
 * @file PAndFPlanSku.vue.js
 * @module salePlan/PAndFPlanSku
 * @description PAndFPlanSku.vue的补充
 */
const _ = require('lodash')
const FIXEDNUMBER = 1

// 季： 合计 目标   计划   计划达成偏差
// 月： 合计 目标   计划   计划达成偏差  目标实际达成率MTD
// 周： 合计        计划   计划达成偏差  目标实际达成率MTD
// 天： 合计        计划   计划达成偏差  目标实际达成率MTD  同期销售进度

const _ind_heji = { label: '合计', value: '合计', checked: true }
const _ind_mubiao = { label: '目标', value: '目标', checked: true }
const _ind_jihua = { label: '计划', value: '计划', checked: true }
const _ind_jihuadachengpiancha = { label: '计划达成偏差', value: '计划达成偏差', checked: true }
const _ind_mubiaoshijidachenglv = { label: '目标实际达成率MTD', value: '目标实际达成率MTD', checked: true }
const _ind_tongqixiaoshoujindu = { label: '同期销售进度', value: '同期销售进度', checked: true }

const layoutSettingsMap = {
  Q: _.cloneDeep([_ind_heji, _ind_mubiao, _ind_jihua, _ind_jihuadachengpiancha]),
  M: _.cloneDeep([_ind_heji, _ind_mubiao, _ind_jihua, _ind_jihuadachengpiancha, _ind_mubiaoshijidachenglv]),
  W: _.cloneDeep([_ind_heji, _ind_jihua, _ind_jihuadachengpiancha, _ind_mubiaoshijidachenglv]),
  D: _.cloneDeep([_ind_heji, _ind_jihua, _ind_jihuadachengpiancha, _ind_mubiaoshijidachenglv, _ind_tongqixiaoshoujindu])
}
export default {
  _getNumberLenFormStr(str) {
    str = String(str)
    let charAndNumberAndstocken = /[\w\(\)\-\.\,]/g
    let arr = str.match(charAndNumberAndstocken) // 找出数字，
    if (arr) {
      return (str.length - arr.length) * 2 + arr.length
    } else {
      // 纯汉字
      return str.length * 2
    }
  },
  _getNumberLenFormPercent(val) {
    // 0.9921 -> 99.2%
    // 1235 -> 123500.0%
    let strVal = 100 * val + ''
    let index = strVal.indexOf('.')

    if (index > -1) {
      return index + 3
    } else {
      return strVal.length + 3
    }
  },
  _getNumberLenForYuan(val) {
    let index = String(val).indexOf('.')
    // 整数位的长度
    index = index > -1 ? index : String(val).length

    let len = index + Math.floor(index / 3) + 2
    return val > 0 ? len : len + 1
  },
  _getNumberLenForThousand(val) {
    val = val / 1000

    let index = String(val).indexOf('.')
    // 整数位的长度
    index = index > -1 ? index : String(val).length

    let len = index + Math.floor(index / 3) + 2
    return val > 0 ? len : len + 1
  },
  _getNumberLenForWan(val) {
    val = val / 1000 / 10

    let index = String(val).indexOf('.')
    // 整数位的长度
    index = index > -1 ? index : String(val).length

    let len = index + Math.floor(index / 3) + 2
    return val > 0 ? len : len + 1
  },
  _getNumberLenForMillion(val) {
    val = val / 1000 / 1000

    let index = String(val).indexOf('.')
    // 整数位的长度
    index = index > -1 ? index : String(val).length

    let len = index + Math.floor(index / 3) + 2
    return val > 0 ? len : len + 1
  },
  cellWidthGetLength(obj) {
    if (obj.val === undefined) {
      return 0
    }
    let len = String(obj.val).length
    if (obj.dataType === 'number') {
      if (this.pMoneyUnit === 'yuan') {
        len = this._getNumberLenForYuan(obj.val)
      } else if (this.pMoneyUnit === 'thousand') {
        len = this._getNumberLenForThousand(obj.val)
      } else if (this.pMoneyUnit === 'wan') {
        len = this._getNumberLenForWan(obj.val)
      } else if (this.pMoneyUnit === 'million') {
        len = this._getNumberLenForMillion(obj.val)
      }
    } else if (obj.dataType === 'percent') {
      len = this._getNumberLenFormPercent(obj.val)
    } else if (obj.dataType === 'string') {
      len = this._getNumberLenFormStr(obj.val)
    }

    // console.info(obj.dataType, obj.val, len)
    return len
  },
  getLayoutSetting(dateDimension) {
    if ('QMWD'.includes(dateDimension)) {
      return _.cloneDeep(layoutSettingsMap[dateDimension])
    } else {
      console.error('获取sku计划页面的指标错误,必须是QMWD', dateDimension)
      return _.cloneDeep(layoutSettingsMap['Q'])
    }
  },
  /**
   * @method _createTargetRows
   * @param {*} total
   * @param {*} maxLevel
   * @returns
   */
  _createTargetRows(total, maxLevel) {
    // maxLevel  // col1,...coln 。最后一个coln是sku
    if (!total) return []
    let rs = total.map(item => {
      let r = {}
      r.rowType = '目标'
      for (let i = 1; i <= maxLevel - 1; i++) {
        let colx = 'col' + i
        r[colx] = {
          val: [item[colx].id, item[colx].name].join('-').trim(),
          id: item[colx].id,
          dataType: 'string'
        }
      }
      let colNameForSKU = 'col' + maxLevel
      r[colNameForSKU] = {
        val: '目标',
        id: item['col' + (maxLevel - 1)].id,
        dataType: 'string'
      }
      item.data.forEach(it => {
        r[it.dateDimension] = it
      })

      return r
    })
    return rs
  },
  /**
   * 计算如下指标：计划，合计，计划达成偏差，同期销售进度
   * @param {Array} basicRows 基础数据行
   * @param {Array} dataColumns 表示数据的列 m1,m2... W1,...
   * @param {String} levelType 表示分类汇总的级别，col1,col2.......
   * @param {Int} maxColLevel 目标数据行中包含的最深的级数 [col1,...coln] 注意coln一定是SKU,它不需要参加汇总计算
   */
  _getMerginSumByLevel(basicRows, dataColumns, levelType = 'col1', maxColLevel = 3) {
    if (!basicRows.length) return []
    let items = basicRows.map(item => {
      return this._getLevelKey(item, levelType)
    })

    let cLevelKeys = Array.from(new Set(items))

    let data = _.cloneDeep(basicRows)

    let result = cLevelKeys.map(item => {
      return data.filter(it => {
        return item === this._getLevelKey(it, levelType)
      })
    })

    // 同期销售进度放在非核心sku那一行中

    let total = result.map(arr => {
      // + levelType
      let value = { levelType, rowType: '合计' }
      let plan = { levelType, rowType: '计划' }
      let planDiff = { levelType, rowType: '计划达成偏差' }
      let yoy = { levelType, rowType: '同期销售进度' }
      let sumRS = 0
      let sumPlan = 0
      let firstRow = arr[0]
      // 给数据列赋值
      dataColumns.forEach(colName => {
        let r = arr.reduce(
          (init, item) => {
            return {
              plan: init.plan * 1 + item[colName].plan * 1,
              val: init.val * 1 + item[colName].val * 1
            }
          },
          { plan: 0, val: 0 }
        )
        value[colName] = { id: firstRow[colName].id, val: r.val, dataType: 'number' }
        planDiff[colName] = { id: firstRow[colName].id, val: r.plan }
        plan[colName] = { id: firstRow[colName].id, val: r.plan, dataType: 'number' }
        yoy[colName] = { id: firstRow[colName].id, val: '', dataType: 'percent' }
        sumRS += 1 * r.val
        sumPlan += 1 * r.plan
      })
      value['sum'] = { editable: false, val: sumRS, dataType: 'number' }
      planDiff['sum'] = { editable: false, val: '', dataType: 'percent' }
      yoy['sum'] = { editable: false, val: '', dataType: 'percent' }

      // if (sumPlan === 0) {
      //   planDiff['sum'] = { editable: false, val: '', dataType: 'percent' }
      // } else {
      //   planDiff['sum'] = { editable: false, val: ((100 * sumRS) / sumPlan).toFixed(FIXEDNUMBER) + '%', dataType: 'percent' }
      // }

      plan['sum'] = { editable: false, val: sumPlan, dataType: 'number' }

      for (let i = 1; i <= maxColLevel; i++) {
        let colx = 'col' + i
        //当前的层级次序
        let currentLevel = levelType.substr(3, 1)

        if (colx in firstRow) {
          // 比当前层级次序高的，使用自己的val值.
          // 例如，当前在col2级别汇总，则col1使用自己的val，而col2,col3,... 使用 固定词汇
          let rsVal = currentLevel >= i ? firstRow[colx].val : '合计'
          let planDiffVal = currentLevel >= i ? firstRow[colx].val : '计划达成偏差'
          let yoyVal = currentLevel >= i ? firstRow[colx].val : '同期销售进度'
          let planVal = currentLevel >= i ? firstRow[colx].val : '计划'
          value[colx] = {
            val: rsVal,
            id: firstRow[colx].id
          }
          planDiff[colx] = {
            val: planDiffVal,
            title: planDiffVal === '计划达成偏差' ? '|1-计划值/实际GMV|' : '',
            id: firstRow[colx].id
          }
          yoy[colx] = {
            val: yoyVal,
            id: firstRow[colx].id
          }
          plan[colx] = {
            val: planVal,
            id: firstRow[colx].id
          }
        }
      }
      // 处理横向时间占比
      arr.forEach(row => {
        // console.info(row.isCoreSkuRow)
      })
      let otherSku = arr.find(it => it.isCoreSkuRow === false)
      if (otherSku) {
        let _temp = [],
          _yoySum = []
        dataColumns.forEach((item, index) => {
          _temp[index] = otherSku[item].yoy
          _yoySum[index] = otherSku[item].yoy
        })

        // 横向汇总
        // x1,x2,xn ----> xn = x1+...+xn-1
        _yoySum.forEach((item, index) => {
          if (index !== 0) {
            _yoySum[index] = _yoySum[index] + _yoySum[index - 1]
          }
          dataColumns.forEach((item, index) => {
            if (_temp[index] === 0) {
              yoy[item].val = ''
            } else {
              if (otherSku[item].yoySum === 0) {
                yoy[item].val = ''
              } else {
                yoy[item].val = ((100 * _yoySum[index]) / otherSku[item].yoySum).toFixed(FIXEDNUMBER) + '%'
              }
            }
          })
        })
      }

      dataColumns.forEach((item, index) => {
        planDiff[item].dataType = 'percent'
        if (value[item].val === 0 || planDiff[item].val === 0) {
          planDiff[item].val = ''
        } else {
          // planDiff[item].val = ((100 * value[item].val) / planDiff[item].val).toFixed(FIXEDNUMBER) + '%'
          let t = Math.abs(100 * (1 - planDiff[item].val / value[item].val))

          planDiff[item].val = t.toFixed(FIXEDNUMBER) + '%'
        }
      })

      return [value, plan, planDiff, yoy]
    })

    return _.flatten(total)
  },
  _getLevelKey(d, levelType = 'col1') {
    let rs = ''
    try {
      switch (levelType) {
        case 'col0':
          rs = 'd.col1.id'
          break
        case 'col1':
          rs = d.col1.id
          break
        case 'col2':
          rs = [d.col1.id, d.col2.id].join('-')
          break
        case 'col3':
          rs = [d.col1.id, d.col2.id, d.col3.id].join('-')
          break
        case 'col4':
          rs = [d.col1.id, d.col2.id, d.col3.id, d.col4.id].join('-')
          break
        default:
          console.error(`levelType:${levelType}`)
          break
      }
    } catch (e) {
      console.info(e, d, levelType)
    }
    return rs
  },

  /**
   *
   * @param {Array} basicTargetRows 包含目标数据的行
   * @param {Array} dataColumns 数据列 m1,m2,....
   * @param {String} levelType 当前汇总维度 col1
   * @param {int} maxColLevel 目标数据行中包含的最深的级数 [col1,...coln] 注意coln一定是SKU,它不需要参加汇总计算
   */
  getTargetRowByLevelType(_basicTargetRows, dataColumns, levelType, maxColLevel) {
    if (_basicTargetRows.length === 0) {
      return []
    }
    let basicTargetRows = _.cloneDeep(_basicTargetRows)
    let curLevel = levelType.substr(3, 1) * 1

    let items = basicTargetRows.map(item => this._getLevelKey(item, levelType))
    let cLevelKeys = Array.from(new Set(items))

    let merginArr = cLevelKeys.map(levelKey => {
      return basicTargetRows.filter(item => this._getLevelKey(item, levelType) === levelKey)
    })

    let result = merginArr.map(arr => {
      let rs = _.cloneDeep(arr[0])
      let sum = 0
      rs.rowType = '目标'

      dataColumns.forEach(colName => {
        let r = arr.reduce((val, item) => {
          return val * 1 + item[colName].val * 1
        }, 0)

        sum += r

        rs[colName] = { id: arr[0][colName].id, val: r, dataType: 'number' }
      })

      for (let i = 1; i <= maxColLevel; i++) {
        let colx = 'col' + i
        if (i > curLevel) {
          rs[colx].val = '目标'
        }
      }

      rs['sum'] = { val: sum, editable: false, dataType: 'number' }
      return rs
    })
    return result
  },

  /**
   * @param {Array} targetRowsWithlevelType
   * @param {Array} _basicRows - 基础数据行
   * @param {Array} dataColumns - 数据列
   * @param {String} levelType
   * @param {Int} maxColLevel
   * @returns Array
   */
  getTargetPercentRowByLevelType(targetRowsWithlevelType, _basicRows, dataColumns, levelType, maxColLevel) {
    let basicRows = _.cloneDeep(_basicRows)
    if (basicRows.length === 0 || targetRowsWithlevelType.length === 0) {
      return []
    }
    let curLevel = levelType.substr(3, 1) * 1

    let items = basicRows.map(item => this._getLevelKey(item, levelType))
    let cLevelKeys = Array.from(new Set(items))

    let merginArr = cLevelKeys.map(levelKey => {
      return basicRows.filter(item => this._getLevelKey(item, levelType) === levelKey)
    })

    let result = merginArr.map(arr => {
      let rs = _.cloneDeep(arr[0])
      rs.rowType = '目标实际达成率MTD'
      let sum = 0
      dataColumns.forEach(colName => {
        let r = arr.reduce((val, item) => {
          return val * 1 + item[colName].val * 1
        }, 0)
        sum += r

        if(this.dateDimension === "D" || this.dateDimension === "W")
        {
          rs[colName] = { id: arr[0][colName].id, val: sum, dataType: 'percent' }
        }
        else {
          rs[colName] = { id: arr[0][colName].id, val: r, dataType: 'percent' }
        }
      })

      for (let i = 1; i <= maxColLevel; i++) {
        let colx = 'col' + i
        if (i > curLevel) {
          rs[colx].val = '目标实际达成率MTD'
          rs[colx].title = '月至今实际GMV累计/当月销售目标'
        }
      }
      rs['sum'] = { val: sum, editable: false, dataType: 'percent' }
      return rs
    })

    result.forEach((obj,index) => {
      let totalTargetObj = targetRowsWithlevelType.find(it => this._getLevelKey(it, levelType) === this._getLevelKey(obj, levelType))
      if (totalTargetObj) {
        dataColumns.forEach(colName => {
          if (totalTargetObj[colName].val !== 0) {
            obj[colName].val = ((100 * obj[colName].val) / totalTargetObj[colName].val).toFixed(FIXEDNUMBER) + '%'
          } else {
            obj[colName].val = ''
          }
        })
        // console.info(targetRowsWithlevelType, obj['sum'].val, totalTargetObj['sum'].val)
        obj['sum'].val = ''

      } else {
        this._error("数据有误！");
        console.error('在target中找不到汇总目标值,begin')
        console.dir(result,index,obj, this._getLevelKey(obj, levelType),targetRowsWithlevelType)
        console.error('在target中找不到汇总目标值，end')
      }
    })
    return result
  },

  _calcTargetAndPercent(targetRows, basicRows, dataColumns, levelType = 'col1', maxColLevel = 4) {
    if (!targetRows) {
      return []
    }

    // 1.根据levelType 求出目标行

    let targetRowsWithlevelType = this.getTargetRowByLevelType(targetRows, dataColumns, levelType, maxColLevel)

    let targetPercentRowsWithlevelType = this.getTargetPercentRowByLevelType(targetRowsWithlevelType, basicRows, dataColumns, levelType, maxColLevel)
    console.info('-----calcTarget', levelType, maxColLevel, targetRowsWithlevelType, targetPercentRowsWithlevelType)
    return _.flatten([targetRowsWithlevelType,targetPercentRowsWithlevelType])
  },
  _insertLevelData(data, levelType = 'col1', basicRows = []) {
    if (!data) return basicRows
    data.forEach(it => {
      let curLevelKey = this._getLevelKey(it, levelType)
      let index = basicRows.findIndex((item, index) => {
        let cur = item
        let next = basicRows[index + 1]
        let colname = this._getLevelKey(item, levelType)

        if (colname === curLevelKey) {
          if (!next) {
            return true
          } else {
            if (this._getLevelKey(next, levelType) !== curLevelKey) {
              return true
            }
          }
        }
        return false
      })
      basicRows.splice(index + 1, 0, it)
    })
    return basicRows
  }
}
