<template lang="html">
<div class="sideBarTool_btns">
  <Poptip placement="bottom" trigger="hover">
    数据维度：<Input style="display:inline-block;width:168px;" readonly :value="currentValue"></Input>
    <div slot="content">
      <RadioGroup v-model="dimension" @on-change="change">
        <Radio label="cate_brand_nosku">
            <span>品类-品牌架构/不展开sku</span>
        </Radio>
        <Radio label="brand_cate_nosku">
            <span>品牌-品类架构/不展开sku</span>
        </Radio>
        <Radio label="cate_brand_sku">
            <span>品类-品牌架构/展开sku</span>
        </Radio>
        <Radio label="brand_cate_sku">
            <span>品牌-品类架构/展开sku</span>
        </Radio>
      </RadioGroup>
      <Checkbox v-model="single" @on-change="change" v-if="user.type != 'SALER'">采销经理</Checkbox>
    </div>
  </Poptip>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
let obj = {
  cate_brand_sku:'品类-品牌架构/展开sku',
  brand_cate_sku:'品牌-品类架构/展开sku',
  cate_brand_nosku:'品类-品牌架构/不展开sku',
  brand_cate_nosku:'品牌-品类架构/不展开sku',
}
export default {
  computed:{
    ...mapGetters({
      user:'getUser',
    }),
    currentValue(){
      return obj[this.dimension]
    }
  },
  props:{
    initCondition:{
      type:Object,
      required:false
    }
  },
  data(){
    return {
      dimension:"cate_brand_nosku", // 默认  品类-品牌-不展示sku
      single:false,
    }
  },
  methods: {
    change(){
      this.$emit("dataDimensionChange",{dataDimension:this.dimension,isSaler:this.single})
      //this.setDataDimensionName(this.currentValue)
      if(this.dimension=="cate_brand_sku"||this.dimension=="brand_cate_sku")  {
        this.$emit("loadSkuChosed",this.single);
      }
    }
  },
//  watch:{
//    initCondition:{
//      handler(){
//        console.log("2222222222222222",this.executeOnce,this.initCondition)
//        if(this.executeOnce == true) return;
//        if(this.initCondition != undefined){
//          if(this.initCondition.dataDimension != undefined && this.initCondition.dataDimension.length > 0){
//            this.dimension = this.initCondition.dataDimension[0];
//          }
//
//          if(this.initCondition.isSaler != undefined){
//            this.single = this.initCondition.isSaler;
//          }
//        }
//        this.executeOnce = true;
//      },
//      deep:true
//    }
//  }

}
</script>
