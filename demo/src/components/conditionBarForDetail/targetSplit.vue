<template lang="html">
  <div>
    <template v-if="isSplitTarget == false">
      <Poptip placement="bottom-end" v-model="modelBoxVisible">
        <Button type="primary"
            :disabled="cDisabled"
            @click="modelBoxVisible = true" size="small">&nbsp;目标下沉&nbsp;<Icon :type="modelBoxVisible ? 'chevron-up':'chevron-down'"></Icon>&nbsp;</Button>
        <div slot="content" style="width: 120px; display: flex;flex-wrap: wrap;">
          <Button style="display:block;width: 35px;margin-bottom:5px;"
            size="small"
            v-for="item in monthsToSplit"
            type="primary"
            :key="item.value"
            name="button"
            @click="changeMonth(item.value)">{{item.label}}&nbsp;</Button>
        </div>
      </Poptip>
    </template>
    <template v-else>
      <Button type="primary" size="small" name="button" @click="back">返回</Button>
    </template>
  </div>
</template>
<script>
export default {
  computed:{
    cDisabled(){
        return this.monthsToSplit.length == 0;
    }
  },
  data() {
    return {
      modelBoxVisible: false,
      isSplitTarget:false,
      monthList:[1,2,3,4,5,6,7,8,9,10,11,12],
    }
  },
  methods: {
    back(){
      this.isSplitTarget = false;
      this.monthList = [1,2,3,4,5,6,7,8,9,10,11,12]
      this.$emit("updateDateDimension","QM")
    },
    changeMonth(val) {
      this.isSplitTarget =  true;
      this.modelBoxVisible = false;
      this.monthList = [val.substr(1)]
      this.$emit("updateDateDimension","WD")
    },
    val(){
        return {monthList:this.monthList}
    }
  },
  props:{
    monthsToSplit:{
      types:Array,
      // required:true
    }
  }
}
</script>
