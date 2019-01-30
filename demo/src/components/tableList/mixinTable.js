import { mapGetters, mapMutations } from 'vuex'
import filter from '@/utils/filter'
const _ = require('lodash')
// import { percent as fPercent, int as fInt, formatCurrency as fFormatCurrency } from '@/utils/filter'
export default {
  props: {
    pDateDimension: { type: String, required: true }, // M Q W D
    pTitleName: { type: String, default: 'XXX' },
    pMoneyUnit: { type: String, required: false, default: 'yuan' },
    pValidDecimalPlacesForNumber: { type: Number, default: 1 },
    pValidDecimalPlacesForPercent: {
      type: Number,
      default: 1
    },

    // 这里才是真正的数据
    detailData: {
      type: Array,
      required: true
    },
    //动态表头
    pColumnsDimension: { type: Array, required: true },

    pColumns:{type:Array,require:true},
    // 整个表格是否可以被编辑
    isEdit: {
      type: Boolean,
      default: false
    },

    pYearMonth: [String, Number],
    height: {
      type: Number,
      default: 400
    }
  },

  computed: {
    ...mapGetters(['getUser']),
    // 需要进行[行列]合并的列的名字

    mxGetSumDateDimension() {
      if (this.pDateDimension === 'D') {
        return 'W'
      } else if (this.pDateDimension === 'W') {
        return 'M'
      } else if (this.pDateDimension === 'M') {
        return 'Q'
      } else if (this.pDateDimension === 'Q') {
        return 'Y'
      }
      return 'nod'
    },
    mixinMerginColNameArr() {
      return this.pColumnsDimension.map(item => item.prop)
    },
    mixinCBasicDataColumnNames() {
      let arr = []
      if (this.detailData[0] && this.detailData[0].data) {
        this.detailData[0].data.forEach(item => {
          arr.push(item.dateDimension)
        })
      }
      return arr
    }, //  数据列
    mxcIdAndName() {
      let id = '',
        name = ''
      if (this.getUser.type === 'SALER') {
        id = this.getUser.salerId
        name = this.getUser.salerName
      } else {
        id = this.getUser.dept3Id
        name = this.getUser.dept3Name
      }
      return {
        id,
        name
      }
    },
    mixincCellWidth() {
      const PER_PIX_FOR_NUMBER = 6
      let rs = {}
      this.cols.forEach(col => {
        let prop = col.prop
        let rows = this.rows.map(row => row[prop])
        // 用于排序的列，在列头的后面会生成两个按钮， 这里给补上两个空格，以增加宽度
        if (col.prop.substring(0, 1) === this.pDateDimension) {
          rows.push({ val: col.label + '  ', dataType: 'string' })
        } else {
          rows.push({ val: col.label, dataType: 'string' })
        }

        let lens = rows.map(item => this.mixincCellWidthGetLength(item))

        rs[prop] = Math.max(...lens) * PER_PIX_FOR_NUMBER + 20
        // console.info('----', prop, lens, Math.max(...lens) * 12, rs)
      })
      // console.info(rs)
      return rs
    }
  },
  methods: {
    setMapF(levelIndex) {
      return item => {
        let rs = []
        for (let i = 1; i <= levelIndex; i++) {
          rs.push(item['col' + i].id)
        }
        return rs.join('-')
      }
    },
    setFilterF(levelIndex, key) {
      return item => {
        let rs = []
        for (let i = 1; i <= levelIndex; i++) {
          rs.push(item['col' + i].id)
        }
        return rs.join('-') === key
      }
    },
    mxSort({ column, prop, order }) {
      console.info(this.detailData)
      let orderObj = {}

      this.detailData.forEach(item => {
        let val = item.data.find(it => it.dateDimension === prop).val
        let colX = 'order' + this.pColumnsDimension.length
        orderObj[item.rowId] = {
          [colX]: val
        }
      })
      for (let i = 1; i <= this.pColumnsDimension.length - 1; i++) {
        // debugger
        let mapper = this.setMapF(i)
        let distinctColX = Array.from(new Set(this.detailData.map(mapper)))
        let obj = {}
        distinctColX.forEach(key => {
          let filter = this.setFilterF(i, key)
          let rs = this.detailData.filter(filter)
          // debugger
          let sumProp = 0
          rs.forEach(obj => {
            sumProp += 1 * obj.data.find(item => item.dateDimension === prop).val
          })
          obj[key] = sumProp

          rs.forEach(item => {
            orderObj[item.rowId]['order' + i] = obj[key]
          })
        })
        console.info(obj)
      }

      let flag = order === 'descending' ? -1 : 1

      this.detailData.sort((arr1, arr2) => {
        for (let i = 1; i <= this.pColumnsDimension.length; i++) {
          if (orderObj[arr1.rowId]['order' + i] !== orderObj[arr2.rowId]['order' + i]) {
            return flag * (orderObj[arr1.rowId]['order' + i] - orderObj[arr2.rowId]['order' + i])
          }
        }
        return 0
      })
      console.info(this.detailData)
    },
    mxAddtoStack() {
      this.$emit('addToStack', { detail: _.cloneDeep(this.detailData) })
    },

    // 根据单元格内容决定显示什么内容
    mixinGetCellValue(row, prop) {
      let dataType = row[prop].dataType
      let val = row[prop].val

      if (dataType === 'percent') {
        return filter.percent(val, this.pValidDecimalPlacesForPercent)
      } else if (dataType === 'number') {
        let int = filter.int(val, this.pValidDecimalPlacesForNumber)

        return filter.formatCurrency(int, this.pMoneyUnit)
      } else {
        return val
      }
    },
    mixinCellClass(row, prop) {
      let val = row[prop].val || ''

      val = val + ''
      // {'bold':mixinIsBoldClass(scope.row),'right': scope.row[item.prop] && scope.row[item.prop].dataType != undefined && scope.row[item.prop].dataType != 'string'}
      let classNameList = []

      if (prop.substring(0, 1) === this.mxGetSumDateDimension) {
        classNameList.push('bgc')
      }
      if (row.rowType && row.rowType.includes('汇总')) {
        classNameList.push('bold')
      }
      if (val.includes('汇总')) {
        classNameList.push('right')
      }
      if (row[prop].dataType === 'number' || row[prop].dataType === 'percent') {
        classNameList.push('right')
      }

      if (row[prop].editable && this.isEdit) {
        classNameList.push('cellCanEdit')
      }
      return classNameList.join(' ')
    },
    mixinRowClassName(obj) {
      if (obj.row.rowType && obj.row.rowType.includes('汇总')) {
        return 'bold'
      } else return ''
    },
    mixinIsBoldClass(row) {
      return row.rowType && row.rowType.includes('汇总')
    },
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
    //
    // 根据内容及类型来确定显示的宽度：1一个汉字=2个字母/数字
    // 这里获取的长度是字母/数字的长度
    mixincCellWidthGetLength(obj) {
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
    mixinGetRowprimaryKey(rowObj, levelOrderIndex) {
      let rs = ''

      switch (levelOrderIndex) {
        case 1:
          rs = rowObj.col1.id
          break
        case 2:
          rs = [rowObj.col1.id, rowObj.col2.id].join('-')
          break
        case 3:
          rs = [rowObj.col1.id, rowObj.col2.id, rowObj.col3.id].join('-')
          break
        case 4:
          rs = [rowObj.col1.id, rowObj.col2.id, rowObj.col3.id, rowObj.col4.id].join('-')
          break
        default:
          throw new Error(`levelOrderIndex:${levelOrderIndex}`)
      }
      return rs
    },

    /**
     * 更新更高维度的值。例如 m1,m2,m3变化之后，要手动把q1的值更新一下
     * 前提是数据是按m1,m2,m3,q1,m4,m5,m6,q2......这样的顺利排列的
     */
    mixinUpdateHigherDimension(detailData) {
      if (detailData.length === 0) return
      let preFix = detailData[0].data[0].dateDimension.substring(0, 1)
      let totalSum = 0;
      let toModifySum = 0;
      detailData.forEach(item => {
        let _preFix = '',
          sum = 0
        item.data.forEach(item => {
          // console.info(item.dateDimension,item.val)
          _preFix = item.dateDimension.substring(0, 1)
          if (_preFix === preFix) {
            sum += item.val * 1;
            totalSum += item.val * 1;
            if (item.editable) {
              toModifySum += item.val * 1
            }
          } else {
            item.val = sum
            sum = 0
          }
        })
      })

    
      this._bus.$emit(this._CONST.E_TOOLBAR_TOTOAL_INIT, { sum:totalSum, toModifySum })

      return this
    },

    exportToJson() {
      
      let tableHeader = {}
      let cols = this.cols || this.pColumns;
      cols.forEach(col => {
        tableHeader[col.prop] = col.label
      })
      let json = []
      if (this.rows) {
        json = this.rows.map(row => {
          let obj = {}
          cols.forEach(col => {
            console.info(col.prop);
            console.info(row);
            console.info(row[col.prop].val)
            obj[col.prop] = row[col.prop].val
          })
          return obj
        })
      }
      json.unshift(tableHeader)
      return json
    }
  },
  watch: {
    detailData(newData,oldData) {
        // 监听明细数据的变化：
        // 1.修改总值
        // 2.更新高纬度
        let sum = 0
        let toModifySum = 0
        this.detailData.forEach(item => {
          item.data.forEach(it => {
            if (it.dateDimension.substr(0, 1) === this.pDateDimension) {
              sum += it.val * 1
              if (it.editable) {
                toModifySum += it.val * 1
              }
            }
          })
        })
        console.info('".......mixins.js........总值修改了', { sum, toModifySum })
        this.mixinUpdateHigherDimension(this.detailData)
        this._bus.$emit(this._CONST.E_TOOLBAR_TOTOAL_INIT, { sum, toModifySum }) // 通知工具条上的修改总值按钮，
      }
  }
}
