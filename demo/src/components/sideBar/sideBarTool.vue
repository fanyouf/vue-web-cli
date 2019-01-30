<template lang="html">
  <div class="sideBarTool">
    <BaseMultiSelector
    ref="baseMultiSelector"
      :isSelectNone="false"
      v-model="dataDimension"
      @change="hDataDimensionChange"
    >
    </BaseMultiSelector>

    <div class="sideBarTool_btns" style="margin-top:5px;">
      <Poptip placement="bottom-start" trigger="hover" title="品类类型">
        <!-- <i class="iconfont icon-btn icon-tuceng"></i> -->
        <svg class="icon icon-btn" aria-hidden="true">
          <use xlink:href="#icon-cengji-moren"></use>
        </svg>
        <div slot="content" >
          <RadioGroup v-model="pCondition.categroyLevel">
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
      <Poptip placement="bottom-start" trigger="hover">
        <svg class="icon icon-btn" aria-hidden="true">
          <use xlink:href="#icon-wuxuliebiao-moren"></use>
        </svg>
        <div slot="content">
          <RadioGroup v-model="pCondition.sortOrder">
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
        <div style="position: relative" class="t" :class="{'showTip' : pCondition.searchKeyword.trim() !='' }">
          <svg class="icon icon-btn"  aria-hidden="true">
            <use xlink:href="#icon-chaxun-moren"></use>
          </svg>
          <span style="position: absolute;top:0;right:0;width:0px;height: 0px;border:5px solid transparent;border-top-color:red;"></span>
        </div>
        <div slot="content">
          <Input v-model="pCondition.searchKeyword"  placeholder="输入内容..." clearable  style="width: 168px"></Input>
        </div>
      </Poptip>
      <Button class="sideBarTool_btns_ok" type="primary" @click="query">确认{{pSelectedNodeNumber}}</Button>
    </div>
  </div>
</template>
<style scoped>
.t.showTip span {
  display: block;
}
.t span {
  display: none;
}
</style>
<script>
import BaseMultiSelector from "@/components/common/BaseMultiSelector";
const _ = require("lodash");
export default {
  beforeDestroy() {
    this._bus.$off(
      this._CONST.E_SIDEBAR_DIMENSION_CHANGE,
      this.hSideBarTool_dimensionForTarget
    );
    this._bus.$off(
      this._CONST.E_SIDEBAR_SELECTEDNODENUMBER_CHANGE,
      this.hSelectNodesNumberChange
    );
  },
  created() {
    this.dataDimension = _.cloneDeep(this.pCondition.dataDimension);
    this._bus.$on(
      this._CONST.E_SIDEBAR_DIMENSION_CHANGE,
      this.hSideBarTool_dimensionForTarget
    );
    this._bus.$on(
      this._CONST.E_SIDEBAR_SELECTEDNODENUMBER_CHANGE,
      this.hSelectNodesNumberChange
    );
  },
  props: {
    pCondition: {
      type: Object,
      required: true
    },
    pSelectedNodeNumber: {
      type: Number,
      default: 0
    }
  },
  components: { BaseMultiSelector },
  data() {
    return {
      dataDimension: [],
      currentSelectedNodeNumber: 10
    };
  },
  methods: {
    hSelectNodesNumberChange(payload) {
      this.currentSelectedNodeNumber = payload;
    },
    hDataDimensionChange(payload) {
      this.pCondition.dataDimension = payload;
      console.info("hSideBarTool_dimensionForTarget", payload);
      // this.pCondition.dataDimension =  payload.dataDimension
      // this.pCondition.isSaler = payload.isSaler

      // if(this.pageType === 'plan'){
      //   if(-1 === payload.dataDimension.indexOf("nosku")){
      //     this._bus.$emit(this._CONST.E_SIDEBAR_SKU_CHANGE,true)
      //   }
      //   else{
      //     this._bus.$emit(this._CONST.E_SIDEBAR_SKU_CHANGE,false)
      //   }
      // }
    },
    query() {
      if (this.currentSelectedNodeNumber == 0) {
        this._info("至少选中一个有效节点!ok");
        return;
      }
      this.$emit("query");
    },
    loadSkuChosed(key) {
      this.$emit("loadSkuChosed", key);
    }
  },
  watch: {
    "pCondition.dataDimension"(newVal) {
      this.dataDimension = newVal;
    },
    "pCondition.categroyLevel"(newval) {
      let selector = this.$refs.baseMultiSelector;
      let cateLevel = newval;

      let item = selector.value.filter(item => item.label.includes("品类"));
      if (cateLevel === "cate1") {
        item[0].label = "一级品类";
      }
      if (cateLevel === "cate2") {
        item[0].label = "二级品类";
      }
      if (cateLevel === "cate3") {
        item[0].label = "三级品类";
      }
    }
  }
};
</script>
