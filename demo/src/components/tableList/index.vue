<template>
  <div class="tablistArea">
    <tmb
      ref="tmb"
      v-if="pVisiableTableKeys.includes('tmb')"
      :pDateDimension="pDateDimension"
      :isEdit="pIsEdit"
      :pMoneyUnit="pMoneyUnit"
      :totalData="pTotal"
      :detailData="pDetail"
      :pColumns="pColumns"
      :pColumnsDimension="pColumnsDimension"
      :pYearMonth="pYearMonth"
      :pMBType="pMBType"
    >
    </tmb>
    <tmx
      ref="tmx"
      v-show="pVisiableTableKeys.includes('tmx')"
      :pTitleName="pTitleName"
      :pValidDecimalPlacesForPercent="pValidDecimalPlacesForPercent"
      :pValidDecimalPlacesForNumber="0"
      :pDateDimension="pDateDimension"
      :isEdit="pIsEdit"
      :pMoneyUnit="pMoneyUnit"
      :isShowExpendRate="isShowExpendRate"
      :detailData="pDetail"
      :pColumns="pColumns"
      :pColumnsDimension="pColumnsDimension"
      :pYearMonth="pYearMonth"
      @addToStack="addToStack" >
    </tmx>
    <tstl
      ref="tstl"
      v-show="pVisiableTableKeys.includes('tstl')"
      :pDateDimension="pDateDimension"
      :isEdit="pIsEdit"
      :pMoneyUnit="pMoneyUnit"
      :pValidDecimalPlacesForNumber="0"
      :detailData="pDetail"
      :pColumns="pColumns"
      :pColumnsDimension="pColumnsDimension"
      :pYearMonth="pYearMonth"
      @addToStack="addToStack"
    >
    </tstl>
    <ttb
      ref="ttb"
      v-if="'W' != pDateDimension"
      v-show="pVisiableTableKeys.includes('ttb')"
      :pDateDimension="pDateDimension"
      :isEdit="pIsEdit"
      :pMoneyUnit="pMoneyUnit"
      :detailData="pDetail"
      :pColumns="pColumns"
      :pColumnsDimension="pColumnsDimension"
      :pYearMonth="pYearMonth"
      @addToStack="addToStack"
      :jiariMark="pJIARIData.qmwdList" :jiariName="pJIARIData.holidayName">
    </ttb>
    <thb
      ref="thb"
      v-if="'QM'.indexOf(pDateDimension) != -1"
      v-show="pVisiableTableKeys.includes('thb')"
      :pDateDimension="pDateDimension"
      :isEdit="false"
      :pMoneyUnit="pMoneyUnit"
      :detailData="pDetail"
      :pColumns="pColumns"
      :pColumnsDimension="pColumnsDimension"
      :pYearMonth="pYearMonth">
    </thb>
    <a href="#" id="aId" :v-show="false"></a>
  </div>
</template>
<script>
import tmb from "@/components/tableList/tMB.vue"; // 1. 目标
import tmx from "@/components/tableList/tMX.vue"; // 2. 明细  tMX
import tstl from "@/components/tableList/tSTL.vue"; // 3. 滲透率
import ttb from "@/components/tableList/tTB.vue"; // 4. 同比
import thb from "@/components/tableList/tHB.vue"; // 5. 环比 ,ttb,thb

const TABLE_NAME_MAP = {
  tmb: "目标数据",
  tmx: "GMV明细",
  tstl: "渗透率",
  ttb: "同比分析",
  thb: "环比分析"
};

export default {
  components: { tmb, tmx, tstl, ttb, thb },
  props: {
    // 标题
    pTitleName: { type: String, required: true },
    // 数值类型数据的有效位数
    pValidDecimalPlacesForNumber: { type: Number, default: 1 },
    // 百分比数据的有效位数
    pValidDecimalPlacesForPercent: { type: Number, default: 1 },
    // 年月份
    pYearMonth: { type: [Number, String], required: true },
    // 总值
    pTotal: { type: Array },
    // 明细值
    pDetail: { type: Array, required: true },
    pMoneyUnit: { type: String, required: false, default: "" },
    // 动态表头列，eg:品类，品牌，采销
    pColumnsDimension: { type: Array },
    // 全部的列，包括动态表头列
    pColumns: { type: Array, required: true },
    // 是否可以编辑
    pIsEdit: { type: Boolean, default: false },
    // 时间维度：QMWD
    pDateDimension: {
      type: String,
      required: true,
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        return ["Q", "M", "W", "D"].indexOf(value) !== -1;
      }
    },

    // 同比表格中要用到的
    pJiariMark: { type: Array },
    pJiariName: { type: String },

    // 哪些表格可见
    pVisiableTableKeys: {
      type: Array,
      default() {
        return ["tmb", "tmx", "tstl", "thb"];
      },
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        let flag = value.every(item =>
          ["tmb", "tmx", "tstl", "ttb", "thb"].includes(item)
        );
        if (flag === false) {
          console.error(value);
        }
        return flag;
      },
      required: true
    },
    pJIARIData: {
      type: Object,
      default() {
        return {
          jiari: "",
          oldData: [],
          newData: [],
          qmwdList: [],
          holidayName: ""
        };
      }
    },
    // 明细表格中使用。 在预测页的明细表格中，不提供 横向时间占比的功能。
    isShowExpendRate: {
      type: Boolean,
      default: true
    },

    // 在目标表格中， 两个类型的情况下 目标表格 计算公式是不同的。
    pMBType: {
      type: String,
      default: "target"
    }
  },
  methods: {
    addToStack(obj) {
      this.$emit("addToStack", obj);
    },
    hSaveDiff(rs) {
      this.$emit("saveDiffData", rs);
    },

    setEditableDataToZero() {
      // 纯前端处理：把可以编辑的数据重置为0
      this.pDetail.forEach(item => {
        item.data.forEach(cell => {
          if (cell.editable === true) {
            cell.val = 0;
          }
        });
      });
    },

    getAllVisiableTableData() {
      let sheetData = this.pVisiableTableKeys.map(item => {
        let sheetName = TABLE_NAME_MAP[item];
        let sheetData = this.$refs[item].exportToJson();
        return { sheetName, sheetData };
      });

      return sheetData;
    },
    exportTableData(fileName = "计划数据") {
      let sheetData = this.getAllVisiableTableData();
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
    }
  }
};
</script>
