<template>
  <div style="position:relative;">
    <div class="flexa">
      <div class="h4">明细</div>&nbsp;
      <Checkbox v-if="isShowExpendRate" v-model="isExpendRate">横向销售占比</Checkbox>
    </div>
    <el-table
      :class="{'editing':isEdit}"
      :span-method="spanMethod"
      border
      :data="rows"
      label-class-name="bold"
      @cell-click="hCellClick"
      @sort-change="mxSort"
      style="width: 100%"
    >
      <el-table-column
        :show-overflow-tooltip="true"
        v-for="item in pColumns"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        :fixed="item.fixed"
        :sortable="item.prop.substr(0,1)=== pDateDimension ? 'custom': false"
        :min-width="mixincCellWidth[item.prop]"
      >
        <template slot-scope="scope">
        <!--

        -->
          <!-- <span>{{scope.row[item.prop].editable}}</span> -->
          <div
            v-if="isEdit && editIndex==scope.$index && editProp ==item.prop && scope.row[item.prop].editable && scope.row[item.prop].dataType != 'percent'"
          >
            <Input
              @on-blur="hSaveModifyVal"
              ref="input"
              @click.prevent
              type="text"
              v-mustBenumber="'nonumber'"
              :value="scope.row[item.prop].val"
            />
          </div>
          <div v-else :class="mixinCellClass(scope.row,item.prop)">
            <span>{{mixinGetCellValue(scope.row,item.prop)}}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <ModifyPercent
      ref="dialog"
      @close="hCloseModifyPercent"
      @save="hSaveModifyPercent"
      :mixinCellClass="mixinCellClass"
      :mixinGetCellValue="mixinGetCellValue"
      :pDateDimension="pDateDimension"
      ></ModifyPercent>
  </div>
</template>
<style scoped>
.bold {
  font-weight: bold;
}
.detailTable input {
  flex: 1 1 80px;
  overflow: hidden;
}
.showEditIcon .iconSpan {
  visibility: visible;
  z-index: 1000;
  cursor: pointer;
}
.iconSpan {
  visibility: hidden;
}
.el-dialog__body {
  padding-top: 5px;
}
</style>
<script>
import mixin from "./mixinTable.js";
import tMXFuncs, { TMX } from "./tMX.vue.js";
import { mapMutations, mapGetters } from "vuex";
import ModifyPercent from "./tMXmodifyPercent";
const _ = require("lodash");

let _t = null;
export default {
  mixins: [mixin],
  components: {
    ModifyPercent
  },
  props: {
    // 在预测页中，要隐藏 横向时间占比
    isShowExpendRate: { type: Boolean, default: true }
  },
  beforeDestroy() {
    this._bus.$off(this._CONST.E_TOOLBAR_TOTOAL_CHANGE, this.modifyTotalValue);
  },
  created() {
    this._bus.$on(this._CONST.E_TOOLBAR_TOTOAL_CHANGE, this.modifyTotalValue);
  },
  data() {
    return {
      isExpendRate: false,

      isEditPercent: false,

      editIndex: -1,
      editProp: "",
      editInitValue: "",
      editValueType: "number", // number or percent

      percentData: [] // 百分比编辑时使用的数据,
    };
  },
  computed: {
    ...mapGetters("stack", ["getPageType"]),
    spanMethod() {
      _t = this.mixinTableCellMergin(
        this.rows,
        this.mixinMerginColNameArr,
        "val",
        "both"
      );
      return _t;
    },

    rows() {
      if (!this.detailData || this.detailData.length == 0) {
        return [];
      }
      let basicRows = this.getBasicRows();

      let basicRowsTemp = _.cloneDeep(basicRows);
      console.info(
        this.pColumnsDimension,
        this.pColumnsDimension.length,
        basicRowsTemp,
        this.mixinCBasicDataColumnNames
      );
      // 从最深的级别开始加入到baisceRows中
      for (var i = this.pColumnsDimension.length - 2; i >= 0; i--) {
        let colName = this.pColumnsDimension[i].prop;
        console.info(colName);
        let cLevelTotal = this._createTotal.bind(this)(
          basicRowsTemp,
          this.mixinCBasicDataColumnNames,
          colName
        );
        console.info(cLevelTotal);

        basicRows = this._insertLevelData(cLevelTotal, colName, basicRows);
      }

      let totalRow = this.getTotalRows();

      basicRows = [totalRow, ...basicRows];

      if (this.isExpendRate === false || this.isShowExpendRate === false) {
        basicRows = basicRows.filter(item => {
          return item.rowType != "percent";
        });
      }
      console.info("明细表格中的行：", basicRows);
      return basicRows;
    },
    cols() {
      return this.pColumns;
    }
  },

  methods: {
    ...tMXFuncs,
    hCellClick(row, column, cell, event) {
      console.info(row);
      event.stopPropagation();
      if (!this.isEdit || this.editIndex != -1) {
        return;
      }

      let _t = this.pColumns.find(it => it.label === column.label);
      if (!_t) {
        return;
      }
      if (!row[_t.prop].editable) {
        return;
      }

      this.editProp = _t.prop;
      this.editIndex = this.rows.findIndex(item => item == row);
      this.editInitValue = row[_t.prop].val;

      // 鼠标点击
      // 如果是百分比行，则弹出pop,如果是数值行，则不弹出pop

      if (row[this.editProp].dataType === "percent") {
        let percentRow = _.cloneDeep(this.rows[this.editIndex]);
        for (let pName in percentRow) {
          let item = percentRow[pName];
          if (item.dataType === "percent" && item.editable) {
            item.val = 100 * item.val;
          }
        }
        let percentData = [
          _.cloneDeep(this.rows[this.editIndex - 1]),
          percentRow
        ];
        this.$refs.dialog.show(percentData, this.pColumns);
      } else {
        this.editRowPrimaryKey = row.rowId;

        console.info(
          `进入编辑模式:类型是${row[this.editProp].dataType},编辑的行号是${
            this.editIndex
          },行主键是${this.editRowPrimaryKey}编辑的属性名是${
            this.editProp
          },初始值是:${this.editInitValue}`
        );

        let p = event.srcElement || event.target;
        while (p.nodeName != "TD") {
          p = p.parentNode;
        }
        setTimeout(() => p.getElementsByTagName("input")[0].focus());
      }
    },

    hModifySumVal(list, dt) {
      let total = list.reduce((val, item) => val + parseFloat(item.val), 0);

      if (total != 0) {
        list.forEach(item => {
          item.val = (dt * item.val) / total + parseFloat(item.val);
        });
      } else {
        list.forEach(item => {
          item.val = dt / list.length;
        });
      }
    },

    hSaveModifyVal(e) {
      //保存数据
      console.info("保存数据变化");
      let p = e.srcElement || e.target;
      let newValue = p.value.trim();
      if (newValue == "") {
        newValue = 0;
      }
      if (isNaN(newValue)) {
        this._info(`${newValue}不是数值,请输入数值型！`);
        // p.value = this.editInitValue
        // this.editIndex = -1
        return;
      }
      if (newValue == this.editInitValue) {
        //this.editProp
        this._info("数据列并没有改动");
        this.editIndex = -1;
        this.editProp = "";
        return;
      }
      console.info(`打算把${this.editInitValue}调整成${newValue}`);

      let dt = newValue - this.editInitValue;
      // 有两种情况，一是修改单个的数值，二是修改当前行的总值
      let listData = this.getItemToJustify(
        this.editRowPrimaryKey,
        this.editProp
      );
      let list = listData.list;

      if (list.length == 0) {
        throw new Error("找不到本次修改要影响的项");
        return;
      }
      //修改总值
      if (this.editProp === "sum") {
        let lockedSum = listData.lockedSum;
        if (newValue < lockedSum) {
          this._error("设定的总值过小,请重新设定!");
          return;
        }
        this.hModifySumVal(list, dt);
      }
      //修改单个的数值
      else if (this.editProp.substr(0, 1) == this.pDateDimension) {
        let modifyItem = list.find(item => item.dateDimension == this.editProp);
        if (!modifyItem) {
          throw new Error("找不到修改项");
        }
        modifyItem.val = newValue;
      }

      this.editIndex = -1;
      this.editProp = "";

      this.mixinUpdateHigherDimension(this.detailData);
      this.mxAddtoStack();
    },

    hCloseModifyPercent() {
      this.editIndex = -1;
    },
    hSaveModifyPercent(obj) {
      var editRowPrimaryKey = obj.rowId;

      let src = this.detailData.find(item => editRowPrimaryKey === item.rowId);

      if (!src) {
        throw new Error(`在源数据项${editRowPrimaryKey}中没有找到,不能保存`);
        return;
      }
      for (var key in obj) {
        if (obj[key].editable && key != "sum") {
          let o = src.data.find(item => item.dateDimension == key);
          if (o) {
            o.val = obj[key].val;
          } else {
            throw new Error(
              `在百分比中修改的字段${key}在源数据项${id}中没有找到`
            );
          }
        }
      }
      this.mixinUpdateHigherDimension(this.detailData);
      this.mxAddtoStack();
    }
  }
};
</script>

