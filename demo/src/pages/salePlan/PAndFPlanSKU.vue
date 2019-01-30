<template>
  <div style="position:relative" ref="wrapper">
    <div v-loading="mxDiffLoading">
      <DiffAdjustment
        v-show="mxDiffDataDetail && mxDiffDataDetail.length"
        @saveDiff="hSaveDiff"
        :pColumnsDimension="mxDiffDataColumns"
        :pDetail="mxDiffDataDetail"
        :pDateDimension="dateDimension"
        typeForTip="skuPlan"
      ></DiffAdjustment>
    </div>
      <div style="position:absolute;right:0;top:-27px;z-index:1000">
        <LayoutSetting
          :pLayoutSetting="layoutSettings">
        </LayoutSetting>
      </div>

      <!--
          :min-width="mixincCellWidth[item.prop]"
      -->
      <div v-loading="mxLoading" >
      <el-table
        ref="tabArea"
        :span-method="cSpanMethod"
        :class="{'editing':pIsEdit}"
        border
        :data="cRows"
        @cell-click="hCellClick"
        :height="tableHeight"
        width="100%">
        <el-table-column
          :min-width="mixincCellWidth[item.prop]"
          v-for="item in cols"
          :key="item.prop"
          :fixed="item.fixed"
          :label="item.label"
          :prop="item.prop"
          :show-overflow-tooltip="item.label ==='SKU'"

          >
          <template slot-scope="scope">
              <div :class="mixinCellClass(scope.row,item.prop)">
                <Tooltip v-if="item.prop.substring(0,1) === 'D' && !scope.row.rowType" :transfer="true"  placement="top" max-width="200">
                  <div  :title="scope.row[item.prop].title">{{ getCellVal(scope.row,item.prop) }}</div>
                  <div slot="content">
                      <p v-html="getItemGMVPriceInfo(scope.row,item.prop)"></p>
                      <p v-if="scope.row[item.prop].promotionList.length" v-html="getItemPromotionListInfo(scope.row,item.prop)"></p>
                  </div>
                </Tooltip>
                <div v-else :title="scope.row[item.prop].title"> {{ getCellVal(scope.row,item.prop) }}</div>
                <!-- <div> {{ getCellVal(scope.row,item.prop) }}</div> -->
              </div>
          </template>
        </el-table-column>
      </el-table>
      </div>
      <Modal
          :footer-hide="true"
          v-model="isEdit"
          :title="titleInfo"
          id="SKUPlanModify"
          >
          <SKUPlanModify
            @cancel="isEdit=false"
            @savemodify="hSaveModify"
            :pIsReadOnly="isReadOnly"
            :modifyMode="modifyMode"
            :pTitle="modifyTitle"
            v-model="modifyData">
          </SKUPlanModify>
      </Modal>
    </div>
</template>
<style scoped>
td[colspan] {
  text-align: left;
}
.cell .ivu-tooltip,
.cell .ivu-tooltip-rel {
  display: block;
}
/* td[colspan]{text-align: right;} */
</style>

<script>
/**
 * @mixes salePlan/mixin
 */

import filter from "@/utils/filter";
import BaseMultiSelector from "@/components/common/BaseMultiSelector";
import SKUPlanModify from "./PAndFPlanSKUModify";
import LayoutSetting from "./PandFPlanSKULayoutSetting";
import DiffAdjustment from "@/components/DiffAdjustment";

import mixin from "./mixin";
import stackmixin from "../stackMixins.js";

import funcs from "./PAndFPlanSKU.vue.js";

import { mapGetters } from "vuex";
const _ = require("lodash");

export default {
  mixins: [mixin, stackmixin],
  props: {
    pQueryDataType: { type: String }
  },
  components: {
    SKUPlanModify,
    BaseMultiSelector,
    LayoutSetting,
    DiffAdjustment
  },
  data() {
    return {
      // 数据列，如 M1, M2 ...
      dataColumns: [],
      //全部列
      cols: [],
      // 目标数据
      total: [],

      basicRows: [],

      // 最低是几级。[col1,col2,col3]
      lowestColLevel: 4,
      //  是否展示同期销售进度。 只有在查询条件是周维度时，才不用显示
      isShowTongQiXiaoShouJinDu: true,

      layoutSettings: [],
      layoutSettings1: [],
      isEdit: false,
      modifyData: {
        gmv: 99,
        price: 3,
        volume: 33,
        pagePrice: 2.8,
        promotionList: [{ label: "616" }, { label: "617" }, { label: "618" }]
      },
      currentModifyCell: {},
      currentRowIndexId: "",
      modifyMode: this._CONST.SKUPLAN_MODIFY_MODE.gmv,
      modifyTitle: "",
      isReadOnly: false,
      tableHeight: 500,
      dateDimension: this.pCondition.dateDimension
    };
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resize);
  },
  computed: {
    ...mapGetters({ user: "getUser" }),

    mixincCellWidth() {
      const PER_PIX_FOR_NUMBER = 6;
      let rs = {};
      this.cols.forEach(col => {
        let prop = col.prop;
        if (prop.includes(this.dateDimension)) {
          let rows = this.cRows.map(row => row[prop]);
          // 用于排序的列，在列头的后面会生成两个按钮， 这里给补上两个空格，以增加宽度
          if (prop.substring(0, 1) === this.pDateDimension) {
            rows.push({ val: col.label + "  ", dataType: "string" });
          } else {
            rows.push({ val: col.label, dataType: "string" });
          }

          let lens = rows.map(item => this.cellWidthGetLength(item));

          rs[prop] = Math.max(...lens) * PER_PIX_FOR_NUMBER + 20;
        } else {
          rs[prop] = 100;
        }
      });
      // console.info(rs)
      return rs;
    },
    cSpanMethod() {
      return this.mixinTableCellMergin(
        this.cRows,
        this.groupColumnsDimension,
        "val",
        "both"
      );
    },
    titleInfo() {
      return this.isReadOnly ? "只读" : "修改";
    },
    colspanColumns() {
      return [...this.groupColumnsDimension];
    },
    groupColumnsDimension() {
      let rs = [];
      for (var i = 1; i <= this.lowestColLevel; i++) {
        rs.push("col" + i);
      }
      return rs;
    },
    cBasicTargetRows() {
      return this._createTargetRows(this.total, this.lowestColLevel);
    },
    cAllRows() {
      let allRows = _.cloneDeep(this.basicRows);
      let colLevelList = ["col0", ...this.groupColumnsDimension];
      // 从最深的级别开始加入到baisceRows中 ,
      for (var i = colLevelList.length - 2; i >= 0; i--) {
        let colName = colLevelList[i];
        console.info(colName);
        let merginArrsByLevel = this._getMerginSumByLevel(
          this.basicRows,
          this.dataColumns,
          colName,
          this.groupColumnsDimension.length
        );
        allRows = this._insertLevelData(merginArrsByLevel, colName, allRows);

        let targetPercent = this._calcTargetAndPercent(
          this.cBasicTargetRows,
          this.basicRows,
          this.dataColumns,
          colName,
          this.lowestColLevel
        );

        allRows = this._insertLevelData(targetPercent, colName, allRows);
      }
      console.info("sku计划中的全部数据是：", allRows);
      return allRows;
    },
    cRows() {
      const visiableRows = this.cAllRows.filter(row => {
        if (row.rowType) {
          // 对于指标行
          let obj = this.layoutSettings.find(it => row.rowType === it.value);

          if (obj) {
            return obj.checked;
          } else {
            return false;
          }
        } else {
          return true;
        }
      });
      console.info("layoutSettings cahnge", visiableRows);
      return visiableRows;
    }
  },
  activated() {
    if (this.oldCondStr !== JSON.stringify(this.pCondition)) {
      this.queryAndUpdate().then(() => {});
    }
  },
  methods: {
    ...funcs,
    getItemGMVPriceInfo(row, prop) {
      let item = row[prop];
      let rs = [];
      let { gmv, price, volume, pagePrice } = item;

      rs.push("GMV:" + gmv);
      rs.push("价格:" + price);
      rs.push("销量:" + volume);
      rs.push("页面价:" + pagePrice);
      return rs.join("</br>");
    },
    getItemPromotionListInfo(row, prop) {
      let item = row[prop];
      let promotionList = item.promotionList;
      return promotionList
        ? promotionList
            .map((item, index) => {
              return "活动" + (index + 1) + ":" + item.label;
            })
            .join("</br>")
        : "";
    },

    stackPrev() {
      this.mxhStackPrev("basicRows");
    },
    stackBack() {
      this.mxhStackBack("basicRows");
    },

    mixinCellClass(row, prop) {
      let classNameList = [];
      let obj = row[prop];
      if (!obj) {
        console.error("设置class出错", row, prop);
        return;
      }
      if (row.rowType) {
        classNameList.push("bold");
      }
      if (obj.dataType === "number" || obj.dataType === "percent") {
        classNameList.push("right");
      }

      if (obj.promotionList && obj.promotionList.length > 0) {
        classNameList.push("bg3c");
      }

      if (obj.editable && this.pIsEdit) {
        classNameList.push("cellCanEdit");
      }
      return classNameList.join(" ");
    },
    getModifyMode(dateDimension, isCoreSkuRow) {
      if (dateDimension === "D" && isCoreSkuRow) {
        return this._CONST.SKUPLAN_MODIFY_MODE.detail;
      } else {
        return this._CONST.SKUPLAN_MODIFY_MODE.gmv;
      }
    },
    getModifyInfo(row, propName) {
      let rs = [];
      rs.push(propName);
      for (var i = 4; i >= 1; i--) {
        let colName = "col" + i;

        if (colName in row) {
          rs.push(row[colName].val);
          break;
        }
      }
      return rs.join("  ");
    },
    getCellVal(row, prop) {
      let dataType = row[prop].dataType;
      let val = row[prop].val;

      if (dataType === "number") {
        let int = filter.int(val, 0);
        return filter.formatCurrency(int, this.pMoneyUnit);
      } else if (dataType === "string") {
        return val;
      } else {
        return val;
      }
    },
    saveData() {
      this._mxTabDataDetail.forEach(item => {
        let sourRow = this.basicRows.find(it => it.rowId === item.rowId);
        item.data.forEach(d => {
          let sourData = sourRow[d.dateDimension];
          Object.assign(d, sourData);
        });
      });
      let cond = JSON.parse(this.oldCondStr);
      cond.isSKU = true;
      cond.detail = JSON.stringify(this._mxTabDataDetail);

      this._api.salePlan.saveAdjustTableData(cond, this, "mxLoading").then(
        this._do("保存数据_ok", () => {
          this.queryAndUpdate().then(() => {});
        })
      );
    },
    hCellClick(row, column, cell, event) {
      event.stopPropagation();
      if (this.user.type == "SALER" && !this.pIsEdit) {
        return;
      }
      if (this.user.type == "DEPT_MANAGER") {
        this.isReadOnly = true;
      } else {
        this.isReadOnly = false;
      }
      let cond = null;
      try {
        cond = JSON.parse(this.oldCondStr);
      } catch (e) {
        return;
      }
      let currentCell = _.cloneDeep(row[column.property]);
      if (!currentCell.editable) {
        return;
      }

      this.currentRowIndexId = row.rowId;
      this.currentColProp = column.property;
      this.modifyMode = this.getModifyMode(
        cond.dateDimension,
        row.isCoreSkuRow
      );
      this.modifyTitle = this.getModifyInfo(row, column.property);

      this.currentModifyCell = currentCell;

      this.modifyData = {
        gmv: Math.round(currentCell.gmv),
        price: currentCell.price,
        volume: currentCell.volume,
        pagePrice: currentCell.pagePrice,
        promotionList: currentCell.promotionList,
        dateDimension: this.pCondition.dateDimension
      };

      this.isEdit = true;
    },
    info(row, prop) {
      //  return "row[prop]"
      try {
        if (row.rowType) {
          return row[prop].name || row[prop].val;
        } else {
          // return  row[prop].val + "-" + row[prop].name
          if (row[prop].name) {
            return row[prop].name;
          }
          if (row[prop].val) {
            return row[prop].val;
          }
        }
      } catch (e) {
        return "";
      }
      return "";
    },
    modifyBasicRow(val) {
      let row = this.basicRows.find(
        row => row.rowId === this.currentRowIndexId
      );
      if (row) {
        // this.currentColProp = column.property;
        let obj = row[this.currentColProp];
        if (obj) {
          Object.assign(obj, { val: val.gmv }, val);
          return true;
        }
      }
      return false;
    },

    hSaveModify(val) {
      this.isEdit = false;
      setTimeout(() => {
        if (this.modifyBasicRow(val)) {
          this.mxhStackAdd({ detail: _.cloneDeep(this.basicRows) });
        } else {
          this._info("修改失败");
        }
      });
      // return;
    },
    showEditBox(row, item) {},
    queryAndUpdate() {
      let _this = this;
      return new Promise(resolve => {
        let cond = this.pCondition;
        this.getDiffData(cond);
        this._api.salePlan
          .querySKUAdjustTableData(cond, this, "mxLoading")
          .then(
            this._do("获取SKU数据", rs => {
              _this.layoutSettings = _this.getLayoutSetting(cond.dateDimension);
              _this.oldCondStr = JSON.stringify(cond);
              _this.isShowTongQiXiaoShouJinDu = cond.dateDimension !== "W";
              _this.initData(rs);
              resolve(cond);
            })
          );
      });
    },
    initData(rs) {
      this.lowestColLevel = rs.columns.length;
      this.total = rs.total;
      this._mxTabDataDetail = rs.detail;
      this.cols = this.createColums(rs);
      this.basicRows = this.createBasicRows();
      this.mxhStackInit(_.cloneDeep({ detail: this.basicRows }));
    },
    createBasicRows() {
      let detail = this._mxTabDataDetail;

      if (detail.length === 0) {
        return [];
      }
      let rs = detail.map(item => {
        let r = { rowId: item.rowId, isCoreSkuRow: item.isCoreSkuRow };
        let sum = 0;
        for (var i = 1; i <= this.lowestColLevel; i++) {
          let colName = "col" + i;
          let name = item[colName].name;
          let val = [item[colName].id, name].join("-").trim();
          if (i === this.lowestColLevel) {
            if (!name) {
              val = item[colName].id;
            }
          }
          r[colName] = {
            title: [item[colName].id, item[colName].name].join("-"),
            val: val,
            id: item[colName].id,
            dataType: "string"
          };
        }

        item.data.forEach(it => {
          let {
            editable,
            val,
            dateDimension,
            gmv,
            pagePrice,
            plan,
            price,
            promotionList,
            volume,
            yoy,
            yoySum
          } = it;
          r[it.dateDimension] = {
            editable,
            val,
            dateDimension,
            gmv,
            pagePrice,
            plan,
            price,
            promotionList,
            volume,
            yoy,
            yoySum,
            dataType: "number"
          };
          sum += 1 * val;
        });

        r.sum = { editable: false, val: sum, dataType: "number" };

        return r;
      });
      return rs;
    },
    // 创建列
    createColums(data) {
      if (!data.columns) return [];

      if (0 === data.columns.length) return [];
      let rs = data.columns.map(item => {
        return { prop: item.prop, label: item.label, fixed: "left" };
      });

      // rs.push({prop:"id",label:"SKU编号"})
      this.dataColumns = [];

      data.detail[0].data.forEach(item => {
        this.dataColumns.push(item.dateDimension);
        rs.push({
          prop: item.dateDimension,
          label: item.dateDimension
        });
      });

      rs.push({ prop: "sum", label: "汇总", fixed: "right" });
      return rs;
    },
    downloadTableData() {
      let cond = JSON.parse(this.oldCondStr);
      cond.fileName = "计划明细数据" + new Date().getTime() + ".xlsx";
      let loadingInstance = this._loading("下载数据");
      this._api.salePlan
        .exportCommonPlanExcel(cond)
        .then(() => {
          this._info("下载计划明细数据成功！");
        })
        .catch(errorStr => {
          this._error("下载计划明细数据，原因是：" + errorStr);
        })
        .finally(() => {
          loadingInstance.close();
        });
    },
    clearForecastData() {
      this.basicRows.forEach(item => {
        for (let propName in item) {
          if (propName.includes(this.dateDimension)) {
            Object.assign(item[propName], { val: 0, gmv: 0, volume: 0 });
          }
        }
      });
    },
    getForecastData() {
      let cond = JSON.parse(this.oldCondStr);
      Object.assign(cond, { isSKU: true });
      this._api.salePlan.queryForecastInAdjust(cond, this, "mxLoading").then(
        this._do("获取SKU预测数据", rs => {
          this.initData(rs);
        })
      );
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
            this.queryAndUpdate().then(() => {});
          })
        );
    },

    resize() {
      try {
        console.info("resize.............");
        debugger;
        let tableArea = this.$refs.tabArea;
        this.tableHeight = document.body.offsetHeight - 250;
        tableArea.$el.style.height = this.tableHeight + "px";
        console.info("tableArea................", this.tableHeight);
      } catch (e) {
        console.info("tableArea.........error.......", e, this.tableHeight);

        console.error("tableArea.........error.......", e, this.tableHeight);
      }
    }
  },
  mounted() {
    window.addEventListener("resize", this.resize);
    setTimeout(() => {
      this.resize();
    }, 100);
  }
};
</script>

