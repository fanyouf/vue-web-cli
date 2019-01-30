<template>
    <div>
        年份:
        <Select v-model="value.currentSelectedYear" style="width:80px;" size="small">
          <Option v-for="item in yearList" :value="item.value" :key="item.label">{{ item.label }}</Option>
        </Select>
        周期：
        <Button title="全年四个季度" :class="{'selected':(/q/i).test(value.type)}" size='small' @click="hClickQ">季度</Button>
        <Button title="全年12个月份" :class="{'selected':(/m/i).test(value.type)}" size='small' @click="hClickM">月份</Button>
        <Poptip v-model="visibleWeek" placement="bottom">
            <Button @click="hClickW"  size='small' :class="{'selected':(/w/i).test(value.type)}">周{{(/w/i).test(value.type) ? textOnWeek : ""}}</Button>
            <div slot="title">请选择某个具体的月</div>
            <div slot="content">
                <Select v-model="value.currentSelectedMonthForWeek" 
                @on-change="hClickW"
                size='small' style="width:100px">
                    <Option v-for="item in value.monthList" :value="item" :key="item">{{ item+'月' }}</Option>
                </Select>
                <!-- <p style="margin-top:20px">
                    <Button @click="hClickW" size='small'>确定</Button>

                    trigger="hover"
                </p> -->
            </div>
        </Poptip>
        <Poptip v-model="visibleDay"  placement="bottom">
            <Button @click="hClickD" size='small' :class="{'selected':(/d/i).test(value.type)}">天{{(/d/i).test(value.type) ? textOnDay : ""}}</Button>
            <div slot="title">请选择某个具体的月</div>
            <div slot="content">
                <Select v-model="value.currentSelectedMonthForDay" 
                @on-change="hClickD"
                size='small' style="width:100px">
                    <Option v-for="item in value.monthList" :value="item" :key="item">{{ item+'月' }}</Option>
                </Select>
                <!-- <p style="margin-top:10px">
                    <Button @click="hClickD" size='small'>确定</Button>
                </p> -->
            </div>
        </Poptip>
        <!-- <div>
            当前的value:{{value}}
        </div> -->
    </div>
</template>

<script>
export default {
  props: {
    isViewDetail:{
      type:Boolean,
      default:false,
    },
    value: {
      type: Object,
      required: true
      // default:()=>{
      //     特殊的属性名字：value对应 在父组件中使用时用到的v-model
      //     ****子组件中直接修改prop***
      //     return {
      //         year:"",
      //         type:"m",
      //         dayRange:["",""],
      //         monthList:[1,2,3,4,5,6,7,8,9,10,11],
      //         currentSelectedMonthForWeek:"5"
      //     }
      // }
    }
  },
  data: () => {
    return {
      visibleWeek: false,
      visibleDay: false,
      yearList: []
    };
  },
  created() {
    this.yearList = this.initYearList();
  },
  computed: {
    textOnWeek() {
      return `[${this.value.currentSelectedMonthForWeek}月]`;
    },
    textOnDay() {
      return `[${this.value.currentSelectedMonthForDay}月]`;
    }
  },
  methods: {
    hClickQ() {
      this.value.type = "q";
    },
    hClickM() {
      this.value.type = "m";
    },
    hClickW() {
      this.visibleWeek = false;
      this.value.type = "w";
    },
    hClickD() {
      this.visibleDay = false;
      this.value.type = "d";
    },
    initYearList() {
      let currentYear = new Date().getFullYear();
      let ret = [
        { label: currentYear + "年", value: currentYear },
        { label: currentYear + 1 + "年", value: currentYear + 1 }
      ];
      if(this.isViewDetail){
        ret = [ { label: (currentYear-1) + "年", value: currentYear-1 },...ret]
      }
      return ret;
    },
    updateMonthList(year) {
      //  根据当前选中的年份和系统此时的时间来设置可以使用的月份
      //  原则是：当前月及未来月

      if (year > new Date().getFullYear()) {
        return {
          monthList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          currentSelectedMonthForWeek: 1,
          currentSelectedMonthForDay: 1
        };
      } else {
        return {
          monthList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(
            item => item >= new Date().getMonth() + 1
          ),
          currentSelectedMonthForWeek: new Date().getMonth() + 1,
          currentSelectedMonthForDay: new Date().getMonth() + 1
        };
      }
    }
  },
  watch: {
    "value.currentSelectedYear": {
      handler(newVal, oldVal) {
        let {
          monthList,
          currentSelectedMonthForWeek,
          currentSelectedMonthForDay
        } = this.updateMonthList(newVal);
        this.value.monthList = monthList;
        this.value.currentSelectedMonthForWeek = currentSelectedMonthForWeek;
        this.value.currentSelectedMonthForDay = currentSelectedMonthForDay;
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.selected {
  color: #fff;
  background-color: #2d8cf0;
  border-color: #2d8cf0;
}
</style>