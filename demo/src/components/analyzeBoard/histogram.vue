<template lang="html">
  <div v-loading="loading">
    <p class="analyzeBoard-content-title">aa{{title}}
      <helpIcon :title="titleInfo"></helpIcon>
    </p>
    <analysisCombination 
    :pageType="pPageType" 
    :data="analysisData" 
    :holiday="holiday"
    :dateDimension="dateDimension" 
    :jieqi="jieqi">
    </analysisCombination>

  </div>
</template>

<script>
const echarts = require('echarts')

const basic_option = {
    tooltip: {trigger: 'axis'},
    legend: {},
    dataZoom: [{
            startValue: '2018-4-1'
        }, {
            type: 'inside'
        }],
    xAxis: {type: 'category'},
    yAxis: [
      {
          type: 'value',
          // interval: 50,
          axisLabel: {
              formatter: '{value}'
          }
      },
      {
          type: 'value',
          name: '比值',
          // min: -0.5,
          // max: 3,
          // interval: 0.1,
          axisLabel: {
              formatter: '{value} %'
          }
      }
    ],
    series: []
  };
import mixin from "./mixin"
import helpIcon from "@/components/common/helpIcon"
import analysisCombination from "@/components/common/analysisCombination"

export default {
  mixins:[mixin],
  props:{
    titleType:{type:String,required:true},
    pPageType:{type:String},
    pQueryDataType:{type:String,required:true},
    pTimeDimension:{type:String},
    pMonthRange:{type:Object},

    pSiderBarCondition:{type:Object},
    pcurrentChildrenIdList:{type:Array}
  },
  
  components:{helpIcon,analysisCombination},
  computed:{
    histogramId(){return "histogram"+Math.random().toString().substring(2);},
  },
  data () {
    return {
      title       :"组合分析",
      titleInfo   :"将同比分析与趋势分析结合，以柱状图表示同比变化，以拆线趋势图展示目标/计划/预测的变动情况。",
      loading     :false,
      isActive    :false,
      analysisData:{},//结构是：{name:'xxx',data:[]}
      holiday     :[],
      jieqi       :[] ,
      dateDimension:""
    }
  },
  methods:{
    createCondition(){
      let cond = {
        startDate     : this.pMonthRange.start, //查询开始日期
        endDate       : this.pMonthRange.end,   //查询结束日期
        dept3Id       : this.pSiderBarCondition.dept3Id,        //三级部门id
        parentLevel   : this.pSiderBarCondition.parentLevel,    //选中节点对应的父节点级别
        parentId      : this.pSiderBarCondition.parentId,       //选中节点对应的父节点，有且只有1个
        childrenLevel : this.pSiderBarCondition.childrenLevel,  //选中节点的级别
        childrenIdList: this.pcurrentChildrenIdList,            //查询级别对应的id列表
        dateDimension : this.pTimeDimension,
      }
      if(this.pPageType == 'target'){
        cond.versionType = this.pVersionType
      }
      else if(this.pPageType === 'planSale' || this.pPageType === 'planGMV' || this.pPageType === "plan"){
        cond.salerId  = this.pSiderBarCondition.salerId//选中节点所属的采销erp
        cond.roleType = this.pSiderBarCondition.roleType
        cond.dataType = this.pQueryDataType
      }else{
        throw new Error("histogram没有合法的pageType,当前的pageType是"+this.pPageType)
      }
      return cond;
    },
    hQuery(){
      if(!this.isActive){
        return;
      }
    
      let cond = this.createCondition();
      this.dateDimension=cond.dateDimension;
      let handler = this.mixinGetHandlerMap("queryAdjustAnalysisCombinationData",this.pPageType);
      handler(cond,this,"loading").then(this._do("组合分析图请求_ok",d => {
        this.jieqi=d.jieqi;
        this.holiday=d.holiday;
        this.oldCond=JSON.stringify(cond)
        this.analysisData = {data: d.data,dateType:cond.dateDimension};
      }))
    },
  },
  activated(){
    this.isActive = true;
    let newCond = this.createCondition()
    if(this.oldCond != JSON.stringify(newCond) ){
      // console.info(this.pPageType+"新旧条件不同，要重新查询")
      this.hQuery()
    }
  },
  deactivated(){
    this.isActive = false
  },
  beforeDestroy(){
    this._bus.$off(this._CONST.E_ANALYZEBOARD_QUERY,this.hQuery)  // 分析面板的查询按钮
  },
  created(){
    this._bus.$on(this._CONST.E_ANALYZEBOARD_QUERY,this.hQuery)  // 分析面板的查询按钮
  },
}
</script>
