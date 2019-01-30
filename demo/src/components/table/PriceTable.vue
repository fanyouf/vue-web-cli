<template>
  <!--单元格合并表格，element-ui组件，http://element.eleme.io/#/zh-CN/component/table-->
  <div>
   <!-- {{rows}}<br/>
    {{column}}<br/>-->
    <el-table
      :data="rows"
      border
      style="width: 100%">
      <el-table-column
        prop="id"
        label="品类ID"
        width="100">
        <template slot-scope="scope">
          <div  v-if="scope.row.priceName.indexOf('页面')>-1">
            <el-button
                      @click="handleClick(scope.row)" type="text" size="small">
                      <i v-if="!scope.row.expand"class="el-icon-arrow-right"></i>
                     <i v-if="scope.row.expand"class="el-icon-arrow-down"></i>
          </el-button>
                    <span>{{scope.row.id}}</span>
          </div>
          <div v-else>
            <span   style="margin-left:20px">{{scope.row.id}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        width="90"
        label="品类名称">
      </el-table-column>
      <el-table-column
           prop="skuId"
           width="80"
           label="ID">
         </el-table-column>
      <el-table-column
        prop="skuName"
        width="300"
        label="名称">
      </el-table-column>
      <el-table-column
         prop="priceName"
         width="100"
         label="">
       </el-table-column>

      <ColumnCell
         v-for="item in column"
         :key="item.prop"
         :label="item.label"
        :prop="item.prop"></ColumnCell>
    </el-table>
  </div>
</template>

<script type="text/ecmascript-6">
  import Vue from 'vue';
  import { Table, TableColumn } from 'element-ui'
  import 'element-ui/lib/theme-chalk/index.css'
  import ColumnCell from'./PriceTableCell';
  Vue.use(Table)
  Vue.use(TableColumn)

  export default{
    props: {
      isWarehousePrice: {
        type: Boolean,
        required: false,
        default: false
      },
      title: {
                 type: String,
                 required: false,
                 default:""
               },
      column: {
            type: Array,
            required: false,
            default: function () {
              return [];
            }
          },
      tableData: {
             type: Array,
             required: false,
             default: function () {
               return [];
             }
           },
    },
    components:{ColumnCell},
    computed:{
      rows(){
        return this.changShowData();
      }
    },
    data(){
      return {
        expandKey:"页面",
        currentEditIndex:1,
        expandList:[],
        data:[],
      }
    },
    methods:{
      changShowData(){
        let dataShow=[];
        for(let i=0;i<this.tableData.length;i++){
                let find=false;
                for(let j=0;j<this.expandList.length;j++){
                  if(this.expandList[j].skuId==this.tableData[i].skuId&&this.expandList[j].flag)   {
                    find=true;
                  }
                }
                if(find) {
                  if(this.tableData[i].priceName&&this.tableData[i].priceName.indexOf("页面")>-1) {
                    let info=  this.tableData[i];
                    info.expand=true;
                    dataShow.push(info);
                  } else {
                    if(this.tableData[i].priceName&&this.tableData[i].priceName.indexOf("仓报")>-1)  {
                        if(this.isWarehousePrice)  dataShow.push(this.tableData[i]);
                    } else{
                      dataShow.push(this.tableData[i]);
                    }
                  }
                }
                else if(this.tableData[i].priceName&&this.tableData[i].priceName.indexOf("页面")>-1) {
                  let info=  this.tableData[i];
                  info.expand=false;
                  dataShow.push(info);
                }
        }
        return dataShow
      },
      handleClick(d){
        let find=false;
        for(var i=0;i<this.expandList.length;i++){
          if(this.expandList[i].skuId==d.skuId){
            this.expandList[i].flag=!d.expand;
            find=true;
          }
        }
        if(!find){
          this.expandList.push({
            skuId: d.skuId,
            flag:!d.expand
          })
        }
        this.changShowData(!d.expand)
      },
    },
    watch:{
      tableData(){
        this.data = this._utils.cloneObj(this.tableData);
      }
    }
  }
</script>

<style></style>
