
const _ = require('lodash')

export default {
  /**
   * 表格中的第一行，汇总行
   */
  getTotalRow() {
    let totalRow = {}

    if (this.detailData.length === 0) {
      return totalRow
    }
    // 汇总行中表头部分的列
    this.pColumnsDimension.forEach(item => {
      totalRow[item.prop] = {
        id: item.prop,
        val: '汇总', //item.label,
        dataType: 'string'
      }
    })

    totalRow['yearMonth'] = {
      id: '',
      val: this.pYearMonth,
      dataType: 'string'
    }

    if (this.mixinCBasicDataColumnNames.length === 0) {
      console.info('basicDataColumns为空!')
    }

    this.mixinCBasicDataColumnNames.forEach(colName => {
      let _sum = 0
      let editable = false;
      this.detailData.forEach(it => {
        let t = it.data.find(d => d.dateDimension === colName)
        if (t) {
          editable = editable ||  t.editable
          _sum += parseFloat(t.val)
        }
      })
      totalRow[colName] = { val: _sum, editable, isModified: false, dataType: 'number', rownum: 1 }
    })

    let _sum = 0
    for (let key in totalRow) {
      if (key.substr(0, 1) === this.pDateDimension) {
        _sum += parseFloat(totalRow[key].val)
      }
    }

    totalRow['sum'] = { val: _sum, isModified: false, editable: false, dataType: 'number', rownum: 1 }
    totalRow.rowType = '汇总'
    return totalRow
  },
  // 第二行：汇总百分比
  getTotalRowPercent(basicRows) {
    let totalRow = {}

    if (this.detailData.length === 0) {
      return totalRow
    }
    // 汇总行中表头部分的列
    this.pColumnsDimension.forEach(item => {
      totalRow[item.prop] = {
        id: item.prop,
        val: '汇总百分比', //item.label,
        dataType: 'string'
      }
    })

    totalRow['yearMonth'] = {
      id: '',
      val: this.pYearMonth,
      dataType: 'string'
    }

    this.mixinCBasicDataColumnNames.forEach(colName => {
      let val = basicRows.map(row => row[colName].val).reduce((initVal, val) => initVal + val)
      totalRow[colName] = { val, editable: false, dataType: 'percent' }
    })

    // 最后一项:汇总
    let _sum = 0
    basicRows.forEach(item => {
      _sum += parseFloat(item['sum'].val)
    })

    totalRow['sum'] = { val: _sum, isModified: false, editable: false, dataType: 'percent' }
    totalRow.rowType = '汇总百分比'

    return totalRow
  },

  getBasicRow(totalRow) {
    let arr = []

    this.detailData.forEach(it => {
      let obj = {
        rowId:it.rowId
      }
      // 表头列

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

      obj['yearMonth'] = {
        id: '',
        val: this.pYearMonth,
        dataType: 'string'
      }

      let sum = 0
      it.data.forEach(d => {
        let val = 0
        let item = totalRow[d.dateDimension]
        if (d.val === 0) {
          val = 0
        } else if (item === undefined || item.val === undefined || item.val === 0) {
          val = 0
        } else {
          val = d.val / item.val
        }
        if (d.dateDimension.substr(0, 1) === this.pDateDimension) {
          sum += d.val * 1
        }
        obj[d.dateDimension] = { id: d.id, val, editable: d.editable, dataType: 'percent' }
        let sumval = totalRow['sum'].val === 0 ? 0 : sum / totalRow['sum'].val
        obj['sum'] = { val: sumval, editable: false, dataType: 'percent' }

        obj.rowType = 'percent'
      })
      arr.push(obj)
    })
    return arr
  },
  /**
   * 获取基础行
   */
  getRows() {
    if (this.detailData.length === 0) return []

    let totalRow = this.getTotalRow()
    let basicRow = this.getBasicRow(totalRow)
    let totalRowPercent = this.getTotalRowPercent(basicRow)

    console.info('渗透率表格中生成的行数据是：', [totalRow, totalRowPercent, ...basicRow])
    return [totalRow, totalRowPercent, ...basicRow]
  }
}
