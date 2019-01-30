<template>
  <el-table-column
    :prop="prop"
    width="90"
          :label="label">
    <template slot-scope="scope">
      <span   style="color:red"  v-if="scope&&scope.row&&scope.row[prop]&& scope.row[prop]['color'] =='red' ">
        {{ show(scope.row[prop])}}
      </span>
      <span   style="color:blue"  v-if="scope&&scope.row&&scope.row[prop]&& scope.row[prop]['color'] =='blue' ">
             {{ show(scope.row[prop])}}
      </span>
      <span     v-if="scope&&scope.row&&scope.row[prop]&& scope.row[prop]['color'] =='' ">
                {{ show(scope.row[prop])}}

      </span>

    </template>
      </el-table-column>

</template>

<script type="text/ecmascript-6">
import Vue from "vue";
import { Table, TableColumn } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.use(Table);
Vue.use(TableColumn);

export default {
  props: {
    prop: { type: [String, Object] },
    label: { type: String },
    percent: { type: Boolean }
  },
  data() {
    return {};
  },
  filters: {
    formaRadio: value => {
      return value;
    }
  },
  methods: {
    formatCurrency: function(num) {
      if (!num || isNaN(num)) {
        return num;
      }
      num = num.toString().replace(/\$|\,/g, "");
      let sign = num == (num = Math.abs(num));
      num = Math.floor(num * 10 + 0.50000000001);
      let cents = num % 10;
      num = Math.floor(num / 10).toString();
      for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
        num =
          num.substring(0, num.length - (4 * i + 3)) +
          "," +
          num.substring(num.length - (4 * i + 3));
      }
      return (sign ? "" : "-") + num + "." + cents;
    },
    show(obj) {
      let d = obj["val"];
      if (obj.percent && d != null) {
        d = d * 100 + "%";
      } else {
        d = this.formatCurrency(d);
      }
      return d;
    }
  }
};
</script>

<style></style>
