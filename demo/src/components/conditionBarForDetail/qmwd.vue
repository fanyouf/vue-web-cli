<template lang="html">
  <div class="">
    年份:
    <Select size="small" v-model="dYear" style="width:100px;">
        <Option v-for="item in yearList" :value="item.value" :key="item.value">{{ item.label }}</Option>
    </Select>
    周期：
    <RadioGroup v-model="qmwd" type="button" size="small">
      <Radio v-for="(item, index) in dateTimeTypeList"  :key="index" :label="item.value"><span>{{item.label}}</span></Radio>
    </RadioGroup>
  </div>
</template>
<script>

export default {
  props:{
    year:{type:Number,default:2018},
    dateDimension:{type: String, default:"QM"}, // 默认是 "QM" "WD"
  },
  created(){
    this.dYear = (new Date()).getFullYear()
  },
  computed:{
    yearList(){
      let currrentYear = this.year - 3;
      let rs = [];
      for(var i =0; i<5;i++){
        rs.push({
          value:currrentYear+i,
          label:currrentYear+i
        })
      }
      return rs;
    },
    dateTimeTypeList(){
      let filterArr = this.dateDimension.split('')
      return [{label:"季",value:"Q"},{label:"月",value:"M"},{label:"周",value:"W"},{label:"天",value:"D"}].filter(item => {
        return filterArr.includes(item.value)
      })
    }
  },
  data(){
    return {
      qmwd:"M",
      dYear:2018
    }
  },
  methods:{
      val(){
          return {
            year:this.dYear,
            dateDimension:this.dateDimension
          }
      }
  },
  watch:{
//    dateTimeTypeList(val){
//      this.dateDimension = val[0].value
//    },
    dateDimension(dateDimension){
      this.$nextTick(()=>{
        this.dateDimension = dateDimension.substr(0,1)
      })
    }
  }
}
</script>
