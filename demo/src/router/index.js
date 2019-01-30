import Vue from 'vue'
import Router from 'vue-router'
import SaleReached from '@/pages/saleReached/SaleReached'
import ManagerReached from '@/pages/saleReached/ManagerReached'
import SaleDetail from '@/pages/saleDetail/SaleDetail'
import StockCover from '@/pages/stockCover/StockCover'
import Notfound from '@/pages/Notfound/Notfound'
import AuthoritySetting from '@/pages/authoritySet/AuthoritySetting'
import HistoryTargetUpload from '@/pages/historyUpload/HistoryTargetUpload'
// 要告诉 vue 使用 vueRouter
Vue.use(Router)

const routes = [
  {
    path: '/',
    redirect: '/SaleReached'
  },
  {
    path: '/ManagerReached',
    name: 'ManagerReached',
    component: ManagerReached
  },
  {
    path: '/SaleReached',
    name: 'SaleReached',
    component: SaleReached
  },
  {
    path: '/SaleDetail',
    name: 'SaleDetail',
    component: SaleDetail
  },
  {
    path: '/salePlan',
    name: 'salePlan',
    meta: { title: '销售计划' },
    component: resolve => require(['@/pages/salePlan/index'], resolve)
  },
  {
    path: '/saleTarget',
    name: 'saleTarget',
    meta: { title: '目标制定' },
    component: resolve => require(['@/pages/saleTarget/index'], resolve)
  },
  {
    path: '/versionManager',
    name: 'versionManager',
    meta: { title: '版本管理' },
    component: resolve => require(['@/pages/versionManager/index'], resolve)
  },
  {
    path: '/StockCover',
    name: 'StockCover',
    component: StockCover
  },
  {
    path: '/viewVersionDetail/:type',
    name: 'viewVersionDetail',
    meta: { title: '查看版本详情' },
    component: resolve => require(['@/pages/versionManager/detail'], resolve)
  },
  {
    path: '/AuthoritySetting',
    name: 'AuthoritySetting',
    component: AuthoritySetting
  },
  {
    path: '/HistoryTargetUpload',
    name: 'HistoryTargetUpload',
    component: HistoryTargetUpload
  },
  {
    path: '/test',
    name: 'test',
    meta: { title: 'test' },
    component: resolve => require(['@/pages/test'], resolve)
  },
  {
    path: '*',
    component: Notfound
  }
]

let router = new Router({
  routes
})
router.beforeEach((to, from, next) => {
  window.document.title = '销售计划系统'
  next()
})
export default router
