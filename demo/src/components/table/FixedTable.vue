<template>
  <div>
    <!--:span-method="arraySpanMethod"-->

    <el-table :data="tableData6" border>

      <el-table-column v-for="column in columns" :key="Math.random()"
                       :label="column.label" :prop="column.prop"
                       :sortable="column.sortable == true" >
        <template slot-scope="scope">
          <!--style="background: green;color: #FFF;"-->
          <div v-if="column.subColumns == undefined" :style="{ color:'black','text-align':'center',background:getShowColor(scope.row,column.prop)}">
            {{ scope.row[column.prop] }}
          </div>
        </template>
        <el-table-column v-if="column.subColumns.length > 0" v-for="sub in column.subColumns" :key="Math.random()"
                         :label="sub.label" :prop="sub.prop" :sortable="sub.sortable == true" >
          <template slot-scope="scope">
            <div v-if="sub.isData == true" :style="{ color:'black','text-align':'center',background:getShowColor(scope.row,sub.prop) }">
              {{ scope.row[sub.prop] }}
            </div>
            <div v-else>
              {{ scope.row[sub.prop] }}
            </div>
          </template>
        </el-table-column>
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

  export default{
    name:'FixedTable',
    data(){
      return {
        tableData6: [
          {
            id: '12987122',
            name: '小高',
            amount1: '234',
            amount2: '3.2',
            amount3: 10,
            start:2,
            end:3,
            cate:13445,
            yoy:0.1
          },
          {
            id: '12987123',
            name: '小刘',
            amount1: '165',
            amount2: '4.43',
            start:1,
            end:3,
            gmv:36553
          },
          {
            id: '12987124',
            name: '王小虎',
            amount1: '369',
            amount2: '1.9',
            start:2,
            end:4,
            profit:897,
            rate:0.89,
            target:96553
          }
        ],
      }
    },
    computed:{
      columns(){
        //{label:'',prop:'',sortable:false,isData:false}
        let columns = [];

        let column1 = {label:'表头'};
        let subColumns1 = [];
        subColumns1.push({label:'ID',prop:'id',sortable:false,isData:false});
        subColumns1.push({label:'品类',prop:'cate',sortable:false,isData:false});
        column1.subColumns = subColumns1;
        columns.push(column1);

        let column2 = {label:'GMV表头'};
        let subColumns2 = [];
        subColumns2.push({label:'GMV',prop:'gmv',sortable:true,isData:true});
        subColumns2.push({label:'目标GMV',prop:'target',sortable:true,isData:true});
        column2.subColumns = subColumns2;
        columns.push(column2);

        let column3 = {label:'数值1',prop:'amount1',sortable:true,isData:true};
        columns.push(column3);

        let column4 = {label:'销售毛利'};
        let subColumns4 = [];
        subColumns4.push({label:'毛利',prop:'profit',sortable:true,isData:true});
        subColumns4.push({label:'毛利率',prop:'rate',sortable:true,isData:true});
        subColumns4.push({label:'毛利同比',prop:'yoy',sortable:true,isData:true});
        column4.subColumns = subColumns4;
        columns.push(column4);

        return columns;
      },
      colorRange(){
        let colorRange = [];
        //{value:100,color:''}
        let range1 = {value:100,color:'#FAF3DA'};
        let range2 = {value:300,color:'#E8F3DA'};
        let range3 = {value:2000,color:'#DFEFF9'};
        let range4 = {value:10000,color:'#EFE9F1'};

        colorRange.push(range1,range2,range3,range4);
        return colorRange;
      }
    },
    methods:{
      arraySpanMethod({ row, column, rowIndex, columnIndex }) {
        //console.log("合并单元格",row,"列：",column,"行：",rowIndex);
        if(row.start != undefined && columnIndex == row.start){
          return [1,row.end - row.start ];
        }
      },
      getShowColor(row,prop){
        //console.log(row,prop,this.colorRange);
        let val = row[prop];
        if(val == undefined) return 'white';

        let color = "#DFEFF9";
        if(this.colorRange.length > 0){
          for(var i=0;i<this.colorRange.length;i++){
            if(val < this.colorRange[i].value){
              color = this.colorRange[i].color;
              break;
            }
          }
        }
        return color;
        if(val < 100){
          return 'red';
        }else if(val <300){
          return 'black';
        }else if(val < 2000){
          return 'green';
        }else{
          return 'blue';
        }
      }
    }
  }
</script>
