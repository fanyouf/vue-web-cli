<template>
  <div>
    <nav class="flexa" style="justify-content:space-between;margin-right:50px;">
      <ButtonGroup class="nav-level2">
        <Button
          @click="hTabChange('Target')"
          :class="{'ivu-btn-primary' :componentName=='Target'}"
        >目标</Button>
        <Button
          @click="hTabChange('Forecast')"
          :class="{'ivu-btn-primary' :componentName=='Forecast'}"
        >预测</Button>
      </ButtonGroup>
    </nav>
    <keep-alive>
      <component
        :is="componentName"
        :pVersionType="pVersionType"
        :pSideBarCond="pSideBarCond"
        @upDateForcastCondition="hUpDateForcastCondition"
        :pForcecastCondition="forecastCondition"
      ></component>
    </keep-alive>
  </div>
</template>
<script>
import Forecast from "./TAndFForcast";
import Target from "./TAndFTarget";
import { SPSCONST } from "@/const";

export default {
  components: { Forecast, Target },
  props: {
    pVersionType: {
      type: String,
      required: true,
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        return Object.keys(SPSCONST.VERSIOIN_TYPE_VALUE_MAP).includes(
          value.toUpperCase()
        );
      }
    },
    pSideBarCond: { type: Object, required: true }
  },

  data() {
    return {
      componentName: "Target",
      forecastCondition: {},

      setForcastCondition: rs => {
        this.forecastCondition = rs;
      }
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

