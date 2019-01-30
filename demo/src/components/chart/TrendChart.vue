<template>
  <div style="height: 300px;" :ref="reference">

  </div>
</template>

<script>
import echarts from "echarts";
export default {
  name: "TrendChart",
  props: {
    xAxis: {
      type: Array,
      required: false,
      default: function() {
        return undefined;
      }
    },
    yAxis: {
      type: Array,
      required: false,
      default: function() {
        return undefined;
      }
    },
    series: {
      type: Array,
      required: false,
      default: function() {
        return undefined;
      }
    },
    reference: {
      type: String,
      required: false,
      default: function() {
        return "myChart";
      }
    },
    colorArr: {
      //默认颜色数组
      type: Array,
      required: false,
      default: function() {
        return [
          "#B8E986",
          "#8BD58D",
          "#5FB9B0",
          "#61ADE0",
          "#B090B7",
          "#FFD85B",
          "#EA6565",
          "#FFD85B",
          "#E78947"
        ];
      }
    },
    shadowColor: {
      //阴影区颜色
      type: Array,
      required: false,
      default: function() {
        return ["rgba(137, 189, 27, 0.3)", "rgba(137, 189, 27, 0)"];
      }
    }
  },
  data() {
    return {
      myChart: null
    };
  },
  methods: {
    initCharts() {
      if (this.myChart) {
        this.myChart.dispose(); //销毁实例对象
      }
      let dom = this.$refs[this.reference];
      this.myChart = echarts.init(dom);
      this.myChart.setOption(this.option, true);

      //chart图表点击事件
      this.myChart.on("click", function(params) {
        console.log("click", params);
      });
    },
    setCharts() {
      this.myChart.setOption(this.option, true);
    },
    reloadCharts() {
      if (!this.myChart) {
        this.initCharts();
        return;
      }
      this.initCharts();
    },
    getIsRatio(seriesName) {
      let isRatio = false;
      if (
        this.seriesData != undefined &&
        this.seriesData.length > 0 &&
        this.yAxisData.length > 0
      ) {
        let seriesFilter = this.seriesData.filter(series => {
          return series.name == seriesName;
        });
        if (seriesFilter != undefined && seriesFilter.length > 0) {
          let yAxisIndex = seriesFilter[0].yAxisIndex;
          if (yAxisIndex == undefined) yAxisIndex = 0;
          isRatio = this.yAxisData[yAxisIndex].isRatio;
        }
      }
      return isRatio;
    },
    isChinese(str) {
      if (/^[\u3220-\uFA29]+$/.test(str)) {
        return true;
      }
      return false;
    }
  },
  computed: {
    isRotate() {
      let rotateLength = 8; //x轴倾斜长度
      if (window.screen.width > 1900) {
        rotateLength = 12;
      }
      if (this.xAxis && this.xAxis.length > rotateLength) {
        return true;
      }
      return false;
    },
    isShowAll() {
      if (this.xAxis && this.xAxis.length < 40) {
        return true;
      }
      return false;
    },
    isAllLabel() {
      if (this.xAxis && this.xAxis.length > 0) {
        let totalFontSize = 0,
          fontSize = 14;
        this.xAxis.forEach(xa => {
          xa.split("").forEach(ch => {
            if (this.isChinese(ch)) {
              totalFontSize += fontSize;
            } else {
              totalFontSize += fontSize / 2;
            }
          });
        });
        console.log("totalFontSize", totalFontSize);
        if (totalFontSize <= window.screen.width * 0.8) {
          return true;
        }
      }
      return false;
    },
    grid() {
      let grid = {
        left: 100,
        right: "5%"
      };
      if (window.screen.width > 1600) {
        grid.left = "5%";
      }
      if (this.isRotate) {
        grid.bottom = "40%";
      }
      return grid;
    },
    option() {
      let self = this;
      let option = {
        color: this.colorArr,
        tooltip: {
          trigger: "axis",
          axisPointer: {
            lineStyle: {
              color: "#57617B"
            }
          },
          formatter: function(params) {
            //              console.log("param",params)
            if (params == undefined || params.length == 0) return "";
            let formatter = "";
            let xAxisName = params[0].name + "<br/>";
            formatter = formatter + xAxisName;
            params.forEach(param => {
              let seriesName = param.seriesName;
              let seriesValue = param.value;
              let isRatio = self.getIsRatio(seriesName);
              let formatValue = seriesValue;
              if (!isNaN(formatValue)) {
                if (isRatio == true) {
                  formatValue = parseFloat(formatValue * 100).toFixed(2) + "%";
                } else {
                  formatValue = formatValue.toFixed(1);
                }
              } else {
                formatValue = 0;
              }
              formatter =
                formatter + seriesName + " : " + formatValue + "<br/>";
            });
            return formatter;
          }
        },
        legend: {
          data: this.legendList,
          bottom: 0,
          type: "scroll",
          padding: [20, 0, 0, 0]
        },
        xAxis: [
          {
            type: "category",
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            data: this.xAxis
            //            triggerEvent:true
          }
        ],
        yAxis: this.yAxisData,
        series: this.seriesData
      };

      if (this.xAxis && this.xAxis.length > 0) {
        let _this = this;
        option.xAxis[0].axisLabel = {
          formatter: function(params) {
            if (_this.isAllLabel == true) {
              return params;
            }
            if (params.length <= 15) {
              return params;
            }
            return params.substr(0, 15) + "...";
          }
        };
        if (this.isRotate == true) {
          option.xAxis[0].axisLabel.rotate = 30;
        }
        if (this.isShowAll == true) {
          option.xAxis[0].axisLabel.interval = 0;
        }
      }
      option.grid = this.grid;
      return option;
    },
    yAxisData() {
      let yAxisData = [{ type: "value" }];
      if (this.yAxis != undefined && this.yAxis.length > 0) {
        yAxisData = this.yAxis.map((axis, index) => {
          let yAxis = { show: true, type: "value", isRatio: axis.isRatio };
          yAxis.name = axis.name;
          if (index > 0) {
            yAxis.splitLine = {
              show: false
            };
          }
          if (axis.isRatio == true) {
            yAxis.axisLabel = {
              formatter: function(value, index) {
                return parseFloat(value * 100).toFixed(0) + "%";
              }
            };
          }
          return yAxis;
        });
      }
      return yAxisData;
    },
    seriesData() {
      let seriesData = [{ data: [], type: "line" }];
      if (this.series != undefined && this.series.length > 0) {
        seriesData = this.series.map(ser => {
          let series = {};
          series.name = ser.name;
          series.type = ser.type;
          if (ser.yaxisIndex != undefined) series.yAxisIndex = ser.yaxisIndex;
          series.data = ser.data;

          if (ser.type == "line") {
            series.smooth = true;
            series.lineStyle = { normal: { width: 1 } };
            if (ser.showShadow == true) {
              let color0 = this.shadowColor[0];
              let color1 = this.shadowColor[1];
              series.areaStyle = {
                normal: {
                  color: new echarts.graphic.LinearGradient(
                    0,
                    0,
                    0,
                    1,
                    [
                      {
                        offset: 0,
                        color: "#f5f5f5"
                      },
                      {
                        offset: 0.8,
                        color: "#f5f5f5"
                      }
                    ],
                    false
                  ),
                  shadowColor: "rgba(0, 0, 0, 0.1)",
                  shadowBlur: 10
                }
              };
            }
          } else if (ser.type == "bar") {
            if (ser.isStack == undefined || ser.isStack == true) {
              series.stack = "总量";
            }
            //              series.barWidth = 25;
            if (this.xAxis.length <= 20) {
              series.barWidth = 25;
            }
            //              series.barMinHeight = 10
          }
          return series;
        });
      }
      //        console.log("seriesData",seriesData)
      return seriesData;
    },
    legendList() {
      let legendList = [];
      if (this.series != undefined && this.series.length > 0) {
        legendList = this.series.map(series => {
          return series.name;
        });
      }
      return legendList;
    }
  },
  mounted() {
    setTimeout(() => {
      this.initCharts();
    }, 1000);
  },
  updated() {
    if (!this.myChart) {
      this.initCharts();
    }
    this.setCharts();
  }
};
</script>
