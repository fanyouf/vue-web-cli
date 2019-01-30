<template>
  <div  class="forecast">
    <div class="h4" style="padding-left:10px;">预测</div>
    <tableList
      v-loading="loading"
      :pYearMonth="year"
      :pTotal="total"
      :pColumnsDimension="columns"
      :pColumns="tabDataColumns"

      :pDetail="detail"
      :pIsEdit="false"
      pTitleName="考核目标预测"
      :pDateDimension="dateDimension"
      :pVisiableTableKeys="['tmx','ttb']"
      pQueryDataType="GMV"
      :pValidDecimalPlacesForNumber="0"
      :isShowExpendRate="false"
    ></tableList>
  </div>
</template>
 <style scoped>
.cellCanEdit {
  color: inherit !important;
}
</style>


<script>
import TableList from "@/components/tableList";

export default {
  components: { TableList },
  props: {
    // 目标version类型
    pVersionType: {
      type: String,
      required: true,
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        return ["ASSESSMENT", "CHALLENGE"].indexOf(value.toUpperCase()) !== -1;
      }
    },
    pForcecastCondition: { type: Object, required: true }
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
    this._bus.$emit("E_FORECASTPAGE_SHOW_CHANGE", true);
    console.info(this.pForcecastCondition);
    let cond = { ...this.pForcecastCondition };
    if (this.oldCondStr !== JSON.stringify(cond)) {
      this._api.saleTarget.queryForecastTableData(cond, this, "loading").then(
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
