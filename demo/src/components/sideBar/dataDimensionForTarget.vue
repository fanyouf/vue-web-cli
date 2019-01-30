<template lang="html">
<div class="sideBarTool_btns" >
  <Poptip placement="bottom" trigger="hover">
    数据维度：<Input style="display:inline-block;width:168px;" readonly :value="currentValue"></Input>
    <div slot="content">
      <RadioGroup v-model="dimension" @on-change="change">
        <Radio label="cate_brand">
            <span>品类-品牌架构</span>
        </Radio>
        <Radio label="brand_cate">
            <span>品牌-品类架构</span>
        </Radio>
      </RadioGroup>
      <Checkbox v-model="single" @on-change="change" v-if="user.type != 'SALER'">采销经理</Checkbox>
    </div>
  </Poptip>
</div>
</template>

<script>
import {mapMutations,mapGetters} from 'vuex'
export default {
  computed:{
    ...mapGetters({
      user:'getUser',
    }),
    currentValue(){
      return (this.dimension == 'cate_brand' ? "品类-品牌" : "品牌-品类")  + (this.single ? "-采销" : " ")
    }
  },
  data(){
    return {
      dimension:"cate_brand",
      single:false
    }
  },
  methods: {
    ...mapMutations("cond",['setDataDimensionName']),
    change(){
      this.$emit("dataDimensionChange",{dataDimension:this.dimension,isSaler:this.single})
      this.setDataDimensionName(this.currentValue)
    },
  }
}
</script>
