<template>
  <!--库存指标详细分析-->
  <div>
    <div class="card-title">
      <div style="text-align: left; width: 50%"><h4>库存指标详细分析</h4></div>
      <div style="text-align: right; width: 50%;display: inline-block">
        <!--<FastFilter ref="filter" :originList="originItemList" :showRadio="false" :syncMethod="syncFilterList"></FastFilter>-->
        <svg class="icon" aria-hidden="true" title="下载" @click="iconClick('download')">
          <use v-show="model!='download'" xlink:href="#icon-xiazai-moren"></use>
          <use v-show="model=='download'" xlink:href="#icon-xiazai-jihuo"></use>
        </svg>
      </div>
    </div>

    <div class="self-cond">
      <RadioGroup size="small" v-model="tab" type="button">
        <Radio label="pvSpot" size="small">PV现货率</Radio>
        <Radio label="turnOver" size="small">库存周转</Radio>
      </RadioGroup>

      筛选：
      <FastFilter ref="filter" :originList="originItemList" :showRadio="false" :syncMethod="syncFilterList" :isInput="true"></FastFilter>
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
    </div>
    <a href="#" :id="aId" :v-show="false"></a> <!--用于下载的钩子 -->
    <div style="line-height: 40px;">
      &nbsp
    </div>
  </div>
</template>

<script>
import ColorRange from "@/components/colorRange/ColorRange";
import RangeTable from "@/components/table/RangeTable";
import FastFilter from "@/components/filter/FastFilter";
import { saleReached as Api } from "@/api/index.js";
import moment from "moment";
export default {
  components: {
    ColorRange,
    RangeTable,
    FastFilter
  },
  data() {
    return {
      model: "",
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
      pvLoading: false,
      turnOverLoading: false,
      filterList: [] //快速选择筛选的filterList
    };
  },
  methods: {
    queryStockDetail() {
      //查询库存指标详细分析
      let condition = this.$parent.$parent.getCommonCondition();
      let realCondition = Object.assign(condition, this.stockCondition);
      if (condition.childrenLevel == "sku") {
        this.$Message.error({
          content: "PV现货率、库存周转不支持按sku查询",
          duration: 10,
          closable: true
        });
        this.pvTableData = [];
        this.turnOverTableData = [];
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
    queryPVSpotData(condition) {
      let pvCondition = Object.assign(condition, { subject: ["pvSpotRate"] });
      Api.getStockDetailAnalysisData(pvCondition, this, "pvLoading").then(
        this._do("PV现货率", rs => {
          this.$parent.$parent.updateModuleState("stock", true);
          this.pvTableData = rs;
          this.pvLoading = false;
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
          this.turnOverLoading = false;
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
    tabsClick(event) {
      console.log("this.defaultMode", this.tab);
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
        this._excel.downloadAll(
          document.getElementById(this.aId),
          sheetData,
          "库存指标详细分析" + moment().format("YYYYMMDD")
        );
      } catch (e) {
        this._error("下载出现错误" + e);
      }
    },
    syncFilterList(filterList) {
      //同步快速选择组件的filterList
      console.log("同步选择filterList", filterList);
      this.filterList = filterList;
    }
  },
  computed: {
    stockCondition() {
      let condition = {};
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
      //        console.log("columnList",columnList)
      return columnList;
    },
    pvDataList() {
      let dataList = [];
      if (this.pvTableData != undefined && this.pvTableData.length > 0) {
        let filterData = this.pvTableData.filter(data => {
          return (
            this.filterList.length == 0 ||
            this.filterList.indexOf(data.name) != -1
          );
        });
        if (filterData == undefined || filterData.length == 0) {
          return dataList;
        }
        filterData.forEach(table => {
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
        let filterData = this.turnOverTableData.filter(data => {
          return (
            this.filterList.length == 0 ||
            this.filterList.indexOf(data.name) != -1
          );
        });
        if (filterData == undefined || filterData.length == 0) {
          return dataList;
        }
        filterData.forEach(table => {
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
    aId() {
      return (
        "a" +
        Math.random()
          .toString()
          .substring(2)
      );
    },
    originItemList() {
      if (this.pvTableData == undefined || this.pvTableData.length == 0) {
        return [];
      }
      return this.pvTableData.map(data => {
        return { label: data.name };
      });
    }
  },
  mounted() {}
};
</script>
