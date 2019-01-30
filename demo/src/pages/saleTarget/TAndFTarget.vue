<template>
  <div>
    <conditionbar
      :dateDimensionData="mxDateDimensionData"
      :isShowEffectTarget="true"
      @effectTarget="hEffectTarget"
      @conditionBarChange="hConditionBarChange"
    ></conditionbar>
    <toolbar
      :querySuccess="mxQuerySuccess"
      :tableList="mxcTableList"
      v-model="moneyUnit"
      toolType="target"
      @toolbarEditStatusChange="hToolbarEditStatusChange"
      @toolbarFileUpload="hFileUpload"
      @toolbarDownloadBeforeUpload="hDownloadBeforeUpload"
      @toolbarDataBack="mxhStackBack"
      @toolbarDataPrev="mxhStackPrev"
      @toolbarDownload="hDownloadAllTableData"
      @toolbarSave="hSaveTableData"
      @toolbarJIARIchange="hToolbarJIARIchange"
      @toolbarClearJIARIFix="hMinxiToolbarClearJIARIFix"
      @toolbarRefresh="hToolbarRefresh"
      @toolbargetForecastData="hgetForecastData"
      @toolbarClearForecastData="hClearForecastData"
    ></toolbar>
  <div v-loading="diffLoading">
      <DiffAdjustment
        v-show="diffDataDetail && diffDataDetail.length"
        @saveDiff="hSaveDiff"
        :pColumnsDimension="diffDataColumns"
        :pDetail="diffDataDetail"
        :pDateDimension="mxDateDimension"
        typeForTip="target"
      ></DiffAdjustment>
      </div>
    <div v-loading="mxLoading">
      <tableList
        ref="refTableList"
        :pYearMonth="mxYearMonth"
        :pTotal="mxTabDataTotal"
        :pColumnsDimension="mxTabDataColumnsDimension"
        :pColumns="mxTabDataColumns"
        :pDetail="mxTabDataDetail"
        :pIsEdit="mxIsEdit"
        :pMoneyUnit="moneyUnit"
        pTitleName="考核目标"
        :pDateDimension="mxDateDimension"
        :pVisiableTableKeys="mxcVisiableTableKeys"
        :pValidDecimalPlacesForNumber="0"
        @addToStack="mxhStackAdd"
      ></tableList>
    </div>
  </div>
</template>
<script>
import { SPSCONST } from "@/const";
import toolbar from "@/components/toolbar/index";
import conditionbar from "@/components/conditionBar/conditionBar";

import TableList from "@/components/tableList/index";
import DiffAdjustment from "@/components/DiffAdjustment";

import mixin from "../mixins.js";
import stackmixin from "../stackMixins.js";
const _ = require("lodash");
export default {
  mixins: [mixin, stackmixin],
  props: {
    // 目标version类型
    pVersionType: {
      type: String,
      required: true,
      validator: value => {
        return Object.keys(SPSCONST.VERSIOIN_TYPE_VALUE_MAP).includes(
          value.toUpperCase()
        );
      }
    },
    pSetForcastCondition: { type: Function },
    pSideBarCond: { type: Object, required: true }
  },
  data() {
    return {
      moneyUnit: this._CONST.DEFAULT_MONEYUNIT,
      diffDataColumns: [],
      diffDataDetail: [],
      diffLoading: false
    };
  },
  activated() {
    this.mxIsAcitive = true;
    let currentCond = this.packageCondition();
    let currentCondStr = JSON.stringify(currentCond);
    // console.info(this.pVersionType, currentCondStr, this.oldCondStr, currentCond)
    if (currentCondStr != this.oldCondStr && currentCond.idList) {
      this.hSideBarChange(this.pSideBarCond);
    }
  },
  deactivated() {
    this.mxIsAcitive = false;
  },
  beforeDestroy() {
    this._bus.$off(
      this._CONST.E_SIDEBAR_SELECTEDNODE_CHANGE,
      this.hSideBarChange
    ); // 左侧节点选择变化
    // 表格数据发生了变化，要保存到栈中
    // this._bus.$off(
    //   this._CONST.E_TABLEDATA_CHANGE_STACK,
    //   this.hMixinTableDataChangeStack
    // );
  },
  created() {
    this.mxIsAcitive = true;

    this._bus.$on(
      this._CONST.E_SIDEBAR_SELECTEDNODE_CHANGE,
      this.hSideBarChange
    );
    // 左侧节点选择变化
    // 表格数据发生了变化
    // this._bus.$on(
    //   this._CONST.E_TABLEDATA_CHANGE_STACK,
    //   this.hMixinTableDataChangeStack
    // );
  },
  components: { toolbar, conditionbar, TableList, DiffAdjustment },
  methods: {
    getDateInfoCondition() {
      let monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      if (this.mxDateDimensionData.type.toUpperCase() === "W") {
        monthList = [this.mxDateDimensionData.currentSelectedMonthForWeek];
      } else if (this.mxDateDimensionData.type.toUpperCase() === "D") {
        monthList = [this.mxDateDimensionData.currentSelectedMonthForDay];
      }

      let cond = {
        year: this.mxDateDimensionData.currentSelectedYear, //查询年份
        monthList: monthList,
        dateDimension: this.mxDateDimensionData.type.toUpperCase() //查询时间维度
      };
      return cond;
    },
    packageCondition() {
      let currentCond = this.getDateInfoCondition();

      let cond = Object.assign({}, this.pSideBarCond, currentCond, {
        versionType: this.pVersionType
      });
      return cond;
    },

    getDiffData(cond) {
      // let cond = JSON.parse(this.oldCondStr)
      this._api.saleTarget.getTreeDiff(cond, this, "diffLoading").then(
        this._do("查询目标页中的调整数据", d => {
          this.diffDataColumns = d.columns || [];
          this.diffDataDetail = d.detail || [];
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
        detail: JSON.stringify(this.diffDataDetail)
      });

      this._api.saleTarget.updateTreeDiff(saveCond, this, "diffLoading").then(
        this._do("保存调整数据", d => {
          this.queryAndUpdate();
        })
      );
    },

    queryAndUpdate() {
      // 清空同比校准数据
      this.$refs.toolbar && this.$refs.toolbar.clearJIARIFix();

      let cond = this.packageCondition();
      this._api.saleTarget.queryAdjustTableData(cond, this, "mxLoading").then(
        this._do("查询目标页中的表格数据", d => {
          this.initData(d);
          //  以下四个数据项只在查周日时有用
          this.deptSumAvailable = d.deptSumAvailable;
          this.deptSum = d.deptSum;
          this.otherDeptSum = d.otherDeptSum;
          this.currentMonth = cond.monthList.join();

          this.mxDateDimension = cond.dateDimension;
          this.mxYearMonth =
            cond.year +
            ("DW".indexOf(this.mxDateDimension) == -1
              ? ""
              : "-" + cond.monthList);

          this.mxQuerySuccess = true;
          this.oldCondStr = JSON.stringify(cond);

          this.$emit("upDateForcastCondition", cond);
        })
      );
      this.getDiffData(cond);
    },
    createCols(d) {
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
      return arr;
    },

    initData(d) {
      this.mxTabDataTotal = d.total; //总共的目标
      this.mxTabDataDetail = d.detail; //明细目标
      this.mxTabDataColumnsDimension = d.columns;
      this.mxTabDataColumns = this.createCols(d);

      this.initStack(
        _.cloneDeep({
          detail: this.mxTabDataDetail,
          total: this.mxTabDataTotal
        })
      );
    },
    hSideBarChange(sideBarCond) {
      if (!this.mxIsAcitive) {
        return;
      }
      if (!sideBarCond) {
        throw new error("hSideBarChange缺少参数");
      }

      this.$nextTick(() => {
        console.info(
          "-------------------nextTick-----hSideBarChange",
          this.pSideBarCond
        );
        this.queryAndUpdate();
      });
    },
    hEffectTarget() {
      let cond = JSON.parse(this.oldCondStr);

      this._api.saleTarget
        .effectTarget(cond, this, "mxLoading")
        .then(this._do("目标生效_ok"));
    },
    hDownloadBeforeUpload(param) {
      let cond = null;
      try {
        cond = JSON.parse(this.oldCondStr);
      } catch (e) {
        this._error("下载参数没有准备就绪，不能下载");
        return;
      }
      cond.fileName = "部门考核目标模板" + new Date().getTime() + ".xlsx";
      let loadingInstance = this._loading("下载数据");
      if (param === "dept") {
        this._api.deptTarget.download(cond).then(() => {
          loadingInstance.close();
          this._info("下载模块成功！");
        });
      } else {
        cond.fileName = "明细目标模板" + new Date().getTime() + ".xlsx";
        this._api.saleTarget.downloadSaleTargetTemplate(cond).then(() => {
          loadingInstance.close();
          this._info("下载模块成功！");
        });
      }
    },
    hFileUpload(payload) {
      // { fileName: this.uploadFileName,targetFileType: this.targetFileType })
      // <Radio label="depChallengeTarget">部门考核目标</Radio>
      // <Radio label="saleTargetModify">销售目标调整</Radio>
      // console.info(payload)
      let type = payload.targetFileType;
      let fileName = payload.fileName;
      let cond = JSON.parse(this.oldCondStr);

      let cols = this.mxTabDataColumnsDimension.map(item => {
        if (item.label === "采销") {
          return [item.label + "ERP", item.label + "NAME"];
        } else {
          return [item.label + "ID", item.label + "NAME"];
        }
      });
      cols = _.flatten(cols);
      if (type === "saleTargetModify") {
        this._excel.import(fileName, cols).then(
          d => {
            console.info("从excel中导入的数据：", d);

            this.minxinUpdateDetailFromExcelValue(d, cond.dataDimensionList);
          },
          d => {
            this._error(d);
            return;
          }
        );
      } else {
        this.isLoading = true;
        this._api.deptTarget
          .upload({
            dept3Id: cond.dept3Id,
            roleType: cond.roleType,
            year: cond.year,
            fileName: fileName
          })
          .then(
            this._do("上传操作_ok", () => {
              // 重查一次表格
              this._info("上传成功，正在更新数据...");
              this.queryAndUpdate();
            })
          );
      }
    },

    hSaveTableData() {
      let cond = JSON.parse(this.oldCondStr);
      Object.assign(cond, {
        detail: JSON.stringify(this.mxTabDataDetail)
      });
      this._api.saleTarget
        .saveAdjustTableData(cond, this, "mxLoading")
        .then(this._do("保存数据_ok"));
    },
    hConditionBarChange() {
      this.queryAndUpdate();
    },
    hToolbarRefresh() {
      this.queryAndUpdate();
    },
    hToolbarJIARIchange(payload) {
      // 节假日校准，更新单元格数据，某一个假日会更新一列数据

      let cond = JSON.parse(this.oldCondStr);
      let val = payload.holidayCode;
      Object.assign(cond, { holiday: val });

      this._api.saleTarget.queryHolidayYoy(cond, this).then(
        this._do("节假日校准_OK", d => {
          if (d.length === 0) {
            this._info("节假日校准操作成功，但没有获取任何数据");
          } else {
            this.mixinUpdateJIARIData(d, cond.holiday, payload.holidayName);
          }
        })
      );
    },
    hToolbarEditStatusChange(d) {
      this.mxIsEdit = d;
    },
    hDownloadAllTableData() {
      let d = new Date();
      let dateTime = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join("-");
      let versioinType =
        this._CONST.VERSIOIN_TYPE_VALUE_MAP[this.pVersionType.toUpperCase()] ||
        "";
      this.$refs.refTableList.exportTableData(dateTime + versioinType);
    },

    // 在目标页面，获取预测
    hgetForecastData() {
      let cond = JSON.parse(this.oldCondStr);

      this._api.saleTarget.queryForecastInAdjust(cond, this, "mxLoading").then(
        this._do(
          "查询目标页中的表格数据",
          d => {
            this.initData(d);
            //  以下四个数据项只在查周日时有用
            this.deptSumAvailable = d.deptSumAvailable;
            this.deptSum = d.deptSum;
            this.otherDeptSum = d.otherDeptSum;
            this.currentMonth = cond.monthList.join();

            this.mxDateDimension = cond.dateDimension;
            this.mxYearMonth =
              cond.year +
              ("DW".indexOf(this.mxDateDimension) == -1
                ? ""
                : "-" + cond.monthList);

            this.mxQuerySuccess = true;
            this.oldCondStr = JSON.stringify(cond);

            this.$emit("upDateForcastCondition", cond);
          },
          d => {
            //加载失败
            this.mxQuerySuccess = false;
            this.mxTabDataTotal = [];
            this.mxTabDataDetail = [];
          }
        )
      );
    },
    hClearForecastData() {
      this.$refs.refTableList.setEditableDataToZero();
    }
  }
};
</script>
