<template>
  <div>
    <conditionbar
      :dateDimensionData="mxDateDimensionData"
      @conditionBarChange="hConditionBarChange"
    ></conditionbar>
    <toolbar
      :isEnableToOpenEdit="isEnableToOpenEdit"
      :querySuccess="querySuccess"
      :tableList="mxcTableList"
      :toolType="toolType"
      v-model="mxMoneyUnit"
      @toolbarEditStatusChange="hToolbarEditStatusChange"
      @toolbarFileUpload="hFileUpload"
      @toolbarDownload="hDownloadTableData"
      @toolbarDownloadBeforeUpload="hDownloadBeforeUpload"
      @toolbarDataBack="hStackBack"
      @toolbarDataPrev="hStackPrev"
      @toolbarSave="hSaveTableData"
      @toolbarJIARIchange="hToolbarJIARIchange"
      @toolbarRefresh="hToolbarRefresh"
      @toolbargetForecastData="hgetForecastData"
      @toolbarClearForecastData="hClearForecastData"
      @toolbarPlanTypeChange="hPlanTypeChange"
    ></toolbar>
    <div v-loading="mxLoading" class="tablistArea">
      <keep-alive>
        <component
          ref="refPlan"
          :is="componentName"
          :pCondition="packageCondition"
          :pIsEdit="mxIsEdit"
          :pDataType="pDataType"
          :pMoneyUnit="mxMoneyUnit"
          :pVisiableTableKeys="mxcVisiableTableKeys"
          :pValidDecimalPlacesForNumber="0"
          @upDateForcastCondition="hUpDateForcastCondition"
        ></component>
      </keep-alive>
    
    <Modal v-model="planSKUUploadErrorTipVisable">
       <planSKUUploadErrorTip
      :pUploadErrorList="uploadErrorList"
      >
      </planSKUUploadErrorTip>
    </Modal>
    </div>
  </div>
</template>
<script>
import toolbar from "@/components/toolbar/index";
import conditionbar from "@/components/conditionBar/conditionBar";
import analyzeboard from "@/components/analyzeBoard/analyzeBoard";

import skuPlan from "./PAndFPlanSKU";
import summaryPlan from "./PAndFPlanSummary";
import planSKUUploadErrorTip from "./planSKUUploadErrorTip";

import { mapGetters, mapMutations } from "vuex";

import mixin from "../mixins";
const _ = require("lodash");

export default {
  mixins: [mixin],
  props: {
    pDataType: { type: String, required: true }, // "gmv" "sale"
    pSetForcastCondition: { type: Function },
    pSideBarCond: { type: Object, required: true }
  },

  components: {
    toolbar,
    conditionbar,
    analyzeboard,
    summaryPlan,
    skuPlan,
    planSKUUploadErrorTip
  },

  data() {
    return {
      componentName: "summaryPlan",
      querySuccess: true,
      toolType: "summaryPlan",
      planSKUUploadErrorTipVisable: false,
      uploadErrorList: [
        // {
        //   //错误信息
        //   errorMessage: "数据格式错误",
        //   //错误信息表头
        //   titleList: [
        //     "SKU ID",
        //     "开始日期",
        //     "结束日期",
        //     "页面价",
        //     "单位成交价",
        //     "日均销量"
        //   ],
        //   //错误信息表数据,二维数组，第一层表示一行，第二层表示一个单元格
        //   errorInfoList: [
        //     ["skuId1", "2018/05/05", "2018/05/06", "15.0", "10.0", "50"]
        //   ]
        // }
      ]
    };
  },
  activated() {
    console.log("activated", this.titleType);
    this.mxIsAcitive = true;
  },
  deactivated() {
    this.mxIsAcitive = false;
  },
  beforeDestroy() {
    this._bus.$off(
      this._CONST.E_SIDEBAR_SELECTEDNODE_CHANGE,
      this.hSideBarChange
    );
    // 左侧节点选择变化
  },
  created() {
    this.setPageType(this._CONST.PAGETYPE.summaryPlan);
    this.mxIsAcitive = true;

    this._bus.$on(
      this._CONST.E_SIDEBAR_SELECTEDNODE_CHANGE,
      this.hSideBarChange
    ); // 左侧节点选择变化
  },

  computed: {
    ...mapGetters(["getUser"]),
    isEnableToOpenEdit() {
      return this.getUser.type === "SALER";
    },
    currentCond() {
      let cond = {
        ...this.getSelectedNode,
        ...this.getConditionBar,
        ...this.getCurrentNode,
        monthToSplit: this.getMonthToSplit,
        dept3Id: this.getUser.dept3Id,
        roleType: this.getUser.type,
        versionType: this.getCurrentVersionType,
        dataType: this.pQueryDataType // this.getPageType.toLowerCase().endsWith("gmv") ? "gmv" : "sale"
      };
      cond.dateDimension = cond.dateDimension;
      cond.monthList =
        cond.dateDimension == "Q" || cond.dateDimension == "M"
          ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          : [cond.monthToSplit];
      //月份,可选[季月维度没有,,,周天维度有]
      return cond;
    },
    packageCondition() {
      // alert("packageCondition")
      let currentCond = this.getDateInfoCondition();
      let cond = Object.assign({}, this.pSideBarCond, currentCond, {
        dataType: "GMV"
      });
      return cond;
    }
  },

  methods: {
    ...mapMutations("stack", ["setPageType"]),
    hStackPrev() {
      this.$refs.refPlan.stackPrev();
    },
    hStackBack() {
      this.$refs.refPlan.stackBack();
    },
    hUpDateForcastCondition(cond) {
      this.$emit("upDateForcastCondition", cond);
    },
    hSideBarChange() {
      if (!this.mxIsAcitive) {
        return;
      }

      this.$nextTick(() => {
        console.info(
          "-------------------nextTick-----hSideBarChange",
          this.pSideBarCond
        );
        this.queryAndUpdate();
      });
    },
    queryAndUpdate() {
      this.$refs.refPlan.queryAndUpdate().then(d => {
        this.mxDateDimension = d.dateDimension;
      });
    },
    hPlanTypeChange(planType) {
      if (planType === "SKUPLAN") {
        this.componentName = "skuPlan";
        this.setPageType(this._CONST.PAGETYPE.skuPlan);
      } else if (planType === "SUMMARYPLAN") {
        this.componentName = "summaryPlan";
        this.setPageType(this._CONST.PAGETYPE.summaryPlan);
      }
      this.toolType = this.componentName;
    },
    hDownloadTableData(fileName = "计划数据") {
      this.$refs.refPlan.downloadTableData();
    },
    getDateInfoCondition() {
      // alert(1)
      let dataCond = _.cloneDeep(this.mxDateDimensionData)
      let monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      if (dataCond.type.toUpperCase() === "W") {
        monthList = [dataCond.currentSelectedMonthForWeek];
      } else if (dataCond.type.toUpperCase() === "D") {
        monthList = [dataCond.currentSelectedMonthForDay];
      }

      let cond = {
        year: dataCond.currentSelectedYear, //查询年份
        monthList: monthList,

        dateDimension: dataCond.type.toUpperCase() //查询时间维度
      };
      return cond;
    },

    hDownloadBeforeUpload(p) {
      
      let cond = {};
      try {
        cond = JSON.parse(this.oldCondStr);
      } catch (e) {
        cond = this.packageCondition;
      }

      let loadingInstance = this._loading("下载数据");

      // TODO: 区分不同的类型
      if (this.toolType === "summaryPlan") {
        cond.fileName = "明细计划模板" + new Date().getTime() + ".xlsx";
        this._api.salePlan.downloadTemplate(cond).then(() => {
          this._info("下载明细计划模板成功！");
          loadingInstance.close();
        });
      } else if (this.toolType === "skuPlan") {
        cond = Object.assign({}, cond, {
          year: p.year,
          monthList: p.monthList
        });

        cond.fileName = "促销销售计划" + new Date().getTime() + ".xlsx";

        this._api.salePlan
          .exportPromotionPlanExcel(cond)
          .then(() => {
            this._info("下载促销销售计划成功！");
          })
          .catch(errorStr => {
            this._error("下载促销计划失败，原因是：" + errorStr);
          })
          .finally(() => {
            loadingInstance.close();
          });
      }
    },
    hFileUpload(payload) {
      let fileName = payload.fileName;

      let cond = {};
      try {
        cond = JSON.parse(this.oldCondStr);
      } catch (e) {
        cond = this.packageCondition;
      }
      // let cols = this.mxTabDataColumnsDimension.map(item => {
      //   if (item.label === "采销") {
      //     return [item.label + "ERP", item.label + "NAME"];
      //   } else {
      //     return [item.label + "ID", item.label + "NAME"];
      //   }
      // });
      // cols = _.flatten(cols);

      if (this.toolType === "summaryPlan") {
        this.$refs.refPlan.importFromFile(fileName);
      } else if (this.toolType === "skuPlan") {
        cond.fileName = fileName;
        this._api.salePlan.uploadPromotionPlanExcel(cond).then(
          this._do("上传促销销售计划", d => {
            if (!d.uploadSuccess) {
              this._info(d.resultMessage);
              this.uploadErrorList = d.uploadErrorList;
              this.planSKUUploadErrorTipVisable = true;
            } else {
              this._info("上传促销销售计划成功");
              this.$refs.refPlan.queryAndUpdate();
            }
            console.info(d);
          })
        );
      }
    },
    updateDetailFromExcelValue(d) {
      let counter = 0,
        obj = null,
        keys = [];
      try {
        d.forEach(item => {
          obj = this.detail.find(it => it.id == item.ID);
          if (obj) {
            keys = Object.keys(item);
            obj.data.forEach(it => {
              if (keys.includes(it.dateDimension)) {
                if (it.val * 1 != item[it.dateDimension] * 1) {
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
    hSaveTableData() {
      this.$refs.refPlan.saveData();
    },
    hConditionBarChange(obj) {
      //  条件查询栏中的按钮被按下
      console.info("条件查询栏中的按钮被按下,它的条件已经保存在store中", obj);

      this.queryAndUpdate();
    },
    hToolbarRefresh() {
      this.queryAndUpdate();
    },
    hToolbarJIARIchange(payload) {
      // 节假日校准，更新单元格数据，某一个假日会更新一列数据

      let cond = this.currentCond;
      let val = payload.holidayCode;
      let cond1 = { ...cond, holiday: val };
      if (this._api.validate.queryHolidayYoy(cond1)) {
        this._api.salePlan.queryHolidayYoy(cond1, this).then(
          this._do("节假日校准_OK", d => {
            console.info(d);
            if (d.length === 0) {
              this._info("节假日校准操作成功，但没有获取任何数据");
            } else {
              this.mixinUpdateJIARIData(d, cond1.holiday, payload.holidayName);
            }
          })
        );
      }
    },
    hToolbarEditStatusChange(rs) {
      this.mxIsEdit = rs;
    },

    // 在计划页面，获取预测
    hgetForecastData() {
      this.$refs.refPlan.getForecastData();
    },
    hClearForecastData() {
      this.$refs.refPlan.clearForecastData();
    }
  }
};
</script>
