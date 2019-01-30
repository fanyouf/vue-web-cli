
<template>
    <div v-loading="mxLoading">
        <DiffAdjustment
        v-show="mxDiffDataDetail && mxDiffDataDetail.length"
        @saveDiff="hSaveDiff"
        :pColumnsDimension="mxDiffDataColumns"
        :pDetail="mxDiffDataDetail"
        :pDateDimension="dateDimension"
        typeForTip="summaryPlan"
      ></DiffAdjustment>
        <summaryPlan
          ref="refTableList"
          pTitleName="GMV"
          :pYearMonth="mxYearMonth"
          :pTotal="mxTabDataTotal"
          :pColumnsDimension="mxTabDataColumnsDimension"
          :pColumns="mxTabDataColumns"
          :pDetail="mxTabDataDetail"
          :pIsEdit="pIsEdit"
          :pMoneyUnit="pMoneyUnit"
          :pDateDimension="dateDimension"
          :pVisiableTableKeys="pVisiableTableKeys"
          :pDataType="pDataType"
          :pValidDecimalPlacesForNumber="0"
          @addToStack="mxhStackAdd"
          pMBType="plan"
        >
        </summaryPlan>
    </div>
</template>

<script>
import summaryPlan from "@/components/tableList/index";

import DiffAdjustment from "@/components/DiffAdjustment";

import mixin from "./mixin";
import stackmixin from "../stackMixins.js";

export default {
  mixins: [mixin, stackmixin],
  components: {
    summaryPlan,
    DiffAdjustment
  },
  data() {
    return {
      oldCondStr: "",
      dateDimension: this.pCondition.dateDimension
    };
  },
  // activated() {
  //   if (this.oldCondStr !== JSON.stringify(this.pCondition)) {
  //     this.queryAndUpdate()
  //   }
  // },
  methods: {
    stackPrev() {
      this.mxhStackPrev();
    },
    stackBack() {
      this.mxhStackBack();
    },

    importFromFile(fileName) {
      let cols = this.mxTabDataColumnsDimension.map(item => {
        if (item.label === "采销") {
          return [item.label + "ERP", item.label + "NAME"];
        } else {
          return [item.label + "ID", item.label + "NAME"];
        }
      });
      cols = _.flatten(cols);

      this._excel.import(fileName, cols).then(
        d => {
          //  汇总计划上传，纯前端更新
          this.updateTableDataWithExcelJSON(d);
        },
        d => {
          this._error(d);
          return;
        }
      );
    },
    updateTableDataWithExcelJSON(excelTable) {
      let cond = JSON.parse(this.oldCondStr);
      let colOrderList = cond.dataDimensionList;
      let counter = 0,
        obj = null,
        keys = [];
      const equalFun = (function(cols) {
        return (detailItem, excelItem) => {
          let arr = [];
          cols.forEach((colName, index) => {
            if (colName === "saler") {
              arr.push(
                detailItem["col" + (index + 1)].id === excelItem["采销ERP"]
              );
            } else if (colName === "brand") {
              arr.push(
                detailItem["col" + (index + 1)].id === excelItem["品牌ID"]
              );
            } else if (colName.includes("cate")) {
              let levelIndex = colName.substr(4, 1); // 1, 2, 3
              let colNameInExcel = "";
              if (levelIndex === "1") {
                colNameInExcel = "一级品类ID";
              } else if (levelIndex === "2") {
                colNameInExcel = "二级品类ID";
              } else if (levelIndex === "3") {
                colNameInExcel = "三级品类ID";
              }

              arr.push(
                detailItem["col" + (index + 1)].id === excelItem[colNameInExcel]
              );
            }
          });

          return arr.every(item => item);
        };
      })(colOrderList);

      try {
        excelTable.forEach(item => {
          obj = this.mxTabDataDetail.find(it => equalFun(it, item));
          if (obj) {
            keys = Object.keys(item);
            obj.data.forEach(it => {
              if (it.editable && keys.includes(it.dateDimension)) {
                if (it.val * 1 !== item[it.dateDimension] * 1) {
                  it.val = item[it.dateDimension] * 1;
                  counter++;
                }
              }
            });
          }
        });
        this._info(`导入成功，总更新${counter}条数据`);
      } catch (e) {
        this._info(`导入失败！`);
        console.info(e);
      }
    },
    saveData() {
      let cond = JSON.parse(this.oldCondStr);
      cond.isSKU = false;
      cond.detail = JSON.stringify(this.mxTabDataDetail);
      this._api.salePlan
        .saveAdjustTableData(cond, this, "mxLoading")
        .then(this._do("保存数据_ok"));
    },
    createCols(d){

      console.info("cols................................")
      if (!d.detail || d.detail.length == 0) return [];
      if (!d.columns || d.columns.length == 0) return [];

      // 动态表头列
      let arr = d.columns.map(item => {
        let obj = {};
        obj.prop = item.prop;
        obj.label = item.label;
        obj.fixed = true;
        return obj;
      });

      arr.push({ prop: "yearMonth", label: "年月", fixed: "left" });

      d.detail[0] &&
        d.detail[0].data.forEach(item => {
          arr.push({ prop: item.dateDimension, label: item.dateDimension });
        });
      // 最后一列 汇总列
      arr.push({ prop: "sum", label: "汇总", fixed: "right" });
      // debugger;
      return arr;
    
    },
    initData(d, cond) {
      this.mxDateDimension = cond.dateDimension; // 季月周天
      this.mxYearMonth =
        cond.year +
        ("DW".indexOf(this.mxDateDimension) == -1 ? "" : "-" + cond.monthList);

      this.mxTabDataTotal = d.total.length ? d.total[0].data : []; //总共的目标
      this.mxTabDataDetail = d.detail; //明细目标
      this.mxTabDataColumnsDimension = d.columns;
      this.mxTabDataColumns=this.createCols(d)


      this.mxhStackInit(_.cloneDeep({ detail: this.mxTabDataDetail }));

      this.querySuccess = true;
      this.$emit("upDateForcastCondition", cond);
    },
    queryAndUpdate() {
      //   if (!this.mxIsAcitive) {
      //     return;
      //   }

      // 清空同比校准数据
      //   this.$refs.toolbar && this.$refs.toolbar.clearJIARIFix();

      return new Promise(resolve => {
        let cond = this.pCondition;
        this.dateDimension = this.pCondition.dateDimension;

        this._api.salePlan.queryAdjustTableData(cond, this, "mxLoading").then(
          this._do("查询汇总计划数据_ok", d => {
            this.oldCondStr = JSON.stringify(cond);
            this.initData(d, cond);
            resolve(cond);
          })
        );

        this.getDiffData(cond);
      });
    },
    getDiffData(cond) {
      this._api.salePlan
        .queryCoreSkuFrameworkDiffTable(cond, this, "mxDiffLoading")
        .then(
          this._do("查询汇总计划页中的调整数据", d => {
            this.mxDiffDataColumns = d.columns;
            this.mxDiffDataDetail = d.detail;
          })
        );
    },

    hSaveDiff() {
      let cond = {};
      try {
        cond = JSON.parse(this.oldCondStr);
      } catch (e) {
        console.info(this.oldCondStr);
        cond = this.packageCondition();
      }
      let saveCond = Object.assign({}, cond, {
        detail: JSON.stringify(this.mxDiffDataDetail)
      });

      this._api.salePlan
        .saveCoreSkuFrameworkDiffTable(saveCond, this, "mxDiffLoading")
        .then(
          this._do("保存调整数据", d => {
            this.queryAndUpdate();
          })
        );
    },
    downloadTableData() {
      let fileName = "计划数据" + this._moment.getNow();
      let sheetData = this.$refs.refTableList.getAllVisiableTableData();
      try {
        this._excel.downloadAll(
          document.getElementById("aId"),
          sheetData,
          fileName
        );
        this._info("启动浏览器下载,下载完成");
      } catch (e) {
        console.info(e);
        this._error("下载出现错误");
      }
    },
    clearForecastData() {
      this.mxTabDataDetail.forEach(item => {
        item.data.forEach(cell => {
          if (cell.editable === true) {
            cell.val = 0;
            cell.gmv = 0;
            cell.volume = 0;
          }
        });
      });

      // this.$refs.refTableList.setEditableDataToZero();
    },

    getForecastData() {
      let cond = null;
      try {
        cond = JSON.parse(this.oldCondStr);
      } catch (e) {
        cond = this.pCondition;
      }

      Object.assign(cond, { isSKU: false });
      this._api.salePlan.queryForecastInAdjust(cond, this, "mxLoading").then(
        this._do("查询汇总计划页中的表格数据", d => {
          this.initData(d, cond);
        })
      );
    }
  }
};
</script>

<style>
</style>

