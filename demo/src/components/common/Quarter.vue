<template>
  <!--时间区间选择组件，按年月周控制-->
  <div style="display: inline-block;">
    <div>
      <Poptip class="align-center" content="content" placement="bottom" width="400" v-on:on-popper-hide="popperHide">
        <div>
          <el-input style="width: 170px;" :value="pickTime"
            class="el-date-editor" placeholder="请选择季度" prefix-icon="el-icon-date" @focus="showPicker"></el-input>
        </div>
        <div slot="content" class="align-center">
          <el-date-picker  v-model="year" type="year" placeholder="年" style="width: 150px;" value-format="yyyy">
          </el-date-picker>

          <el-select v-model="quarter" placeholder="季度" size="small" style="width: 150px;">
            <el-option label="Q1" value="1"></el-option>
            <el-option label="Q2" value="2"></el-option>
            <el-option label="Q3" value="3"></el-option>
            <el-option label="Q4" value="4"></el-option>
          </el-select>

        </div>
      </Poptip>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import Vue from 'vue';
  import { DatePicker,Input,Select,Option } from 'element-ui'
  Vue.use(DatePicker);
  Vue.use(Input);
  Vue.use(Select);
  Vue.use(Option);
  export default{
    props:{
      date:{
        type:Date,
        required:false,
        default:function () {
          return undefined;
        }
      },
      type:{
        type:String,
        required:false,
        default:function () {
          return undefined;
        }
      }
    },
    data(){
      return {
        year:'2018',
        quarter:'1'
      }
    },
    methods:{
      showPicker(event){
        console.log(event);
      },
      popperHide(){
        let date = moment().year(this.year).quarter(this.quarter).toDate();
        console.log("date:",date);
        this.$emit('date-change',date,this.type)
      },
    },
    computed:{
      pickTime(){
        return this.year + '年' + this.quarter + '季度';
      }
    },
    mounted(){
      setTimeout(() => {
        if(this.date != undefined){
          let year = moment(this.date).year();
          let quarter = moment(this.date).quarter();
          this.year = year + '';
          this.quarter = quarter + '';
        }else{
          let year = moment().year();
          let quarter = moment().quarter();
          console.log(year,quarter)
          this.year = year + '';
          this.quarter = quarter + '';
        }
      },100);
    }
  }
</script>
