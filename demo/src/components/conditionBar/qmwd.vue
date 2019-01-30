<template lang="html">
  <div class="">
    年份:
    <Select v-model="cond.year" style="width:65px;">
        <Option v-for="item in yearList" :value="item.value" :key="item.value">{{ item.label }}</Option>
    </Select>
    周期：
    <RadioGroup v-model="qmwd" type="button" size="small">
      <Radio v-for="(item, index) in dateTimeTypeList"  :key="index" :label="item.value"><span>{{item.label}}</span></Radio>
    </RadioGroup>
  </div>
</template>
<script>
// import { createNamespacedHelpers } from 'vuex'
//
// const { mapState, mapMutations, mapActions } = createNamespacedHelpers('target')
import {mapGetters} from 'vuex'
export default {
  activated(){
    this.isActive = true;
  },
  deactivated(){
    this.isActive = false;
  },
  beforeDestroy() {
    this._bus.$off(this._CONST.E_DATELEVEL_CHANGE,this.hDateLevel);
  },
  props:{
    initYear:{type:Number,default:-1},
    cond:{type: Object, required:true}, // 默认是 季 月
  },
  created(){
    this.isActive = true;
    if(this.initYear != -1){
        this.disabled = true
    }
    else{
        this.disabled = false
    }
    this._bus.$on(this._CONST.E_DATELEVEL_CHANGE,this.hDateLevel);
    let currrentYear = (new Date()).getFullYear() - 3;
    for(var i =0; i<5;i++){
      this.yearList.push({
        value:currrentYear+i,
        label:currrentYear+i
      })
    }
    console.info('this.yearList',this.yearList)
  },
  computed:{
    ...mapGetters("cond",['getConditionBar','getPageType']),
    dateTimeTypeList(){
        console.info('dateTimeTypeList',this.this.cond.level)
      let filterArr = this.cond.level.split('')
      let rs = this.list.filter(item => {
        return filterArr.includes(item.value)
      })
      return rs;
    }
  },
  data(){
    return {
      list:this._CONST.dateDimension,
      qmwd:this.cond.dateDimension,
      yearList:[],
      disabled:false,
      isActive:false
    }
  },
  methods:{
    hDateLevel(dateLevel){
      console.info("hDateLevel",this.isActive,dateLevel)
      if(this.isActive){
        this.cond.level = this.getConditionBar.level
        console.info(this.getPageType+" - 条件栏上的日期类型变化了，变成了",this.cond.level,"当前的active是",this.isActive);
        setTimeout( ()=>{this.dateDimension = this.getConditionBar.dateDimension})
      }
      else{
        console.info(this.getPageType+" - 条件栏上的日期类型变化了，它不处于活动状态，不更新");

      }
    }
  },

  watch:{
    qmwd(newValue){
      this.cond.dateDimension = newValue
    },
    initYear(newValue){
      console.info("在qmwd组件中initYear的值变化了",newValue)
      if(newValue){
          this.cond.year = newValue;
          this.disabled = true;
      }
      else
          this.disabled = false;
    }
  }
}
</script>
