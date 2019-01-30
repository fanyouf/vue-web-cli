<template>
    <div>
        <h4>SKU导入失败! 原因如下</h4>
        <div
            v-for="(item,index) in tableList" 
            v-bind:key="index"
        >
            <p style="padding:10px;">{{index+1}}. {{item.title}}</p>
            <Table 
            border 
            :columns="item.cols" 
            :data="item.rows"></Table>
        </div>
      </div>
       
    <!--  -->
</template>
<script>
//上传失败的错误提示信息
// uploadErrorList:[
//     {
//         //错误信息
//         errorMessage:'数据格式错误',
//         //错误信息表头
//         titleList:[
//             "SKU ID", "开始日期", "结束日期", "页面价", "单位成交价", "日均销量"
//         ]
//         //错误信息表数据,二维数组，第一层表示一行，第二层表示一个单元格
//         errorInfoList:[
//             ['skuId1','2018/05/05','2018/05/06','15.0','10.0','50'],
//         ]
//     }
// ]

export default {
  props: {
    pVisiable: { type: Boolean, default: false },
    pUploadErrorList: {
      type: Array,
      required: true,
      default: () => {
        return [
          {
            //错误信息
            errorMessage: "数据格式错误",
            //错误信息表头
            titleList: [
              "SKU ID",
              "开始日期",
              "结束日期",
              "页面价",
              "单位成交价",
              "日均销量"
            ],
            //错误信息表数据,二维数组，第一层表示一行，第二层表示一个单元格
            errorInfoList: [
              ["skuId1", "2018/05/05", "2018/05/06", "15.0", "10.0", "50"]
            ]
          }
        ];
      }
    }
  },
  data() {
    return {
      visiable: this.pVisiable
    };
  },
  computed: {
    tableList() {
      let tabs = [];
      this.pUploadErrorList.forEach(list => {
        let obj = {};
        obj.title = list.errorMessage;
        obj.cols = list.titleList.map(it => {
          return {
            title: it,
            key: it
          };
        });

        obj.rows = list.errorInfoList.map(it => {
          let row = {};
          it.forEach((cell, index) => {
            row[obj.cols[index].key] = cell;
          });
          return row;
        });

        obj.cols.unshift({
          type: "index",
          width: 60,
          align: "center"
        });

        tabs.push(obj);
      });
      console.info("tableList:--------------------", tabs);
      return tabs;
    }
  }
};
</script>
