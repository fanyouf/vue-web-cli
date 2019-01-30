<template lang="html">
  <div class="sideBarTool">
    <!-- {{pageType}} -->
    <data-dimension-for-target
      @dataDimensionChange="hDataDimensionChange"
      @loadSkuChosed="loadSkuChosed"
      v-if="pageType=='target'"
    ></data-dimension-for-target>
    <data-dimension-for-plan
      @dataDimensionChange="hDataDimensionChange"
      @loadSkuChosed="loadSkuChosed"
      v-if="pageType=='plan'"
    ></data-dimension-for-plan>

    <data-dimension-for-plan-reached
      @dataDimensionChange="hDataDimensionChange"
      @loadSkuChosed="loadSkuChosed"
      v-if="pageType=='reached'"
    ></data-dimension-for-plan-reached>


    <!--:initCondition="initCondition"-->

    <div class="sideBarTool_btns">
      <Poptip placement="bottom-start" trigger="hover">
        <!-- <i class="iconfont icon-btn icon-tuceng"></i> -->
        <svg class="icon icon-btn" aria-hidden="true">
          <use xlink:href="#icon-cengji-moren"></use>
        </svg>
        <div slot="content">
          <RadioGroup v-model="initCondition.categroyLevel">
            <Radio label="cate1">
              <span>一级品类</span>
            </Radio>
            <Radio label="cate2">
              <span>二级品类</span>
            </Radio>
            <Radio label="cate3">
              <span>三级品类</span>
            </Radio>
          </RadioGroup>
        </div>
      </Poptip>
      <Poptip placement="bottom" trigger="hover">
        <svg class="icon icon-btn" aria-hidden="true">
          <use xlink:href="#icon-wuxuliebiao-moren"></use>
        </svg>
        <div slot="content">
          <RadioGroup v-model="initCondition.sortOrder">
            <Radio label="order_m1">
              <span>按M-1占比排序</span>
            </Radio>
            <Radio label="order_id">
              <span>按ID顺序排序</span>
            </Radio>
          </RadioGroup>
        </div>
      </Poptip>

      <Poptip placement="bottom" trigger="hover">
        <div style="position: relative" class="t" :class="{'showTip' : initCondition.searchKeyword.trim() !='' }">
          <svg class="icon icon-btn"  aria-hidden="true">
            <use xlink:href="#icon-chaxun-moren"></use>
          </svg>
          <span style="position: absolute;top:0;right:0;width:0px;height: 0px;border:5px solid transparent;border-top-color:red;"></span>
        </div>
        <div slot="content">
          <Input v-model="initCondition.searchKeyword"  placeholder="输入内容..." clearable  style="width: 168px"></Input>
        </div>
      </Poptip>
      <Button class="sideBarTool_btns_ok" type="primary" @click="query">确认{{currentSelectedNodeNumber}}</Button>
    </div>
  </div>
</template>
<style scoped>
  .t.showTip span{
    display: block;
  }
  .t span{
    display: none;
  }
</style>
<script>
  import dataDimensionForTarget from "./dataDimensionForTarget.vue"
  import dataDimensionForPlan from "./dataDimensionForPlan.vue"
  import dataDimensionForPlanReached from "./dataDimensionForPlanReached.vue"
  export default {
    beforeDestroy() {
      this._bus.$off(this._CONST.E_SIDEBAR_DIMENSION_CHANGE, this.hSideBarTool_dimensionForTarget);
      this._bus.$off(this._CONST.E_SIDEBAR_SELECTEDNODENUMBER_CHANGE, this.hSelectNodesNumberChange);
    },
    created(){
      this._bus.$on(this._CONST.E_SIDEBAR_DIMENSION_CHANGE, this.hSideBarTool_dimensionForTarget);
      this._bus.$on(this._CONST.E_SIDEBAR_SELECTEDNODENUMBER_CHANGE, this.hSelectNodesNumberChange);
    },
    components:{dataDimensionForTarget,dataDimensionForPlan,dataDimensionForPlanReached},
    data() {
      return {
        currentSelectedNodeNumber:10
      }
    },
    methods: {
      hSelectNodesNumberChange(payload){
        this.currentSelectedNodeNumber = payload
      },
      hDataDimensionChange(payload){
        console.info("hSideBarTool_dimensionForTarget",payload)
        console.log("pageType",this.pageType)
        this.initCondition.dataDimension =  payload.dataDimension
        this.initCondition.isSaler = payload.isSaler

        if(this.pageType === 'reached'){
          if(-1 === payload.dataDimension.indexOf("nosku")){
            this._bus.$emit(this._CONST.E_SIDEBAR_SKU_CHANGE,true)
          }
          else{
            this._bus.$emit(this._CONST.E_SIDEBAR_SKU_CHANGE,false)
          }
        }
      },
      query(){
        if(this.currentSelectedNodeNumber == 0){
          this._info("至少选中一个有效节点!")
          return
        }
        this.$emit('query')
      },
      loadSkuChosed(key){
        this.$emit("loadSkuChosed",key);
      }
    },
    props:{
      pageType:{
        type:String,
        required: true
      },
      initCondition: {
        type: Object,
        required: true
      }
    },

  }
</script>
