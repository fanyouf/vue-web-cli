<template lang="html">
  <div class="">
    <div class="analyzeBoard-content-title">
      <span>{{title}}<helpIcon :title="titleInfo"></helpIcon></span>
      <div style="font-size:14px;font-weight: normal;display: flex;">
        <dataFilterLine
          style="margin-right:5px;"
          v-model = "line"
          :list = "lineList"
        ></dataFilterLine>
        <holidayMark
          :jieqi="jieqi"
          :holiday= "holiday"
          v-model = "markup"
          style="margin-right:30px;"></holidayMark>
      </div>
    </div>
    <div :id="lineId" style="height:400px;" v-loading="loading"></div>
  </div>
</template>

<script>
const echarts = require('echarts')
const moment = require("moment")
var basic_option = {
    tooltip: {
        trigger: 'axis'
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    legend: { formatter: function (name) {
                        return name.substring(0,6);
                    },
                    tooltip: {
                        show: true
                    }},
    dataZoom: [
//        {startValue: '2018-4-1'},
      {type: 'inside'}
      ],
    xAxis: {type: 'category',},
    yAxis: [{
      type: 'value',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'category',
        name: '',
      }],
    series: []
};
import mixin from "./mixin"
import helpIcon from "@/components/common/helpIcon"
import dataFilterLine from "./LineDataFilterLine.vue"
import holidayMark from "@/components/holidayMark.vue"
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
  activated(){
    //  当它处于活动时，检查是否需要查询
    this.isActive = true;
    let newCond = this.createCondition();
    //console.info(this.pPageType+"折线图组件进入旧条件是..................",this.pSiderBarCondition );
    console.info(this.pPageType+"折线图组件进入新条件是"+ JSON.stringify(newCond));

    if(this.oldCond != JSON.stringify(newCond) ){
      console.info(this.pPageType+"新旧条件不同，要重新查询")
      this.query()  
    }
  },
  deactivated(){
    console.info(this.pPageType+"折线图组件隐藏");
    this.isActive = false
  },
  beforeDestroy(){
    this._bus.$off(this._CONST.E_ANALYZEBOARD_QUERY,this.query)  // 分析面板的查询按钮
  },
  created(){
    this._bus.$on(this._CONST.E_ANALYZEBOARD_QUERY,this.query)   // 监听分析面板的查询按钮
  },
  components:{helpIcon,holidayMark,dataFilterLine},
  data () {
    return {
      title     : "趋势分析",
      titleInfo : "分析品类/品牌/SKU等在一段时期内的GMV/销量的趋势变化，以拆线的方式展示。",
      loading   : false,
      isActive  : false,
      oldCond   : "",
      markup    : [],
      holiday   : [],
      jieqi     : [],

      line      : [],
      lineList  : [],
      option:[]
    }
  },
  computed:{
    lineId(){return "line"+Math.random().toString().substring(2);},
    getHoliday(){
        console.info(this.holiday)
        return this.holiday.length
    }
  },
  
  methods:{
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
      if(this.pPageType == 'target'){
        cond.versionType = this.pVersionType
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
    query(){
      // console.info(this.pPageType+"line页上的getAnalyzeBoard",this.getAnalyzeBoard)
      // if('lines' != this.getAnalyzeBoard.componentName)
      //   return;
      if(!this.isActive){
        console.info(this.pPageType+"的line不是处于激活状态，所以，不会去画图")
        return;
      }
      let cond = this.createCondition()
      let handler = this.mixinGetHandlerMap("queryAnalysisSaleTrendData",this.pPageType);

      handler(cond,this,"loading").then(this._do("请求趋势分析_ok",d => {
        if(d&&d.data&&d.jieqi&&d.holiday) {
          this.oldCond = JSON.stringify(cond);  // 保存当前用过的条件
            console.info(this.pPageType+"折线图请求的数据：",d)
            this.jieqi = d.jieqi.map(item =>{ item.value = item.value+"_jieqi"; return item});
            this.holiday = d.holiday.map(item =>{ item.value = item.value+"_jieri"; return item});
            this.lineList = d.data.map(item => { // 总val排序
                let val = 0;
                item.data.forEach(it=>{val += it.val})
                return {label:item.name,value:item.id,val:parseInt(val)}
            });

            this.lineList.sort((a,b)=> (a.val-b.val))

            
            // 默认只显示10条
            this.line = this.lineList.filter((item,index)=>index<=9).map(item=>item.value);

            this.option = this.createdOptions(d.data,cond.dateDimension)
        }else{
          this.oldCond=""
          this.jieqi=[]
          this.holiday=[]
          this.lineList=[]
          this.option=[]
        }

        this.draw(this.updateGraphOption());
      }))
    },
    createdOptions(d,dateType){
      let rs = [],
         title = {},
        option = {};

      rs = d.map(item => {
        return {
          code:item.id,
          name: item.name,
          type:'line',
          data:item.data.map(it => parseInt(it.val))
        }
      })
      if( rs.length === 0 ){
        title = {
          text:"暂无数据",
          left:"center",
          top:"middle"
        }
      }
      option = Object.assign({},basic_option,{series:rs},{title:title});
      if(d[0]){
        if(dateType == "M"){
          option.xAxis.data = d[0].data.map(item => [item.year,item.month.toString().padStart(2,"0")].join("-"))
        }
        else if(dateType == "Q"){
          option.xAxis.data = d[0].data.map(item => [item.year,item.quarter.toString().padStart(2,"0")].join("-"))
        }
        else if(dateType == "W"){
          option.xAxis.data = d[0].data.map(item => [item.year,item.week.toString().padStart(2,"0")].join("-"))
        }
        else if(dateType == "D"){
          option.xAxis.data = d[0].data.map(item => [item.year,item.month.toString().padStart(2,"0"),item.day.toString().padStart(2,"0")].join("-"))
        }
      }else{
        option.xAxis.data = []
      }
      let z = option.dataZoom.find(item => Object.keys(item)[0] === "startValue")
      if(z){
          z.startValue =  option.xAxis.data[0]
      }
      else{
        option.dataZoom.push({startValue:option.xAxis.data[0]})
      }
      return option;
    },

    draw(option){
      // console.info(this.pPageType+"趋势图中的画图数据：",JSON.stringify(option))
      option.legend={
        formatter: function (name) {
          return name.substring(0,6);
        },
        tooltip: {
          show: true
        }
      };
      this.myChart &&  this.myChart.setOption(option,true);
    },
    updateGraphOption(){
      let option = this._utils.cloneObj(this.option);
      option.series = option.series.filter(item => this.line.includes(item.code))

      let jieqi = this.jieqi.filter(item => this.markup.includes(item.value));
      if(jieqi.length > 0){
        let obj = { // 阳历节气
          symbolSize: 15,
          symbol:'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAQLSURBVGhDxZpdThRBEMeLNSSoUTF+REOCEBN88EFuoJ5APIF4AvEE4gnEE4gnEE8gnkB9MCS8sJKQEJWIEpTE+NG/nW23tnenp3p3eq2EgLs9Vf9/VXV1dY1jf5xILjlcLzSfvJXLgoxlJdC8XQCfeZWNQCObZryvfzIZykfg0+MOZP13zUTyEPCe92DDf9dIIg+Bfh7PFIX6CZR5O1MU4gR2l0R2H4ocvbUHPebplChgE9tb8RIcL6P7qyI79wvw4zMipxdEJu+JTMzbCaWsBPT+c5FvayI/m8WT5x6IXFop1RIn8HtfZONs78OeDMr5exjBxkdXsTRore/qm6jD4inUmBQ5dacXHt45dIfTMfe9loOXRcQ2Z0Xej3X/8Bnf4WFAe8HGry8dj2t941cqo119Eus08sonbojMrotgHNl76ry43A0sFhWeO79UpIfXsbNYkNNSkT4srSYQppEGT85u3+3vvRgB7f3pF51eKSRRkT6oqS6jOo00eCKz5Xodv9ksgMM1OId+CV3IlPtNkUAM6WMjwCqqTwiefNa5PAgB/wy69la6SWDTINUphBIPlGiQNni+LvAaJF2rb73R7/dHhIiNgFZANRkmbWJeBfC1LRNwr6Z6D2iD5Gou8D7Sn9upZEgflqRFgEMtR+posIlRsEfgYC0/eB8FTmWjlBOge/RXQpT5+61R8VDLNAEwRGz3EvDAwwd/uOozKjl83bFUhqe9orMHWEi7G7K93h5a0NuMUsrsUmYvPPpXbhstwHi7IlSjxN6yVVbtArxFCmUcDWUj3sbcaJ18dJacgiduZrOXrLjsngFGsILZYe9s4ioi/5tcANw7pLcKlRE5Pp/sxIEf0JeoEuBet/0k5iCj9x+FTD1zbfWiyZKdAOo2Jt1p/NWkeOBFjTOuoWuaGzp7KwGiyysD4zI/eG7JDB6daRHgic0ZV6M/mPEkLUz0PrptEaAD9V3otNsLGMohLd0uTRFj12sjQHPlb2EMtXKkEhvX38a4YjLlMIidgL5KUiEwWFckdNVpzY5W3aDLzZgMUr0HesYqLgKz7iT09+PthcH3BA4gbbTn/YQC8LWMVcLLhY4E6TTXdLPLJ2nRADgdJeWyDDwENJmSaFRHAA8zMgwF8D4S/jsOOwhD8uhd9xPMeQDLuITfeuLg0ya0QT805y75ERlwuOvAAISaXctwd7k93O1TnivSKGG83gbNBs46Xl/tJjPUeJ0XHEgKaF5IfFdXQh1+GjPaYIu03hU4MlxlI89U7wGLMb0mHAbo7/TkLVVvyXrbOZBijA3a7+7AZxne2NdPALIX3aYMpd9nKY4ZWQQwFEYhk/cxlScCYRQyeR8z9W9iHWr/itRaeQZIqbwERvDfbf4CbcHIs9LkJtMAAAAASUVORK5CYII=',
          data:jieqi.map(item => [item.dateDimension,"", item.text+":"+item.label]),
          type: 'scatter',
          tooltip:{
            position: 'bottom',
            formatter:function(item){
              console.info(item)
              return item.data[2]
            }
          },
          yAxisIndex:1,
        }
        option.series.unshift(obj)
      }
      let holiday = this.holiday.filter(item => this.markup.includes(item.value));
      if(holiday.length > 0){
        let obj = { // 阴历节日
          symbolSize: 15,
          symbol    : 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAD2klEQVRoQ+1YzW5TRxT+zty/JHbAadUFECB9AEq6a+Mg6L5Sg3gAYN1WhVW37RMQ1l3gPkFZdesssOmukfoAjYRNdk0J2Ni+d+agc2+cXBvHHtvYDpJHsixdnxl/3znfnJ9L+MgXfeT4MScw6wjOIzCPwJgemEtoGAfy/uYt09BF5asClmoPaWX3/2H297KdagSEAIe6GB6GcLPeG+XSj7RaLoxDYroEDtZzqGcPdDNC9DqEu+TCWXS3abX0cFQSUyUgILm6yfId1UPoegQnUHCX/QJdKt0fhcTMCAjY1kEDrDkhkfUe02r5wbAkZkrAhBrhq1aM2V32RE7f0IVnO8OQmCmBOAqvmuDQAMTwc0GFlt9eGyY7TZUAVzbWQervtIfbF1qeqcCBt+z/Spee/WIbhekSePn1Ftj5owOcYTT/axw/8nPBobpaPn9GCeQLYLrbDe5YRgCcRQdu1rlNF58/tSEx3QhUNg9AyHUDa6dUeU4K8D9d+J0ulu6dKQJc2bgHUk96gUoTkN+DT4J/6HL5i7NFoJr/F6C1XqDSF1l+9877cNaeW6nDysjGE/1s+GX+AZgenWbTTcDNuHAynlVNmDiBOHVCFXtpv02oW0LOkiuVefYEOG7eMkWA1vtF6EwSsAXfUY2PWModUAF/Thf+2hsk34lIKKm49GSQ52NwXYVs5peYK/m7AG3303zaq+mGrv08WFko0ZXS5iDvx3XDxsjGRqYtGH5k5fXjAxlRPYrngvYiT8E/Z99a9yXA+1+t9dMh79+4CW22QNg6Lcf3Jc+czATmxCpOoQvOl7Ra3rVx3KkEEo+imBzCu2A6GcCJ10YC3IGIod9GiGon3hc9BCvBC7pcvmIDfqCEuJrfA+iq7WH2dgzwURfKJz6M839GWTdygwn06V/swfawNJwMMjoej5Ml3s/ZX97Utv5QuJp/CtB3YwFObWZtEB62OsED8HP+G3Lohq327QlINa1ldkB0fVwSUnFNI+q4tHJmPA8v0FDSsSYQX+ExSYjXo1oI00qlmyMER1nn/qgvuKzrwCgkBLiW9z/N94GL5r2sV1e++n5U8AMvcS/JcGVj24T8k2QRUgQoAjkqbgkEsCzd0jBN/Z5U2ufJ8O4uOlVy6NthNd+NyToC6Y3S65hQF3STrwtQ26V8JTNvTbnqh3G8nv6/kQi0D5BKjRZ+Nhp3TGQ+M1GSFiUScVTkVYmnoFz50J9w+DfbYd3WKWMR6IiKXPRGNun7DW4l6LEDRHs2bbEt4A8ioVH/bBL7PlgEJgHO5sw5ARsvTdJmHoFJetfm7HkEbLw0SZt3ptWhQB3i9UIAAAAASUVORK5CYII=',
          data      : holiday.map(item => [item.dateDimension,"", item.text+":"+item.label]),
          type      : 'scatter',
          tooltip   :{
            position: 'bottom',
            formatter:function(item){
              return item.data[2]
            }
          },
          yAxisIndex:1,
        }
        option.series.unshift(obj)
      }

      return option;
    }
  },
  mounted(){
    this.myChart = this._echarts.init(document.getElementById(this.lineId));
    document.getElementById(this.lineId).style.width = document.getElementById(this.lineId).offsetWidth+"px"
  },
  watch:{
    markup(){
      console.info("打标变化了",this.markup)
      this.draw(this.updateGraphOption());
    },
    line(){
      console.info("要显示的线",this.line)
      this.draw(this.updateGraphOption());
    },
    pcurrentChildrenIdList:{
      handler(val){

        console.info("watch",val)
      },
      immediate:true,
    }
  }
}
</script>
