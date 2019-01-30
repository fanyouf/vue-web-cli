<template>
  <!--达成指标分析页面-->
  <div>
    <div class="card-title">
      <div style="text-align: left; width: 50%"><h4>指标分析</h4></div>
      <div style="text-align: right; width: 50%;display: inline-block">
        <!--<FastFilter ref="filter" :originList="originItemList" :syncMethod="syncFilterList"></FastFilter>-->
        <svg class="icon" aria-hidden="true" title="下载" @click="iconClick('download')">
          <use v-show="model!='download'" xlink:href="#icon-xiazai-moren"></use>
          <use v-show="model=='download'" xlink:href="#icon-xiazai-jihuo"></use>
        </svg>
      </div>
    </div>

    <div class="self-cond">
      指标：
      <Select style="width: 120px;" v-model="subject" v-on:on-change="subjectChange">
        <Option value="GMV">GMV</Option>
        <Option value="saleQtty">销售数量</Option>
        <!--<Option value="orderNumber">单量</Option>-->
        <!--<Option value="ac">客单价</Option>-->
        <Option value="numUnitPrice">件单价</Option>
        <Option value="saleGrossProfit">前台毛利额</Option>
      </Select>

      排序：
      <Select style="width: 120px;" v-model="sort" v-on:on-change="sortChange">
        <Option value="asc">指标升序</Option>
        <Option value="desc">指标降序</Option>
      </Select>

      筛选：
      <FastFilter ref="filter" :originList="originItemList" :syncMethod="syncFilterList" :isInput="true"></FastFilter>
    </div>

    <div v-loading="loading">
      <TrendChart ref="trendChart" :xAxis="xAxisList" :yAxis="yAxis" :series="seriesList" reference="trendChart"></TrendChart>
    </div>
    <a href="#" :id="aId" :v-show="false"></a> <!--用于下载的钩子 -->
  </div>
</template>

<script>
  import TrendChart from '@/components/chart/TrendChart'
  import FastFilter from '@/components/filter/FastFilter'
  import moment from 'moment'
  import { saleReached as Api } from '@/api/index.js'
  export default{
    components:{
      TrendChart,FastFilter
    },
    data(){
      return {
        model:'',
        subject:'GMV',
        xAxis:[],
        yAxis:[],
        series:[],
        loading:false,
        filterList:[],//快速选择筛选的filterList
        sort:'asc',//默认指标升序
      }
    },
    methods:{
      querySubjectAnalysis(){
        let condition = this.$parent.$parent.getCommonCondition();
        let realCondition = Object.assign(condition,this.subjectCondition);
        // this.loading = true;
        Api.getIndicationAnalysisData(realCondition,this,'loading').then( this._do("指标分析",rs => {
          this.$parent.$parent.updateModuleState('subject',true);
          if(rs.chart != undefined){
            this.xAxis = rs.chart.xaxisList;
            this.yAxis = rs.chart.yaxisList;
            this.series = rs.chart.seriesList;
          }

          setTimeout(() => {
            this.loading = false;
            this.$refs.trendChart.reloadCharts();
          },1000);
        })).catch( error => {
          this.loading = false;
          this.$Message.error({content: '失败：'+error, duration: 10, closable: true});
        });
      },
      iconClick(icon){
        this.model = icon;
        if(icon == 'download'){
          this.download();
        }
      },
      subjectChange(option){
//        this.filterList = [];
        this.querySubjectAnalysis();
      },
      sortChange(sort){
        this.querySubjectAnalysis();
      },
      download(){
        console.log("指标分析下载");
        console.log("this.yAxis",this.yAxis);
        console.log("this.xAxis",this.xAxis)
        console.log("this.series",this.series)

        let title = {};
        title.name = '名称';
        this.yAxis.forEach(y => title[y.name] = y.name);

        let nameList = this.xAxis;
        if(this.filterList != undefined && this.filterList.length > 0){
          nameList = this.filterList;
        }

        let rowList = nameList.map( (xAxis,index) => {
          let row = {};
          row.name = xAxis;
          this.yAxis.forEach(y => {
            let filterSeriesList = this.seriesList.filter(ser => y.name == ser.name);
            if(filterSeriesList != undefined && filterSeriesList.length > 0){
              let filter = filterSeriesList[0];
              let value = filter.data[index];
              if(y.isRatio != undefined && y.isRatio == true){
                value = parseFloat(value * 100).toFixed(2) + '%';
              }
              row[y.name] = value;
            }
          });
          return row;
        });
        rowList.unshift(title);

        let sheetData = [
          {sheetName:'指标分析',sheetData:rowList },
        ]
        console.info(sheetData)
        try{
          this._excel.downloadAll(document.getElementById(this.aId), sheetData, '指标分析'+moment().format('YYYYMMDD'));
        }
        catch(e){
          this._error("下载出现错误")
        }
      },
      syncFilterList(filterList){//同步快速选择组件的filterList
        console.log("同步选择filterList",filterList)
        this.filterList = filterList;
        setTimeout( ()=>{
          this.$refs.trendChart.reloadCharts();
        },1000);
      },
    },
    computed:{
      subjectCondition(){
        let condition = {};
        condition.subject = [this.subject];
        condition.sort = this.sort;
        return condition;
      },
      aId(){
        return "a"+Math.random().toString().substring(2);
      },
      originItemList(){
        let seriesName = undefined;
        if(this.subject == 'GMV'){
          seriesName = 'GMV';
        }else if(this.subject == 'saleQtty'){
          seriesName = '销量';
        }else if(this.subject == 'orderNumber'){
          seriesName = '单量';
        }else if(this.subject == 'ac'){
          seriesName = '客单价';
        }else if(this.subject == 'numUnitPrice'){
          seriesName = '件均单价';
        }else if(this.subject == 'saleGrossProfit'){
          seriesName = '前台毛利额';
        }
        let seriesFilter = this.series.filter(ser => ser.name == seriesName);
        if(seriesFilter == undefined || seriesFilter.length == 0){
          return [];
        }
        let datas = seriesFilter[0].data;
        let itemList = this.xAxis.map( (x,index) => {
            let obj = {};
          obj.label = x;
          obj.value = datas[index];
          return obj;
        });
        if(this.sort == 'asc'){
          itemList.sort( (a,b) => a.value - b.value);
        }else{
          itemList.sort( (a,b) => b.value - a.value);
        }
        //itemList.sort( (a,b) => a.value - b.value);
        return itemList;
      },
      indexList(){
        let indexList = [];
        if(this.filterList != undefined || this.filterList.length != 0){
          this.xAxis.forEach( (x,index) => {
            if(this.filterList.indexOf(x) !== -1){
              indexList.push(index);
            }
          });
        }
        return indexList;
      },
      xAxisList(){
        if(this.filterList == undefined || this.filterList.length == 0){
          return this.xAxis;
        }
        return this.xAxis.filter(x => this.filterList.indexOf(x) !== -1);
      },
      seriesList(){
//        this.series
        if(this.filterList == undefined || this.filterList.length == 0){
          return this.series;
        }
        let indexList = this.indexList;
        return this.series.map(ser => {
          let clone = this._utils.cloneObj(ser);
          let data = indexList.map(i => clone.data[i]);
          clone.data = data;
          return clone;
        });
      }
    },
    mounted(){

    }
  }
</script>
