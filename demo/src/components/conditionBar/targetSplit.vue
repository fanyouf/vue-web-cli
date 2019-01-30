<template lang="html">
  <div>
    <template v-if="getIsSplitTarget == false">
      <Poptip placement="bottom-end" v-model="visible">
        <Button type="primary"
            :disabled="cDisabled"
            @click="visible = true" size="small"  style="height: 28px;line-height: 1;">&nbsp;{{title}}下沉&nbsp;<Icon :type="visible ? 'chevron-up':'chevron-down'"></Icon>&nbsp;</Button>
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
import {mapMutations,mapGetters} from "vuex"
export default {
  computed:{
    ...mapGetters('cond',['getIsSplitTarget','getPageType']),
    title(){
      if(this.getPageType == 'target' || this.getPageType == 'viewTarget')
        return '目标'
      else
        return '计划'
    },
    cDisabled(){
        return this.monthsToSplit.length == 0;
    }
  },
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    ...mapMutations('cond',['setMonthToSplit','setSplitTargetStatus','setConditionBar']),
    back(){
      this.setSplitTargetStatus(false);
      this.setMonthToSplit('');
      this.setConditionBar({level:"QM",qmwd:"M"})
      //this._bus.$emit(this._CONST.E_DATELEVEL_CHANGE,"QM")
      this.$emit("dateLevelChange","QM")
      this._bus.$emit(this._CONST.E_TARGETSPLIT_CHANGE) // 重查表格
    },
    cancel(){this.visible = false;},
    changeMonth(val) {

      // 1.保存到store,
      // 2.发消息，让季月改成周天，
      // 3.发消息，进行一次查询
      this.visible = false;
      this.setMonthToSplit(val);
      this.setSplitTargetStatus(true)
      this.setConditionBar({level:"WD",qmwd:"W"})
      this.$emit("dateLevelChange","WD")
      // this._bus.$emit(this._CONST.E_DATELEVEL_CHANGE,"WD")  // 更新季月
      this._bus.$emit(this._CONST.E_TARGETSPLIT_CHANGE,val.toString().toUpperCase().substr(1)) // 重查表格
    }
  },
  props:{
    monthsToSplit:{
      types:Array,
      required:true
    }
  }
}
</script>
