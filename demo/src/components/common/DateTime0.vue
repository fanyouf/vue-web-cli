<template>
  <!--时间区间选择组件，按年月周控制-->
  <div class="flexa">
    <div >
      <label style="width:100px;">时间维度:</label>
      <Select class="mw100" v-model="qmwd" placeholder="请选择时间维度">
          <Option v-for="item in list" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </div>

    <div>
      <label style="width:100px;">时间区间:</label>
      <div>
        <el-date-picker v-if="initDateRange.dateDimension!='Q'" v-model="initDateRange.startDate" :type="getType" :format="getFormat" placeholder="起始"
                        :picker-options="pickerOptions" v-on:change="startDateChange">
        </el-date-picker>
        <div v-else>
          <el-input-number size="mini" v-model="initDateRange.startYear" controls-position="right"></el-input-number>年
          <el-select v-model="initDateRange.startQuarter" placeholder="季度" style="width: 50px;">
            <el-option label="Q1" value="1"></el-option>
            <el-option label="Q2" value="2"></el-option>
            <el-option label="Q3" value="3"></el-option>
            <el-option label="Q4" value="4"></el-option>
          </el-select>
        </div>
        至
        <el-date-picker v-if="initDateRange.dateDimension!='Q'"  v-model="initDateRange.endDate" :type="getType" :format="getFormat" placeholder="结束"
                        :picker-options="pickerOptions" v-on:change="endDateChange">
        </el-date-picker>
        <div v-else>
          <el-input-number size="mini" v-model="initDateRange.endYear" controls-position="right"></el-input-number>年
          <el-select v-model="initDateRange.endQuarter" placeholder="季度" style="width: 50px;">
            <el-option label="Q1" value="1"></el-option>
            <el-option label="Q2" value="2"></el-option>
            <el-option label="Q3" value="3"></el-option>
            <el-option label="Q4" value="4"></el-option>
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  export default{

    methods:{
      getValue(){
        return this.dateDimension
      }
    },
    props:{
      initDateRange:{
        type:Object,
        required:true,
        dafault:function(){
          return {
            startDate:this.start,//起始时间
            endDate:this.end,//结束时间
            startYear:(new Date()).getFullYear(),//起始年份
            endYear:(new Date()).getFullYear(),//结束年份
            startQuarter:'1',
            endQuarter:'4',
            qmwd: this.defaultQmwd,
          }
        }
      },
      start:{
        type:String,
        required:false,
        default:moment().format('YYYY-MM-DD')
      },
      end:{
        type:String,
        required:false,
        default:moment().format('YYYY-MM-DD')
      }
    },
    computed:{
      getType(){
        let mappsetting = {'Q':'month','M':'month','W':'week','D':'date'}
        return mappsetting[this.dateDimension]
      },
      getFormat(){
        let mappsetting = {'Q':'yyyy年0Q季','M':'yyyy年MM月','W':'yyyy年WW周','D':'yyyy年MM月dd日'}
        return mappsetting[this.dateDimension]
      }
    },
    data(){
      return {

        list: this._CONST.dateDimension,

        pickerOptions: {
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          }, {
            text: '昨天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          }, {
            text: '一周前',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', date);
            }
          }],
          firstDayOfWeek:1
        },
      }
    },
    methods:{
      startDateChange(date){
        let startMoment = moment(date);
        let endMoment = moment(this.endDate);

        let mills = startMoment.diff(endMoment);
        if(mills > 0){
          this.$Message.warning({content: '起始日期大于结束日期', duration: 10, closable: true});
        }
        if(this.syncBegin != undefined){
          this.syncBegin.call(this,date);
        }
      },
      endDateChange(date){
        console.log(date,this.startDate)
        let startMoment = moment(this.startDate);
        let endMoment = moment(date);

        let mills = startMoment.diff(endMoment);
//        console.log("startMoment",startMoment," endMoment",endMoment,"mills",mills)
        if(mills > 0){
          this.$Message.warning({content: '起始日期大于结束日期', duration: 10, closable: true});
        }

        if(this.syncEnd != undefined){
          this.syncEnd.call(this,date);
        }
      },
      getDateRange(){
        if(this.dateType != undefined){
          let format = 'YYYY-MM-DD';
          if(this.dateType == 'month') format = 'YYYY-MM';
          if(this.dateType == 'week') format = 'YYYY-WW';
          if(this.dateType == 'quarter') format = 'YYYY-0Q';
          let startDate = moment(this.startDate).format(format);
          let endDate = moment(this.endDate).format(format);
          return [startDate,endDate];
        }
        return [];
      }
    }
  }
</script>
