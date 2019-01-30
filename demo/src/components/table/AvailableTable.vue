<template>
  <!--StockCover报表可用周期设置表格-->
  <div class="saledetail">
    <el-table :data="cloneDatas" style="width: 100%;" border :cell-style="getCellStyle">
      <el-table-column label="ID" width="100" prop="id">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="名称" width="180" prop="name">
        <template slot-scope="scope">
          <span style="margin-left: 10px;white-space: nowrap;overflow:hidden;" :title="scope.row.name">{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="周期" width="100" prop="period">
        <template slot-scope="scope">
          <span>{{ scope.row.period }}</span>
        </template>
      </el-table-column>

      <el-table-column label="危险" prop="danger">
        <template slot-scope="scope">
          0
          -
          <Input style="width: 60px;line-height:20px;" v-model="scope.row.danger"/>
        </template>
      </el-table-column>

      <el-table-column label="预警" prop="warning">
        <template slot-scope="scope">
          <span>{{ scope.row.danger }}</span>
          -
          <Input style="width: 60px;line-height:20px;" v-model="scope.row.warning"/>
        </template>
      </el-table-column>

      <el-table-column label="正常" prop="normal">
        <template slot-scope="scope">
          <span>{{ scope.row.warning }}</span>
          -
          <Input style="width: 60px;line-height:20px;" v-model="scope.row.normal"/>
        </template>
      </el-table-column>

      <!--:render-header="renderHeader"-->
      <el-table-column label="滞销" prop="poorSale">
        <template slot-scope="scope">
          <span> >= {{ scope.row.normal }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import Vue from 'vue';
  import { Table, TableColumn } from 'element-ui'
  import 'element-ui/lib/theme-chalk/index.css'
  Vue.use(Table);
  Vue.use(TableColumn);

  export default {
    props:{
      datas:{
        type:Array,
        required:true
      }
    },
    data(){
      return {
        cloneDatas:[],
      }
    },
    methods:{
      getCellStyle({row, column, rowIndex, columnIndex}){
//        console.log("getCellStyle:",rowIndex,"row:",row,"column:",column)
        let style = {};
        if(column.property == 'danger'){
          style.background = '#ed3f14';
          style.color = '#fff';
        }
        if(column.property == 'warning'){
          style.background = '#f90';
          style.color = '#fff';
        }
        if(column.property == 'normal'){
          style.background = '#19be6b';
          style.color = '#fff';
        }
        if(column.property == 'poorSale'){
          style.background = '#CCCCCC';
          style.color = '#fff';
        }
        style['text-align'] = 'center';
        return style;
      },
      renderHeader(h,{ column }){
        console.log("title render",column)
        return h('div', {
          style: {
            background: 'red',
            color:'white',
            'width':column.realWidth + 'px',
            'text-align':'center'
          },
        },[
          column.label ,
        ]);
      }
    },
    mounted(){
      if(this.datas != undefined && this.datas.length > 0){
        this.cloneDatas = this._utils.cloneObj(this.datas);
      }
    }
  }
</script>
