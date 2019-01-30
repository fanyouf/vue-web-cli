<template>
    <div >
      <div style="margin:10px; color:red;cursor:pointer; padding:1em;text-align:center;border:1px solid #ccc;border-radius:5px;" @click="modal=true">{{cTitle}}</div>
      <Modal
        width="800" 
        v-model="modal"
        :title="cTitle"
        @on-ok="hSave"
        >
        <p class="mb5">{{cTip}}</p>
<div class="tablistArea">


        <el-table
            class=" editing"
            max-height="500"
            border
            stripe
            :data="rows"
            @cell-click="hCellClick"
            :row-class-name="hRowClassName"
            style="width: 100%">
            <el-table-column
              :show-overflow-tooltip="true"
              v-for="item in cols"
              :fixed="item.fixed"
              :key="item.prop"
              :label="item.label"
              :style="{color:'red'}"
              >
              <template slot-scope="scope">
                
                <div v-if="scope.row[item.prop]">
                  <div v-if="editIndex==scope.$index && editProp ==item.prop && scope.row[item.prop].editable">
                      <Input
                          @on-blur="hSaveDataChange"
                          ref="input" @click.prevent="" type="text" v-model="scope.row[item.prop].val"></Input>
                  </div>
                  <div v-else>
                      <span :class="{'cellCanEdit':scope.row[item.prop].editable}">{{scope.row[item.prop].val}}</span>
                  </div>
                </div>
                <div v-else><span>-</span></div>
              </template>
            </el-table-column>
          </el-table>
          </div>
      </Modal>
    </div>
</template>
<style scoped>
.bold {
  font-weight: bold;
}
</style>

<script>
const mixinGetRowprimaryKey = (rowObj, colNameList) => {
  let rs = colNameList.map(colName => {
    let obj = rowObj[colName];
    if (obj) {
      return obj.id || "";
    } else {
      return "";
    }
  });

  return rs.join(-"");
};

const DATATYPE_MAP = {
  ADD: "新增",
  REDUCE: "删减"
};

const getSign = dataType => {
  if (dataType === DATATYPE_MAP["ADD"]) {
    return 1;
  }
  return -1;
};

export default {
  props: {
    typeForTip: { type: String, required: true },
    pColumnsDimension: { type: Array },
    pDetail: { type: Array },
    pDateDimension: { type: String, required: true }
  },
  data() {
    return {
      modal: false,
      isEdit: true,

      editIndex: -1
    };
  },
  computed: {
    cTitle() {
      let obj = {
        target: "品牌/品类调整差异",
        summaryPlan: "SKU变动差异",
        skuPlan: "SKU变动差异"
      };

      return obj[this.typeForTip];
    },
    cTip() {
      let tipObj = {
        target:
          "以下品牌/品类发生了变动，点击“确认”后，下柜或删减的品牌/品类的目标值将标记为无效",
        summaryPlan:
          "以下SKU发生了变动，点击“确认”后，下柜及转出SKU的计划值将标记为无效",
        skuPlan:
          "以下SKU发生了变动，点击“确认”后，下柜及转出SKU的计划值将标记为无效"
      };
      return tipObj[this.typeForTip];
    },

    fixedColNameList() {
      return this.pColumnsDimension.map(item => item.prop);
    },
    dataColNameList() {
      return this.pDetail[0].data.map(item => item.dateDimension);
    },

    cols() {
      let cols = [{ prop: "dataType", label: "类型" }];
      this.pColumnsDimension.forEach(item => {
        cols.push({
          prop: item.prop,
          label: item.label
        });
      });
      if (this.pDetail[0]) {
        this.pDetail[0].data.forEach(item => {
          cols.push({
            prop: item.dateDimension,
            label: item.dateDimension
          });
        });
      }
      console.info("DiffAjustment.... 列：", cols);

      return cols;
    },
    rows() {
      let rows = this.pDetail.map(item => {
        let obj = { dataType: { val: DATATYPE_MAP[item.dataType] } };
        this.fixedColNameList.forEach(colName => {
          obj[colName] = {
            val: [item[colName].id, item[colName].name].join("-"),
            id: item[colName].id
          };
        });

        this.dataColNameList.forEach(colName => {
          let t = item.data.find(it => it.dateDimension === colName);
          if (t) {
            obj[colName] = { val: t.val, id: t.id, editable: t.editable };
          }
        });

        return obj;
      });

      // 计算第一行：汇总行。

      let sumRow = { rowType: "sum" };

      //pDateDimension
      this.cols.forEach(col => {
        if (col.prop.substring(0, 1) !== this.pDateDimension) {
          sumRow[col.prop] = { val: "汇总", editable: false };
        } else {
          let sum = 0;
          rows.forEach(row => {
            sum += row[col.prop].val * getSign(row.dataType.val);
          });

          sumRow[col.prop] = { val: sum, editable: false };
        }
      });
      rows = [sumRow, ...rows];
      console.info("DiffAjustment.... 行：", rows);
      return rows;
    }
  },
  methods: {
    hRowClassName(rs) {
      if (rs.row.rowType === "sum") {
        return "bold";
      }
    },

    hSaveDataChange(e) {
      //保存数据
      console.info("保存数据变化");
      let p = e.srcElement || e.target;
      let newValue = p.value;
      if (isNaN(newValue)) {
        this._info("请输入数值型！");
        p.focus();
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

      let list = this.pDetail.find(item => {
        return (
          this.editRowPrimaryKey ===
          mixinGetRowprimaryKey(item, this.fixedColNameList)
        );
      });
      if (!list) {
        throw new Error("找不到要编辑的行" + this.editRowPrimaryKey);
      }
      let modifyItem = list.data.find(
        item => item.dateDimension == this.editProp
      );
      if (!modifyItem) {
        throw new Error("找不到修改项");
      }
      modifyItem.val = newValue;

      this.editIndex = -1;
      this.editProp = "";

      // console.info(this.detailData, this.detailData);
    },
    hCellClick(row, column, cell, event) {
      event.stopPropagation();

      console.info(row, column, cell);
      // 鼠标点击
      // 如果是百分比行，则弹出pop
      // 如果是数值行，则不弹出pop
      let _t = this.cols.find(it => it.label === column.label);

      if (!_t) return;
      if (!row[_t.prop].editable) return;

      this.editIndex = this.rows.findIndex(item => item == row);
      this.editProp = _t.prop;

      this.editInitValue = row[_t.prop].val;
      this.editRowPrimaryKey = mixinGetRowprimaryKey(
        row,
        this.fixedColNameList
      );

      console.info(
        `进入编辑模式:类型是${row[this.editProp].dataType},编辑的行号是${
          this.editIndex
        },行主键是${this.editRowPrimaryKey}编辑的属性名是${
          this.editProp
        },初始值是:${this.editInitValue}`
      );
      {
        //console.info("click................",event);
        let p = event.srcElement || event.target;
        while (p.nodeName != "TD") {
          p = p.parentNode;
        }
        setTimeout(() => p.getElementsByTagName("input")[0].focus());
      }
    },
    hSave() {
      this.$emit("saveDiff");
    }
  }
};
</script>
