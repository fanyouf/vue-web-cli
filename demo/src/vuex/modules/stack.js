// 实现恢复与撤销功能
import { SPSCONST } from '@/const.js'
export default {
  namespaced: true,
  state: {
    pageType: SPSCONST.PAGETYPE.summaryPlan,
    dataList: {
      [SPSCONST.PAGETYPE.summaryPlan]: Object.freeze([]),
      [SPSCONST.PAGETYPE.skuPlan]: Object.freeze([]),
      [SPSCONST.PAGETYPE.challengeTarget]: Object.freeze([]),
      [SPSCONST.PAGETYPE.assessmentTarget]: Object.freeze([])
    },
    //最大保存5步
    maxLength: 5,
    // 当前获取的可操作位置
    operatorIndex:{
      [SPSCONST.PAGETYPE.summaryPlan]: 0,
      [SPSCONST.PAGETYPE.skuPlan]: 0,
      [SPSCONST.PAGETYPE.challengeTarget]: 0,
      [SPSCONST.PAGETYPE.assessmentTarget]: 0
    }
  },
  mutations: {
    setPageType: function(state, payload) {

      state.pageType = payload
      
    },
    clearStack(state,payload){
      if('target' === payload){
        state.dataList[SPSCONST.PAGETYPE.challengeTarget] = Object.freeze([]);
        state.operatorIndex[SPSCONST.PAGETYPE.challengeTarget] = 0

        state.dataList[SPSCONST.PAGETYPE.assessmentTarget] = Object.freeze([]);
        state.operatorIndex[SPSCONST.PAGETYPE.assessmentTarget] = 0
      } else if('plan' === payload){
        state.dataList[SPSCONST.PAGETYPE.summaryPlan] = Object.freeze([]);
        state.operatorIndex[SPSCONST.PAGETYPE.summaryPlan] = 0

        state.dataList[SPSCONST.PAGETYPE.skuPlan] = Object.freeze([]);
        state.operatorIndex[SPSCONST.PAGETYPE.skuPlan] = 0
      }

    },
    initStack(state, playload) {
      // console.info('initStack-----------------', state.pageType)
      // let dataList = state.dataList[state.pageType]
      // dataList.length = 0
      // dataList.push(playload)
     
      state.dataList[state.pageType] = Object.freeze([playload]);
      state.operatorIndex[state.pageType] = 0
    },
    addStack(state, playload) {
      let dataList = [...state.dataList[state.pageType] ]
      let index = state.operatorIndex[state.pageType] + 1
      dataList[index] = playload
      while (dataList.length > state.maxLength) {
        dataList.splice(0, 1)
      }
      state.dataList[state.pageType] = Object.freeze(dataList);
      index = Math.min(state.maxLength - 1, index)
      state.operatorIndex[state.pageType] = index
    },
    reset(state) {
      let pageType = state.pageType
      state.dataList[pageType] = Object.freeze([])
      state.operatorIndex[pageType] = 0
    },
    goBack(state) {
      state.operatorIndex[state.pageType]--
    },
    goPrev(state) {
      state.operatorIndex[state.pageType]++
    }
  },
  getters: {
    // 可否向前恢复
    isPrev: state => state.pageType && state.dataList[state.pageType].length > 0 && state.operatorIndex[state.pageType] < state.dataList[state.pageType].length - 1,
    isBack: state => state.pageType && state.dataList[state.pageType].length > 0 && state.operatorIndex[state.pageType] > 0,
    getStack: state => {
      return state.dataList[state.pageType][state.operatorIndex[state.pageType]]
    },
    getPageType:state=>state.pageType
  }
}
