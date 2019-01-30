<template>
  <div :style="{position:'relative',align:'center',width:width}">
    <el-table :data="datas" style="width: 100%;" border :cell-style="getCellStyle" max-height="800">
      <el-table-column v-for="column in columns" :key="Math.random()" min-width="100"
                       :label="column.name" :prop="column.key" :fixed="column.fixed">
        <template slot-scope="scope">
          <div style="white-space: nowrap;overflow:hidden;" :title="scope.row[column.key]">{{ scope.row[column.key] }}</div>
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
    name:'range-table',
    props:{
      width:{
        type:String,
        required:false,
        default:function () {
          return '9.3rem';
        }
      },
      columns:{ // { name:'',key:'',isData:true,fixed:'left' }
        type:Array,
        required:true
      },
      datas:{
        type:Array,
        required:true
      },
      available:{
        type:Array,
        required:false,
        default:function () {
          return undefined;
        }
      }
    },
    data(){
      return {
        min:undefined,//库存可用周期最小值
        max:undefined,//库存可用周期最大值
        isFilter:false,//是否按照过滤规则重新设置颜色
      }
    },
    methods:{
      getCellStyle({row, column, rowIndex, columnIndex}){
//        console.log("getCellStyle:",rowIndex,"row:",row,"column:",column)
        let style = {};
        if(this.columns == undefined || this.datas == undefined)
          return style;

        if(row.subject == 'availablePeriod'){
          style = { 'font-weight':'bold'};
        }
        if(row.subject == 'purchase'){
          style['border-top'] = '2px solid #47A7E7';
        }
        let property = column.property;
        if(property == 'subjectName'){
          style['border-right'] = '1px solid #47A7E7';
        }
        if(property == 'id'){
          style['border-left'] = '1px solid #47A7E7';
        }

        if(row.subject != 'availablePeriod'){
          return style;
        }

        let columnSet = this.columns.filter(col => col.key == property)[0];
        if(columnSet.isData == undefined || columnSet.isData == false)
          return style; //{ background:'red' }

        let periodFilter = this.datas.filter(data => {
          return data.id == row.id && data.subject == 'availablePeriod';
        });
        if(periodFilter == undefined || periodFilter.length == 0)
          return style;

        let periodData = periodFilter[0];
        let value = periodData[property];

        if(this.isFilter == false){
          if(this.available == undefined == undefined)
            return style;
          let settingFilter = this.available.filter(set => {
            return set.id == row.id;
          });
          if(settingFilter == undefined || settingFilter.length == 0)
            return style;

          let setting = settingFilter[0];
          let danger = setting.danger == undefined ? 0 : setting.danger;
          let warning = setting.warning == undefined ? 0 : setting.warning;
          let normal = setting.normal == undefined ? 0 : setting.normal;
          if(value >= 0 && value <= danger){
            style.background = '#ed3f14';
            style.color = '#fff';
          }else if(value <= warning){
            style.background = '#f90';
            style.color = '#fff';
          }else if(value <= normal){
            style.background = '#19be6b';
            style.color = '#fff';
          }else{
            style.background = '#CCCCCC';
            style.color = '#fff';
          }
        }else{
          let min = this.min;
          let max = this.max;
          if( isNaN(min) && isNaN(max) ){
            return style;
          }else if( !isNaN(min) && isNaN(max)){
            if(value >= min){
              style.background = '#19be6b';
              style.color = '#fff';
            }
          }else if( isNaN(min) && !isNaN(max)){
            if(value <= max){
              style.background = '#19be6b';
              style.color = '#fff';
            }
          }else{
            if(value >= min && value <= max){
              style.background = '#19be6b';
              style.color = '#fff';
            }
          }
        }
        return style;
      },
      applyFilterRule(minVal = undefined,maxVal = undefined){//应用过滤规则
        this.isFilter = true;
        this.min = minVal;
        this.max = maxVal;
      },
      cancalFilterRule(){
        this.isFilter = false;
        this.min = undefined;
        this.max = undefined;
      }
    }
  }
</script>
