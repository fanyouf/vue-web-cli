<template lang="html">
  <div class="flexa">
    <stock-bars  style="width:50%" 
      :titleType="titleType"
      :pPageType="pPageType"
      :pDataBar="dataBar"
      :pChangeCurrentChildrenIdList = "pChangeCurrentChildrenIdList"

      @changeDataForScatter="hChangeDataForScatter"
      v-on="$listeners"
      >
    </stock-bars>
    <scatter  style="width:50%" 
      :titleType="titleType"
      :pDataScatter="dataScatter"
      >
    </scatter>
  </div>
</template>

<script>
import scatter from "./BarsAndScatter_Scatter.vue"
import stockBars from "./BarsAndScatter_Bars.vue"

import {mapGetters} from 'vuex'
import mixin from "./mixin"
export default {
  mixins:[mixin],
  props:{
    titleType:{type:String,required:true},
    pPageType:{type:String},
    pQueryDataType:{type:String,required:true},
    pTimeDimension:{type:String},
    pMonthRange:{type:Object},

    pSiderBarCondition:{type:Object},
    pcurrentChildrenIdList:{type:Array},
    pVersionType:{type:String},
    pChangeCurrentChildrenIdList:{type:Function}

  },
  components:{stockBars,scatter},
  data(){
    return {
      isActive:false,
      dataBar:[],
      dataScatter:[]
    }
  },
  methods:{
    hChangeDataForScatter(rs){
      console.info("hChangeDataForScatter",rs)
      this.dataScatter = rs;
    },
    createCondition(){
      let cond = {
        startDate: this.pMonthRange.start, //查询开始日期
          endDate:  this.pMonthRange.end, //查询结束日期
        dept3Id: this.pSiderBarCondition.dept3Id,//三级部门id
        parentLevel: this.pSiderBarCondition.parentLevel,//选中节点对应的父节点级别
        parentId: this.pSiderBarCondition.parentId, //选中节点对应的父节点，有且只有1个
        childrenLevel: this.pSiderBarCondition.childrenLevel, //选中节点的级别
        childrenIdList: this.pcurrentChildrenIdList, //查询级别对应的id列表
        dateDimension: this.pTimeDimension,
      }
      if(this.pPageType === 'assessmentTarget' || this.pPageType ==="challengeTarget"){
        cond.versionType = this.pVersionType.toUpperCase();
      }
      else if(this.pPageType === 'planSale' || this.pPageType === 'planGMV' || this.pPageType === "plan"){
        cond.salerId = this.pSiderBarCondition.salerId//选中节点所属的采销erp
        cond.roleType = this.pSiderBarCondition.roleType
        cond.dataType = this.pQueryDataType
      }else{
        throw new Error("气泡图中没有合法的pageType,当前的pageType是"+this.pPageType)
      }
      return cond;
    },
    hQuery(){
      if(!this.isActive){
        console.info(this.pPageType+"气泡图不是处于激活状态，不重画")
        return;
      }
      
      let cond = this.createCondition();

      // 收到分析面板中的E_ANALYZEBOARD_QUERY事件后，它会被调用.注意：
      // 1. 分板面板中发出E_ANALYZEBOARD_QUERY有两种可能性：（1）用户点击了查询按钮，（2)用户改变了sideBar中的条件，并点击按钮
      // 区别在于，前都param中没有值，而后者会带上值。{eventSource: "sideBar"}
      // console.info("消息的额外信息：：：：：",param)
      // if('barsAndScatter' != this.getAnalyzeBoard.componentName){
      //   console.info(this.getPageType+"当前组件类型是",this.getAnalyzeBoard.componentName,"不是barsAndScatter,不重画")
      //   return;
      // }
      // console.info("气泡图query条件...",condition);
      // return;

      
      // let cond = this._createCondition(condition);
      let handler = this.mixinGetHandlerMap("queryAnalysisSaleStructureData",this.pPageType);
      handler(cond,this,'loading').then( this._do("查询气泡图数据_ok",(dataArr)=>{
        //测试数据：rs = [
        // {"id":"880","name":"洗衣机","val":879706.362,"yoy":6.413012417E7},
        // {"id":"878","name":"冰箱","val":620490.121,"yoy":2.2859184807E8},
        // {"id":"877","name":"家电配件","val":25424.336,"yoy":0.0}]
        if(dataArr.length < cond.childrenIdList.length){
          this._info(`请注意：查询到的数据条数[${dataArr.length}]条 < 查询条件[${cond.childrenIdList.length}]条`)
        }
        this.dataBar = dataArr;
        this.dataScatter = dataArr;
      }))
    },
  },

  activated(){
    this.isActive = true;
  },
  deactivated(){
    this.isActive = false
  },
  beforeDestroy(){
    this._bus.$off(this._CONST.E_ANALYZEBOARD_QUERY,this.hQuery)
  },
  created(){
    this.isActive = true;
    this._bus.$on(this._CONST.E_ANALYZEBOARD_QUERY,this.hQuery)   // 分析面板的查询按钮
  }
}
</script>
