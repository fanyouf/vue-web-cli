<template>
  <div :style="{position:'relative',align:'center',width:width}" class="rangeTable">
    <el-table :data="datas" style="width: 100%;" border :cell-style="getCellStyle" max-height="800">
      <el-table-column v-for="column in columns" :key="Math.random()" min-width="100"
                       :label="column.name" :prop="column.key" :fixed="column.fixed">
        <template slot-scope="scope">
          <div style="white-space: nowrap;overflow:hidden;" :title="scope.row[column.key]">{{ scope.row[column.key] | valueFormatter(column.isData,isRatio) }}</div>
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
          return '98%';
        }
      },
      isRatio:{
        type:Boolean,
        required:false,
        default:function () {
          return false;
        }
      },
      colorRange:{
        type:Array,
        required:false,
        default:function () {
          return [];
        }
      },
      columns:{ // { name:'',key:'',isData:true,fixed:'left' }
        type:Array,
        required:true
      },
      datas:{
        type:Array,
        required:true
      }
    },
    data(){
      return {}
    },
    methods:{
      getCellStyle({row, column, rowIndex, columnIndex}){
//        console.log("getCellStyle:",rowIndex,"row:",row,"column:",column)
        let style = {};
        if(row.isTotal == true) style = { 'font-weight':'bold'};
        if(this.colorRange == undefined || this.columns == undefined) return style;

        let key = column.property;
        let columnProps = this.columns.find( (tmp,index) => {
          return tmp.key == key;
        });
        if(columnProps == undefined) return {};
        let isData = columnProps.isData;
        if(isData == true){
          let value = row[key];
          if(value == null || isNaN(value)) return style;

          let color = undefined;
          if(this.colorRange.length > 0){
            for(var i=0;i<this.colorRange.length;i++){
              if(this.colorRange[i].value == undefined){
                color = this.colorRange[i].color;
                continue;
              }
              let compareVal = this.isRatio == true ? this.colorRange[i].value / 100 : this.colorRange[i].value
              if(value <= compareVal){
                color = this.colorRange[i].color;
                break;
              }
            }
          }
          style = Object.assign(style,{ background : color });
          return style;
        }

        return style;
      },
    },
    filters:{
      valueFormatter(value,isData,isRatio){
        if(isData == undefined || isData == false)
          return value;
        if(isNaN(value) || value == null){
          return "-";
        }
        let format = value;
        if(isRatio == true){
          format =  value * 100;
        }
        format = parseFloat(format).toFixed(2);
        if(format.indexOf(".") != -1){
          let index = format.indexOf(".");
          let intVal = format.substr(0,index);
          let floatVal = format.substr(index+1,format.length);
          if(floatVal.length > 2){
            floatVal = floatVal.substr(0,2);
          }
          format = intVal + '.' + floatVal;
        }
        if(isRatio == true){
          format = format + '%';
        }
        return format;
      }
    }
  }
</script>
