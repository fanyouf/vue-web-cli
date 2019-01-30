<template lang="html">
  <div class="" ref="scatterContainer">
    <div class="analyzeBoard-content-title">
      <div>
        {{title}}<helpIcon :title="titleInfo"></helpIcon>
      </div>
      <Poptip v-show="zeroNegativeList.length" trigger="hover" placement="bottom-end">
        <span style="color:red">!有值为0或者负值</span>
        <div slot="content">
          <p>去年同期GMV为0或负值</p>
          <div v-for="item in zeroNegativeList" :key="item.label">
            <span>{{item.label}}</span> :<span>{{item.value}}</span>
          </div>
        </div>
      </Poptip>
    </div>
    <div ref="scatterId" style="height:400px;"></div>
  </div>
</template>

<script>
let title = "GMV";
const echarts = require("echarts");
let data = [];
function getOption(title) {
  return {
    xAxis: {
      splitLine: {
        lineStyle: {
          type: "dashed"
        }
      },
      name: "同比去年增长",
      nameLocation: "center",
      nameGap: 30,
      axisLabel: {
        formatter: "{value}%"
      }
    },
    yAxis: {
      splitLine: {
        lineStyle: {
          type: "dashed"
        }
      },
      name: title + "占比",
      nameLocation: "center",
      nameGap: 32,
      offset: -5,
      axisLabel: {
        formatter: "{value}%"
      }
    },
    tooltip: {
      backgroundColor: "rgba(50,50,50,0.5)",
      trigger: "item",
      formatter: function(params) {
        return (
          params.data[2] +
          "<br/> " +
          title +
          "占比:" +
          params.data[1] +
          "% <br/>  同比增长:" +
          params.data[0] +
          "%"
        );
      }
    },
    series: {
      // name: '2015',
      data: data[1],
      type: "scatter",
      emphasis: {
        label: {
          // emphasis: {
          show: false,
          formatter: function(param) {
            return (
              param.data[2] +
              "\n " +
              title +
              "占比:" +
              param.data[1] +
              "% \n 同比增长:" +
              param.data[0] +
              "%"
            );
          },
          position: "bottom",
          color: "#000",
          fontSize: "12"
          // }
        }
      },
      itemStyle: {
        normal: {
          shadowBlur: 10,
          shadowColor: "rgba(25, 100, 150, 0.8)",
          shadowOffsetY: 5,
          color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
            {
              offset: 0,
              color: "rgb(129, 227, 238)"
            },
            {
              offset: 1,
              color: "rgb(25, 183, 207)"
            }
          ])
        }
      }
    }
  };
}
function formatNum(num) {
  if (!num || isNaN(num)) {
    return num;
  }
  num = num.toString().replace(/\$|\,/g, "");
  let sign = num == (num = Math.abs(num));
  num = Math.floor(num * 10 + 0.50000000001);
  let cents = num % 10;
  num = Math.floor(num / 10).toString();
  for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
    num =
      num.substring(0, num.length - (4 * i + 3)) +
      "," +
      num.substring(num.length - (4 * i + 3));
  }
  return (sign ? "" : "-") + num + "." + cents;
}
import helpIcon from "@/components/common/helpIcon";
export default {
  props: {
    titleType: { type: String, required: true },
    pDataScatter: { type: Array, required: true }
  },
  components: { helpIcon },
  data() {
    return {
      title: "增长分析",
      titleInfo:
        "由同比去年增长和GMV/销量占比两个维度构成矩阵，分析品类/品牌/SKU的增长变动情况。",
      zeroNegativeList: []
    };
  },
  methods: {
    draw(newData) {
      this.zeroNegativeList = [];
      let totalval = newData.reduce((val, item) => val + item.val, 0),
        option = getOption(this.titleType),
        data = [],
        rs = [];

      newData.forEach(item => {
        if (item.yoy != 0) {
          let r = [];
          r[0] = (((item.val - item.yoy) / item.yoy) * 100).toFixed(1); //x 同比
          r[1] = (100 * (item.val / totalval)).toFixed(1); //y 占比
          r[2] = item.name;
          r[3] = item.yoy;
          r[4] = item.val;
          data.push(r[1]); //要画散点图的y值
          rs.push(r);
        } else {
          this.zeroNegativeList.push({ label: item.name, value: item.yoy });
          // this._error(`${item.name}的yoy值是0，不能参与同比增长计算，不会出现在气泡图中。`)
        }
      });
      //  控制气泡的大小
      let min = Math.min(...data),
        max = Math.max(...data);
      option.series.symbolSize = (function(d) {
        return function(data) {
          // console.info(data[1],d)
          return Math.min(Math.max((data[1] / d) * 20, 20), 40);
        };
      })(max - min);
      option.series.data = rs;
      this.myChart && this.myChart.setOption(option, true);
    }
  },
  mounted() {
    this.myChart = this._echarts.init(this.$refs.scatterId);
  },
  watch: {
    pDataScatter(val) {
      this.draw(val);
    }
  }
};
</script>
