// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

import { Menu, Submenu, MenuItem, MenuItemGroup, Loading, InputNumber, Tree, DatePicker, Pagination, Dialog, Table, MessageBox } from 'element-ui'

Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Loading)
Vue.use(Tree)
Vue.use(Table)

import echarts from 'echarts'
Vue.prototype._echarts = echarts

import router from './router'
import store from './vuex'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/fonts/iconfont.css'
import '@/assets/fonts/iconfont.js'

import iView from 'iview'
import 'iview/dist/styles/iview.css'
Vue.use(iView)
// Vue.prototype.$alert = MessageBox.alert
Vue.prototype._error = function(desc) {
  Vue.prototype.$Notice.error({
    title: '操作失败',
    desc,
    duration: 0
  })
}

Vue.prototype._info = function(desc) {
  Vue.prototype.$Notice.info({
    title: '系统提示',
    desc
  })
}

Vue.prototype._success = function(title) {
  Vue.prototype.$Notice.success({
    title
  })
}

Vue.prototype._loading = function(title = '加载中') {
  return Vue.prototype.$loading({
    lock: true,
    text: title,
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
}

Vue.prototype._do = (opString, okFunction, errFunction) => {
  let arr = opString.split('_') // 获取最后一位标记位。
  let flag = false
  if (arr.length === 2 && arr[1].toString().toLowerCase() === 'ok') {
    // "操作_ok" 只有在这种情况下才会输出操作成功的提示框
    flag = true
  }
  opString = arr[0]
  return res => {
    if (res && res.success) {
      flag && Vue.prototype._success(opString + '成功！')
      okFunction && okFunction(res.data)
    } else {
      let str = opString + '失败！'
      if (res && res.info && res.info.trim() !== '') {
        str += '原因是:' + res.info
      }
      if (res && res.message && res.message.trim() !== '') {
        str += '原因是:' + res.message
      }
      if (res && res.msg && res.msg.trim() !== '') {
        str += '原因是:' + res.msg
      }
      Vue.prototype._error(str)
      errFunction && errFunction()
    }
  }
}
const markDiffPointCounter = function(arr, startIdx, endIdx) {
  let tmp = {}
  let rs = []
  for (let i = startIdx; i < endIdx; i++) {
    if (tmp.name === '') {
      tmp.name = arr[i]
      tmp.val = 1
      tmp.index = 0
      rs.push(tmp)
    } else {
      if (tmp.name === arr[i]) {
        tmp.val = tmp.val + 1
      } else {
        tmp = {}
        tmp.name = arr[i]
        tmp.val = 1
        tmp.index = i
        rs.push(tmp)
      }
    }
  }
  return rs
}
/**
 * ok
 */
Vue.prototype.mixinTableCellMergin = function(data, cols, displayPropName = 'name', dir = 'both') {
  let resultCol = []
  let resultRow = []
  console.info('mixinTableCellMergin')
  try {
    if ('both' === dir || 'column' === dir) {
      let rowsValue = data.map(it => {
        return cols.map(item => {
          return it[item][displayPropName]
        })
      })

      resultCol = rowsValue.map(arr => {
        let rs = [],
          tmp = {}
        for (let i = 0; i < arr.length; i++) {
          if (tmp.name === '') {
            tmp.name = arr[i]
            tmp.val = 1
            tmp.index = 0
            rs.push(tmp)
          } else {
            if (tmp.name === arr[i]) {
              tmp.val = tmp.val + 1
            } else {
              tmp = {}
              tmp.name = arr[i]
              tmp.val = 1
              tmp.index = i
              rs.push(tmp)
            }
          }
        }
        return rs
      })
    }

    if ('both' === dir || 'row' === dir) {
      let colsValue = cols.map(it => {
        return data.map((item, index) => {
          return item[it][displayPropName]
        })
      })
      colsValue.forEach((arr, index) => {
        if (index === 0) {
          resultRow[index] = markDiffPointCounter(arr, 0, arr.length)
        } else {
          let tempArr = []
          resultRow[index - 1].forEach(obj => {
            let spliceArr = markDiffPointCounter(arr, obj.index, obj.index + obj.val)
            tempArr = [...tempArr, ...spliceArr]
          })
          resultRow[index] = tempArr
        }
      })
    }
  } catch (e) {
    console.info(e)
  }
  return ({ row, column, rowIndex, columnIndex }) => {
    let colspan = 1
    let rowspan = 1
    //   console.info(row,rowIndex,columnIndex,column,column.property);
    //   return {
    //     rowspan,
    //     colspan
    //     };
    let i = cols.findIndex(item => item === column.property.toLocaleLowerCase())

    // 对每一列,如果当前列处于要做合并处理的列，进一步确定这个单元格的colspan
    // 否则，直接为1

    if (-1 !== i) {
      if ('both' === dir || 'column' === dir) {
        let itemCol = resultCol[rowIndex].find(item => item.index === columnIndex)
        colspan = itemCol ? itemCol.val : 0
      }
      //  是否需要设置rowSpan（即是否要合并）
      if ('both' === dir || 'row' === dir) {
        let itemRow = resultRow[i].find(item => item.index === rowIndex)
        rowspan = itemRow ? itemRow.val : 0
      }
    }

    return {
      rowspan,
      colspan
    }
  }
}

import filter from '@/filter'
Vue.use(filter)

import api from './api'
Vue.prototype._api = api

import utils from './utils'
Vue.use(utils)

import constSetting from './const'
Vue.use(constSetting)

const eventBus = new Vue()
Object.defineProperties(Vue.prototype, {
  _bus: {
    get: () => eventBus
  }
})

// import './components/global.js'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: {
    App
  },
  template: '<App/>',
  router,
  store
})
