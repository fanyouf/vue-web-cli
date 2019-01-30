<template>
  <!--达成指标分析页面-->
  <div>
    <div class="card-title">
      <div style="text-align: left; width: 50%"><h4>指标分析</h4></div>
      <div style="text-align: right; width: 50%;display: inline-block">
        <layoutSetting ref="layout" page="reached" module="subject" :condition="layoutCondition" @applyLayout="applyLayout"></layoutSetting>
        <svg class="icon" aria-hidden="true" title="下载" @click="iconClick('download')">
          <use v-show="model!='download'" xlink:href="#icon-xiazai-moren"></use>
          <use v-show="model=='download'" xlink:href="#icon-xiazai-jihuo"></use>
        </svg>
        <expand class="icon" style="line-height: 24px;"><TrendChart :height="600" :xAxis="xAxis" :yAxis="yAxis" :series="series"></TrendChart></expand>
      </div>
    </div>

    <div class="self-cond">
      <div style="width: 92%;">
        <LayoutTree ref="layoutTree" :treeCondition="treeCondition" :syncMethod="syncCondition"
                    @initQuery="initQuery"></LayoutTree>
        <div>
          <DateTime ref="date" :dateType="dateType" :begin="beginDate" :end="endDate"
                    :syncBegin="syncBeginDate" :syncEnd="syncEndDate" :syncDateType="syncType"></DateTime>
        </div>

        指标：
        <Select style="width: 80px;" v-model="subject" size="small">
          <Option value="GMV">GMV</Option>
          <Option value="saleQtty">销售数量</Option>
          <!--<Option value="orderNumber">单量</Option>-->
          <!--<Option value="ac">客单价</Option>-->
          <Option value="numUnitPrice">件单价</Option>
          <Option value="saleGrossProfit">前台毛利额</Option>
        </Select>

        排序：
        <Select style="width: 90px;" v-model="sort"  size="small">
          <Option value="asc">指标升序</Option>
          <Option value="desc">指标降序</Option>
        </Select>
      </div>

      <div style="width: 7%;text-align: right;">
        <Button type="primary" v-on:click="querySubjectAnalysis">查询</Button>
      </div>
    </div>

    <div v-loading="loading">
      <TrendChart ref="trendChart" :xAxis="xAxis" :yAxis="yAxis" :series="series" reference="trendChart"></TrendChart>
    </div>
    <a href="#" :id="aId" :v-show="false"></a> <!--用于下载的钩子 -->
  </div>
</template>

<script>
import TrendChart from "@/components/chart/TrendChart";
import layoutSetting from "@/components/layout/LayoutSetting";
import DateTime from "@/components/common/DateTime";
import LayoutTree from "../saleDetail/LayoutTree.vue";
import expand from "../saleDetail/expand.vue";
import moment from "moment";
import { saleReached as Api } from "@/api/index.js";
import mixin from "./mixin";
export default {
  mixins: [mixin],
  components: {
    TrendChart,
    layoutSetting,
    DateTime,
    LayoutTree,
    expand
  },
  data() {
    return {
      model: "",
      toggle: "chart",
      dateType: "D", //类型，月：month,周:week,日:day
      subject: "GMV",
      beginDate: new Date(),
      endDate: new Date(),
      xAxis: [],
      yAxis: [],
      series: [],
      treeCondition: {},
      loading: false,
      isCookie: false,
      sort: "asc" //默认指标升序
    };
  },
  methods: {
    querySubjectAnalysis() {
      if (!this.validateUserInfo(true)) return;
      if (this.$refs.date.validateDateRange() == false) return;
      let condition = this.$parent.$parent.getCommonCondition();
      let realCondition = Object.assign(condition, this.subjectCondition);
      console.log("subjectCondition", realCondition);
      if (realCondition.dateType != undefined) {
        let format = "YYYY-MM-DD";
        if (realCondition.dateType == "M") format = "YYYY-MM";
        if (realCondition.dateType == "W") format = "YYYY-WW";
        realCondition.beginDate = moment(realCondition.beginDate).format(
          format
        );
        realCondition.endDate = moment(realCondition.endDate).format(format);
      }
      if (!this.validateTreeData()) {
        return;
      }
      // this.loading = true;
      Api.getIndicationAnalysisData(realCondition, this, "loading")
        .then(
          this._do("指标分析", rs => {
            this.$parent.$parent.updateModuleState("subject", true);
            if (rs != null && rs.chart != undefined) {
              this.xAxis = rs.chart.xaxisList;
              this.yAxis = rs.chart.yaxisList;
              this.series = rs.chart.seriesList;
            }

            setTimeout(() => {
              this.loading = false;
              if (this.$refs.trendChart) {
                this.$refs.trendChart.reloadCharts();
              }
            }, 1000);
          })
        )
        .catch(error => {
          this.$Message.error({
            content: "失败：" + error,
            duration: 10,
            closable: true
          });
        });
    },
    initQuery(condition) {
      setTimeout(() => {
        if (this.isCookie == false) {
          console.log("@initQuery", condition);
          this.treeCondition = condition;
          this.querySubjectAnalysis();
        }
      }, 200);
    },
    iconClick(icon) {
      this.model = icon;
      if (icon == "download") {
        this.download();
      }
    },
    download() {
      this.model = "download";

      let title = {};
      title.name = "名称";
      this.yAxis.forEach(y => (title[y.name] = y.name));

      let rowList = this.xAxis.map((xAxis, index) => {
        let row = {};
        row.name = xAxis;
        this.yAxis.forEach(y => {
          let filterSeriesList = this.series.filter(ser => y.name == ser.name);
          if (filterSeriesList != undefined && filterSeriesList.length > 0) {
            let filter = filterSeriesList[0];
            let value = filter.data[index];
            if (y.isRatio != undefined && y.isRatio == true) {
              value = parseFloat(value * 100).toFixed(2) + "%";
            }
            row[y.name] = value;
          }
        });
        return row;
      });
      rowList.unshift(title);

      // 前端下载
      let sheetData = [{ sheetName: "指标分析", sheetData: rowList }];
      console.info(sheetData);
      try {
        this._excel.downloadAll(
          document.getElementById(this.aId),
          sheetData,
          "指标分析" + moment().format("YYYYMMDD")
        );
      } catch (e) {
        this._error("下载出现错误");
      }
      this.model = "chart";
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
    syncCondition(condition) {
      //同步treeCondition查询条件
      console.log("tree syncCondition", condition);
      this.treeCondition = condition;
    },
    syncLayout() {
      setTimeout(() => {
        if (!this.$refs.layout) {
          return;
        }
        let layout = this.$refs.layout.getDefaultLayout();
        console.log("指标分析布局：", layout);
        if (layout != undefined) {
          let layoutClone = this._utils.cloneObj(layout);
          this.isCookie = true;
          this.subject = layoutClone.subject;
          this.beginDate = moment(layoutClone.beginDate).toDate();
          this.endDate = moment(layoutClone.endDate).toDate();
          this.dateType = layoutClone.dateType;
          this.sort = layoutClone.sort;
          this.treeCondition = layoutClone.treeCondition;
          this.$refs.layoutTree.syncLayoutCondition(layoutClone.treeCondition);
          this.querySubjectAnalysis();
          this.treeCondition = layout.treeCondition;
        }
      }, 150);
    },
    applyLayout(layout) {
      if (layout != undefined) {
        let layoutClone = this._utils.cloneObj(layout);
        this.subject = layoutClone.subject;
        this.beginDate = moment(layoutClone.beginDate).toDate();
        this.endDate = moment(layoutClone.endDate).toDate();
        this.dateType = layoutClone.dateType;
        this.sort = layoutClone.sort;
        this.treeCondition = layoutClone.treeCondition;
        this.$refs.layoutTree.syncLayoutCondition(layoutClone.treeCondition);
      }
    }
  },
  computed: {
    subjectCondition() {
      let condition = {};
      condition.dateType = this.dateType;
      condition.subject = [this.subject];
      condition.beginDate = this.beginDate;
      condition.endDate = this.endDate;
      condition.sort = this.sort;
      Object.assign(condition, this.treeCondition.queryCondition);
      return condition;
    },
    layoutCondition() {
      let condition = {};
      condition.dateType = this.dateType;
      condition.subject = this.subject;
      condition.beginDate = this.beginDate;
      condition.endDate = this.endDate;
      condition.treeCondition = this.treeCondition;
      condition.sort = this.sort;
      return condition;
    },
    aId() {
      return (
        "a" +
        Math.random()
          .toString()
          .substring(2)
      );
    }
  },
  mounted() {
    //      let layout = this.$refs.layout.getDefaultLayout();
    //      console.log("指标分析布局：",layout)
    //      if(layout != undefined){
    //        this.subject = layout.subject;
    //        this.beginDate = moment(layout.beginDate).toDate();
    //        this.endDate = moment(layout.endDate).toDate();
    //        this.dateType = layout.dateType;
    //        this.treeCondition = layout.treeCondition;
    //      }
    this.beginDate = moment()
      .subtract(1, "day")
      .toDate();
    this.dateType = "M";
  },
  created() {
    this._bus.$on(this._CONST.E_USERINFO_CHANGE, this.syncLayout);
  },
  beforeDestroy() {
    this._bus.$off(this._CONST.E_USERINFO_CHANGE, this.syncLayout);
  }
};
</script>
