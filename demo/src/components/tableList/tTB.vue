<template>
  <div class="" style="position:relative;">
    <div class="h4">同比分析</div>
    <div v-show="jiariMark.length && jiariName">当前同比校准：{{jiariName}}</div>
    <!--
       :span-method="objectSpanMethodMX"
    
      @sort-change="sortChange"
     -->
    <el-table
    :class="{'editing':isEdit}" 
      border
      :data="rows"
      @cell-click="hCellClick"
      
      :span-method="mixinTableCellMergin(rows,mixinMerginColNameArr,'val','both')"
      :row-class-name="mixinRowClassName"
      style="width: 100%">
        <!-- 
          :min-width = "mixincCellWidth[item.prop]" 
        
        :sortable="item.prop.substr(0,1)== pDateDimension"
        -->
      <el-table-column
        v-for="item in cols"
        :show-overflow-tooltip="true"
        :fixed="item.fixed"
        :key="item.prop"
        :prop="item.prop" 
        :label="item.label"
        
        :style="{color:'red'}"
        :label-class-name="tbMarkList.includes(item.prop) ? 'tbmark' : ''"
        :min-width = "mixincCellWidth[item.prop]"
        >
        <template slot-scope="scope">
          <!-- <span>{{scope.row[item.prop]}}</span>
          
          :min-width = "mixincCellWidth[item.prop]"
          -->
          <div class="flexa" v-if="isEdit && editIndex==scope.$index && editProp ==item.prop && scope.row[item.prop].editable"
            >
            <Input
                  @on-blur="hSaveDataChange"
                  ref="input" @click.prevent="" size="small" type="text" v-model="scope.row[item.prop].val"></Input><span>%</span>
          </div>
          
          <div v-else 
          :class="mixinCellClass(scope.row,item.prop)"
          :title="isEdit && scope.row[item.prop].editable ? '点击可编辑' : ''"
          >
          <!-- <span>{{scope.row[item.prop].val | int }}%</span> -->
          <!-- <span>{{mixinGetCellValue(scope.row,item.prop)}}</span> -->
             <span v-if="scope.row[item.prop].dataType=='percent'">{{scope.row[item.prop].val | int(1) }}%</span>
            <span v-else :title="scope.row[item.prop].val">{{scope.row[item.prop].val }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<style>
.editing .cellCanEdit {
  cursor: pointer;
}
.tbmark {
  color: red;
}
</style>
<script>
import mixin from "./mixinTable.js";
import tTBFunc from "./tTB.vue.js";
export default {
  mixins: [mixin],
  props: {
    jiariName: { type: String, default: "" },
    jiariMark: { type: Array, default: () => [] } // 同比校准中涉及的月份列表
  },
  beforeDestroy() {
    this._bus.$off(this._CONST.E_MONEYUNIT_CHANGE, this.changeMoneyUnit);
  },
  created() {
    this._bus.$on(this._CONST.E_MONEYUNIT_CHANGE, this.changeMoneyUnit);

    this.tbMarkList = this.jiariMark;
  },
  computed: {
    rows() {
      let basicRows = this.getRows();
      console.info("同比的行.........................", basicRows);

      return basicRows;
    },
    cols() {
      if (
        this.jiariMark &&
        Array.isArray(this.jiariMark) &&
        this.jiariMark.length
      ) {
        this.pColumns.forEach(item => {
          if (this.jiariMark.includes(item.prop)) item.className = "tbmark";
        });
      }
      return this.pColumns;
    }
  },
  data() {
    return {
      moneyUnit: "yuan",
      editRow: null,
      editIndex: -1,
      editId: -1, //editId和editname一起来确定当前编辑的是哪一行数据
      editName: "", //editId和editname一起来确定当前编辑的是哪一行数据
      editProp: "",
      editInitValue: "",
      editValueType: "number", // number or percent
      tbMarkList: []
    };
  },
  methods: {
    ...tTBFunc,
    hCellClick(row, column, cell, event) {
      if (!this.isEdit) return;
      if (row[column.label].editable === false) {
        return;
      }
      // console.info(row,column,cell)
      this.editRow = row;
      this.editIndex = this.rows.findIndex(item => item == row);
      this.editProp = column.label;
      this.editInitValue = row[column.label].val;
      // console.info(row,column.label,row[column.label])
      // console.info(row[column.label].editable)

      this.editRowPrimaryKey = this.mixinGetRowprimaryKey(
        row,
        this.mixinMerginColNameArr.length
      );

      console.info(
        `进入编辑模式:编辑的行号是${this.editIndex}，数据类型:${
          row[column.label].dataType
        },编辑的属性名是:${this.editProp},editRowPrimayKey:${
          this.editRowPrimaryKey
        }`
      );

      let node = event.target;
      while (node && node.nodeName != "TD") {
        node = node.parentNode;
      }

      console.info("..............................", node);
      setTimeout(() => {
        let input = node.getElementsByTagName("input");
        if (input) {
          input[0].focus();
        }
      }, 200);
    },
    isNeedJiariMark(item) {
      let rs = "";
      if (this.jiariMark.includes(item.prop)) {
        rs = "tbmark";
      }
      console.info(this.jiariMark, item, rs);
      return rs;
    },
    /*
     * 调整某个子项的同比百分比，只会影响它自己的值。
     */
    saveSingleModify(newPercentValue) {
      //算出newPercentValue这个百分比 对应的数据值
      var cell = this.editRow[this.editProp];
      // (val1  - yoy) / yoy = tb1
      // (val2  - yoy) / yoy = tb2
      // val2 = (val1-yoy)*tb2/tb1 + yoy
      var newValue =
        ((cell.realVal - cell.yoy) * newPercentValue) / this.editInitValue +
        cell.yoy;
      // var newValue = newPercentValue * oldValue / this.editInitValue;
      // console.info(`把${this.editInitValue}%改成${newPercentValue} 等价于把 ${cell.realVal}改成${newValue}`);

      // 同等应用到明细上
      let _t = this.detailData.find(
        item =>
          this.editRowPrimaryKey ===
          this.mixinGetRowprimaryKey(item, this.mixinMerginColNameArr.length)
      );
      let t = _t.data.find(d => d.dateDimension == this.editProp);
      if (!t) {
        throw new Error(`在明细中没有找到调整的数据:${this.editRowPrimaryKey}`);
        return;
      } else {
        t.val = newValue;
      }
    },
    /**
     * 调整第一行的同比百分比，则同一列的其它数据也会变化。
     * 相当于改了总数
     */
    modifyTotalValue(newPercentValue) {
      //算出newPercentValue这个百分比 对应的数据值
      var cell = this.editRow[this.editProp];
      // (val1  - yoy) / yoy = tb1
      // (val2  - yoy) / yoy = tb2
      // val2 = (val1-yoy)*tb2/tb1 + yoy
      var newValue =
        ((cell.sumVal - cell.sumYoy) * newPercentValue) / this.editInitValue +
        cell.sumYoy;
      //var newValue = newPercentValue * oldValue / this.editInitValue;
      // console.info(`把${this.editInitValue}%改成${newPercentValue} 等价于把 ${cell.sumVal}改成${newValue}`);

      // 总值变化的比例幅度
      var newPercentForVal = newValue / cell.sumVal;
      if (cell.sumVal == 0)
        newPercentForVal = newValue / this.detailData.length;
      // 同等应用到明细上
      this.detailData.forEach(it => {
        let t = it.data.find(d => d.dateDimension == this.editProp);
        t.val = t.val * newPercentForVal;
        if (cell.sumVal == 0) t.val = newPercentForVal;
      });
    },

    hSaveDataChange(e) {
      //  input框失去了焦点。数据可能发生了变化
      let newValue = e.srcElement.value;
      if (isNaN(newValue)) {
        this.hInputBlur(e);
        this._error("输入的为非数值型");
        return;
      } // TODO: 对newValue进行验证
      if (newValue == this.editInitValue) {
        this.editIndex = -1;
        this.editProp = "";
        this._info("数据并没有改动");
        return;
      }

      // console.info(`打算把${this.editInitValue}调整成${newValue}`)
      if (this.editIndex === 0) {
        this.modifyTotalValue(newValue); //如果是同比汇总发生变化
      } else {
        this.saveSingleModify(newValue); //如果是其他值发生变化
      }
      this._info("数据调整成功");
      this.mixinUpdateHigherDimension(this.detailData).mxAddtoStack();
      this.editIndex = -1;
    },

    exportToJson() {
      let tableHeader = {};
      this.cols.forEach(col => {
        tableHeader[col.prop] = col.label;
      });
      let json = [];
      if (this.rows) {
        json = this.rows.map(row => {
          let obj = {};
          this.cols.forEach(col => {
            if (row[col.prop].dataType === "percent") {
              // 由于在前端显示时，对百分比值*100,现在要除回去
              obj[col.prop] = row[col.prop].val / 100;
            } else {
              obj[col.prop] = row[col.prop].val;
            }
          });
          return obj;
        });
      }
      json.unshift(tableHeader);
      return json;
    }
  },
  watch: {
    jiariMark() {
      this.tbMarkList = this.jiariMark;
    }
  }
};
</script>
