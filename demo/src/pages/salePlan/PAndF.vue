<template>
    <div>
        <nav>
          <ButtonGroup class="nav-level2">
          <Button @click="hTabChange('Plan')"     :class="{'ivu-btn-primary' :componentName=='Plan'}">计划</Button>
          <Button @click="hTabChange('Forecast')" :class="{'ivu-btn-primary' :componentName=='Forecast'}">预测</Button>
          </ButtonGroup>
        </nav>

        <keep-alive>
          <component 
          :is="componentName"
          :pSideBarCond="pSideBarCond"
          :pDataType="pDataType"
          @upDateForcastCondition="hUpDateForcastCondition"
          :pForcecastCondition="forecastCondition"></component>
        </keep-alive>
    </div>
</template>
<script>
import Plan from "./PAndFPlan";
import Forecast from "./PAndFForecast";

export default {
  props: {
    pDataType: {
      type: String,
      required: true,
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        return ["GMV", "SALE"].indexOf(value.toUpperCase()) > -1;
      }
    },
    pSideBarCond: { type: Object, required: true }
  },
  components: { Plan, Forecast },
  data() {
    return {
      componentName: "Plan",
      forecastCondition: {}
    };
  },
  methods: {
    hTabChange(tabName) {
      this.componentName = tabName;
    },
    hUpDateForcastCondition(val) {
      this.forecastCondition = val;
    }
  }
};
</script>

