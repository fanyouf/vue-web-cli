<template>
<div>
    <Modal
        v-model="visible"
        :mask-closable="false"
        title="按比例修改数据"
        width="800"
        @on-cancel="hCancel"
        >
    <p>如果在输入框中填入了数值，则以填入的值为准.没有填入值的输入框则会按比例进行计算。</p>
    <!-- <div style="margin-bottom:10px;">
      <Button @click="hResetPercent" size="small">恢复初值</Button>
      <Button @click="hSetPercentToZero" size="small">清空比例</Button>
    </div> -->
      <span style="color:red">{{msg}}</span>
    <el-table class="detailTable" border :data="rows">
      <el-table-column
        v-for="item in cols"
        :key="item.prop"
        :fixed="item.fixed"
        :label="item.label"
      >
       <!-- @on-blur="hSaveDataChangePercent" -->
        <template slot-scope="scope">
          <div v-if="scope.row[item.prop].editable  && scope.row[item.prop].dataType=='percent'">
            <div class="flexa">
              <Input
                ref="input"
                type="text"
                v-model="scope.row[item.prop].val"
              />%
            </div>
          </div>
          <div v-else :class="mixinCellClass(scope.row,item.prop)">
            <span>{{mixinGetCellValue(scope.row,item.prop)}}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer" style="margin-top:5px;margin-bottom:10px;">
      <Button type="primary" @click="hComputePercent" size="small">计算</Button>
      <Button type="success" @click="hApplyNewPercent" size="small">应用</Button>
      <Button @click="hCancel" size="small">取消</Button>
    </div>
        
    </Modal>
    </div>
</template>
<script>
import tMXFuncs from "./tMX.vue";
import { mapMutations } from "vuex";
const _ = require("lodash");
export default {
  props: {
    mixinCellClass: { type: Function },
    mixinGetCellValue: { type: Function },
    pDateDimension: { type: String, required: true }
  },
  data() {
    return {
      visible: false,
      msg: "", //修改百分比值时的错误提示
      rows: [],
      cols: [],
      rowsInfo: {
        totalEditableValue: 0,
        totalEditablePercent: 0,
        totalValue: 0
      },

      isFinished: false // 记录在拆分渗透率时是否用户已经点击了计算
    };
  },
  computed: {},
  methods: {
    show(rows, cols) {
      this.visible = true;
      this.rows = rows;

      this.cols = cols;
      this.rowsInfo = this.getRowsInfo();
      console.info(rows);
      setTimeout(() => {
        this.hSetPercentToZero();
      });
    },
    getRowsInfo() {
      let totalEditableValue = 0;
      let totalEditablePercent = 0;
      let totalValue = 0;

      for (let key in this.rows[0]) {
        let obj = this.rows[0][key];
        if (obj.editable) {
          totalEditableValue += obj.val * 1;
        }
      }
      for (let key in this.rows[1]) {
        let obj = this.rows[1][key];
        if (obj.editable) {
          totalEditablePercent += obj.val * 1;
        }
      }

      totalValue = this.rows[0]["sum"].val;

      return {
        totalEditableValue,
        totalEditablePercent,
        totalValue
      };
    },
    hCancel() {
      this.visible = false;
      this.$emit("close");
    },
    hSetPercentToZero() {
      if (this.rows.length != 2) {
        return;
      }
      for (var key in this.rows[1]) {
        let item = this.rows[1][key];
        console.info(item);
        if (item.dataType == "percent" && item.editable == true) {
          item.val = "";
        }
      }
    },
    // hResetPercent() {
    //   let p = _.cloneDeep(this.rows[1]);
    //   for (var key in p) {
    //     if (p[key].dataType === "percent" && p[key].editable) {
    //       p[key].val = (100 * p[key].val).toFixed(3);
    //     }
    //   }
    //   this.rows = [_.cloneDeep(this.rows[0]), p];
    // },
    editPercentData(row, propName) {
      console.info(row, propName);

      this.editIndex = this.rows.findIndex(item => item == row);
      this.editProp = propName;

      this.editRowPrimaryKey = this.mixinGetRowprimaryKey(
        row,
        this.mixinMerginColNameArr.length
      );

      let p = _.cloneDeep(this.rows[this.editIndex]);
      for (var key in p) {
        if (p[key].dataType === "percent" && p[key].editable) {
          p[key].val = (100 * p[key].val).toFixed(3);
        }
      }
      this.rows = [_.cloneDeep(this.rows[this.editIndex - 1]), p];
      this.initPercentDataInfo();

      this.dialogTableVisible = true;
      this.msg = ""; //清空提示
    },
    hasNaNnumber() {
      let rs = false;
      let row = this.rows[1];
      for (var key in row) {
        let obj = row[key];
        if (obj.editable) {
          if (isNaN(obj.val)) {
            this.msg = obj.val + "不是数值,请核实";
            rs = true;
            break;
          }
        }
      }
      return rs;
    },
    // 用户填入的总百分比
    getUserTotalPercent() {
      let userSumPercent = 0;
      for (var key in this.rows[1]) {
        let obj = this.rows[1][key];
        if (obj.editable) {
          if (obj.val != "") {
            userSumPercent += obj.val * 1;
          }
        }
      }
      return userSumPercent;
    },
    isUserPercentExceed() {
      let rs = false;

      return rs;
    },

    getCellModifyState() {
      let userCols = [];
      let beComputedCols = [];
      for (var key in this.rows[1]) {
        let obj = this.rows[1][key];
        if (obj.editable) {
          if (obj.val != "") {
            userCols.push(key);
          } else {
            beComputedCols.push(key);
          }
        }
      }

      return { userCols, beComputedCols };
    },

    updateUserStaticCols(userCols) {
      userCols.forEach(col => {
        //值
        this.rows[0][col].val =
          (this.rows[1][col].val * this.rowsInfo.totalValue) / 100;
      });
    },

    /**
     * 把 beComputedCols 这些列 按之前的比例一起分 百分比 totalPercent
     */
    updatebeComputedCols(beComputedCols, totalPercent) {
      if (beComputedCols.length === 0) return;
      let beComputedColsInitValues = beComputedCols.map(colName => {
        return this.rows[0][colName].val;
      });

      let sum = beComputedColsInitValues.reduce((a, b) => a * 1 + b * 1, 0);

      if (sum === 0) {
        // 全为0，平分
        beComputedCols.forEach((colName, index) => {
          this.rows[0][colName].val =
            (this.rowsInfo.totalValue * totalPercent) /
            beComputedCols.length /
            100;
          this.rows[1][colName].val = totalPercent / beComputedCols.length;
        });
      } else {
        let beComputedColsModifyedPercent = beComputedColsInitValues.map(
          val => (totalPercent * val) / sum
        );

        beComputedCols.forEach((colName, index) => {
          this.rows[0][colName].val =
            (this.rowsInfo.totalValue * beComputedColsModifyedPercent[index]) /
            100;
          this.rows[1][colName].val = beComputedColsModifyedPercent[index];
        });
      }
    },

    hComputePercent() {
      // 按下计算按钮之后，先置为false,表示此时应用按钮仍不可用

      if (this.hasNaNnumber()) return;

      this.isFinished = false;
      this.msg = "";

      //共两行数据
      // 第一行是真实数据
      // 第二行是比例值

      let userTotalPercent = this.getUserTotalPercent(); // 用户填入的比例
      let percentToSplit =
        this.rowsInfo.totalEditablePercent - userTotalPercent; // 用户输入的修改后的比例之和。

      if (percentToSplit < 0) {
        this.msg = `修改后的总比例${userTotalPercent}%大于全部可用比例${
          this.rowsInfo.totalEditablePercent
        },请核实`;
        return;
      }

      let { userCols, beComputedCols } = this.getCellModifyState();
      if (beComputedCols.length === 0 && percentToSplit > 0) {
        this.msg = `您填入的比例并不等于总共可编辑的比例,请核实`;
        return;
      }

      this.updateUserStaticCols(userCols);
      this.updatebeComputedCols(beComputedCols, percentToSplit);

      this.mixinUpdatePercentUnion(this.rows, this.cols, this.pDateDimension);
      this.isFinished = true;
    },
    // TODO
    mixinUpdatePercentUnion(data, cols, dateDimension) {
      //按天 D W    //按月   M Q

      let parentKey = "W";
      if (dateDimension === "M") parentKey = "Q";
      let props = "",
        sum0 = 0,
        sum1 = 0;
      let upDataChild = data[0];
      for (let i = 0; i < cols.length; i++) {
        props = cols[i].prop;
        if (
          props.substring(0, 1) === dateDimension ||
          props.substring(0, 1) === parentKey
        ) {
          for (let key in upDataChild) {
            if (props === key) {
              if (props.substring(0, 1) === dateDimension) {
                sum0 = sum0 + parseFloat(data[0][key].val);
                if (data[1][key].editable) {
                  sum1 = sum1 + data[1][key].val / 100;
                } else {
                  sum1 = sum1 + data[1][key].val;
                }
              } else if (props.substring(0, 1) === parentKey) {
                data[0][key].val = sum0;
                data[1][key].val = sum1;
                sum0 = 0;
                sum1 = 0;
              }
              break;
            }
          }
        }
      }
    },
    hApplyNewPercent() {
      if (!this.isFinished) {
        this.msg = "必须先点击计算，然后才能应用";
        return;
      }

      this.$emit("save", this.rows[0]);
      this.hCancel();
      return;
    }
  }
};
</script>
