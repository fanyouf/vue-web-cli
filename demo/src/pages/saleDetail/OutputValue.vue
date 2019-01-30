<!--产值分析-->
<template>
  <div>
    <div class="card-title">
      <div style="text-align: left; width: 50%"><h4>产值分析</h4></div>
      <div style="text-align: right; width: 50%">
        <!--<FastFilter ref="filter" :originList="originItemList" :syncMethod="syncFilterList"></FastFilter>-->
      </div>
    </div>
    <div class="common-padding">
      <div>
        筛选：
        <FastFilter ref="filter" :originList="originItemList" :syncMethod="syncFilterList" :isInput="true"></FastFilter>
      </div>
      <div style="height: 340px;">
        <div style="float: right;line-height: 24px;">
          <expand><TrendChart :xAxis="xAxisList" :yAxis="yAxisList" :series="seriesList"></TrendChart></expand>
        </div>
        <div v-loading="loading" style="padding-top: 24px;">
          <TrendChart ref="trend" :xAxis="xAxisList" :yAxis="yAxisList" :series="seriesList"></TrendChart>
        </div>
      </div>
      <div v-if="condition.childrenLevel != 'sku'">
        <div style="float: right;line-height: 24px;padding-top: 24px;">
          <expand><ScatterChart :height="400" xName="SKU计数" yName="GMV" :datas="scatterDatas"></ScatterChart></expand>
        </div>
        <div v-loading="loading" style="padding-top: 48px;">
          <ScatterChart ref="scatter" :height="400" xName="SKU计数" yName="GMV" :datas="scatterDatas"></ScatterChart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import TrendChart from '@/components/chart/TrendChart'
  import ScatterChart from '@/components/chart/ScatterChart'
  import FastFilter from '@/components/filter/FastFilter'
  import expand from './expand.vue'
  import { saleReached as Api } from '@/api/index.js'
  export default{
    name:'OutputValue',
    components:{
      TrendChart,ScatterChart,expand,FastFilter
    },
    data(){
      return {
        loading:false,
        dataList:[],
        filterList:[],//过滤列表中文
        condition:{},//查询条件，用于判断是否需要气泡图
      }
    },
    methods:{
      queryOutputValue(){//查询产值分析数据
        let condition = this.$parent.$parent.getCommonCondition();
        this.condition = condition;
        // this.loading = true;
        Api.getGMVYoy(condition,this,'loading').then( this._do("产值分析",rs => {
          this.$parent.$parent.updateModuleState('output',true);
          if(rs != undefined){
            this.dataList = rs;
          }

          setTimeout(() => {
            this.$refs.trend.reloadCharts();
            if(this.$refs.scatter){
              this.$refs.scatter.reloadCharts();
            }
            this.loading = false;
          },1000);
        })).catch( error => {
          this.loading = false;
          this.$Message.error({content: '失败：'+error, duration: 10, closable: true});
        });
      },
      syncFilterList(filterList){
        console.log("同步产值分析",filterList)
        this.filterList = filterList;
        setTimeout( ()=>{
          this.$refs.trend.reloadCharts();
          if(this.$refs.scatter){
            this.$refs.scatter.reloadCharts();
          }
        },300);
      }
    },
    computed:{
      filterDataList(){
        if(this.filterList == undefined || this.filterList.length == 0){
          return this.dataList;
        }
        return this.dataList.filter(data => this.filterList.indexOf(data.name) != -1);
      },
      xAxisList(){
        if(this.filterDataList == undefined || this.filterDataList.length == 0) return [];
        let xAxisList = this.filterDataList.map(gmv => gmv.name);
        return xAxisList;
      },
      yAxisList(){
        let yAxisList = [];
        let y1 = {name:'GMV',isRatio:false};
        let y2 = {name:'同比',isRatio:true};
        yAxisList.push(y1);
        yAxisList.push(y2);
        return yAxisList;
      },
      seriesList(){
        if(this.filterDataList == undefined || this.filterDataList.length == 0) return [];
        let seriesList = [];
        let ser1 = { name:'前一年',type:'bar',isStack:false };
        let lastYearData = this.filterDataList.map(gmv => gmv.old);
        ser1.data = lastYearData;
        let ser2 = { name:'所选年',type:'bar',isStack:false};
        let curYearData = this.filterDataList.map(gmv => gmv.gmv);
        ser2.data = curYearData;
        seriesList.push(ser1);
        seriesList.push(ser2);
        let ser3 = { name:'同比',type:'line',yaxisIndex: 1,showShadow:false };
        let yoyData = this.filterDataList.map(gmv => {
          if(isNaN(gmv.gmv) || isNaN(gmv.old) || gmv.gmv == null || gmv.old == null || gmv.old == 0){
            return 0;
          }
          return (gmv.gmv - gmv.old) / gmv.old;
        });
        ser3.data = yoyData;
        seriesList.push(ser3);
        return seriesList;
      },
      scatterDatas(){
//        { name:'',x:10,y:20,size:50 }
        if(this.filterDataList == undefined || this.filterDataList.length == 0) return [];
        let datas = this.filterDataList.map(gmv => {
          let obj = {};
          obj.name = gmv.name;
          obj.x = gmv.skuNum == null ? 0 : gmv.skuNum;
          obj.y = gmv.gmv == null ? 0 : gmv.gmv;
//          obj.size = obj.y / 10000000;
          return obj;
        });

        datas.sort( (d1,d2) => d2.y - d1.y);
        let maxGMV = datas[0].y;
        let maxScatterSize = 100;
        datas.forEach(d => {
          d.size = d.y / maxGMV * 100;
        });
        datas.sort( (d1,d2) => d1.x - d2.x);
        console.log("scatterDatas",datas);
        return datas;
      },
      originItemList(){
        if(this.dataList == undefined || this.dataList.length ==0){
          return [];
        }
        let mapList = this.dataList.map(gmv => {
          return { label:gmv.name,value:(gmv.gmv == null ? 0 : gmv.gmv) };
        });
        return mapList.sort((m1,m2) => m2.value - m1.value);
      },

    }
  }
</script>
