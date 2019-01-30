export default {
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
            if (this._getLevelKey(next, levelType) != curLevelKey) {
              return true
            }
          }
        }
        return false
      })
      basicRows.splice(index + 1, 0, it)
    })
    return basicRows
  },
  /**
   * 按levelType进行分组求和
   * basicDataColumns: 基础数据列名
   */

  _createTotal(basicRows, basicDataColumns, levelType = 'col1') {
    if (!basicRows.length) return []
    let items = basicRows.map(item => this._getLevelKey(item, levelType))

    let cLevelKeys = Array.from(new Set(items))

    let data = _.cloneDeep(basicRows)

    // 由于行中也有百分比的行，只能对行类型为number的求和
    let result = cLevelKeys.map(item => {
      return data.filter(it => {
        return item === this._getLevelKey(it, levelType) && it.rowType === 'number'
      })
    })

    let total = result.map(arr => {
      let rs = { levelType, rowType: '汇总' + levelType }

      rs['yearMonth'] = {
        id: '',
        val: this.pYearMonth,
        dataType: 'string'
      }

      let sum = arr.reduce((val, item) => {
        return val + item['sum'].val * 1
      }, 0)

      basicDataColumns.forEach(colName => {
        let r = arr.reduce((val, item) => {
          let t = val[colName].val * 1 + item[colName].val * 1
          item[colName].val = t
          return item
        })
        rs[colName] = {
          id: r[colName].id,
          val: r[colName].val,
          editable: false,
          dataType: 'number'
        }
      })
      rs.sum = {
        val: sum,
        id: arr[0].col1.id,
        dataType: 'number',
        editable: false
      }
      rs.col1 = { val: arr[0].col1.val, id: arr[0].col1.id }

      if (levelType === 'col1') {
        if ('col2' in arr[0]) {
          rs.col2 = { val: '共计', id: arr[0].col2.id }
        }
        if ('col3' in arr[0]) {
          rs.col3 = { val: '共计' }
        }
      } else if (levelType === 'col2') {
        rs.col2 = { val: arr[0].col2.val, id: arr[0].col2.id }
        if ('col3' in arr[0]) {
          rs.col3 = { val: '小计', id: arr[0].col3.id }
        }
      } else if (levelType === 'col3') {
        rs.col2 = { val: arr[0].col2.val, id: arr[0].col2.id }
        rs.col3 = { val: arr[0].col3.val, id: arr[0].col3.id }
      }
      return rs
    })
    return total
  },

  /**
   *  构建行的主键
   */
  _getLevelKey(d, levelType = 'col1') {
    try {
      let rs = ''
      switch (levelType) {
        case 'col1':
          rs = d.col1.id
          break
        case 'col2':
          rs = [d.col1.id, d.col2.id].join('-')
          break
        case 'col3':
          rs = [d.col1.id, d.col2.id, d.col3.id].join('-')
          break
        default:
          throw new Error(`levelType:${levelType}`)
          break
      }
      return rs
    } catch (e) {
      console.info(e, d, levelType)
    }
  },

  /**
   * 获取全部可以编辑的单元格项
   */
  getAllEditableItem() {
    let rs = []
    if (this.detailData) {
      this.detailData.forEach(item => {
        item.data.forEach(it => {
          if (this.canEdit(it)) {
            rs.push(it)
          }
        })
      })
    }
    return rs
  },
  canEdit(item) {
    return item.dateDimension.substring(0, 1) === this.pDateDimension && item.editable === true
  },
  getTotalValByDateDimension(dateDimensionList) {
    let sum = 0
    if (this.detailData) {
      this.detailData.forEach(item => {
        item.data.forEach(it => {
          if (dateDimensionList.includes(it.dateDimension)) {
            sum += it.val * 1
          }
        })
      })
    }

    return sum
  },
  /**
   * 修改总值
   * @param {dataSoruce} d object
   */
  modifyTotalValue(d) {
    let newValue = d.newValue
    let oldValue = d.oldValue

    let changeValue = d.newValue - d.oldValue
    console.info(`修改总值为:${newValue},原值是：${oldValue},变化是:${changeValue}`)
    // 1.在汇总中，把可以修改的值找出来，按比例分下去
    let itemsToJustify = this.getAllEditableItem()
    if (itemsToJustify.length === 0) {
      this._error('全部的值都不能修改,修改总值无效!')
      return
    }

    console.info('要承担这个变化的是：', itemsToJustify)
    let oldSum = itemsToJustify.reduce((val, item) => {
      return val * 1 + item.val * 1
    }, 0)

    console.info('它们的原值是：', oldSum, '它们的新值:', oldSum * 1 + changeValue)
    itemsToJustify.forEach(it => {
      let d = 0
      if (oldSum === 0) {
        d = (1 / itemsToJustify.length) * changeValue
      } else {
        d = (it.val / oldSum) * changeValue
      }

      it.val = it.val * 1 + d * 1
    })

    this.mixinUpdateHigherDimension(this.detailData)

    // 工具栏中的前进后退
    this._bus.$emit(this._CONST.E_TABLEDATA_CHANGE_STACK, {
      detail: this.detailData
    })
  },
  collectTolalModifyDetail() {
    if (this.detailData.length === 0) return {}
    let _sum = 0
    let _rows = {}
    let list = []

    this.detailData[0].data &&
      this.detailData[0].data.forEach(item => {
        list.push({
          qmwd: item.dateDimension
        })
      })
    list.forEach(item => {
      _sum = 0
      this.detailData.forEach(it => {
        let _t = it.data.find(d => d.dateDimension === item.dateDimension)
        _sum += parseFloat(_t ? _t.val : 0)
      })
      _rows[item.dateDimension] = {
        val: _sum,
        isEditable: false,
        isModified: false,
        dataType: 'number'
      }
    })

    _sum = 0
    for (let key in _rows) {
      if (key.substr(0, 1) === this.pDateDimension) {
        _sum += parseFloat(_rows[key].val)
      }
    }
    _rows['sum'] = {
      val: _sum,
      isModified: false,
      isEditable: false,
      dataType: 'number'
    }
    return _rows
  },

  /**
   * 获取基础行。随后可通过基础行去进一步生成分类汇总行。
   */
  getBasicRows() {
    if (this.detailData.length === 0) return []
    let arr = []
    let preFix = this.pDateDimension
    this.detailData.forEach(it => {
      let obj = {
        yearMonth: {
          val: this.pYearMonth,
          dataType: 'string'
        },
        rowId:it.rowId,
        rowType: 'number'
      } // 第一项
      let _sum = 0

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

      //数据列
      it.data.forEach(d => {
        let _preFix = d.dateDimension.substring(0, 1)
        obj[d.dateDimension] = {
          val: Number(d.val).toFixed(3),
          editable: d.editable,
          dataType: 'number'
        }
        if (_preFix === preFix) {
          // 这一行中有m1,m2,m3,q1，我们只对m进行求合。
          _sum += parseFloat(d.val)
        }
      })
      let editable = it.data.some(item => item.editable === true)
      obj['sum'] = {
        val: _sum.toFixed(3),
        editable,
        dataType: 'number'
      } // 最后一列
      arr.push(obj)

      // 如果有扩展项，则要把百分比也加上}
      let percentObj = {
        yearMonth: {
          val: this.pYearMonth,
          dataType: 'string'
        },
        rowType: 'percent'
      } // 第一项

      this.pColumnsDimension.forEach(item => {
        let val = [it[item.prop].id, it[item.prop].name].join('-')
        if (item.label === '采销') {
          val = it[item.prop].name
        }
        percentObj[item.prop] = {
          id: it[item.prop].id,
          val,
          dataType: 'string'
        }
      })

      it.data.forEach(d => {
        percentObj[d.dateDimension] = {
          val: _sum === 0 ? 0 : d.val / _sum,
          editable: d.editable,
          dataType: 'percent'
        }
      })
      percentObj['sum'] = {
        val: 1,
        editable: false,
        dataType: 'percent'
      }
      arr.push(percentObj)
    })

    return arr
  },
  /**
   * 获取汇总列
   */
  getSumRow() {
    if (this.detailData.length === 0) return {}
    let sum = 0
    let rows = {}

    // todo: asdfsdf

    let dataColumnList = []
    if (this.detailData[0].data) {
      dataColumnList = this.detailData[0].data.map(item => item.dateDimension)
    }

    dataColumnList.forEach(item => {
      sum = 0
      this.detailData.forEach(it => {
        let _t = it.data.find(d => d.dateDimension === item)
        sum += parseFloat(_t ? _t.val : 0)
      })
      rows[item] = {
        val: sum,
        editable: false,
        dataType: 'number',
        rownum: 1
      }
    })

    sum = 0
    for (let key in rows) {
      if (key.substr(0, 1) === this.pDateDimension) {
        sum += parseFloat(rows[key].val)
      }
    }
    rows['sum'] = {
      val: sum,
      editable: false,
      dataType: 'number',
      rownum: 1
    }
    return rows
  },

  getTotalRows() {
    if (this.detailData.length === 0) {
      return []
    }
    //console.info('汇总表中获取到的数据是：',this.detailData)

    let obj = {
      yearMonth: {
        val: this.pYearMonth,
        dataType: 'string'
      }
    }
    this.pColumnsDimension.forEach(item => {
      obj[item.prop] = {
        val: '汇总',
        dataType: 'string',
        rownum: 1
      }
    })
    // let arr = [
    //   {
    //     id:{val:this.$store.state.roleDept3Id},
    //     name:{val:this.$store.state.roleDept3Name},
    //     yearMonth:{val:this.pYearMonth,"dataType": "string"}},
    // ];
    //console.info("the first arr",arr);
    let collection = this.getSumRow()
    // console.info("get the detail",collection);

    obj = { ...obj, ...this._utils.cloneObj(collection), ...{ rowType: '汇总' } }
    // arr[0].id = { "val": "", "dataType": "string",rownum:1 };
    // arr[0].name = { "val": "汇总", "dataType": "string",rownum:1 }
    // arr[0].yearMonth = { "val": this.pYearMonth, "dataType": "string" ,rownum:1}
    return obj
  },
  updateCellVal(rowPrimaryKey, prop, val) {
    let index = this.detailData.findIndex(item => {
      return rowPrimaryKey === item.rowId
    })
    if (index === -1) {
      throw new Error(`在当前数据${this.detailData}中没有找到行主键为${rowPrimaryKey}的值`)
    }
    let obj = this.detailData[index].data.find(item => item.dateDimension === prop)

    if (obj) {
      obj.val = val
    }
  },
  getItemToJustify(rowPrimaryKey, prop) {
    let index = this.detailData.findIndex(item => {
      return rowPrimaryKey === item.rowId
    })
    if (index === -1) {
      throw new Error(`在当前数据${this.detailData}中没有找到行主键为${rowPrimaryKey}的值`)
    }
    console.info(`要调整的数据在整个数据中是第${index}行`)
    let lockedSum = 0
    let list = this.detailData[index].data.filter(item => {
      if (item.dateDimension.substring(0, 1) === this.pDateDimension && item.editable) {
        return true
      }
      if (item.dateDimension.substring(0, 1) === this.pDateDimension && !item.editable) {
        lockedSum += item.val
        return false
      } else {
        return false
      }
    })
    let result = {
      lockedSum: lockedSum,
      list: list
    }
    return result
  },
  percentResetSingle() {
    //百分比单重置
    let p = this._utils.cloneObj(this.rows[this.editIndex])
    for (let key in p) {
      if (p[key].dataType === 'percent' && p[key].editable) {
        p[key].val = 100 * p[key].val
      }
    }
    for (let key in this.percentData[1]) {
      let obj = this.percentData[1][key]
      if (obj.editable && isNaN(obj.val)) {
        console.log('reset data:  ' + this.percentData[1][key].val + ':    ' + p[key].val)
        this.percentData[1][key].val = p[key].val
      }
    }
  }
}
