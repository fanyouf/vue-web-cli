<!--明细分析-->
<template>
  <div>
    <div class="card-title">
      <div style="width: 50%"><h4>明细分析</h4></div>
      <div style="text-align: right;width: 50%">
        <div @click="download" style="display: inline-block;"><Icon type="ios-download-outline" size="30" style="padding-right: 10px;"></Icon></div>
        <div @click="hideColumn" style="display: inline-block;"><Icon type="grid" size="30" style="padding-right: 10px;"></Icon></div>
        <div @click="expand" style="display: inline-block;"><Icon type="arrow-expand" size="30" style="padding-right: 10px;"></Icon></div>
      </div>
    </div>

    <div>
      <Transfer
        :data="data3"
        :target-keys="targetKeys3"
        :list-style="listStyle"
        :render-format="render3"
        :operations="['添加','隐藏']"
        :titles="['展示列','隐藏列']"
        filterable
        @on-change="handleChange3">
      </Transfer>
    </div>

    <div class="padding">
      <FixedTable></FixedTable>
    </div>

    <div class="card-padding align-right padding">
      <Page :total="120" :current="1" show-sizer></Page>
    </div>
  </div>
</template>

<script>
  import FixedTable from '@/components/table/FixedTable'
  export default{
    name:'DetailAnalysis',
    components:{
      FixedTable
    },
    data(){
      return {
        data3: this.getMockData(),//穿梭框用
        targetKeys3: this.getTargetKeys(),//穿梭框用
        listStyle: {//穿梭框用
          width: '250px',
          height: '300px'
        },
      }
    },
    methods:{
      queryDetailAnalysis(){//查询明细分析数据
        console.log("查询明细分析数据");
      },
      download(){//下载
        console.log("明细分析下载");
      },
      hideColumn(){//隐藏列，选择穿梭框
        console.log("选择隐藏列");
      },
      expand(){//全屏展开
        console.log("全屏展开");
      },
      handleChange3 (newTargetKeys) {//穿梭框用
        this.targetKeys3 = newTargetKeys;
      },
      render3 (item) {//穿梭框用
        return item.label + ' - ' + item.description;
      },
      getTargetKeys () {//穿梭框用
        return this.getMockData()
          .filter(() => Math.random() * 2 > 1)
          .map(item => item.key);
      },
      getMockData () {//穿梭框用
        let mockData = [];
        for (let i = 1; i <= 20; i++) {
          mockData.push({
            key: i.toString(),
            label: 'Content ' + i,
            description: 'The desc of content  ' + i,
            disabled: Math.random() * 3 < 1
          });
        }
        return mockData;
      },
    },
    computed:{

    },
    mounted(){

    }
  }
</script>
