import { mapGetters, mapMutations } from 'vuex'

/**
 *
 * @param {Object} obj
 */
const getPrimaryKey = function(obj) {
  let keyArr = []

  ;['col1', 'col2', 'col3'].forEach(colName => {
    if (obj[colName]) {
      keyArr.push(obj[colName])
    }
  })
  return keyArr.join('-')
}
/**
 * @file pages/mixins.js
 */
export default {
  computed: {
    mxcVisiableTableKeys() {
      return this.mxcTableList.filter(item => item.checked).map(item => item.value)
    },
    mxcTableList() {
      return this.mxTableList.filter(item => {
        return this.mxTableListMap[this.mxDateDimension].includes(item.value)
      })
    },
    // ...mapGetters('cond',['getPageType','getSelectedNode','getCurrentNode','getConditionBar','getMonthToSplit','getDataDimensionName']),
    ...mapGetters('stack', ['getStack'])
    // ...mapGetters(["getUser",'getCurrentVersionType']),
  },
  data() {
    return {
      mxSideBarCond: {}, // 左侧结构树及用户信息

      mxIsEdit: false, // table is editable

      mxMoneyUnit: 'yuan',

      mxTabDataTotal: [], // 顶级数据
      mxTabDataDetail: [], // 顶级数据拆成子级数据
      mxTabDataColumnsDimension: [], // 动态列头

      mxTabDataColumns: [],

      mxYearMonth: new Date().getFullYear(), // 传递给表格使用
      mxDateDimension: 'M', // 传递给表格使用 q m w d

      mxLoading: false,
      mxIsActive: false,
      mxQuerySuccess: false,

      // 引用对象传递给子组件，在子组件内直接修改
      mxDateDimensionData: {
        currentSelectedYear: new Date().getFullYear(),
        // 默认按月
        type: 'M',
        monthList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        // 要让下拉列表中的相应项目处于选中状态，则应该保持数据类型一致。
        currentSelectedMonthForWeek: new Date().getMonth() + 1,
        currentSelectedMonthForDay: new Date().getMonth() + 1
      },
      mxTableListMap: {
        Q: ['tmb', 'tmx', 'tstl', 'ttb', 'thb'],
        M: ['tmb', 'tmx', 'tstl', 'ttb', 'thb'],
        D: ['tmb', 'tmx', 'tstl', 'ttb'],
        W: ['tmb', 'tmx', 'tstl']
      },
      mxTableList: [
        { label: '目标数据', value: 'tmb', checked: true },
        { label: 'GMV明细', value: 'tmx', checked: true },
        { label: '渗透率', value: 'tstl', checked: true },
        { label: '同比分析', value: 'ttb', checked: true },
        { label: '环比分析', value: 'thb', checked: true }
      ],
      mxJIARIData: { jiari: '', oldData: [], newData: [], qmwdList: [] }
      // 节假日同比校准操作说明：
      // 1. 一次只能校准一个节日
      // 2. 校准的过程是用获取的到的新的yoy来代替旧的yoy。
      // 操作：
      //   获取成功之后
      // 1. 把上一次的操作还原：把mxJIARIData中的oldData应用到当前的表格中
      // 2. 把当前操作应用到表格中.
      // 3. 把当前获取数据保存在mxJIARIData中
      // 每一次查询操作成功之后，都要去重置mxJIARIData
    }
  },
  methods: {
    mxClearJIARIData() {
      // 每一次表格查询之后，都要清空一次。
      this.mxJIARIData = { jiari: '', holidayName: '', oldData: [], newData: [], qmwdList: [] }
    },
    mixinUpdateJIARIData(d, holiday, holidayName) {
      // 节假日同比校准
      // 操作：
      //   获取成功之后
      // 1. 把上一次的操作还原：把mxJIARIData中的oldData应用到当前的表格中
      // 2. 把当前操作应用到表格中.
      // 3. 把当前获取数据保存在mxJIARIData中
      // 每一次查询操作成功之后，都要去重置mxJIARIData
      if (this.mxJIARIData.jiari) {
        if (this.mxJIARIData.oldData.length > 0) {
          this.setmxJIARIData(this.mxJIARIData.oldData)
        }
      }
      this.mxJIARIData.oldData = this.getOLDmxJIARIData(d)
      this.mxJIARIData.newData = d
      this.mxJIARIData.holidayName = holidayName

      this.mxJIARIData.jiari = holiday
      let arr = d.map(item => {
        if (item.data && item.data.dateDimension) {
          return item.data.dateDimension
        } else return ''
      })
      arr = [...new Set(arr)]
      this.mxJIARIData.qmwdList = arr

      this.setmxJIARIData(d)
    },
    hMinxiToolbarClearJIARIFix(holiday) {
      if (this.mxJIARIData.jiari === holiday) {
        this.setmxJIARIData(this.mxJIARIData.oldData)
        this.mxClearJIARIData()
      } else {
        console.info(this.mxJIARIData, holiday)
        this._error('清除节假日校准有异常')
      }
    },
    getOLDmxJIARIData(d) {
      // 获取旧的同比数据
      return d.map(item => {
        let obj = { id: item.id, data: { qmwd: item.data.dateDimension } }
        let t = this.mxTabDataDetail.findIndex(it => getPrimaryKey(it) === getPrimaryKey(item))
        if (t !== -1) {
          let index = this.mxTabDataDetail[t].data.findIndex(it => it.dateDimension === item.data.dateDimension)
          if (index !== -1) {
            obj.data.yoy = this.mxTabDataDetail[t].data[index].yoy
          }
        }
        return obj
      })
      // [
      //   {"id":"880","name":"880","level":"CATE_3","data":{"qmwd":"M4","yoy":7099840,"year":2017,"quarter":2,"month":4,"week":null,"day":null}},
      //   {"id":"878","name":"878","level":"CATE_3","data":{"qmwd":"M4","yoy":7083704,"year":2017,"quarter":2,"month":4,"week":null,"day":null}}
      // ]
    },
    setmxJIARIData(d) {
      d.forEach(item => {
        let t = this.mxTabDataDetail.findIndex(it => getPrimaryKey(it) === getPrimaryKey(item))
        if (t !== -1) {
          let obj = this.mxTabDataDetail[t].data.findIndex(it => it.dateDimension === item.data.dateDimension)
          if (obj !== -1) {
            this.mxTabDataDetail[t].data[obj].yoy = item.data.yoy
          }
        }
      })
    },

    checkFormatter(data) {
      let flag = false

      //this.mxTabDataColumnsDimension;
      return flag
    },
    //  页面导入明细数据，并且更新整个表格。
    // 在导入数据功能中使用
    minxinUpdateDetailFromExcelValue(d, colOrderList) {
      let counter = 0,
        obj = null,
        keys = []
      const equalFun = (function(cols) {
        return (detailItem, excelItem) => {
          let arr = []
          cols.forEach((colName, index) => {
            if (colName === 'saler') {
              arr.push(detailItem['col' + (index + 1)].id === excelItem['采销ERP'])
            } else if (colName === 'brand') {
              arr.push(detailItem['col' + (index + 1)].id === excelItem['品牌ID'])
            } else if (colName.includes('cate')) {
              let levelIndex = colName.substr(4, 1) // 1, 2, 3
              let colNameInExcel = ''
              if (levelIndex === '1') {
                colNameInExcel = '一级品类ID'
              } else if (levelIndex === '2') {
                colNameInExcel = '二级品类ID'
              } else if (levelIndex === '3') {
                colNameInExcel = '三级品类ID'
              }

              arr.push(detailItem['col' + (index + 1)].id === excelItem[colNameInExcel])
            }
          })

          return arr.every(item => item)
        }
      })(colOrderList)
      debugger
      try {
        d.forEach(item => {
          obj = this.mxTabDataDetail.find(it => equalFun(it, item))
          if (obj) {
            keys = Object.keys(item)
            obj.data.forEach(it => {
              if (it.editable) {
                if (keys.includes(it.dateDimension)) {
                  if (it.val * 1 !== item[it.dateDimension] * 1) {
                    it.val = item[it.dateDimension] * 1
                    counter++
                  }
                }
              }
            })
          }
        })
        this._info(`导入成功，总更新${counter}条数据`)
      } catch (e) {
        this._info(`导入失败！`)
        console.info(e)
      }
    }
    // mixinUpdateHigherDimension(detailData) {
    //   if (detailData.length === 0) return
    //   let preFix = this.mxDateDimension

    //   detailData.forEach(item => {
    //     let _preFix = '',
    //       sum = 0
    //     item.data.forEach(item => {
    //       // console.info(item.dateDimension,item.val)
    //       _preFix = item.dateDimension.substring(0, 1)
    //       if (_preFix === preFix) {
    //         sum += item.val * 1
    //       } else {
    //         item.val = sum
    //         sum = 0
    //       }
    //     })
    //   })
    // }
  }
}
