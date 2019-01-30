<!--本月GMV进度-->
<template>
  <div>
    <div class="card-title"><h4>本月GMV进度</h4></div>
    <Row class="self-cond">
      <div class="float-left">当前时间进度 35.7%</div>
      <div class="float-right">
        排序：
        <Select style="width:128px;" v-model="sort" v-on:on-change="sortChange">
          <Option value="asc">升序</Option>
          <Option value="desc">降序</Option>
        </Select>
      </div>
    </Row>

    <Row class="card-padding">
      <Col span="4"><DetailCircle :percent="27" :schedule="51.8" detail="3340256/15644" :title="'SKUA1'" v-on:detailClick="detailClick"/></Col>
      <Col span="4"><DetailCircle :percent="27" :schedule="51.8" detail="3340256/15644" :title="'SKUA1'"/></Col>
      <Col span="4"><DetailCircle :percent="27" :schedule="51.8" detail="3340256/15644" :title="'SKUA1'"/></Col>
      <Col span="4"><DetailCircle :percent="27" :schedule="51.8" :color="'#8AC346'" :title="'SKUA1'"/></Col>
      <Col span="4"><DetailCircle :percent="75" :schedule="51.8" :title="'SKUA1'"/></Col>
      <Col span="4"><DetailCircle :percent="27" :schedule="51.8" detail="3340256/15644" :title="'SKUA1'"/></Col>
      <Col span="4"><DetailCircle :percent="69" :schedule="51.8" detail="3340256/15644" :title="'SKUA1'"/></Col>
      <Col span="4"><DetailCircle :percent="27" :schedule="51.8" detail="3340256/15644" :title="'SKUA1'"/></Col>
    </Row>

    <div class="card-padding align-right">
      <Page :total="47" :current="curPage" show-sizer v-on:on-change="pageChange"></Page>
    </div>
  </div>
</template>

<script>
  import DetailCircle from '@/components/circle/DetailCircle'
  export default{
    name:'',
    data(){
      return {
        sort:'asc',
        curPage:2,
      }
    },
    components:{
      DetailCircle
    },
    methods:{
      queryGMVSchedule(){
        console.log("查询GMV进度");
      },
      detailClick(payload){//单个进度环点击事件
        console.log(1111);
        console.log(payload);
      },
      sortChange(value){//排序方法改变
        console.log("排序方法改变",value);
      },
      pageChange(cur){//分页方法改变
        console.log("分页方法改变",cur);
        this.curPage = cur;
        console.log("curPage",this.curPage);
      }
    }
  }
</script>
