<template>
  <div class="flexa">
    <label>时间区间： </label>
   <DatePicker :clearable="false" class="w90" size="small" v-model="dateRange.start" format="yyyy-MM" type="month" placeholder="开始时间"></DatePicker>
   &nbsp;至&nbsp;
    <DatePicker :clearable="false"  class="w90" size="small" v-model="dateRange.end" format="yyyy-MM" type="month" placeholder="结束时间"></DatePicker>
 </div>
</template>

<script>
const moment = require("moment")
export default {
  methods:{
    getValue(){
      // console.info("dateRange组的getValue......",this.dateRange)
      return {
        start:moment(this.dateRange.start).format('YYYY-MM'),
        end:moment(this.dateRange.end).format('YYYY-MM')}
    }
  },
  props:{
    dateRange:{
        type:Object
    }
  }
}
</script>
<style media="screen">

</style>
