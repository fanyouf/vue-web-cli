<!--达成分析-->
<template>
  <div>
    <div class="card-title">
      <div style="text-align: left; width: 50%"><h4>达成分析</h4></div>
      <div style="text-align: right; width: 50%;display: inline-block">
        <!--布局组件-->
        <layoutSetting ref="layout" page="reached" module="reached" :condition="reachedCondition"
                       @applyLayout="applyLayout"></layoutSetting>

        <!--<FastFilter ref="filter" :originList="originItemList" :syncMethod="syncFilterList"></FastFilter>-->
        <!--<svg class="icon" aria-hidden="true" title="柱状图" @click="iconClick('chart')">-->
          <!--<use v-show="model!='chart'" xlink:href="#icon-zhuzhuangtu-moren"></use>-->
          <!--<use v-show="model=='chart'" xlink:href="#icon-zhuzhuangtu-xuanzhong"></use>-->
        <!--</svg>-->
        <svg class="icon" aria-hidden="true" title="下载" @click="iconClick('download')">
          <use v-show="model!='download'" xlink:href="#icon-xiazai-moren"></use>
          <use v-show="model=='download'" xlink:href="#icon-xiazai-jihuo"></use>
        </svg>
      </div>
    </div>

    <div class="self-cond">
      <div style="width: 90%;padding-top:5px;">

        <div>
          <DateTime ref="date" :dateType="dateType" :begin="beginDate" :end="endDate"
                    :syncBegin="syncBeginDate" :syncEnd="syncEndDate" :syncDateType="syncType"></DateTime>
        </div>
        &nbsp;&nbsp; | &nbsp;&nbsp;
        视图:
        <Select v-model="dimension" size="small" v-on:on-change="dimensionChange" style="width: 90px;">
          <Option value="cate3">三级品类</Option>
          <Option value="brand">品牌</Option>
          <Option value="saler" v-if="user.type == 'DEPT_MANAGER'">采销</Option>
        </Select>

        <div style="padding-top: 5px;">
          排序：
          <Select style="width: 90px;"  size="small"  v-model="sort" v-on:on-change="sortChange">
            <Option value="real_asc">实际升序</Option>
            <Option value="real_desc">实际降序</Option>
            <Option value="target_asc">目标升序</Option>
            <Option value="target_desc">目标降序</Option>
          </Select>
          筛选：
          <FastFilter ref="filter" :isInput="true" :originList="originItemList" :syncMethod="syncFilterList"></FastFilter>
        </div>
      </div>

      <div style="width: 9%;text-align: right;">
        <Button type="primary" v-on:click="queryReachedAnalysis">查询</Button>
      </div>
    </div>
    <div v-if="toggle == 'chart'" v-loading="loading">
      <TrendChart ref="chart" :xAxis="xAxisList" :yAxis="yAxis" :series="seriesList"></TrendChart>
    </div>
    <!--<div v-else-if="toggle == 'table'" class="card-padding">-->
      <!--<div style="width: 20%;">-->
        <!--<ColorRange :isRatio="true" :colorList="colorList"></ColorRange>-->
      <!--</div>-->
      <!--<div><RangeTable :colorRange="colorList" :columns="columnList" :datas="dataList"></RangeTable></div>-->
    <!--</div>-->
    <a href="#" :id="aId" :v-show="false"></a> <!--用于下载的钩子 -->
  </div>
</template>

<script>
import TrendChart from "@/components/chart/TrendChart";
import layoutSetting from "@/components/layout/LayoutSetting";
import ColorRange from "@/components/colorRange/ColorRange";
import RangeTable from "@/components/table/RangeTable";
import FastFilter from "@/components/filter/FastFilter";
import DateTime from "@/components/common/DateTime";
import moment from "moment";
import { saleReached as Api } from "@/api/index.js";
import { mapGetters } from "vuex";
import mixin from "./mixin";
export default {
  mixins: [mixin],
  name: "TrendAnalysis",
  components: {
    TrendChart,
    layoutSetting,
    ColorRange,
    RangeTable,
    FastFilter,
    DateTime
  },
  data() {
    return {
      model: "chart",
      toggle: "chart",
      sort: "real_asc",
      dimension: "cate3",
      dateType: "D", //类型，月：month,周:week,日:day
      beginDate: new Date(),
      endDate: new Date(),
      filterList: [], //快速选择筛选的filterList
      fastRadio: "", //快速选择筛选的单选框
      xAxis: [],
      yAxis: [],
      series: [],
      tableData: [],
      colorList: [
        { color: "#FAF3DA", value: 200000 },
        { color: "#E8F3DA", value: 400000 },
        { color: "#DFEFF9", value: 800000 },
        { color: "#EFE9F1", value: 1000000 }
      ],
      loading: false
    };
  },
  methods: {
    queryReachedAnalysis() {
      if (!this.validateUserInfo(true)) return;
      if (this.$refs.date.validateDateRange() == false) return;
      let condition = this.$parent.$parent.getCommonCondition();
      let realCondition = Object.assign(condition, this.reachedCondition);
      console.log("查询达成分析数据", realCondition);
      if (realCondition.dateType != undefined) {
        let format = "YYYY-MM-DD";
        if (realCondition.dateType == "M") format = "YYYY-MM";
        if (realCondition.dateType == "W") format = "YYYY-WW";
        realCondition.beginDate = moment(realCondition.beginDate).format(
          format
        );
        realCondition.endDate = moment(realCondition.endDate).format(format);
      }
      // this.loading = true;
      Api.getSaleReachedData(realCondition, this, "loading")
        .then(
          this._do("达成分析", rs => {
            this.$parent.$parent.updateModuleState("reached", true);
            if (rs != null && rs.chart != undefined) {
              this.filterList = [];
              this.xAxis = rs.chart.xaxisList;
              this.yAxis = rs.chart.yaxisList;
              this.series = rs.chart.seriesList;
            }
            //          this.tableData = rs.table;

            setTimeout(() => {
              this.loading = false;
              this.$refs.chart.reloadCharts();
            }, 1000);
          })
        )
        .catch(error => {
          this.loading = false;
          this.$Message.error({
            content: "失败：" + error,
            duration: 10,
            closable: true
          });
        });
    },
    download() {
      this.model = "download";
      console.log("this.xAxis", this.xAxis);
      console.log("this.yAxis", this.yAxis);
      console.log("this.series", this.series);
      let title = {};
      title.name = "名称";
      this.series.forEach(y => (title[y.name] = y.name));

      let rowList = this.xAxis.map((xAxis, index) => {
        let row = {};
        row.name = xAxis;
        this.series.forEach(ser => {
          let value = ser.data[index];
          if (value == null || value == "-") {
            value = 0;
          }
          let yIndex = ser.yaxisIndex == undefined ? 0 : ser.yaxisIndex;
          let y = this.yAxis[yIndex];
          if (y.isRatio != undefined && y.isRatio == true && !isNaN(value)) {
            value = parseFloat(value * 100).toFixed(2) + "%";
          }
          row[ser.name] = value;
          return row;
        });
        //            this.yAxis.forEach(y => {
        //              let filterSeriesList = this.series.filter(ser => y.name == ser.name);
        //              if(filterSeriesList != undefined && filterSeriesList.length > 0){
        //                let filter = filterSeriesList[0];
        //                let value = filter.data[index];
        //                if(value == null || value == '-'){
        //                  value = 0;
        //                }
        //                if(y.isRatio != undefined && y.isRatio == true){
        //                  value = parseFloat(value * 100).toFixed(2) + '%';
        //                }
        //                row[y.name] = value;
        //              }
        //            });
        return row;
      });
      rowList.unshift(title);

      // 前端下载
      let sheetData = [{ sheetName: "达成分析", sheetData: rowList }];
      console.info(sheetData);
      try {
        this._excel.downloadAll(
          document.getElementById(this.aId),
          sheetData,
          "达成分析" + moment().format("YYYYMMDD")
        );
      } catch (e) {
        this._error("下载出现错误");
      }
      this.model = "chart";
    },
    sortChange(sort) {
      console.log("排序变化", sort, this.sort);
    },
    iconClick(icon) {
      this.model = icon;
      if (icon == "download") {
        this.download();
      } else if (icon == "chart") {
        this.toggle = "chart";
      } else if (icon == "table") {
        this.toggle = "table";
      }
    },
    syncFilterList(filterList) {
      //同步快速选择组件的filterList
      console.log("同步选择filterList", filterList);
      this.filterList = filterList;
      setTimeout(() => {
        console.log(this.seriesList);
        this.$refs.chart.reloadCharts();
      }, 1000);
    },
    syncBeginDate(begin) {
      //同步起始时间
      this.beginDate = moment(begin).toDate();
    },
    syncEndDate(end) {
      //同步结束时间
      this.endDate = moment(end).toDate();
    },
    syncType(dateType) {
      this.dateType = dateType;
    },
    dimensionChange(dim) {},
    syncLayout() {
      setTimeout(() => {
        if (!this.$refs.layout) {
          return;
        }
        let layout = this.$refs.layout.getDefaultLayout();
        console.log("达成分析获取默认布局：", layout);
        if (layout != undefined) {
          let layoutClone = this._utils.cloneObj(layout);
          this.sort = layoutClone.sort;
          this.beginDate = moment(layoutClone.beginDate).toDate();
          this.endDate = moment(layoutClone.endDate).toDate();
          this.dimension = layoutClone.dimension;
          this.fastRadio = layoutClone.fastRadio;
          this.dateType = layoutClone.dateType;
        }
      }, 150);
    },
    applyLayout(layout) {
      if (layout != undefined) {
        let layoutClone = this._utils.cloneObj(layout);
        this.sort = layoutClone.sort;
        this.beginDate = moment(layoutClone.beginDate).toDate();
        this.endDate = moment(layoutClone.endDate).toDate();
        this.dimension = layoutClone.dimension;
        this.fastRadio = layoutClone.fastRadio;
        this.dateType = layoutClone.dateType;
      }
    },
    syncLayoutAndQuery() {
      this.syncLayout();
      setTimeout(() => {
        this.queryReachedAnalysis();
      }, 300);
    }
  },
  computed: {
    ...mapGetters({
      erp: "getErp",
      user: "getUser"
    }),
    reachedCondition() {
      let condition = {};
      condition.sort = this.sort;
      condition.dimension = this.dimension;
      condition.beginDate = this.beginDate;
      condition.endDate = this.endDate;
      condition.dateType = this.dateType;
      return condition;
    },
    tmpColumnList() {
      return [
        { key: "id", name: "ID", fixed: "left", isData: false },
        { key: "view", name: "视图", fixed: "left", isDdata: false },
        { key: "deptID3", name: "三级部门id", fixed: "left", isData: false },
        {
          key: "deptName3",
          name: "三级部门名称",
          fixed: "left",
          isData: false
        },
        { key: "2017-02", name: "2017-02", isData: true },
        { key: "2017-06", name: "2017-06", isData: true },
        { key: "2017-07", name: "2017-07", isData: true },
        { key: "2017-08", name: "2017-08", isData: true },
        { key: "2017-09", name: "2017-09", isData: true },
        { key: "2017-11", name: "2017-11", isData: true },
        { key: "2017-12", name: "2017-12", fixed: "right", isData: true },
        { key: "2017-10", name: "2017-10", isData: true }
      ];
    },
    columnList() {
      let columnList = [];
      if (this.tableData != undefined && this.tableData.length > 0) {
        let table = this.tableData[0];
        for (var key in table) {
          if (key != "columnList") {
            let column = { key: key, name: key, fixed: "left" };
            columnList.push(column);
          } else {
            let columnItemList = table[key];
            if (columnItemList != undefined && columnItemList.length > 0) {
              columnItemList.forEach(item => {
                let column = {
                  key: item.title,
                  name: item.title,
                  isData: true,
                  isRatio: item.isRatio
                };
                columnList.push(column);
              });
            }
          }
        }
      }
      return columnList;
    },
    dataList() {
      let dataList = [];
      if (this.tableData != undefined && this.tableData.length > 0) {
        this.tableData.forEach(table => {
          let data = {};
          for (let key in table) {
            if (key != "columnList") {
              let value = table[key];
              data[key] = value;
            } else {
              let columnList = table[key];
              if (columnList != undefined && columnList.length > 0) {
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
    originItemList() {
      //        return this.xAxis;
      let seriesName = undefined;
      if (this.sort == "real_asc" || this.sort == "real_desc") {
        seriesName = "实际";
      } else if (this.sort == "target_asc" || this.sort == "target_desc") {
        seriesName = "目标";
      }
      let seriesFilter = this.series.filter(ser => ser.name == seriesName);
      if (seriesFilter == undefined || seriesFilter.length == 0) {
        return [];
      }
      let datas = seriesFilter[0].data;
      let itemList = this.xAxis.map((x, index) => {
        let obj = {};
        obj.label = x;
        obj.value = datas[index];
        return obj;
      });
      if (this.sort == "realAsc" || this.sort == "targetAsc") {
        itemList.sort((a, b) => a.value - b.value);
      } else if (this.sort == "realDesc" || this.sort == "targetDesc") {
        itemList.sort((a, b) => b.value - a.value);
      }
      return itemList;
    },
    originCheckedLabelList() {
      return this.originItemList.map(item => item.label);
    },
    aId() {
      return (
        "a" +
        Math.random()
          .toString()
          .substring(2)
      );
    },
    indexList() {
      let indexList = [];
      if (this.filterList != undefined || this.filterList.length != 0) {
        this.xAxis.forEach((x, index) => {
          if (this.filterList.indexOf(x) !== -1) {
            indexList.push(index);
          }
        });
      }
      return indexList;
    },
    xAxisList() {
      if (this.filterList == undefined || this.filterList.length == 0) {
        return this.xAxis;
      }
      return this.xAxis.filter(x => this.filterList.indexOf(x) !== -1);
    },
    seriesList() {
      //        this.series
      if (this.filterList == undefined || this.filterList.length == 0) {
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
  created() {
    this._bus.$on(this._CONST.E_USERINFO_CHANGE, this.syncLayout);
  },
  mounted() {
    this.beginDate = moment()
      .subtract(1, "day")
      .toDate();
    this.dateType = "M";
  },
  beforeDestroy() {
    this._bus.$off(this._CONST.E_USERINFO_CHANGE, this.syncLayout);
  }
};
</script>
