<template>
  <div class="" style="position:relative;">
    <div class="h4">环比分析</div>
    <el-table
      :span-method="mixinTableCellMergin(rows,mixinMerginColNameArr,'val')"
      border
      :data="rows"
      :row-class-name="mixinRowClassName"
      width="100%">
      <el-table-column
        :show-overflow-tooltip="true"
        v-for="item in cols"
        :key="item.prop"
        :prop="item.prop" 
        :label="item.label"
        :fixed="item.fixed"
        :min-width = "mixincCellWidth[item.prop]"
        >
        <template slot-scope="scope">
          <!-- 
            
             :sortable="item.prop.substr(0,1)== pDateDimension"
             <span>{{scope.row[item.prop]}}</span> :class="mixinCellClass(scope.row,item.prop)" -->
      
          <div :class="mixinCellClass(scope.row,item.prop)">
            <span v-if="scope.row[item.prop].dataType=='percent'">{{scope.row[item.prop].val | percent }}</span>
            <span v-else :title="scope.row[item.prop].val">{{scope.row[item.prop].val }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import mixin from "./mixinTable.js";
export default {
  mixins: [mixin],
  beforeDestroy() {
    this._bus.$off(this._CONST.E_MONEYUNIT_CHANGE, this.changeMoneyUnit);
  },
  created() {
    this._bus.$on(this._CONST.E_MONEYUNIT_CHANGE, this.changeMoneyUnit);
  },
  computed: {
    collectDetail() {
      // 汇总
      let obj = {},
        _sumVal = 0,
        _sum = 0,
        _sumMom = 0,
        _sumYoy = 0,
        _obj = {},
        val = 0,
        editable = false;
      //  确定列
      this.mixinCBasicDataColumnNames.forEach(item => {
        _sumVal = 0;
        _sumMom = 0;
        _sumYoy = 0;
        _obj = {};
        let editable = false;
        this.detailData.forEach(it => {
          let _t = it.data.find(d => d.dateDimension == item);
          _sumVal += parseFloat(_t ? _t.val : 0);
          _sumMom += parseFloat(_t ? _t.mom : 0);
          _sumYoy += parseFloat(_t ? _t.yoy : 0);
          editable = _t.editable;
        });
        if (_sumMom == 0) {
          val = 0;
          editable = false;
        } else {
          val = _sumVal / _sumMom - 1;
        }
        obj[item] = {
          sumVal: _sumVal,
          sumMom: _sumMom,
          val,
          editable,
          isModified: false,
          dataType: "percent",
          sumYoy: _sumYoy,
          rownum: 1
        };
      });
      _sumVal = 0;
      _sumMom = 0;
      for (var key in obj) {
        if (key.substr(0, 1) == this.pDateDimension) {
          _sumVal += parseFloat(obj[key].sumVal);
          _sumMom += parseFloat(obj[key].sumYoy);
          //  第一行的汇总值，环比的汇总以同比为准
          // console.info(_sumVal,_sumMom)
        }
      }

      this.pColumnsDimension.forEach(item => {
        obj[item.prop] = {
          id: item.prop,
          val: "汇总",
          dataType: "string"
        };
      });

      obj["yearMonth"] = {
        val: this.pYearMonth,
        editable: false,
        rownum: 1
      };
      if (_sumMom == 0) {
        val = 0;
      } else {
        val = _sumVal / _sumMom - 1;
      }
      obj["sum"] = {
        val,
        realVal: _sumVal,
        yoy: _sumMom,
        isModified: false,
        editable: false,
        dataType: "percent",
        rownum: 1
      };
      obj.rowType = "汇总";

      return obj;
    },
    rows() {
      if (this.detailData.length == 0) {
        return [];
      }
      // 表格中的数据项
      let arr = [],
        _sumMom = 0,
        _sumVal = 0,
        val = 0,
        editable = false;
      // console.info("环比表中接收到的详细数据是：",this.detailData)
      arr.push(this.collectDetail);
      let preFix = this.pDateDimension;
      this.detailData.forEach(it => {
        let obj = {
          yearMonth: { val: this.pYearMonth }
        };

        // 不显示 - 采销的id
        this.pColumnsDimension.forEach(item => {
          let val = [it[item.prop].id, it[item.prop].name].join("-");
          if (item.label === "采销") {
            val = it[item.prop].name;
          }
          obj[item.prop] = {
            id: it[item.prop].id,
            val: val,
            dataType: "string"
          };
        });

        _sumVal = 0;
        _sumMom = 0;
        it.data.forEach(d => {
          let _preFix = d.dateDimension.substring(0, 1);
          if (d.mom == 0) {
            val = 0;
            editable: false;
          } else {
            val = d.val / d.mom - 1;
            editable = d.editable;
          }
          obj[d.dateDimension] = {
            realVal: d.val,
            editable,
            val,
            yoy: d.yoy,
            dataType: "percent"
          };
          if (_preFix === preFix) {
            // 这一行中有m1,m2,m3,q1，很明显，我们只对m进行求合。
            _sumVal += parseFloat(d.val);
            _sumMom += parseFloat(d.yoy);
            //  ****特殊的：环比（前一个周期与当前周期）中的月维度汇总就是同比（前一年与当前年）汇总
          }
        });
        if (_sumMom == 0) {
          val = 0;
        } else {
          val = _sumVal / _sumMom - 1;
        }
        obj["sum"] = {
          val,
          realVal: _sumVal,
          yoy: _sumMom,
          editable: false,
          dataType: "percent"
        }; // 最后一列
        obj["yearMonth"] = { val: this.pYearMonth, editable: false };
        arr.push(obj);
      });
      console.info("环比表的表格数据是：", arr);
      return arr;
    },
    cols() {
      return this.pColumns;
    }
  },
  data() {
    return {};
  },
  methods: {
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
            obj[col.prop] = row[col.prop].val;
          });
          return obj;
        });
      }
      json.unshift(tableHeader);
      return json;
    }
  }
};
</script>
