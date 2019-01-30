<!-- 这是一个业务组件 -->
<template>
  <div>
    <radio-buttons :defaultValue="'yoy'" v-model="ratioType" :list="[{label:'同比',value:'yoy'},{label:'环比',value:'mom'}]"></radio-buttons>

    <holidayMark
          :jieqi="jieqi"
          :holiday= "holiday"
          v-model = "markup"
          style="margin-right:30px;margin-top:1px;float: right"></holidayMark>

    <div ref = "domId" style="height:400px;"></div>
  </div>
</template>

<script>
const echarts = require('echarts')

const legend = {
  target:{
    bar_val_mom:"目标环比",
    bar_entendVal_mom:"",
    bar_val_yoy:"目标同比",
    bar_entendVal_yoy:"",
    line_history_val:"目标(历史)",
    line_forecast_val:"目标&预测",
    line_extend_val:"",
  },
  target_Forecast:{
    bar_val_mom:"GMV实际&预测环比",
    bar_entendVal_mom:"GMV预测（调整）环比",
    bar_val_yoy:"GMV实际&预测同比",
    bar_entendVal_yoy:"GMV预测（调整）同比",
    line_history_val:"GMV实际",
    line_forecast_val:"GMV预测",
    line_extend_val:"GMV预测（调整）",},
  planGMV:{
    bar_val_mom:"GMV环比",
    bar_entendVal_mom:"历史实际环比",// 不会出现
    bar_val_yoy:"GMV同比",
    bar_entendVal_yoy:"历史实际同比",// 不会出现
    line_history_val:"GMV实际",
    line_forecast_val:"GMV计划&预测",
    line_extend_val:"考核目标",     //红色
  },
  planGMV_Forecast:{
    bar_val_mom:"GMV实际&预测环比",
    bar_entendVal_mom:"GMV预测（调整）环比",
    bar_val_yoy:"GMV实际&预测同比",
    bar_entendVal_yoy:"GMV预测（调整）同比",
    line_history_val:"GMV实际",
    line_forecast_val:"GMV预测",
    line_extend_val:"GMV预测（调整）",
  },

  planSale:{
    bar_val_mom:"销量环比",
    bar_entendVal_mom:"历史环比", // 无
    bar_val_yoy:"销量同比",
    bar_entendVal_yoy:"历史同比", // 无
    line_history_val:"销量实际",
    line_forecast_val:"销量实际",
    line_extend_val:"考核目标", // 无
  },
  planSale_Forecast:{
    bar_val_mom:"销量实际&预测环比",
    bar_entendVal_mom:"销量预测（调整）环比",
    bar_val_yoy:"销量实际&预测同比",
    bar_entendVal_yoy:"销量预测（调整）同比",
    line_history_val:"销量实际",
    line_forecast_val:"销量预测",
    line_extend_val:"销量预测（调整）",
  },
}
var basic_option = {
    legend: {},
    dataZoom: [
      //{startValue: '2018-04-01'}, //  如果加这一条，则在显示只有一条数据时会出问题
      {type: 'inside'}
    ],
    xAxis: {
      type: 'category',
      axisTick: {show: false},
      },
    yAxis: [ // 双y轴
      {
        type: 'value',
        name: '数值',
        axisLabel: {
            formatter: '{value}'
        }
      }, {
        type: 'value',
        name: '比值',
        // min: -0.5,
        // max: 3,
        // interval: 0.1,
        axisLabel: {formatter: '{value} %'},
      }, {
              "type": "category", "name": ""
            }
    ],
    series: []
};
import radioButtons from "./radioButtons"
import holidayMark from "@/components/holidayMark.vue"
const _ = require("lodash")
export default {
  props:{
    data:{type:Object,required:true},
    pageType:{type:String,required:true} ,
    jieqi:{type:Array,required:true},
    holiday:{type:Array,required:true},
    dateDimension:{type:String,required:true} ,
  },
  created(){
    this.domId= ("histogram"+Math.random()).replace(".",'')
    console.info("..组合分析图....pageType",this.pageType)
  },
  components:{radioButtons,holidayMark},
  data () {
    return {
      title:"增长分析",
      titleInfo:"info...",
      ratioType:"yoy",// 同比yoy,环比mom
      options:[],
      markup:[],
      id:""
    }
  },
  methods:{
    init(d){
      this.setOptions(d);
      this.draw();
    },
    setOptions(d){
      let bar_val_mom =  _.fill(_.range[0,d.data.length],null),
        bar_entendVal_mom = _.fill(_.range[0,d.data.length],null),
        bar_val_yoy =  _.fill(_.range[0,d.data.length],null),
        bar_entendVal_yoy =  _.fill(_.range[0,d.data.length],null),
        line_history_val = _.fill(_.range[0,d.data.length],null),
        line_forecast_val =_.fill(_.range[0,d.data.length],null),
        line_extend_val= _.fill(_.range[0,d.data.length],null),
        xAxis=[];
      d.data.forEach((item,index) => {

        bar_val_mom[index] = (!item.mom||!item.val) ? 0 : Number(100*(item.val/item.mom - 1)).toFixed(2); // 环比
        bar_val_yoy[index] = (!item.yoy||!item.val) ? 0 : Number(100*(item.val/item.yoy - 1)).toFixed(2); // 同比
        item.hasExtendVal && ( bar_entendVal_yoy[index] = (!item.extendVal||!item.yoy) ? 0 :Number(100*(item.extendVal/item.yoy - 1)).toFixed(2) );
        item.hasExtendVal && ( bar_entendVal_mom[index] = (!item.extendVal||!item.mom) ? 0 :Number(100*(item.extendVal/item.mom - 1)).toFixed(2) );

        item.hasExtendVal && (line_extend_val[index] = item.extendVal);  // 蓝色实线

        item.dataType=='history'  && (line_history_val[index] = item.val); // 橙色实线
        item.dataType=='forecast' && (line_forecast_val[index] = item.val);// 橙色虚线

        if(d.dateType == "M"){
          xAxis.push([item.year,item.month.toString().padStart(2,"0")].join("-"))
        }
        else if(d.dateType == "Q"){
          xAxis.push([item.year,item.quarter.toString().padStart(2,"0")].join("-"))
        }
        else if(d.dateType == "W"){
          xAxis.push([item.year,item.week.toString().padStart(2,"0")].join("-"))
        }
        else if(d.dateType == "D"){
          xAxis.push([item.year,item.month.toString().padStart(2,"0"),item.day.toString().padStart(2,"0")].join("-"))
        }
      })
      console.info("全部的数据：bar_val_mom",bar_val_mom,"bar_val_yoy",bar_val_yoy,"bar_entendVal_yoy",bar_entendVal_yoy,"line_history_val",line_history_val,"line_forecast_val",line_forecast_val)
      //把数据连接起来       用实线连起来的
      let unionVal=0;
        for(var ii=0;ii<line_forecast_val.length;ii++){
        if(line_forecast_val[ii]!=undefined){unionVal= line_forecast_val[ii];break;
        }
       }
      line_history_val.push(unionVal)
      let option = Object.assign({},basic_option);
      option.series = [];
      // option.dataZoom.push({"startData":xAxis[0]})

      if(bar_entendVal_mom.length) {
        option.series.push(
          {
            name: legend[this.pageType]['bar_entendVal_mom'],//  d.name + '-' +
            type: 'bar',
            data_type: 'mom',
            data: bar_entendVal_mom,
            yAxisIndex: 1,
            itemStyle: {color: '#FFD85B'}
          })
      }
      if(bar_entendVal_yoy.length) {
        option.series.push(
          {
            name: legend[this.pageType]['bar_entendVal_yoy'],
            data_type: 'yoy',
            type: 'bar',
            data: bar_entendVal_yoy,
            yAxisIndex: 1,
            itemStyle: {color: '#FFD85B'}
          })
      }
      if(bar_val_yoy.length) {
        option.series.push(
        {
            name:legend[this.pageType]['bar_val_yoy'],
            type:'bar',
            data_type:'yoy',
            data:bar_val_yoy,
            yAxisIndex: 1,
            stack:'total',
            itemStyle:{color:'#D8D8D8'}
        })
      }
      if(bar_val_mom.length) {
        option.series.push(
          {
            name: legend[this.pageType]['bar_val_mom'],
            type: 'bar',
            data_type: 'mom',
            data: bar_val_mom,
            yAxisIndex: 1,
            itemStyle: {color: '#D8D8D8'}
          })
      }
      if(line_extend_val.length) {
          let color = "#5FB9B0"
          if(this.pageType === "planGMV"){
            color = "#f00"
          }
        option.series.push(
          {
            name: legend[this.pageType]['line_extend_val'],
            type: 'line',
            data: line_extend_val,
            yAxisIndex: 0,
            lineStyle: {
              color,
              type:'solid'
            },
            itemStyle: {
              color
            },
            symbol: "circle"
          })
      }

      if(line_history_val.length) {
        option.series.push(
          {
            name: legend[this.pageType]['line_history_val'],//d.name + '-' +
            type: 'line',
            data: line_history_val,
            symbol: 'circle',
            yAxisIndex: 0,
            lineStyle: {
              color: "#E78947",
              type: 'solid',
              width: '2'
            },
            itemStyle: {
              color: "#E78947",
              borderWidth: 4,
            },
            // symbol:"r",
            //showAllSymbol: true
          })
      }

      if(line_forecast_val.length) {
        option.series.push(
          {
            name: legend[this.pageType]['line_forecast_val'],
            type: 'line',
            data: line_forecast_val,
            symbol: 'emptyCircle',
            yAxisIndex: 0,
            lineStyle: {
              color: "#E78947",
              type: 'dashed',
              width: '2'
            },
            itemStyle: {
              color: "#E78947",
              borderWidth: 4,
            },
            //symbol: "circle",
            //showAllSymbol: true
          })
      }
      option.xAxis.data = xAxis

      if( option.series.length === 0 ){
        option.title = {
          text:"暂无数据",
          left:"center",
          top:"middle"
        }
      }
      else{
         delete option.title
      }
      this.options = option
      console.info("options",JSON.stringify(option))

    },
    setOptionsTooltip(option){
      let dateDimension=this.dateDimension;
      console.info("dateDimension",dateDimension)
      let  _this=this;
      option.tooltip= {

           show:true,
           trigger: 'axis',
           formatter: function(t){
             let currentTimeDimension=_this._moment.getCurrentTimeDimension(new Date());  //当前 天 周 月 季 （4个维度）
             let currentTime="";
             let strArr = [];

             if(dateDimension=='D')     {
               currentTime=currentTimeDimension[0];
             } else if(dateDimension== 'W')   {
               currentTime=currentTimeDimension[1];
             } else if(dateDimension== 'M') {
               currentTime = currentTimeDimension[2];
             } else if(dateDimension== 'Q') {
               currentTime = currentTimeDimension[3];
             }

             strArr.push(t[0].axisValueLabel)
             var str = t[0].axisValueLabel


            t.forEach(item => {

              if((item.seriesName=='GMV预测'||item.seriesName=='销量预测'
                ||item.seriesName=='GMV计划&预测' ||item.seriesName=='汇总数据-销量实际'
               )&&item.data==undefined&&item.value==undefined) {
                return ""
              }

              if((item.seriesName=='GMV实际'||item.seriesName=='销量实际'
                ||item.seriesName=='汇总数据-销量实际'||item.seriesName=='汇总数据-GMV实际')
                &&currentTime.indexOf(item.axisValue)>-1) {
                return ""; //这里是避免重合
              }

              let unit="",value=item.value;

              if(item.seriesName=='GMV实际&预测同比'||item.seriesName=='GMV实际&预测环比'){
                unit="%";
              }
              if(value==undefined) {
                value = "";
              }

              str += "</br>"
              let name=item.seriesName.indexOf("series")>-1? "":  item.seriesName+"</b>:";
              str += "<b style='color:"+item.color+"'>"+name+value+unit;

              strArr.push(`<b style="color:"${item.color}">${name}${value}${unit}</b>`)
            })

             str=strArr.join("<br/>")
            return str
           }
       };
    },
    draw()
    {
      let option =this.updateGraph();

      this.setOptionsTooltip(option);

      if(this.myChart)
        this.myChart.setOption(option,true);
      else{
        throw new Error("没有找到要画图的dom")
      }
      console.info(this.myChart,"当前的画图数据是:",option.series);
    },
    updateGraph(){ //更新图例
      let option = Object.assign({}, this.options);
        option.series = this.options.series.filter(item => item.data_type != (this.ratioType == 'yoy' ? 'mom' :'yoy') )
        let holidayList1 = this.jieqi.filter(item => this.markup.includes(item.value));
        if(holidayList1.length > 0){
           let obj = { // 阳历节气
             symbolSize: 15,
             symbol:'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAQLSURBVGhDxZpdThRBEMeLNSSoUTF+REOCEBN88EFuoJ5APIF4AvEE4gnEE4gnEE8gnkB9MCS8sJKQEJWIEpTE+NG/nW23tnenp3p3eq2EgLs9Vf9/VXV1dY1jf5xILjlcLzSfvJXLgoxlJdC8XQCfeZWNQCObZryvfzIZykfg0+MOZP13zUTyEPCe92DDf9dIIg+Bfh7PFIX6CZR5O1MU4gR2l0R2H4ocvbUHPebplChgE9tb8RIcL6P7qyI79wvw4zMipxdEJu+JTMzbCaWsBPT+c5FvayI/m8WT5x6IXFop1RIn8HtfZONs78OeDMr5exjBxkdXsTRore/qm6jD4inUmBQ5dacXHt45dIfTMfe9loOXRcQ2Z0Xej3X/8Bnf4WFAe8HGry8dj2t941cqo119Eus08sonbojMrotgHNl76ry43A0sFhWeO79UpIfXsbNYkNNSkT4srSYQppEGT85u3+3vvRgB7f3pF51eKSRRkT6oqS6jOo00eCKz5Xodv9ksgMM1OId+CV3IlPtNkUAM6WMjwCqqTwiefNa5PAgB/wy69la6SWDTINUphBIPlGiQNni+LvAaJF2rb73R7/dHhIiNgFZANRkmbWJeBfC1LRNwr6Z6D2iD5Gou8D7Sn9upZEgflqRFgEMtR+posIlRsEfgYC0/eB8FTmWjlBOge/RXQpT5+61R8VDLNAEwRGz3EvDAwwd/uOozKjl83bFUhqe9orMHWEi7G7K93h5a0NuMUsrsUmYvPPpXbhstwHi7IlSjxN6yVVbtArxFCmUcDWUj3sbcaJ18dJacgiduZrOXrLjsngFGsILZYe9s4ioi/5tcANw7pLcKlRE5Pp/sxIEf0JeoEuBet/0k5iCj9x+FTD1zbfWiyZKdAOo2Jt1p/NWkeOBFjTOuoWuaGzp7KwGiyysD4zI/eG7JDB6daRHgic0ZV6M/mPEkLUz0PrptEaAD9V3otNsLGMohLd0uTRFj12sjQHPlb2EMtXKkEhvX38a4YjLlMIidgL5KUiEwWFckdNVpzY5W3aDLzZgMUr0HesYqLgKz7iT09+PthcH3BA4gbbTn/YQC8LWMVcLLhY4E6TTXdLPLJ2nRADgdJeWyDDwENJmSaFRHAA8zMgwF8D4S/jsOOwhD8uhd9xPMeQDLuITfeuLg0ya0QT805y75ERlwuOvAAISaXctwd7k93O1TnivSKGG83gbNBs46Xl/tJjPUeJ0XHEgKaF5IfFdXQh1+GjPaYIu03hU4MlxlI89U7wGLMb0mHAbo7/TkLVVvyXrbOZBijA3a7+7AZxne2NdPALIX3aYMpd9nKY4ZWQQwFEYhk/cxlScCYRQyeR8z9W9iHWr/itRaeQZIqbwERvDfbf4CbcHIs9LkJtMAAAAASUVORK5CYII=',
             data:holidayList1.map(item => [item.dateDimension,"", item.text+":"+item.label]),
             type: 'scatter',
             yAxisIndex:2,
           }
            option.series.unshift(obj);
         }
      let holidayList2 = this.holiday.filter(item => this.markup.includes(item.value));
            if(holidayList2.length > 0){
              let obj = { // 阴历节日
                symbolSize: 15,
                symbol:'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAD2klEQVRoQ+1YzW5TRxT+zty/JHbAadUFECB9AEq6a+Mg6L5Sg3gAYN1WhVW37RMQ1l3gPkFZdesssOmukfoAjYRNdk0J2Ni+d+agc2+cXBvHHtvYDpJHsixdnxl/3znfnJ9L+MgXfeT4MScw6wjOIzCPwJgemEtoGAfy/uYt09BF5asClmoPaWX3/2H297KdagSEAIe6GB6GcLPeG+XSj7RaLoxDYroEDtZzqGcPdDNC9DqEu+TCWXS3abX0cFQSUyUgILm6yfId1UPoegQnUHCX/QJdKt0fhcTMCAjY1kEDrDkhkfUe02r5wbAkZkrAhBrhq1aM2V32RE7f0IVnO8OQmCmBOAqvmuDQAMTwc0GFlt9eGyY7TZUAVzbWQervtIfbF1qeqcCBt+z/Spee/WIbhekSePn1Ftj5owOcYTT/axw/8nPBobpaPn9GCeQLYLrbDe5YRgCcRQdu1rlNF58/tSEx3QhUNg9AyHUDa6dUeU4K8D9d+J0ulu6dKQJc2bgHUk96gUoTkN+DT4J/6HL5i7NFoJr/F6C1XqDSF1l+9877cNaeW6nDysjGE/1s+GX+AZgenWbTTcDNuHAynlVNmDiBOHVCFXtpv02oW0LOkiuVefYEOG7eMkWA1vtF6EwSsAXfUY2PWModUAF/Thf+2hsk34lIKKm49GSQ52NwXYVs5peYK/m7AG3303zaq+mGrv08WFko0ZXS5iDvx3XDxsjGRqYtGH5k5fXjAxlRPYrngvYiT8E/Z99a9yXA+1+t9dMh79+4CW22QNg6Lcf3Jc+czATmxCpOoQvOl7Ra3rVx3KkEEo+imBzCu2A6GcCJ10YC3IGIod9GiGon3hc9BCvBC7pcvmIDfqCEuJrfA+iq7WH2dgzwURfKJz6M839GWTdygwn06V/swfawNJwMMjoej5Ml3s/ZX97Utv5QuJp/CtB3YwFObWZtEB62OsED8HP+G3Lohq327QlINa1ldkB0fVwSUnFNI+q4tHJmPA8v0FDSsSYQX+ExSYjXo1oI00qlmyMER1nn/qgvuKzrwCgkBLiW9z/N94GL5r2sV1e++n5U8AMvcS/JcGVj24T8k2QRUgQoAjkqbgkEsCzd0jBN/Z5U2ufJ8O4uOlVy6NthNd+NyToC6Y3S65hQF3STrwtQ26V8JTNvTbnqh3G8nv6/kQi0D5BKjRZ+Nhp3TGQ+M1GSFiUScVTkVYmnoFz50J9w+DfbYd3WKWMR6IiKXPRGNun7DW4l6LEDRHs2bbEt4A8ioVH/bBL7PlgEJgHO5sw5ARsvTdJmHoFJetfm7HkEbLw0SZt3ptWhQB3i9UIAAAAASUVORK5CYII=',
                data:holidayList2.map(item => [item.dateDimension,"", item.text+":"+item.label]),
                type: 'scatter',
                yAxisIndex:2
              }
              option.series.unshift(obj)
            }
         return  option;
    }
  },
  mounted(){
    this.myChart = this._echarts.init(this.$refs.domId);
    console.info("组合分析组件mounted获取到的mychart是",this.myChart)
    this.$refs.domId.style.width = this.$refs.domId.offsetWidth+"px"
  },

  watch:{
    markup(){
         this.draw(this.updateGraph());
       },
    ratioType(newData){
       console.info("analysis-combination同-环切换",newData)
      this.draw();
    },
    data:{
      handler:function(newData){
        console.info("analysis-combination 数据变化了........",newData)
        if(!newData.data || newData.data.length === 0){
          this.myChart.setOption({title:{
            text:"暂无数据",
            left:"center",
            top:"middle"
          }},true);
        }
        else{
          this.init(newData)
        }
      },
      deep:true
    }
  }
}
</script>
