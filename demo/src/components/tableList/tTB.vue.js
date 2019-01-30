const _ = require('lodash')
export default {
  collectDetail() {
    // 汇总
    if (this.detailData.length === 0) return
    let obj = {},
      _sumVal = 0,
      _sum = 0,
      _sumYoy = 0,
      _obj = {},
      val = 0,
      list = [],
      editable = false

    this.mixinCBasicDataColumnNames.forEach(item => {
      _sumVal = 0
      _sumYoy = 0
      _obj = {}
      this.detailData.forEach(it => {
        let _t = it.data.find(d => d.dateDimension === item)
        _sumVal += parseFloat(_t ? _t.val : 0)
        _sumYoy += parseFloat(_t ? _t.yoy : 0)
        editable = _t.editable
      })
      if (_sumYoy === 0) {
        val = 0
        editable = false
      } else {
        val = (_sumVal / _sumYoy - 1) * 100
      }
      obj[item] = { sumVal: _sumVal, sumYoy: _sumYoy, val: val.toFixed(3), editable, rownum: 1, dataType: 'percent' }
    })

    _sumVal = 0
    _sumYoy = 0
    for (let key in obj) {
      if (key.substr(0, 1) === this.pDateDimension) {
        _sumVal += parseFloat(obj[key].sumVal)
        _sumYoy += parseFloat(obj[key].sumYoy)
        // console.info(_sumVal,_sumYoy)
      }
    }

    // 汇总行中表头部分的列
    this.pColumnsDimension.forEach(item => {
      obj[item.prop] = {
        id: item.prop,
        val: '汇总', //item.label,
        dataType: 'string',
        editable: false
      }
    })

    obj['yearMonth'] = { val: this.pYearMonth }

    if (_sumYoy === 0) {
      val = 0
    } else {
      val = (_sumVal / _sumYoy - 1) * 100
    }
    obj['sum'] = { val: val.toFixed(3), realVal: _sumVal, yoy: _sumYoy, editable: false, dataType: 'percent' }
    obj.rowType = '汇总'
    return obj
  },

  getRows() {
    // 表格中的数据项
    let arr = [],
      _sumYoy = 0,
      _sumVal = 0,
      val = 0,
      editable = false
    // console.info("同比表中接收到的详细数据是：")
    // console.info( this.detailData );
    if (this.detailData.length === 0) {
      return []
    }
    arr.push(this.collectDetail())

    let preFix = this.pDateDimension
    this.detailData.forEach(it => {
      let obj = {}

      // 不显示 - 采销的id
      this.pColumnsDimension.forEach(item => {
        let val = [it[item.prop].id, it[item.prop].name].join('-')
        if (item.label === '采销') {
          val = it[item.prop].name
        }
        obj[item.prop] = {
          id: it[item.prop].id,
          val: val,
          dataType: 'string'
        }
      })

      _sumVal = 0
      _sumYoy = 0
      it.data.forEach(d => {
        let _preFix = d.dateDimension.substring(0, 1)
        if (d.yoy === 0) {
          val = 0
          editable = false
        } else {
          val = (d.val / d.yoy - 1) * 100
          editable = d.editable
        }

        obj[d.dateDimension] = { realVal: d.val, editable, val: val.toFixed(3), yoy: d.yoy, dataType: 'percent' }
        if (_preFix === preFix) {
          // 这一行中有m1,m2,m3,q1，很明显，我们只对m进行求合。
          _sumVal += parseFloat(d.val)
          _sumYoy += parseFloat(d.yoy)
        }
      })
      if (_sumYoy === 0) {
        val = 0
      } else {
        val = (_sumVal / _sumYoy - 1) * 100
      }
      // 最后一列
      obj['sum'] = { val: val.toFixed(3), realVal: _sumVal, yoy: _sumYoy, editable: false, dataType: 'percent' }
      obj['yearMonth'] = {
        val: this.pYearMonth, //
        editable: false
      }

      arr.push(obj)
    })
    // console.info("同比中的表格数据是：",arr)
    return arr
  }
}
