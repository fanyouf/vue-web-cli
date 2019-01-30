<template lang="html">
  <div class="">
    <div class="h4">目标 <Tooltip content="不可修改" /></div>
    <el-table
      border
      :data="rows"
      >
      <el-table-column
        :show-overflow-tooltip="true"
        v-for="item in cols"
        :key="item.prop"
        :label="item.label"
        :fixed="item.fixed"
        :min-width = "mixincCellWidth[item.prop]"
        >
        <template slot-scope="scope">
          <div >
            <span v-if="scope.row[item.prop].dataType=='number'">{{scope.row[item.prop].val | int | formatCurrency(pMoneyUnit)}}</span>
            <span v-else-if="scope.row[item.prop].dataType=='percent'">{{scope.row[item.prop].val | percent }}</span>
            <span v-else>{{scope.row[item.prop].val}}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import mixin from "./mixinTable.js";

export default {
  props: {
    // 在目标表格中， 两个类型的情况下 目标表格
    // 1. 计算公式是不同的。
    // 2. 达成率 这三个字对应的的文案也不同。

    pMBType: {
      type: String,
      default: "target",
      validator: val => {
        return ["target", "plan"].includes(val);
      }
    },
    totalData: {
      type: Array,
      required: true
    },
    //  如果当前是按周或者是日查询时，对于target页来说，它是没有周或者是日的明细值的，在季，月维度下是有明细值的。
    //  对于这种例外的情况，如果汇总值是由明细汇起来了，则结果肯定是0，因为没有明细。所以做特殊处理：直接使用传过来的deptSum和otherDeptSum。前提：目标页，周天维度。
    deptSum: { type: Number, required: false, default: 0 }, //  所选汇总值
    otherDeptSum: { type: Number, required: false, default: 0 }, //  所选之外的汇总
    deptSumAvailable: { type: Boolean, required: false, default: false },
    currentMonth: { type: [Number, String], required: false, default: 0 }
  },
  mixins: [mixin],
  data() {
    return {
      moneyUnit: "yuan"
    };
  },
  computed: {
    collectDetail() {
      let rows = {};
      let sum = 0,
        obj = {};
      this.totalData.forEach(item => {
        sum = 0;
        obj = {};
        this.detailData.forEach(it => {
          let _t = it.data.find(d => d.dateDimension == item.dateDimension);
          sum += parseFloat(_t ? _t.val : 0);
        });
        sum += item.otherSum; // 由于第三行要算达成率：（当前正在做的部分 + 其它部分）/整个部门的目标值

        rows[item.dateDimension] = {
          val: sum,
          isEditable: false,
          isModified: false,
          dataType: "number"
        };
      });

      sum = 0;
      for (var key in rows) {
        if (key.substr(0, 1) === this.pDateDimension) {
          sum += parseFloat(rows[key].val);
        }
      }
      rows["sum"] = {
        val: sum,
        isModified: false,
        isEditable: false,
        dataType: "number"
      };
      return rows;
    },

    collectDetailForPlan() {
      let rows = {};
      let sum = 0,
        obj = {};
      this.totalData.forEach(item => {
        sum = 0;
        obj = {};
        this.detailData.forEach(it => {
          let _t = it.data.find(d => d.dateDimension == item.dateDimension);
          sum += parseFloat(_t ? _t.val : 0);
        });
        rows[item.dateDimension] = {
          val: sum,
          isEditable: false,
          dataType: "number"
        };
      });

      sum = 0;
      for (var key in rows) {
        if (key.substr(0, 1) === this.pDateDimension) {
          sum += parseFloat(rows[key].val);
        }
      }
      rows["sum"] = {
        val: sum,
        isEditable: false,
        dataType: "number"
      };
      return rows;
    },
    rows() {
      if (!this.totalData || this.totalData.length == 0) {
        return [];
      }

      let dachenglv = this.pMBType === "plan" ? "预计达成率" : "达成率";

      let { id, name } = this.mxcIdAndName;
      let rows = [
        {
          id: { val: id },
          name: { val: name },
          typeText: { val: "目标" },
          yearMonth: { val: this.pYearMonth }
        },
        {
          id: { val: id },
          name: { val: name },
          typeText: { val: "汇总" },
          yearMonth: { val: this.pYearMonth }
        },
        {
          id: { val: id },
          name: { val: name },
          typeText: { val: dachenglv },
          yearMonth: { val: this.pYearMonth }
        }
      ];
      let _sum = 0,
        _otherSum = 0;

      if (this.pMBType === "target") {
        this.totalData.forEach((item, index) => {
          rows[0][item.dateDimension] = {
            val: item.val,
            otherSum: item.otherSum,
            isEditable: item.editable,
            isModified: false,
            dataType: "number"
          };
          // console.info(item.dateDimension,this.dateType,item.val)
          if (item.dateDimension.substr(0, 1) == this.pDateDimension)
            // 计算total
            _sum += parseFloat(item.val);
          _otherSum += parseFloat(item.otherSum);
        });
        if (this.deptSumAvailable === true) {
          _sum = this.deptSum;
          _otherSum = this.otherDeptSum;
        }
        rows[0]["sum"] = {
          val: _sum,
          otherSum: _otherSum,
          isEditable: false,
          isModified: false,
          dataType: "number"
        };

        // 第一行：目标行

        rows[1] = { ...rows[1], ...this.collectDetail }; //  第二行：汇总行
      } else if (this.pMBType === "plan") {
        this.totalData.forEach((item, index) => {
          rows[0][item.dateDimension] = {
            val: item.val,
            otherSum: item.otherSum,
            isEditable: item.editable,
            isModified: false,
            dataType: "number"
          };
          try {
            // 计算total
            if (item.dateDimension.substr(0, 1) == this.pDateDimension)
              _sum += parseFloat(item.val);
          } catch (e) {
            console.error(this.totalData, item, index);
            console.error(item.dateDimension, this.pDateDimension, item.val);
          }
        });
        rows[0]["sum"] = {
          val: _sum,
          isEditable: false,
          dataType: "number"
        };

        // 第一行：目标行

        rows[1] = { ...rows[1], ...this.collectDetailForPlan }; //  第二行：汇总行
      }

      for (var key in rows[1]) {
        if (false == ["id", "name", "typeText", "yearMonth"].includes(key)) {
          let val =
            rows[0][key].val === 0 ? 0 : rows[1][key].val / rows[0][key].val;
          //console.info(rows[0][key].val)
          rows[2][key] = { val, dataType: "percent" };
        }
      }

      console.info("目标表格中的数据", rows);

      return rows;
    },
    cols() {
      if (!this.totalData || this.totalData.length == 0) {
        console.info("目标表格中的数据为空");

        return [];
      }
      let arr = [
        { prop: "id", label: "ID", fixed: true },
        { prop: "name", label: "名称", fixed: true },
        { prop: "typeText", label: "类别", fixed: true },
        { prop: "yearMonth", label: "年月", fixed: true }
      ];
      this.totalData.forEach((item, index) => {
        arr.push({ prop: item.dateDimension, label: item.dateDimension });
      });
      let sumLabel = "汇总";
      //  如果当前是WD,则显示月汇总
      if (this.deptSumAvailable === true) {
        sumLabel = this.currentMonth + "月汇总";
      }
      arr.push({ prop: "sum", label: sumLabel, fixed: "right" });
      console.info("目标表格中的列", arr);

      return arr;
    }
  }
};
</script>
