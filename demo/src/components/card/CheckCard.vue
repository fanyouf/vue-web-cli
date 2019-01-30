<template>
  <div>
    <div class="check-card">
      <div class="flextc">
        <div>
          <h3 class="card-subject mb5">{{ subject }}</h3>
          <Poptip trigger="hover" title="说明" :content="desc" placement="top-end">
            <Icon v-if="icon != undefined" :type="icon" size="15"></Icon>
          </Poptip>
        </div>
        <div class="main-font text-hidd">
          <!--<span :title="value">{{ value | formatPercent(isRatio,isThousand) }}</span>-->
          <!--<Tooltip :content="value" placement="top">-->
            <!--<div class="value-padding-top">{{ value | formatPercent(isRatio,isThousand,fixedNum,isMoney) }}</div>-->
          <!--</Tooltip>-->
          <em v-jumpNumber>{{ value | formatPercent(isRatio,isThousand,fixedNum,isMoney) }}</em>
        </div>

        <div v-if="yoy !== undefined" style="width:100%;padding:0 20px;">
          <div class="yoy">
            <div class="text">同比去年</div>
            <em class="percent"><YOYShow :value="yoy"></YOYShow></em>
          </div>
          <div class="mom">
            <div class="text">环比上月</div>
            <em class="percent"><YOYShow :value="mom"></YOYShow></em>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
import YOYShow from "@/components/yoy/YOYShow";
import { outputMoney } from "@/filter/math.js";
import "@/assets/css/card/Card.css";
export default {
  name: "CheckCard",
  components: {
    YOYShow
  },
  props: {
    subject: {
      type: String,
      required: true
    },
    value: {
      type: Number | String,
      required: true
    },
    isRatio: {
      type: Boolean,
      required: false,
      default: function() {
        return false;
      }
    },
    yoy: {
      type: Number,
      required: false,
      default: function() {
        return undefined;
      }
    },
    mom: {
      type: Number,
      required: false,
      default: function() {
        return undefined;
      }
    },
    icon: {
      type: String,
      required: false,
      default: function() {
        return undefined;
      }
    },
    desc: {
      type: String,
      required: false,
      default: function() {
        return undefined;
      }
    },
    isThousand: {
      type: Boolean,
      required: false,
      default: function() {
        return false;
      }
    },
    isMoney: {
      type: Boolean,
      required: false,
      default: function() {
        return false;
      }
    },
    fixedNum: {
      type: Number,
      required: false,
      default: function() {
        return 2;
      }
    }
  },
  data() {
    return {};
  },
  computed: {},
  filters: {
    formatPercent(val, isRatio, isThousand, fixedNum, isMoney) {
      if (val == undefined || isNaN(val)) {
        return "-";
      }
      if (isRatio == true) {
        return parseFloat(val * 100).toFixed(fixedNum) + "%";
      }
      if (isThousand == true) {
        return outputMoney(val / 10000);
      } else if (isThousand == false && isMoney == true) {
        return outputMoney(parseFloat(val).toFixed(0));
      }
      return val;
    }
  }
};
</script>
