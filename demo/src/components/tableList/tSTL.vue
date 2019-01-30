<template>
  <div class="" style="position:relative;">
    <div class="h4">渗透率</div>

      <!-- @sort-change="sortChange" -->
        <!-- :sortable="item.prop.substr(0,1)== pDateDimension" -->
    <el-table
      ref="table"
      @cell-click="hCellClick"
      border
      :data="rows"
      :class="{'editing':isEdit}"
      :span-method="mixinTableCellMergin(rows,mixinMerginColNameArr,'val','both')"
      style="width: 100%">
      <el-table-column
        :show-overflow-tooltip="true"

        v-for="item in pColumns"
        :key="item.prop"
        :prop="item.prop"
        :fixed="item.fixed"
        :label="item.label"
        :min-width = "mixincCellWidth[item.prop]"
        >
        <template slot-scope="scope">
          <div v-if="isEdit && editIndex==scope.$index && editProp ==item.prop && scope.row[item.prop].editable && scope.row[item.prop].dataType !='percent'"
              >
            <Input
              @on-blur="hSaveSumNumberModify"
              ref="input"
              @click.prevent=""
              v-model="scope.row[item.prop].val"></Input>
          </div>
          <div v-else :class="mixinCellClass(scope.row,item.prop)">
            <span>{{mixinGetCellValue(scope.row,item.prop)}}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div :style="popStyle" ref="pop" draggable="true" v-draggable v-show="isPopVisible" v-clickoutside="()=>{this.isPopVisible=false}">
      <tSTLmodifyPercent
        @modifyPercentCancel="isPopVisible=false"
        @savePercentListModify="savePercentListModify"
        :pPercentData="editPercentData"
        :pEditProp="editProp"

      ></tSTLmodifyPercent>
    </div>
  </div>
</template>
<style scoped>
.editing .cellCanEdit {
  cursor: pointer;
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
</style>
<script>
import mixin from "./mixinTable.js";
import tSTLFunc from "./tSTL.vue.js";
import tSTLmodifyPercent from "./tSTLmodifyPercent";
const _ = require('lodash')
export default {
  mixins: [mixin],
  data() {
    return {
      moneyUnit: "yuan",
      editIndex: -1,
      editId: -1, //editId和editname一起来确定当前编辑的是哪一行数据
      editName: "", //editId和editname一起来确定当前编辑的是哪一行数据
      editProp: "",
      editInitValue: "",
      editValueType: "number", // number or percent
      popStyle: {
        //  百分比修改
        backgroundColor: "#fff",
        top: "30px",
        left: "50px",
        position: "absolute",
        zIndex: 1000,
        width: "100%",
        border: "2px solid #DDD",
        boxShadow: "2px 2px 2px #000",

      },
      isPopVisible: false,
      editPercentData: [], // 百分比编辑时使用的数据,
      editPercentDataInfo: { totalValue: 0, totalPercent: 0, sumValue: 0 },
      isPercentTableComputed: false
    };
  },
  components:{
    tSTLmodifyPercent
  },

  computed: {
    rows() {
      let basicRows = this.getRows();
      return basicRows;
    },
    cols() {
      return this.pColumns;
    }
  },

  methods: {
    ...tSTLFunc,
    hCellClick(row, column, cell, event) {
      // 鼠标点击，如果是百分比行，则弹出pop； 如果是数值就是修改总值
      // 整个表格处于不可编辑状态时，单击单元格是无效的
      if (!this.isEdit || row[column.label].editable === false) {
        return;
      }

      console.info("鼠标点击的事件参数", row, column, cell);
      this.editIndex = this.rows.findIndex(item => item === row);
      this.editProp = column.label;
      this.editInitValue = row[column.label].val;

      this.editRowPrimaryKey = row.rowId;

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
      if (row[column.label].dataType === "percent") {
        this.initPercentEdit(node);
      } else {
        setTimeout(() => {
          // 加延迟的原因是 editIndex的变化与视图相关
          let input = node.getElementsByTagName("input");
          if (input) {
            input[0].focus();
          }
        }, 200);
      }
    },
    /**
     * 初始化渗透率编辑状态数据
     */
    initPercentEdit(node) {
      // console.info("percent....");
      setTimeout(() => {
        this.isPopVisible = true;
      }, 100);

      this.initModelPosition(node);

      this.editPercentData = this.rows.map((item,index) => {
        return _.cloneDeep(item[this.editProp])
      });
    },

    /**
     * 设置渗透率弹窗的位置
     */
    initModelPosition(node) {
      let table = this.$refs.table.$el.querySelector(".el-table__body-wrapper")
        .scrollLeft;
      console.info(table);

      this.popStyle.top = node.parentNode.parentNode.offsetTop + 29 + "px";
      this.popStyle.left = node.offsetLeft + 65 - table + "px";
      this.popStyle.width = node.offsetWidth + 21 + "px";
    },

    isAllEditableSumValEqualZero(prop) {
      let len = 0;
      let valArr = this.detailData.map(item => {
        let obj = item.data.find(
          it => it.dateDimension === prop && it.editable
        )

        if (obj) {
          len++;
          return obj.val;
        } else {
          return 0;
        }
      });

      let sum = valArr.reduce((initVal, val) => {
        return initVal * 1 + val * 1;
      }, 0);

      return { sum, len };
    },

    /***
     * 等分比例
     */
    equalDivide(prop, newVal, oldVal, len) {
      let equalVal = (newVal - oldVal) / len;
      this.detailData.forEach(item => {
        let obj = item.data.find(
          it => it.dateDimension === prop && it.editable
        );
        if (obj) {
          obj.val = equalVal;
        }
      });
    },


    savePercentListModify({percentData,prop}){
      let totalNumber = percentData[0].backVal;
      percentData.forEach(item => {
        if (item.dataType === "percent" && item.editable) {
          let src = this.detailData.find(row=>row.rowId === item.id);
          if (!src) {
              throw new Error(`在源数据项${item.id}中没有找到,不能保存`);
              return;
          }
          let o = src.data.find(it => it.dateDimension === prop);
          if (o) {
              o.val = (totalNumber * item.val) / 100;
          } else {
              throw new Error(
              `在百分比中修改的字段${key}在源数据项${id}中没有找到`
              );
          }
          }
      });
      this.mixinUpdateHigherDimension(this.detailData).mxAddtoStack();
      this.isPopVisible = false;
    },


    /**
     * 响应保存渗透率中的修改总值
     */
    hSaveSumNumberModify(e) {
      //  input框失去了焦点。数据可能发生了变化
      let newValue = e.srcElement.value;
      if (isNaN(newValue)) {
        this._info("渗透率的总值必须是数值！");
        this.hInputBlur(e);
        return;
      }
      // TODO: 对newValue进行验证
      if (newValue == this.editInitValue) {
        this.editIndex = -1;
        this.editProp = "";
        this._info("数据并没有改动");
        return;
      }
      this.doModifyTotalNum(newValue, this.editInitValue, this.editProp)
        .mixinUpdateHigherDimension(this.detailData)
        .mxAddtoStack();
      this.editIndex = -1;
    },
    /***
     * 修改总值的具体操作
     */
    doModifyTotalNum(newValue, oldValue, prop) {
      // 获取 比例值

      let p = [];
      console.info("---------------渗透率调整总值-----");

      let rs = this.isAllEditableSumValEqualZero(prop);
      if (rs.sum === 0) {
        this.equalDivide(prop, newValue, oldValue, rs.len);
      } else {
        this.rows.forEach(item => {
          if (item.rowType === "percent") {
            let id = item.rowId
            let percent = item[prop].val;
            let obj = this.detailData.find((row)=>row.rowId === id);
            if (!obj) {
              console.warn(
                `渗透率更改错误，没有在数据源中找到id=${id}的数据`
              );
            } else {
              let d = obj.data;
              let objitem = d.find(
                item => item.dateDimension === prop && item.editable
              );
              if (!objitem) {
                console.warn(
                  `渗透率更改错误，没有在数据源id=${id}中没有找到属性${prop}`
                );
              } else {
                objitem.val = percent * newValue;
              }
            }
          }
        });
      }
      return this;
    }
  }
};
</script>
