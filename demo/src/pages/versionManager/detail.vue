<!-- 销售目标 的主页 -->
<template lang="html">
  <div class="">
    <div class="page">
      <div class="sideBar">
        <sidebar :pageType="'target'" @sideBarQuery="hSideBarQuery"></sidebar>
      </div>
      <div class="mainContainer">

        <div class="nav-level1">
          <span class="current" style="cursor:normal">查看版本详情</span>
        </div>

        <div class="versionInfo flexa">
          <p>版本类型：{{currentVersionInfo.type}}</p>
          <p>最后修改人：{{currentVersionInfo.creater}}</p>
          <p>最后修改时间：{{currentVersionInfo.date}}</p>
          <p>适用年份：{{currentVersionInfo.year}}</p>
        </div>

        <conditionBar
          :dateDimensionData="dateDimensionData"
          :isViewDetail="true"
          @conditionBarChange="hConditionBarChange"
        ></conditionBar>
        <toolbar
          :tableList="tableList"
          v-model="moneyUnit"
          toolType="view"
          @toolbarDownload="hDownloadAllTableData"
        ></toolbar>

        <tableList
          ref="refTableList"
          v-loading = "loading"
          :pYearMonth="yearMonth"
          :pTotal="tabDataTotal"
          :pColumnsDimension="tabDataColumns"
          :pColumns="tabDataAllColumns"
          :pDetail="tabDataDetail"
          :pIsEdit="false"
          :pMoneyUnit="moneyUnit"
          pTitleName="考核目标"
          :pDateDimension="DateDimension"
          :pVisiableTableKeys="cVisiableTableKeys"
          :pValidDecimalPlacesForNumber="0"
        >
        </tableList>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.versionInfo {
  padding-left: 15px;
  margin: 15px 0;
  font-size: 16px;
  p {
    margin-right: 10px;
  }
}
</style>
<script>
import { mapMutations, mapGetters } from "vuex";

import sidebar from "@/components/sideBar/sideBar";
import conditionBar from "@/components/conditionBar/conditionBar";
import TableList from "@/components/tableList/index";
import toolbar from "@/components/toolbar/index";

export default {
  components: { sidebar, conditionBar, TableList, toolbar },
  computed: {
    ...mapGetters(["getUser"]),
    cVisiableTableKeys() {
      return this.tableList
        .filter(item => item.checked === true)
        .map(item => item.value);
    }
  },
  created() {
    let versionType = this.$route.params.type;
    if (this.validVersionType(versionType) === false) {
      this.$router.replace({ path: "../versionManager" });
    } else {
      this.versionType = versionType;

      this.query();
    }
  },
  data() {
    return {
      versionType: "",
      loading: false,
      currentVersionInfo: {
        year: "-", //目标是给2018年做的
        creater: "-", //
        date: "-", //最后修改时间
        remark: "-",
        type: "-"
      },
      dateDimensionData: {
        currentSelectedYear: new Date().getFullYear(),
        // 默认按月
        type: "M",
        monthList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        // 要让下拉列表中的相应项目处于选中状态，则应该保持数据类型一致。
        currentSelectedMonthForWeek: new Date().getMonth() + 1,
        currentSelectedMonthForDay: new Date().getMonth() + 1
      },
      sidebarCond: {},
      DateDimension: "M",
      moneyUnit: this._CONST.DEFAULT_MONEYUNIT,
      yearMonth: "",
      tableList: [
        { label: "目标数据", value: "tmb", checked: true },
        { label: "GMV明细", value: "tmx", checked: true },
        { label: "渗透率", value: "tstl", checked: true },
        { label: "同比分析", value: "ttb", checked: true },
        { label: "环比分析", value: "thb", checked: true }
      ],
      tabDataTotal: [],
      tabDataColumns: [],
      tabDataDetail: [],
      tabDataAllColumns: []
    };
  },
  methods: {
    validVersionType(version) {
      if (typeof version !== "string") return false;
      return this._CONST.TARTETVERSIONS.map(item => item.value).includes(
        version.toUpperCase()
      );
    },
    hDownloadAllTableData() {
      let fileName = "asfsfs";
      this.$refs.refTableList.exportTableData(fileName);
    },
    hConditionBarChange() {
      this.queryAndUpdate(this.sidebarCond);
    },
    query() {
      this.versionType = this.$route.params.type;
      this._api.saleTargetVersion
        .getVersion(
          {
            versionType: this.$route.params.type,
            dept3Id: this.getUser.dept3Id,
            roleType: this.getUser.type
          },
          this,
          "loading"
        )
        .then(
          this._do("查询版本信息", d => {
            console.info("查询版本信息的结果是:", d);
            if (!d) {
              this.currentVersionInfo = {
                year: "-", //目标是给2018年做的
                creater: "-", //
                date: "-", //最后修改时间
                remark: "-",
                type: "-"
              };

              this.initData({
                total: [], //总共的目标
                detail: [], //明细目标
                columns: []
              });
            } else {
              this.currentVersionInfo.year = Number(d.year);
              this.currentVersionInfo.creater = d.creater;
              this.currentVersionInfo.date = d.date;
              this.currentVersionInfo.type =
                this.$route.params.type == "CHALLENGE"
                  ? "挑战目标"
                  : "考核目标";
            }
          })
        );
    },
    hSideBarQuery(cond) {
      let sidebarCond = Object.assign({}, cond, {
        roleType: this.getUser.type,
        dept3Id: this.getUser.dept3Id
      });
      console.info(
        "目标详情页收到siderBaryQuery事件，左侧节点的条件是",
        sidebarCond
      );

      this.sidebarCond = sidebarCond;
      // 2.发出事件
      this.queryAndUpdate(sidebarCond);
    },
    getDateInfoCondition() {
      let monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      if (this.dateDimensionData.type.toUpperCase() === "W") {
        monthList = [this.dateDimensionData.currentSelectedMonthForWeek];
      } else if (this.dateDimensionData.type.toUpperCase() === "D") {
        monthList = [this.dateDimensionData.currentSelectedMonthForDay];
      }

      let cond = {
        year: this.dateDimensionData.currentSelectedYear, //查询年份
        monthList: monthList,
        dateDimension: this.dateDimensionData.type.toUpperCase() //查询时间维度
      };
      return cond;
    },
    packageCondition(sidebarCond) {
      let currentCond = this.getDateInfoCondition();

      let cond = Object.assign({}, sidebarCond, currentCond, {
        versionType: this.versionType
      });
      return cond;
    },
    queryAndUpdate(sidebarCond) {
      let cond = this.packageCondition(sidebarCond);
      this._api.saleTarget.queryAdjustOnlyTableData(cond, this, "loading").then(
        this._do(
          "查询目标页中的表格数据",
          d => {
            this.initData(d);
            //  以下四个数据项只在查周日时有用
            this.deptSumAvailable = d.deptSumAvailable;
            this.deptSum = d.deptSum;
            this.otherDeptSum = d.otherDeptSum;
            this.currentMonth = cond.monthList.join();

            this.dateDimension = cond.dateDimension;
            this.yearMonth =
              cond.year +
              ("DW".indexOf(this.dateDimension) == -1
                ? ""
                : "-" + cond.monthList);

            this.oldCondStr = JSON.stringify(cond);
          },
          d => {
            //加载失败

            this.tabDataTotal = [];
            this.tabDataDetail = [];
          }
        )
      );
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
      this.tabDataTotal = d.total; //总共的目标
      this.tabDataDetail = d.detail; //明细目标
      this.tabDataColumns = d.columns;
      this.tabDataAllColumns = this.createCols(d);
    }
  },
  watch: {
    getUser: function(val) {
      this.sidebarCond.idList = [];
      this.sidebarCond.nameList = [];
      this.query();
    }
  }
};
</script>
