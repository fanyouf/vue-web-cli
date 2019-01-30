<template lang="html">
  <div class="conditionBar">
    <div class="conditionBar-datetime flexa">
      <qmwd ref="qmwd"
            :dateDimension = "dateDimension"
            :year = "year"
      ></qmwd>
      <Button size="small" type="primary"  @click="query" class="ml15">查询</Button>
    </div>
    <div class="conditionBar-btns">
      <target-split ref="splitMonth"
                    @updateDateDimension="hUpdateDateDimension"
                    :monthsToSplit="monthsToSplit">
      </target-split>
    </div>
  </div>
</template>
<script>
import targetSplit from "./targetSplit"
import qmwd from "./qmwd"
export default {
  props:{
    year:{type:Number},
    monthsToSplit:{
      type:Array,
      required:true
    },

  },
  components:{targetSplit,qmwd},
  data(){
      return {
        dateDimension:"QM"
      }
  },
  methods:{
    val(){
      let obj = {};
      let c = this.$refs.dateDimension.val();
      let c1 = this.$refs.splitMonth.val()

      obj.monthList = c1.monthList
      obj.year = c.year
      obj.dateDimension = c.dateDimension
      return obj;
    },
    hUpdateDateDimension(dateDimension){
      this.dateDimension = dateDimension
      setTimeout(()=>{
        this.query()
      },50)
    },
    query(){
      this.$emit("conditionBarChange",this.val())
    },
    emitEffectTargetEvent(type){
      this.$emit("effectTarget",type)
    },
    splitTarget(){
      console.info("splitTarget")
    },
    modifyTotal(){
      console.info("modifyTotal")
    },
    saveValue(){
      console.info('saveValue')
    },
    setAvailableVersionList(arr,v){
      this.$refs["versionSelect"].updateVersionList(arr,v)
    }
  },
  watch:{
    initYear(value){
        console.info("在conditionbar中， inityear的值",value)
    }
  }

}
</script>

<style lang="css">
</style>
