<template>
  <!--库存指标详细分析-->
  <div>
    <div class="card-title">
      <div style="text-align: left; width: 50%"><h4>库存指标详细分析</h4></div>
      <div style="text-align: right; width: 50%;display: inline-block">
        <layoutSetting ref="layout" page="reached" module="stock" :condition="layoutCondition" @applyLayout="applyLayout"></layoutSetting>
        <svg class="icon" aria-hidden="true" title="下载" @click="iconClick('download')">
          <use v-show="model!='download'" xlink:href="#icon-xiazai-moren"></use>
          <use v-show="model=='download'" xlink:href="#icon-xiazai-jihuo"></use>
        </svg>
      </div>
    </div>

    <div class="self-cond">
      <div style="width: 90%;">
        <LayoutTree ref="layoutTree" :treeCondition="treeCondition" :syncMethod="syncCondition"
                    @initQuery="initQuery"></LayoutTree>
        <div>
          <DateTime ref="date" :dateType="dateType" :begin="beginDate" :end="endDate"
                    :syncBegin="syncBeginDate" :syncEnd="syncEndDate" :syncDateType="syncType"></DateTime>
        </div>

        <RadioGroup v-model="tab" size="small" type="button">
          <Radio label="pvSpot" size="small">PV现货率</Radio>
          <Radio label="turnOver" size="small">库存周转</Radio>
        </RadioGroup>
      </div>

      <div style="width: 9%;text-align: right;">
        <Button type="primary" v-on:click="queryReachedStockDetail">查询</Button>
      </div>
    </div>

    <div class="card-padding">

      <div v-if="tab == 'pvSpot'" v-loading="pvLoading">
        <div style="width: 500px;">
          <ColorRange :isRatio="true" :colorList="pvColorList"></ColorRange>
        </div>
        <div><RangeTable :isRatio="true" :colorRange="pvColorList" :columns="pvColumnList" :datas="pvDataList"></RangeTable></div>
      </div>
      <div v-else-if="tab == 'turnOver'" v-loading="turnOverLoading">
        <div style="width: 500px;">
          <ColorRange :isRatio="false" :colorList="turnOverColorList"></ColorRange>
        </div>
        <div><RangeTable :colorRange="turnOverColorList" :columns="turnOverColumnList" :datas="turnOverDataList"></RangeTable></div>
      </div>
      <a href="#" :id="aId" :v-show="false"></a> <!--用于下载的钩子 -->
    </div>
  </div>
</template>

<script>
import ColorRange from "@/components/colorRange/ColorRange";
import RangeTable from "@/components/table/RangeTable";
import DateTime from "@/components/common/DateTime";
import layoutSetting from "@/components/layout/LayoutSetting";
import TreeCondition from "../saleDetail/TreeCondition.vue";
import LayoutTree from "../saleDetail/LayoutTree.vue";
import { saleReached as Api } from "@/api/index.js";
import moment from "moment";
import mixin from "./mixin";
export default {
  mixins: [mixin],
  components: {
    ColorRange,
    RangeTable,
    DateTime,
    layoutSetting,
    LayoutTree
  },
  data() {
    return {
      model: "",
      dateType: "D", //类型，月：month,周:week,日:day
      beginDate: new Date(),
      endDate: new Date(),
      tab: "pvSpot", //默认tab签
      pvColorList: [
        //          {color:'#FAF3DA',value:20},
        //          {color:'#E8F3DA',value:40},
        //          {color:'#DFEFF9',value:80},
        //          {color:'#EFE9F1',value:100},
        { color: "#F9EEC7", value: 20 },
        { color: "#D2FFC8", value: 40 },
        { color: "#CEEBFD", value: 80 },
        { color: "#F8C3E4", value: 100 }
      ],
      turnOverColorList: [
        { color: "#F9EEC7", value: 10 },
        { color: "#D2FFC8", value: 20 },
        { color: "#CEEBFD", value: 30 },
        { color: "#F8C3E4" }
      ],
      pvTableData: [],
      turnOverTableData: [],
      treeCondition: {},
      pvLoading: false,
      turnOverLoading: false,
      isCookie: false
    };
  },
  methods: {
    queryReachedStockDetail() {
      //查询库存指标详细分析
      if (!this.validateUserInfo(true)) return;
      if (this.$refs.date.validateDateRange() == false) return;
      let condition = this.$parent.$parent.getCommonCondition();
      let realCondition = Object.assign(condition, this.stockCondition);
      if (realCondition.childrenLevel == "sku") {
        this.$Message.error({
          content: "PV现货率、库存周转不支持按sku查询",
          duration: 10,
          closable: true
        });
        this.pvTableData = [];
        this.turnOverTableData = [];
        return;
      }
      if (!this.validateTreeData()) {
        return;
      }
      let methods = [];
      methods.push(this.queryPVSpotData(realCondition));
      methods.push(this.queryTurnOverData(realCondition));
      Promise.all(methods)
        .then(() => {})
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
          this.queryReachedStockDetail();
        }
      }, 200);
    },
    queryPVSpotData(condition) {
      // this.pvLoading = true;
      let pvCondition = Object.assign(condition, { subject: ["pvSpotRate"] });
      Api.getStockDetailAnalysisData(pvCondition, this, "pvLoading").then(
        this._do("PV现货率", rs => {
          this.$parent.$parent.updateModuleState("stock", true);
          this.pvTableData = rs;
        })
      );
    },
    queryTurnOverData(condition) {
      // this.turnOverLoading = true;
      let turnOverCondition = Object.assign(condition, {
        subject: ["inventoryTurnoverRatio"]
      });
      Api.getStockDetailAnalysisData(
        turnOverCondition,
        this,
        "turnOverLoading"
      ).then(
        this._do("库存周转", rs => {
          this.turnOverTableData = rs;
        })
      );
    },
    iconClick(model) {
      if (this.model == "") {
        this.model = model;
      } else {
        this.model = "";
      }
      if (model == "download") {
        this.download();
      }
    },
    download() {
      console.log("this.pvTableData", this.pvTableData);
      console.log("this.turnOverTableData", this.turnOverTableData);

      let pvTitle = {};
      this.pvColumnList.forEach(column => {
        if (column.isData == true) {
          pvTitle[column.key] = column.key;
        } else {
          pvTitle[column.key] = column.name;
        }
      });
      let pvData = this._utils.cloneObj(this.pvDataList);
      pvData.unshift(pvTitle);

      let turnTitle = {};
      this.turnOverColumnList.forEach(column => {
        if (column.isData == true) {
          turnTitle[column.key] = column.key;
        } else {
          turnTitle[column.key] = column.name;
        }
      });
      let turnData = this._utils.cloneObj(this.turnOverDataList);
      turnData.unshift(turnTitle);

      let sheetData = [
        { sheetName: "PV现货率", sheetData: pvData },
        { sheetName: "库存周转", sheetData: turnData }
      ];
      console.info("sheetData", sheetData);
      try {
        let excelName = "库存指标详细分析" + moment().format("YYYYMMDD");
        this._excel.downloadAll(
          document.getElementById(this.aId),
          sheetData,
          excelName
        );
      } catch (e) {
        this._error("下载出现错误" + e);
      }
    },
    syncCondition(condition) {
      //同步treeCondition查询条件
      this.treeCondition = condition;
    },
    syncBeginDate(begin) {
      //同步起始时间
      this.beginDate = moment(begin).toDate();
    },
    syncEndDate(end) {
      //同步结束时间
      this.endDate = moment(end).toDate();
    },
    syncType(type) {
      this.dateType = type;
    },
    tabsClick(event) {
      console.log("this.defaultMode", this.tab);
    },
    syncLayout() {
      setTimeout(() => {
        if (!this.$refs.layout) {
          return;
        }
        let layout = this.$refs.layout.getDefaultLayout();
        console.log("库存指标详细分析布局：", layout);
        if (layout != undefined) {
          let layoutClone = this._utils.cloneObj(layout);
          this.isCookie = true;
          this.beginDate = moment(layoutClone.beginDate).toDate();
          this.endDate = moment(layoutClone.endDate).toDate();
          this.dateType = layoutClone.dateType;
          this.treeCondition = layoutClone.treeCondition;
          this.$refs.layoutTree.syncLayoutCondition(layoutClone.treeCondition);
          this.queryReachedStockDetail();
        }
      }, 150);
    },
    applyLayout(layout) {
      if (layout != undefined) {
        let layoutClone = this._utils.cloneObj(layout);
        this.isCookie = true;
        this.beginDate = moment(layoutClone.beginDate).toDate();
        this.endDate = moment(layoutClone.endDate).toDate();
        this.dateType = layoutClone.dateType;
        this.treeCondition = layoutClone.treeCondition;
        this.$refs.layoutTree.syncLayoutCondition(layoutClone.treeCondition);
      }
    }
  },
  computed: {
    stockCondition() {
      let condition = {};
      if (this.dateType != undefined) {
        let format = "YYYY-MM-DD";
        if (this.dateType == "M") format = "YYYY-MM";
        if (this.dateType == "W") format = "YYYY-WW";
        condition.beginDate = moment(this.beginDate).format(format);
        condition.endDate = moment(this.endDate).format(format);
      }
      condition.dateType = this.dateType;
      Object.assign(condition, this.treeCondition.queryCondition);
      return condition;
    },
    layoutCondition() {
      let condition = {};
      condition.beginDate = this.beginDate;
      condition.endDate = this.endDate;
      condition.dateType = this.dateType;
      condition.treeCondition = this.treeCondition;
      return condition;
    },
    pvColumnList() {
      let columnList = [];
      if (this.pvTableData != undefined && this.pvTableData.length > 0) {
        let table = this.pvTableData[0];
        columnList.push({ key: "id", name: "ID", fixed: "left" });
        columnList.push({ key: "name", name: "名称", fixed: "left" });
        for (var key in table) {
          if (key == "columnList") {
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
    pvDataList() {
      let dataList = [];
      if (this.pvTableData != undefined && this.pvTableData.length > 0) {
        this.pvTableData.forEach(table => {
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
                  data[key] =
                    value == null || isNaN(value)
                      ? "-"
                      : parseFloat(value).toFixed(2);
                });
              }
            }
          }
          dataList.push(data);
        });
      }
      return dataList;
    },
    turnOverColumnList() {
      let columnList = [];
      if (
        this.turnOverTableData != undefined &&
        this.turnOverTableData.length > 0
      ) {
        let table = this.turnOverTableData[0];
        columnList.push({ key: "id", name: "ID", fixed: "left" });
        columnList.push({ key: "name", name: "名称", fixed: "left" });
        for (var key in table) {
          if (key == "columnList") {
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
    turnOverDataList() {
      let dataList = [];
      if (
        this.turnOverTableData != undefined &&
        this.turnOverTableData.length > 0
      ) {
        this.turnOverTableData.forEach(table => {
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
                  let value =
                    item.value == null || isNaN(item.value) ? "-" : item.value;
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
    this.beginDate = moment()
      .subtract(1, "day")
      .toDate();
    this.endDate = moment()
      .subtract(0, "day")
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
