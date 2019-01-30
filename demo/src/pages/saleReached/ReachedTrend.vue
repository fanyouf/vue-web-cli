<template>
  <!--销售达成，趋势分析-->
  <div>
    <div class="card-title">
      <div style="text-align: left; width: 50%"><h4>趋势分析</h4></div>
      <div style="text-align: right; width: 50%;display: inline-block">
        <!--<svg class="icon" aria-hidden="true" title="柱状图" @click="iconClick('chart')">-->
          <!--<use v-show="model!='chart'" xlink:href="#icon-zhuzhuangtu-moren"></use>-->
          <!--<use v-show="model=='chart'" xlink:href="#icon-zhuzhuangtu-xuanzhong"></use>-->
        <!--</svg>-->
        <!--<svg class="icon" aria-hidden="true" title="列表图" @click="iconClick('table')">-->
          <!--<use v-show="model!='table'" xlink:href="#icon-liebiaotu-moren"></use>-->
          <!--<use v-show="model=='table'" xlink:href="#icon-liebiaotu-xuanzhong"></use>-->
        <!--</svg>-->
        <layoutSetting ref="layout" page="reached" module="trend" :condition="layoutCondition"
                       @applyLayout="applyLayout"></layoutSetting>
        <svg class="icon" aria-hidden="true" title="下载" @click="iconClick('download')">
          <use v-show="model!='download'" xlink:href="#icon-xiazai-moren"></use>
          <use v-show="model=='download'" xlink:href="#icon-xiazai-jihuo"></use>
        </svg>
      </div>
    </div>

    <div class="self-cond">
      <div style="width:90%;">
        <LayoutTree ref="layoutTree" :treeCondition="treeCondi" :syncMethod="syncCondition"
                    :reference="'trendTree'" @initQuery="initQuery"></LayoutTree>

        <div>
          <DateTime ref="date" :dateType="dateType" :begin="beginDate" :end="endDate"
                    :syncBegin="syncBeginDate" :syncEnd="syncEndDate" :syncDateType="syncType"></DateTime>
        </div>

        <!--<Select style="width: 120px;" v-model="sort">-->
          <!--<Option value="real_asc">实际升序</Option>-->
          <!--<Option value="real_desc">实际降序</Option>-->
          <!--<Option value="target_asc">目标升序</Option>-->
          <!--<Option value="target_desc">目标降序</Option>-->
        <!--</Select>-->
      </div>

      <div style="width: 9%;text-align: right;">
        <Button type="primary" v-on:click="queryReachedTrend">查询</Button>
      </div>
    </div>

    <div v-if="toggle == 'chart'" v-loading="loading">
      <TrendChart ref="trendChart" :xAxis="xAxis" :yAxis="yAxis" :series="series" reference="trendChart"
                  :shadowColor="['#FAF3DA','#DFEFF9']"></TrendChart>
    </div>
    <!--<div v-else-if="toggle == 'table'" class="card-padding">-->
      <!--<div style="width: 20%;">-->
        <!--<ColorRange :isRatio="false" :colorList="colorList"></ColorRange>-->
      <!--</div>-->
      <!--<div><RangeTable :colorRange="colorList" :columns="columnList" :datas="dataList"></RangeTable></div>-->
    <!--</div>-->
    <a href="#" :id="aId" :v-show="false"></a> <!--用于下载的钩子 -->
  </div>
</template>

<script>
  import TrendChart from '@/components/chart/TrendChart'
  import layoutSetting from '@/components/layout/LayoutSetting'
  import ColorRange from '@/components/colorRange/ColorRange'
  import RangeTable from '@/components/table/RangeTable'
  import DateTime from '@/components/common/DateTime'
  import TreeCondition from '../saleDetail/TreeCondition.vue'
  import LayoutTree from '../saleDetail/LayoutTree.vue'
  import moment from 'moment'
  import { saleReached as Api } from '@/api/index.js'
  import mixin from './mixin'
  export default{
    mixins:[mixin],
    components:{
      layoutSetting,DateTime,TrendChart,ColorRange,RangeTable,TreeCondition,LayoutTree
    },
    data(){
      return {
        model:'chart',
        toggle:'chart',
        dateType:'D',//类型，月：month,周:week,日:day
        showQuarter:true,
        sort:'real_asc',
        beginDate:new Date(),
        endDate:new Date(),
        xAxis:[],
        yAxis:[],
        series:[],
        tableData:[],
        colorList:[
          {color:'#FAF3DA',value:200000},
          {color:'#E8F3DA',value:400000},
          {color:'#DFEFF9',value:800000},
          {color:'#EFE9F1',value:1000000}
        ],
        treeCondition:{},
        loading:false,
        isCookie:false,
      }
    },
    methods:{
      queryReachedTrend(){
        if(!this.validateUserInfo(true)) return;
        if(this.$refs.date.validateDateRange() == false) return;
        let condition = this.$parent.$parent.getCommonCondition();
        let realCondition = Object.assign(condition,this.trendCondition);
        console.log("trendCondition",realCondition);
        if(realCondition.dateType != undefined){
          let format = 'YYYY-MM-DD';
          if(realCondition.dateType == 'M') format = 'YYYY-MM';
          if(realCondition.dateType == 'W') format = 'YYYY-WW';
          realCondition.beginDate = moment(realCondition.beginDate).format(format);
          realCondition.endDate = moment(realCondition.endDate).format(format);
        }
        if(!this.validateTreeData()){
          return;
        }
        this.loading = true;
        Api.getTrendAnalysisData(realCondition,this).then( this._do("趋势分析",rs => {
          this.$parent.$parent.updateModuleState('trend',true);
          if(rs.chart != undefined){
            this.xAxis = rs.chart.xaxisList;
            this.yAxis = rs.chart.yaxisList;
            this.series = rs.chart.seriesList;
          }
          this.tableData = rs.table;

          setTimeout(() => {
            this.loading = false;
            if(this.$refs.trendChart){
              this.$refs.trendChart.reloadCharts();
            }
          },1000);
        })).catch( error => {
          this.$Message.error({content: '失败：'+error, duration: 10, closable: true});
        });
      },
      initQuery(condition){
        setTimeout( () => {
          if(this.isCookie == false){
            console.log("@initQuery",condition)
            this.treeCondition = condition;
            this.queryReachedTrend();
          }
        },200);
      },
      download(){
        this.model = 'download';
        console.log("this.xAxis",this.xAxis)
        console.log("this.yAxis",this.yAxis)
        console.log("this.series",this.series)

        let title = {};
        title.name = '名称';
        this.series.forEach(y => title[y.name] = y.name);

        let rowList = this.xAxis.map( (xAxis,index) => {
          let row = {};
          row.name = xAxis;
          this.series.forEach(ser => {
            let value = ser.data[index];
            if(value == null || value == '-'){
              value = 0;
            }
            let yIndex = ser.yaxisIndex == undefined ? 0 : ser.yaxisIndex;
            let y = this.yAxis[yIndex];
            if(y.isRatio != undefined && y.isRatio == true && !isNaN(value)){
              value = parseFloat(value * 100).toFixed(2) + '%';
            }
            row[ser.name] = value;
          });
          return row;
        });
        rowList.unshift(title);

        // 前端下载
        let sheetData = [
          {sheetName:'趋势分析',sheetData:rowList},
        ]
        console.info(sheetData)
        try{
          this._excel.downloadAll(document.getElementById(this.aId), sheetData, '趋势分析'+moment().format('YYYYMMDD'));
        }
        catch(e){
          this._error("下载出现错误")
        }
        this.model = 'chart';
      },
      iconClick(icon){
        this.model = icon;
        if(icon == 'download'){
          this.download();
        }else if(icon == 'chart'){
          this.toggle = 'chart';
        }else if(icon == 'table'){
          this.toggle = 'table';
        }
      },
      syncBeginDate(begin){//同步起始时间
        this.beginDate = moment(begin).toDate();
      },
      syncEndDate(end){//同步结束时间
        this.endDate = moment(end).toDate();
      },
      syncType(dateType){
        this.dateType = dateType;
      },
      syncCondition(condition){//同步treeCondition查询条件
        console.log("reached trend syncCondition",condition)
        this.treeCondition = condition;
//        this.queryReachedTrend();
      },
      syncLayout(){
        setTimeout( () => {
          if(!this.$refs.layout){
            return;
          }
          let layout = this.$refs.layout.getDefaultLayout();
          console.log("趋势分析获取默认布局：",layout)
          if(layout != undefined){
            let layoutClone = this._utils.cloneObj(layout);
            this.isCookie = true;
//            this.sort = layoutClone.sort;
            this.beginDate = moment(layoutClone.beginDate).toDate();
            this.endDate = moment(layoutClone.endDate).toDate();
            this.dateType = layoutClone.dateType;
            this.treeCondition = layoutClone.treeCondition;
            this.$refs.layoutTree.syncLayoutCondition(layoutClone.treeCondition);
            this.queryReachedTrend();
          }
        },150);
      },
      applyLayout(layout){
        if(layout != undefined){
          let layoutClone = this._utils.cloneObj(layout);
          this.isCookie = true;
//          this.sort = layoutClone.sort;
          this.beginDate = moment(layoutClone.beginDate).toDate();
          this.endDate = moment(layoutClone.endDate).toDate();
          this.dateType = layoutClone.dateType;
          this.treeCondition = layoutClone.treeCondition;
          this.$refs.layoutTree.syncLayoutCondition(layoutClone.treeCondition);
        }
      }
    },
    computed:{
      trendCondition(){
        let condition = {};
        condition.dateType = this.dateType;
//        condition.sort = this.sort;
        condition.beginDate = this.beginDate;
        condition.endDate = this.endDate;
        Object.assign(condition,this.treeCondition.queryCondition);
        return condition;
      },
      layoutCondition(){
        let condition = {};
        condition.dateType = this.dateType;
//        condition.sort = this.sort;
        condition.beginDate = this.beginDate;
        condition.endDate = this.endDate;
        condition.treeCondition = this.treeCondition;
        return condition;
      },
      columnList(){
        let columnList = [];
        if(this.tableData != undefined && this.tableData.length > 0){
          let table = this.tableData[0];
          for(var key in table){
            if(key != 'columnList'){
              let column = { key:key,name:key,fixed:'left'};
              columnList.push(column);
            }else{
              let columnItemList = table[key];
              if(columnItemList != undefined && columnItemList.length > 0){
                columnItemList.forEach(item => {
                  let column = { key:item.title,name:item.title,isData:true,isRatio:item.isRatio };
                  columnList.push(column);
                });
              }
            }
          }
        }
        return columnList;
      },
      dataList(){
        let dataList = [];
        if(this.tableData != undefined && this.tableData.length > 0){
          this.tableData.forEach(table => {
            let data = {};
            for(let key in table){
              if(key != 'columnList'){
                let value = table[key];
                data[key] = value;
              }else{
                let columnList = table[key];
                if(columnList != undefined && columnList.length > 0){
                  columnList.forEach(item => {
                    let key = item.title;
                    let value = item.value;
                    data[key] = value;
                  });
                }
              }
            }
            dataList.push(data);
          });
        }
        return dataList;
      },
      treeCondi(){
        return this.treeCondition;
      },
      aId(){
        return "a"+Math.random().toString().substring(2);
      }
    },
    mounted(){
//      let layout = this.$refs.layout.getDefaultLayout();
//      console.log("趋势分析获取默认布局：",layout)
//      if(layout != undefined){
//        this.sort = layout.sort;
//        this.beginDate = moment(layout.beginDate).toDate();
//        this.endDate = moment(layout.endDate).toDate();
//        this.dateType = layout.dateType;
//        this.treeCondition = layout.treeCondition;
//      }
      this.beginDate = moment(moment().format("YYYY-MM-01"),'YYYY-MM-dd').toDate();
      this.endDate = moment().toDate();
//      this.dateType = "M";
    },
    created(){
      this._bus.$on(this._CONST.E_USERINFO_CHANGE,this.syncLayout);
    },
    beforeDestroy(){
      this._bus.$off(this._CONST.E_USERINFO_CHANGE,this.syncLayout);
    }
  }
</script>
