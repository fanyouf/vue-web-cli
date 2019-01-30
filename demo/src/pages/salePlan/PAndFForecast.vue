<template>
  <div class="forecast">
    <tableList
      v-loading="loading"
      :pYearMonth="year"
      :pTotal="total"
      :pColumnsDimension="columns"
      :pColumns="tabDataColumns"
      :pDetail="detail"
      :pIsEdit="false"
      :pTitleName="cTitleName"
      :pDateDimension="dateDimension"
      :pVisiableTableKeys="['tmx','ttb']"
      :pDataType="pDataType"
      :pValidDecimalPlacesForNumber="0"
      :isShowExpendRate="false"
    ></tableList>
  </div>
</template>




<script>
import TableList from "@/components/tableList";

export default {
  components: { TableList },
  props: {
    pForcecastCondition: { type: Object, required: true },
    pDataType: {
      type: String,
      required: true,
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        return ["GMV", "SALE"].indexOf(value.toUpperCase()) > -1;
      }
    }
  },
  data() {
    return {
      loading: false,
      total: [],
      detail: [],
      columns: [],
      tabDataColumns:[],
      dateDimension: "M",
      year: 2018,
      oldCondStr: ""
    };
  },
  deactivated() {
    this._bus.$emit("E_FORECASTPAGE_SHOW_CHANGE", false);
  },
  
  activated() {
    console.info(this.pForcecastCondition);
    this._bus.$emit("E_FORECASTPAGE_SHOW_CHANGE", true);
    let cond = { ...this.pForcecastCondition };
    if (this.oldCondStr !== JSON.stringify(this.pForcecastCondition)) {
      this._api.salePlan.queryForecastTableData(cond, this, "loading").then(
        this._do("查询预测", d => {
          this.total = d.total; //总共的目标
          this.detail = d.detail; //明细目标
          this.columns = d.columns;
          this.tabDataColumns = this.createCols(d);
          this.dateDimension = cond.dateDimension; // 季月周天
          this.year = cond.year;

          this.oldCondStr = JSON.stringify(cond);
        })
      );
    }
  },
  computed: {
    cTitleName() {
      return (this._CONST.PLAN_TYPE_VALUE_MAP[this.pDataType] || "") + "预测 ";
    }
  },
  methods:{
    createCols(d){
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
  }
};
</script>
