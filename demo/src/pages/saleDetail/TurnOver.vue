<!--周转分析-->
<template>
  <div>
    <div class="card-title">
      <div style="text-align: left;width: 50%"><h4>库存周转分析</h4></div>
      <div @click="download" style="text-align: right;width: 50%">
        <Icon type="ios-download-outline" size="30" style="padding-right: 10px;"></Icon>
      </div>
    </div>

    <div class="self-cond">
      周期：
      <RadioGroup type="button" size="large" v-model="period" v-on:on-change="periodChange">
        <Radio label="month">月</Radio>
        <Radio label="week">周</Radio>
        <Radio label="day">天</Radio>
      </RadioGroup>
    </div>

    <div>
      <div style="width: 20%;"><ColorRange :isRatio="false" :colorList="colorList"></ColorRange></div>
      <div><FixedTable></FixedTable></div>
      <div class="card-padding align-right">
        <Page :total="47" :current="curpage" show-sizer v-on:on-change="pageChange"></Page>
      </div>
    </div>
  </div>
</template>

<script>
  import FixedTable from '@/components/table/FixedTable'
  import ColorRange from '@/components/colorRange/ColorRange'
  export default{
    name:'TurnOver',
    components:{
      FixedTable,ColorRange
    },
    data(){
      return {
        curpage:1,
        period:'month'
      }
    },
    methods:{
      queryTurnOver(){//查询周转数据
        console.log("查询周转数据")
      },
      pageChange(page){//分页变化
        console.log("周转，分页变化",page);
        this.curpage = page;
      },
      periodChange(period){//周期变化
        console.log("周转，周期变化",period);
      },
      download(){
        console.log("周转，下载");
      },
    },
    computed:{
      colorList(){
        //{color:'red',value:30}
        let colorList = [];
        let color1 = {color:'#FAF3DA',value:30};
        let color2 = {color:'#E8F3DA',value:60};
        let color3 = {color:'#DFEFF9',value:90};
        let color4 = {color:'#EFE9F1',value:100};
        colorList.push(color1);
        colorList.push(color2);
        colorList.push(color3);
        colorList.push(color4);
        return colorList;
      }
    }
  }
</script>
