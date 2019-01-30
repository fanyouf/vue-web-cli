<template lang="html">
<!-- 
  2018-10-10 fanyoufu
  修改点：
1. 不处理sku的计划
 -->
<div class="sideBarTool_btns">
  <Poptip placement="bottom" trigger="hover">
    数据维度：<Input style="display:inline-block;width:168px;" readonly :value="currentValue"></Input>
    <div slot="content">
      <RadioGroup v-model="dimension" @on-change="hChange">
        <Radio label="cate_brand_nosku">
            <span>品类-品牌架构</span>
        </Radio>
        <Radio label="brand_cate_nosku">
            <span>品牌-品类架构</span>
        </Radio>
      </RadioGroup>
      <Checkbox v-model="single" @on-change="hChange" v-if="user.type != 'SALER'">采销经理</Checkbox>
    </div>
  </Poptip>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
let obj = {
  // cate_brand_sku:'品类-品牌架构/展开sku',
  // brand_cate_sku:'品牌-品类架构/展开sku',
  cate_brand_nosku:'品类-品牌架构',
  brand_cate_nosku:'品牌-品类架构',
}
export default {
  data(){
    return {
      dimension:"cate_brand_nosku", // 默认  品类-品牌-不展示sku
      single:false,
    }
  },
  computed:{
    ...mapGetters({
      user:'getUser',
    }),
    currentValue(){
      return obj[this.dimension]
    }
  },
  methods: {
    hChange(){
      this.$emit("dataDimensionChange",{dataDimension:this.dimension,isSaler:this.single})
      //this.setDataDimensionName(this.currentValue)
      if(this.dimension=="cate_brand_sku"||this.dimension=="brand_cate_sku")  {
        this.$emit("loadSkuChosed",this.single);
      }
    }
  }
}
</script>
