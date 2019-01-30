<template>
  <!--单元格合并表格，element-ui组件，http://element.eleme.io/#/zh-CN/component/table-->
  <div style="height: 300px;">
    <el-table
      :data="tableData6"
      :span-method="arraySpanMethod"
      border
      style="width: 70%">
      <el-table-column
        prop="id"
        label="ID"
        width="180">
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名">
      </el-table-column>
      <el-table-column
        prop="amount1"
        sortable
        label="数值 1">
        <template slot-scope="scope">
          <div style="background: green;color: #FFF;">
            {{ scope.row.amount1 }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="amount2"
        sortable
        label="数值 2">
      </el-table-column>
      <el-table-column
        prop="amount3"
        sortable
        label="数值 3">
      </el-table-column>
    </el-table>

  </div>
</template>

<script type="text/ecmascript-6">
  import Vue from 'vue';
  import { Table, TableColumn } from 'element-ui'
  import 'element-ui/lib/theme-chalk/index.css'

  Vue.use(Table)
  Vue.use(TableColumn)

  export default{
    data(){
      return {
        tableData6: [
          {
            id: '12987122',
            name: '王小虎',
            amount1: '234',
            amount2: '3.2',
            amount3: 10,
            start:2,
            end:3
          },
          {
            id: '12987123',
              name: '王小虎',
              amount1: '165',
              amount2: '4.43',
              start:1,
              end:3
          },
          {
            id: '12987124',
              name: '王小虎',
              amount1: '324',
              amount2: '1.9',
              start:2,
              end:4
          }
        ]
      }
    },
    methods:{
      arraySpanMethod({ row, column, rowIndex, columnIndex }) {
        //console.log("合并单元格",row,"列：",column,"行：",rowIndex);
        if(row.start != undefined && columnIndex == row.start){
          return [1,row.end - row.start ];
        }
//        if (rowIndex % 2 === 0) {
//          if (columnIndex === 2) {
//            return [1, 2];
//          } else if (columnIndex === 1) {
//            return [0, 0];
//          }
//        }
      },
    }
  }
</script>

<style></style>
