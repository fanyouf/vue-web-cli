<template>
  <!--时间区间选择组件，按年月周控制-->
  <div style="display: inline-block;">
    日期：
    <div style="display: inline-block;" class="dateTime">
      <div v-if="type == 'Q'">
        <Quarter v-on:date-change="dateChange" :date="beginDate" type="beginDate"></Quarter>
        至
        <Quarter v-on:date-change="dateChange" :date="endDate" type="endDate"></Quarter>
      </div>

      <div v-else-if="type == 'D'">
        <el-date-picker style="width:170px;" size="small" v-model="beginDate" type="date" placeholder="起始日期" format="yyyy年MM月dd日"
                        :picker-options="pickerOptions" v-on:change="beginDateChange">
        </el-date-picker>
        至
        <el-date-picker style="width:170px;" size="small" v-model="endDate" type="date" placeholder="结束日期" format="yyyy年MM月dd日"
                        :picker-options="pickerOptions" v-on:change="endDateChange">
        </el-date-picker>
      </div>

      <div v-else-if="type == 'W'">
        <el-date-picker style="width:140px;" size="small" v-model="beginDate" type="week" format="yyyy年WW周" placeholder="起始周"
                        :picker-options="pickerOptions" v-on:change="beginDateChange">
        </el-date-picker>
        至
        <el-date-picker style="width:140px;" size="small" v-model="endDate" type="week" format="yyyy年WW周" placeholder="结束周"
                        :picker-options="pickerOptions" v-on:change="endDateChange">
        </el-date-picker>
      </div>

      <div v-else-if="type == 'M'">
        <el-date-picker style="width:140px;" size="mini" v-model="beginDate" type="month" format="yyyy年MM月" placeholder="起始月"
                        :picker-options="pickerOptions" v-on:change="beginDateChange">
        </el-date-picker>
        至
        <el-date-picker style="width:140px;" size="mini" v-model="endDate" type="month" format="yyyy年MM月" placeholder="结束月"
                        :picker-options="pickerOptions" v-on:change="endDateChange">
        </el-date-picker>
      </div>
    </div>
    &nbsp;&nbsp; | &nbsp;&nbsp;
    <div style="display: inline-block;">
      维度:
      <RadioGroup v-model="type" type="button" size="small" v-on:on-change="dateTypeChange">
        <Radio label="Q" v-if="showQuarter == true">季</Radio>
        <Radio label="M">月</Radio>
        <Radio label="W">周</Radio>
        <Radio label="D">天</Radio>
      </RadioGroup>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import Quarter from "./Quarter.vue";
import "@/assets/less/saledetail/dateTime.less";
import Vue from "vue";
import { DatePicker } from "element-ui";
Vue.use(DatePicker);
export default {
  props: {
    dateType: {
      type: String,
      required: false,
      default: function() {
        return undefined;
      }
    },
    begin: {
      type: Date,
      required: false,
      default: function() {
        return undefined;
      }
    },
    end: {
      type: Date,
      required: false,
      default: function() {
        return undefined;
      }
    },
    showQuarter: {
      type: Boolean,
      required: false,
      default: function() {
        return false;
      }
    },
    syncBegin: {
      type: Function,
      required: false,
      default: function() {
        return undefined;
      }
    },
    syncEnd: {
      type: Function,
      required: false,
      default: function() {
        return undefined;
      }
    },
    syncDateType: {
      type: Function,
      required: false,
      default: function() {
        return undefined;
      }
    }
  },
  components: {
    Quarter
  },
  data() {
    return {
      type: "D", //类型，月：M,周:W,日:D
      beginDate: new Date(), //起始时间
      endDate: new Date() //结束时间
    };
  },
  methods: {
    year2day() {
      let begin = moment()
        .month(0)
        .dayOfYear(1)
        .toDate();
      let end = moment().toDate();
      this.beginDate = begin;
      this.endDate = end;
      if (this.syncBegin != undefined) {
        this.syncBegin.call(this, begin);
      }
      if (this.syncEnd != undefined) {
        this.syncEnd.call(this, end);
      }
    },
    month2day() {
      let monthFormat = moment().format("YYYY-MM");
      let dayFormat = monthFormat + "-01";
      let begin = moment(dayFormat, "YYYY-MM-DD").toDate();
      let end = moment().toDate();
      this.beginDate = begin;
      this.endDate = end;
      if (this.syncBegin != undefined) {
        this.syncBegin.call(this, begin);
      }
      if (this.syncEnd != undefined) {
        this.syncEnd.call(this, end);
      }
    },
    beginDateChange(date) {
      let beginMoment = moment(date);
      let endMoment = moment(this.endDate);

      let mills = beginMoment.diff(endMoment);
      if (mills > 0) {
        this.$Message.warning({
          content: "起始日期大于结束日期",
          duration: 10,
          closable: true
        });
      }
      if (this.syncBegin != undefined) {
        this.syncBegin.call(this, date);
      }
    },
    endDateChange(date) {
      console.log(date, this.beginDate);
      let beginMoment = moment(this.beginDate);
      let endMoment = moment(date);

      let mills = beginMoment.diff(endMoment);
      //        console.log("beginMoment",beginMoment," endMoment",endMoment,"mills",mills)
      if (mills > 0) {
        this.$Message.warning({
          content: "起始日期大于结束日期",
          duration: 10,
          closable: true
        });
      }

      if (this.syncEnd != undefined) {
        this.syncEnd.call(this, date);
      }
    },
    dateTypeChange(type) {
      //时间维度变化
      this.type = type;
      if (this.syncDateType != undefined) {
        this.syncDateType.call(this, type);
      }
    },
    dateChange(date, type) {
      if (type == "beginDate") {
        this.beginDate = date;
        this.beginDateChange(date);
      } else if (type == "endDate") {
        this.endDate = date;
        this.endDateChange(date);
      }
    },
    validateDateRange() {
      console.log("this.dateType", this.dateType);
      if (this.dateType == "M") {
        let months = moment(this.endDate).diff(
          moment(this.beginDate),
          "months"
        );
        console.log("months", months);
        if (months > 24) {
          this.$Message.warning({
            content: "按月查询，选择时间不允许超过24个月",
            duration: 10,
            closable: true
          });
          return false;
        }
      }
      if (this.dateType == "W") {
        let weeks = moment(this.endDate).diff(moment(this.beginDate), "weeks");
        console.log("weeks", weeks);
        if (weeks > 13) {
          this.$Message.warning({
            content: "按周查询，选择时间不允许超过13周",
            duration: 10,
            closable: true
          });
          return false;
        }
      }
      if (this.dateType == "D") {
        let days = moment(this.endDate).diff(moment(this.beginDate), "days");
        console.log("days", days);
        //          if(days > 31){
        //            this.$Message.warning({content: '按天查询，选择天数不允许超过31天', duration: 10, closable: true});
        //            return false;
        //          }
      }
      return true;
    },
    getDateRange() {
      if (this.dateType != undefined) {
        let format = "YYYY-MM-DD";
        if (this.dateType == "M") format = "YYYY-MM";
        if (this.dateType == "W") format = "YYYY-WW";
        if (this.dateType == "Q") format = "YYYY-0Q";
        let beginDate = moment(this.beginDate).format(format);
        let endDate = moment(this.endDate).format(format);
        return [beginDate, endDate];
      }
      return [];
    }
  },
  computed: {
    pickerOptions() {
      let self = this;
      let pickerOptions = {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            }
          },
          {
            text: "月至今",
            onClick(picker) {
              console.log("picker", picker, this);
              self.month2day();
              //self._bus.$emit('month2day');
            }
          },
          {
            text: "年至今",
            onClick(picker) {
              self.year2day();
              //self._bus.$emit('year2day');
            }
          }
        ],
        firstDayOfWeek: 1
      };
      return pickerOptions;
    }
  },
  mounted() {},
  watch: {
    dateType: {
      handler(val) {
        if (this.dateType != undefined) {
          this.type = this.dateType;
        }
        if (this.begin != undefined) {
          this.beginDate = this.begin;
        }
        if (this.end != undefined) {
          this.endDate = this.end;
        }
      }
    },
    begin: {
      handler(val) {
        if (this.begin != undefined) {
          this.beginDate = this.begin;
        }
      }
    },
    end: {
      handler(val) {
        if (this.end != undefined) {
          this.endDate = this.end;
        }
      }
    }
  },
  created() {
    //      this._bus.$on('year2day',this.year2day)
    //      this._bus.$on('month2day',this.month2day)
  }
};
</script>
