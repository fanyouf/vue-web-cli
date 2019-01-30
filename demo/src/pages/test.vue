<template>
<div>

  <div style="padding:50px;">
      <h1>表单</h1>

  </div>
  <!-- <IPCTable 
  :pFixedCols="fixedCols"
  :pColsData="colsData" 
  :pRowsData="rowsData"
  :pMergeCols="mergeCols"
  pFixedHeight=500
  pValKey="val">
  </IPCTable> -->
 <hr>
<h1>基本使用</h1> 
    <IPCTable 
      :pColsData="colsData2" 
      :pRowsData="rowsData1"
      :pFixedHeight="500">
    </IPCTable>
  <!-- <hr>
 <hr>
<h1>基本使用</h1> 
    <IPCTable 
      :pColsData="colsData1" 
      :pRowsData="rowsData1"
      :pFixedHeight="500">
    </IPCTable>
  <hr>
    <IPCTable 
    :pIsEdit="true"
      :pColsData="colsData" 
      :pRowsData="rowsData"
      pValKey="val">
    </IPCTable> -->
<!-- 
  <h2 v-jumpNumber="2">50000.</h2>

  <div>100</div>
  <BaseMultiSortSelector
      v-model="dataSource"
      @drag-start="hDragStart"
  >

  </BaseMultiSortSelector>

  <button @click="click">ok</button>
  <BaseTriangleList
    :width="500"
    :height="400"
    :percentList="[50,30,20]"
    v-model="dataSource1"
    :digestNumber="3"
  >
  </BaseTriangleList> 
   -->

    <!-- <div>

        <SKUPlanModify 
            @savemodify="hSaveModify"
            v-model="data1">
        
        </SKUPlanModify>       
    </div> -->


        <!-- <BaseTransferSelect
            pTipInfo='ceshi'
            :pDataSource="dataSource"
            v-model="abc">
        </BaseTransferSelect>   
        <p>
            <button @click="click">ok</button>
        </p> -->

  
</div>
</template>
<style>
.classRed {
  color: red;
}
.classBlue {
  color: blue;
}
</style>

<script>
import IPCTable from "@/components/common/IPCTable/IPCTable.vue";
import BaseTransferSelect from "@/components/common/BaseTransferSelect";
import BaseMultiSortSelector from "@/components/common/BaseMultiSelector";
import BaseTriangleList from "@/components/common/BaseTriangleList";
// import SKUPlanModify from '@/components/SKUPlanModify'
export default {
  data() {
    return {
      mergeCols: ["age", "date"],
      colsData3: [
        { label: "用户名", prop: "userName" },
        {
          label: "信息",
          prop: "info",
          children: [{ label: "地址", prop: "address" }]
        }
      ],
      colsData3: [
        { label: "用户名", prop: "userName" },
        {
          label: "信息",
          prop: "info",
          children: [{ label: "Age", prop: "age" }]
        }
      ],
      colsData2: [
        {
          label: "用户名",
          prop: "userName"
        },
        {
          label: "信息",
          prop: "info",
          children: [
            {
              label: "Age",
              prop: "age"
            },
            {
              label: "地址",
              prop: "address"
            }
          ]
        }
      ],
      colsData1: [
        {
          label: "用户名",
          prop: "userName"
        },
        {
          label: "Age",
          prop: "age"
        },
        {
          label: "地址",
          prop: "address"
        }
      ],
      rowsData1: [
        {
          rowId: 1,
          userName: "John Brown",
          age: 18,
          address: "New York No. 1 Lake Park"
        },
        {
          rowId: 2,
          userName: "Jim Green",
          age: 18,
          address: "New York No. 1 Lake Park"
        },
        {
          rowId: 2,
          userName: "Jim Green",
          age: 18,
          address: "New York No. 1 Lake Park"
        },
        {
          rowId: 2,
          userName: "Jim Green",
          age: 18,
          address: "New York No. 1 Lake Park"
        },
        {
          rowId: 2,
          userName: "Jim Green",
          age: 18,
          address: "New York No. 1 Lake Park"
        },
        {
          rowId: 2,
          userName: "Jim Green",
          age: 18,
          address: "New York No. 1 Lake Park"
        },
        {
          rowId: 2,
          userName: "Jim Green",
          age: 18,
          address: "New York No. 1 Lake Park"
        },
        {
          rowId: 2,
          userName: "Jim Green",
          age: 18,
          address: "New York No. 1 Lake Park"
        },
        {
          rowId: 2,
          userName: "Jim Green",
          age: 18,
          address: "New York No. 1 Lake Park"
        },
        {
          rowId: 2,
          userName: "Jim Green",
          age: 18,
          address: "New York No. 1 Lake Park"
        }
      ],

      colsData: [
        {
          label: "用户名",
          prop: "userName",
          align: "right",
          fixed: "left"
        },
        {
          label: "Age",
          prop: "age",
          align: "right",
          sortable: true,

          classNameFuc: val => {
            return val > 20 ? "classRed" : "classBlue";
          }
        },
        {
          label: "Address",
          prop: "address",
          classNameFuc: val => {
            return val > 20 ? "classRed" : "classBlue";
          }
          // hidden: true
        },
        {
          label: "date",
          prop: "date"
          // hidden: true
        },
        {
          label: "Address1",
          prop: "address1"
        },
        {
          label: "Address2",
          prop: "address2"
        },
        {
          label: "Address3",
          prop: "address3"
        },
        {
          label: "销量",
          prop: "saler"
        },
        {
          label: "GMV",
          prop: "GMV"
        }
      ],
      rowsData: [
        {
          rowId: { val: 1 },
          userName: { val: "John Brown" },
          age: { val: 18, editable: true },
          address: { val: "New York No. 1 Lake Park" },
          address1: { val: "New York No. 1 Lake Park" },
          date: { val: "2016-10-01" },
          saler: { val: "1233232.33223%" },
          GMV: { val: "123323" }
        },
        {
          rowId: { val: 2 },
          userName: { val: "Jim Green" },
          age: { val: 18 },
          address: { val: "London No. 1 Lake Park", editable: true },
          address1: { val: "London No. 1 Lake Park" },
          address2: { val: "London No. 1 Lake Park" },
          address3: { val: "London No. 1 Lake Park" },
          date: { val: "2016-10-01" }
        },
        {
          rowId: { val: 3 },
          userName: { val: "Joe Black" },
          age: { val: 19 },
          address: { val: "Sydney No. 1 Lake Park" },
          date: { val: "2016-10-01" }
        },
        {
          rowId: { val: 4 },
          userName: { val: "Jon Snow" },
          age: { val: 26 },
          address: { val: "Ottawa No. 2 Lake Park" },
          date: { val: "2016-10-01" }
        },
        {
          rowId: { val: 5 },
          userName: { val: "Jim Green" },
          age: { val: 27 },
          address: { val: "London No. 1 Lake Park" },
          date: { val: "2016-10-01" }
        },
        {
          rowId: { val: 6 },
          userName: { val: "Joe Black" },
          age: { val: 28 },
          address: { val: "Sydney No. 1 Lake Park" },
          date: { val: "2016-10-01" },
          address1: {
            val: "Ottawa No. 2 Lake Lake LakeeLake Park"
          },
          address2: {
            val: "Ottawa k"
          }
        },
        {
          rowId: { val: 7 },
          userName: { val: "Jim Green" },
          age: { val: 29 },
          address: { val: "London No. 1 Lake Park" },
          date: { val: "2016-10-01" }
        },
        {
          rowId: { val: 8 },
          userName: { val: "Joe Black" },
          age: { val: 30 },
          address: { val: "Sydney No. 1 Lake Park" },
          date: { val: "2016-10-02" }
        },
        {
          rowId: { val: 9 },
          userName: { val: "Jim Green" },
          age: { val: 31 },
          address: { val: "London No. 1 Lake Park" },
          date: { val: "2016-10-01" }
        },
        {
          rowId: { val: 10 },
          userName: { val: "Joe Black" },
          age: { val: 32 },
          address: { val: "Sydney No. 1 Lake Park" },
          date: { val: "2016-10-02" }
        },
        {
          rowId: { val: 11 },
          userName: { val: "Jim Green" },
          age: { val: 33 },
          address: { val: "London No. 1 Lake Park" },
          date: { val: "2016-10-01" }
        },
        {
          rowId: { val: 12 },
          userName: { val: "Joe Black" },
          age: { val: 34 },
          address: { val: "Sydney No. 1 Lake Park" },
          date: { val: "2016-10-02" }
        },
        {
          rowId: { val: 13 },
          userName: { val: "Jim Green" },
          age: { val: 35 },
          address: { val: "London No. 1 Lake Park" },
          date: { val: "2016-10-01" }
        },
        {
          rowId: { val: 14 },
          userName: { val: "Joe Black" },
          age: { val: 36 },
          address: { val: "Sydney No. 1 Lake Park" },
          date: { val: "2016-10-02" }
        },
        {
          rowId: { val: 15 },
          userName: { val: "Jim Green" },
          age: { val: 37 },
          address: { val: "London No. 1 Lake Park" },
          date: { val: "2016-10-01" }
        },
        {
          rowId: { val: 16 },
          userName: { val: "Joe Black" },
          age: { val: 38 },
          address: { val: "Sydney No. 1 Lake Park" },
          date: { val: "2016-10-02" }
        },
        {
          rowId: { val: 17 },
          userName: { val: "Jim Green" },
          age: { val: 39 },
          address: { val: "London No. 1 Lake Park" },
          date: { val: "2016-10-01" }
        },
        {
          rowId: { val: 18 },
          userName: { val: "Joe Black" },
          age: { val: 40 },
          address: { val: "Sydney No. 1 Lake Park" },
          date: { val: "2016-10-02" }
        },
        {
          rowId: { val: 19 },
          userName: { val: "Jim Green" },
          age: { val: 41 },
          address: { val: "London No. 1 Lake Park" },
          date: { val: "2016-10-01" }
        },
        {
          rowId: { val: 20 },
          userName: { val: "Joe Black" },
          age: { val: 42 },
          address: { val: "Sydney No. 1 Lake Park" },
          date: { val: "2016-10-02" }
        }
        // {
        //   userName: { val: "Jim Green" },
        //   age: { val: 43 },
        //   address: { val: "London No. 1 Lake Park" },
        //   date: { val: "2016-10-01" }
        // },
        // {
        //   userName: { val: "Joe Black" },
        //   age: { val: 44 },
        //   address: { val: "Sydney No. 1 Lake Park" },
        //   date: { val: "2016-10-02" }
        // },
        // {
        //   userName: { val: "Jim Green" },
        //   age: { val: 45 },
        //   address: { val: "London No. 1 Lake Park" },
        //   date: { val: "2016-10-01" }
        // }
        // {
        //   userName: { val: "Joe Black" },
        //   age: { val: 30 },
        //   address: { val: "Sydney No. 1 Lake Park" },
        //   date: { val: "2016-10-02" }
        // },
        // {
        //   userName: { val: "Jim Green" },
        //   age: { val: 24 },
        //   address: { val: "London No. 1 Lake Park" },
        //   date: { val: "2016-10-01" }
        // },
        // {
        //   userName: { val: "Joe Black" },
        //   age: { val: 30 },
        //   address: { val: "Sydney No. 1 Lake Park" },
        //   date: { val: "2016-10-02" }
        // }
      ],
      d: 200000,
      data1: {
        GMV: 99,
        price: 3,
        volume: 33,
        pagePrice: 2.8,
        activeList: [{ label: "616" }, { label: "617" }, { label: "618" }]
      },
      abc: ["a", "b"],
      dataSource1: [
        { id: 1, userName: "sku1", val: 1000 },
        { id: 2, userName: "sku2", val: 800 },
        { id: 3, userName: "sku3", val: 380 },
        { id: 4, userName: "sku4", val: 840 },
        { id: 5, userName: "sku5", val: 480 },
        { id: 6, userName: "sku6", val: 280 },
        { id: 7, userName: "sku7", val: 166 },
        { id: 8, userName: "sku8", val: 6 },
        { id: 9, userName: "sku9", val: 26 },
        { id: 10, userName: "sku10", val: 36 },
        { id: 11, userName: "sku11", val: 57 }
      ],
      dataSource: [
        { value: "a", label: "品类", checked: true },
        { value: "b", label: "品牌", checked: false },
        { value: "c", label: "采销", checked: true }
      ],
      txt: "aaa",
      myDate: {
        type: "w",
        dayRange: ["", ""],
        pMonthListForWeek: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        weekInMonth: 1
      },
      defaultMonth: 0,
      currentType: "q",
      monthList: [
        { value: 1, label: "1" },
        { value: 2, label: "2" },
        { value: 3, label: "3" }
      ]
    };
  },
  components: {
    BaseTransferSelect,

    BaseTriangleList,
    BaseMultiSortSelector,
    IPCTable
  },
  created() {
    setTimeout(() => {
      this.d = 1001;
    });
  },
  methods: {
    hDragStart(e) {
      console.info(e);
    },
    hSaveModify() {
      console.info(this.data1);
    },
    t() {
      console.dir(this.$refs.i);
    },
    click() {
      console.info(this.dataSource);
    },
    click1() {
      this.myDate.type = "q";
      // this.defaultMonth = "4";
      // this.monthList= [{value:4,label:"4"},{value:5,label:"5"}]
    },
    click2() {
      this.myDate.type = "w";
      this.myDate.dayRange = ["", ""];
      this.myDate.pMonthListForWeek = [1, 2];

      setTimeout(() => {
        this.myDate.weekInMonth = 2;
      });
    },
    click3() {
      this.myDate.type = "w";
      this.myDate.dayRange = ["", ""];
      this.myDate.pMonthListForWeek = [3, 4, 5, 6];

      this.myDate.weekInMonth = 3;
    },
    click4() {
      this.myDate.type = "d";
      this.myDate.dayRange = ["2018-10-08", "2018-10-10"];
      // this.myDate = {
      //     type:"d",
      //     dayRange:["2018-10-08","2018-10-10"],
      //     pMonthListForWeek:[1,2,3,4,5,6,7,8,9,10,11],
      //     weekInMonth:1
      // }
    }
  }
};
</script>

