<!--趋势分析-->
<template>
  <div>
    <div class="card-title">
      <div style="text-align: left; width: 50%"><h4>趋势分析</h4></div>
      <div style="text-align: right; width: 50%;display: inline-block">
        <!--<FastFilter ref="filter" :originList="originItemList" :showRadio="false" :syncMethod="syncFilterList"></FastFilter>-->
        <svg class="icon" aria-hidden="true" title="下载" @click="iconClick('download')">
          <use v-show="model!='download'" xlink:href="#icon-xiazai-moren"></use>
          <use v-show="model=='download'" xlink:href="#icon-xiazai-jihuo"></use>
        </svg>
      </div>
    </div>

    <div class="self-cond">
      指标:
      <!--单量改为财务子单量-->
      <Select size="small" style="width:128px;" v-model="subject" v-on:on-change="subjectChange">
        <Option value="GMV">GMV</Option>
        <Option value="saleQtty">销售数量</Option>
        <Option value="orderNumber">财务子单量</Option>
        <Option value="ac">客单价</Option>
        <Option value="numUnitPrice">件单价</Option>
        <Option value="saleGrossProfit">前台毛利额</Option>
      </Select>

      筛选：
      <FastFilter ref="filter" :originList="originItemList" :showRadio="false" :syncMethod="syncFilterList" :isInput="true"></FastFilter>
    </div>
    <div v-loading="loading">
      <TrendChart ref="trendChart" :xAxis="xAxisList" :yAxis="yAxis" :series="seriesList" reference="trendChart"></TrendChart>
    </div>
    <a href="#" :id="aId" :v-show="false"></a> <!--用于下载的钩子 -->
  </div>
</template>

<script>
import TrendChart from "@/components/chart/TrendChart";
import FastFilter from "@/components/filter/FastFilter";
import moment from "moment";
import { saleReached as Api } from "@/api/index.js";
export default {
  name: "TrendAnalysis",
  components: {
    TrendChart,
    FastFilter
  },
  data() {
    return {
      model: "",
      subject: "GMV",
      xAxis: [],
      yAxis: [],
      series: [],
      loading: false,
      filterList: [] //快速选择筛选的filterList
    };
  },
  methods: {
    queryTrendAnalysis() {
      let condition = this.$parent.$parent.getCommonCondition();
      let realCondition = Object.assign(condition, this.subjectCondition);
      realCondition.requireTable = false;
      // this.loading = true;
      Api.getDetailTrendAnalysisData(realCondition, this, "loading")
        .then(
          this._do("趋势分析", rs => {
            this.$parent.$parent.updateModuleState("trend", true);
            if (rs.chart != undefined) {
              this.xAxis = rs.chart.xaxisList;
              this.yAxis = rs.chart.yaxisList;
              this.series = rs.chart.seriesList;
            }

            setTimeout(() => {
              this.$refs.trendChart.reloadCharts();
              this.loading = false;
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
      console.log("趋势分析下载");
      console.log("this.yAxis", this.yAxis);
      console.log("this.xAxis", this.xAxis);
      console.log("this.series", this.series);

      let title = {};
      this.series.forEach(y => (title[y.name] = y.name));
      title.name = "日期";

      let rowList = this.xAxis.map((xAxis, index) => {
        let row = {};
        row.name = xAxis;
        this.series.forEach(ser => {
          let value = ser.data[index];
          let y = this.yAxis.filter(y => y.name == ser.yaxisIndex);
          if (
            y != undefined &&
            y.length > 0 &&
            y[0].isRatio != undefined &&
            y[0].isRatio == true
          ) {
            value = parseFloat(value * 100).toFixed(2) + "%";
          }
          row[ser.name] = value;
        });
        return row;
      });
      rowList.unshift(title);

      let sheetData = [{ sheetName: "趋势分析", sheetData: rowList }];
      console.info("sheetData", sheetData);
      try {
        this._excel.downloadAll(
          document.getElementById(this.aId),
          sheetData,
          "趋势分析" + moment().format("YYYYMMDD")
        );
      } catch (e) {
        this._error("下载出现错误" + e);
      }
    },
    iconClick(icon) {
      this.model = icon;
      if (icon == "download") {
        this.download();
      }
    },
    subjectChange(option) {
      this.filterList = [];
      this.queryTrendAnalysis();
    },
    syncFilterList(filterList) {
      //同步快速选择组件的filterList
      this.filterList = filterList;
      setTimeout(() => {
        this.$refs.trendChart.reloadCharts();
      }, 1000);
    }
  },
  computed: {
    subjectCondition() {
      let condition = {};
      condition.subject = [this.subject];
      return condition;
    },
    aId() {
      return (
        "a" +
        Math.random()
          .toString()
          .substring(2)
      );
    },
    originItemList() {
      let filter = this.series.filter(
        ser => ser.yaxisIndex == undefined || ser.yaxisIndex == 0
      );
      if (filter == undefined || filter.length == 0) {
        return [];
      }
      return filter.map(ser => {
        return { label: ser.name };
      });
    },
    xAxisList() {
      return this.xAxis;
    },
    seriesList() {
      if (this.filterList == undefined || this.filterList.length == 0) {
        return this.series;
      }
      return this.series.filter(ser => {
        return ser.yaxisIndex == 1 || this.filterList.indexOf(ser.name) != -1;
      });
    }
  },
  mounted() {}
};
</script>
