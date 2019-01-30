<template>
    <div id="echartDom"
        :style="{height:height,width:width}"
    ></div>
</template>

<script>
const _ = require("lodash");

let digestNumber = 2;

function getZuobiao(arr, h = 100, w = 80, left = 10, bottom = 10) {
  //取正立坐标,顺时针方向
  let zuobiaoArr = [];
  let per = 0;
  arr.forEach((val, index) => {
    let array = [];
    per += val;
    let bottomLeft = {
      x: left + ((1 - per) / 2) * w,
      y: bottom + (1 - per) * h
    };
    let bottomRight = {
      x: left + ((1 + per) / 2) * w,
      y: bottom + (1 - per) * h
    };
    if (index == 0) {
      array.push({ x: left + (1 / 2) * w, y: bottom + h });
      array.push(bottomRight);
      array.push(bottomLeft);
    } else {
      let preArray = zuobiaoArr[index - 1];
      let upLeft =
        preArray[index == 1 ? preArray.length - 1 : preArray.length - 2];
      let upRight = preArray[1];

      array.push(upRight);
      array.push(bottomRight);
      array.push(bottomLeft);
      array.push(upLeft);
    }
    zuobiaoArr.push(array);
  });
  let obj = {};
  obj.arr = zuobiaoArr;
  obj.center = zuobiaoArr.map((item, index) => {
    return { x: (item[0].x + item[1].x) / 2, y: (item[0].y + item[1].y) / 2 };
  });
  return obj;
}

function getDaoZuobiao(arr, h = 100, w = 80, left = 10, bottom = 10) {
  let zuobiaoArr = [];
  let per = 0;
  arr.forEach((val, index) => {
    let array = [];
    per += val;
    let bottomLeft = {
      x: left + ((2 + per) / 2) * w,
      y: bottom + (1 - per) * h
    };
    let bottomRight = {
      x: left + ((4 - per) / 2) * w,
      y: bottom + (1 - per) * h
    };
    if (index === 0) {
      array.push({ x: left + w, y: bottom + h });
      array.push({ x: left + 2 * w, y: bottom + h });
      array.push(bottomRight);
      array.push(bottomLeft);
    } else if (index != arr.length - 1) {
      let preArray = zuobiaoArr[index - 1];
      let upLeft = preArray[preArray.length - 1];
      let upRight = preArray[preArray.length - 2];
      array.push(upLeft);
      array.push(upRight);
      array.push(bottomRight);
      array.push(bottomLeft);
    } else {
      let preArray = zuobiaoArr[index - 1];
      let upLeft = preArray[preArray.length - 1];
      let upRight = preArray[preArray.length - 2];
      array.push(upLeft);
      array.push(upRight);
      array.push({ x: left + (3 / 2) * w, y: bottom + 0 });
    }
    zuobiaoArr.push(array);
  });
  let obj = {};
  obj.arr = zuobiaoArr;
  obj.center = zuobiaoArr.map((item, index) => {
    return {
      x: (item[0].x + item[item.length - 1].x) / 2,
      y: (item[0].y + item[item.length - 1].y) / 2
    };
  });
  return obj;
}

const COLORS = ["blue", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc"];

function createRenderItem(
  points,
  valuePercent,
  colorList = ["blue", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc"]
) {
  return function(params, api) {
    let colors = [...colorList].splice(0, valuePercent.length);

    var coords = points[params.dataIndex].map(item => [item.x, item.y]);
    var _points = coords.map(item => api.coord(item));

    return {
      type: "polygon",
      shape: {
        points: _points
      },
      style: api.style({
        fill: colors[params.dataIndex % colors.length],
        stroke: "#fff"
      })
    };
  };
}

// 按拆分比例列表，对数据进行加工，以便于图形显示
const _createData = (dataSource, percentList) => {
  //[{"id":"880","name":"洗衣机","val":879706.362,"yoy":6.413012417E7},
  // {"id":"878","name":"冰箱","val":620490.121,"yoy":2.2859184807E8},
  // {"id":"877","name":"家电配件","val":25424.336,"yoy":0.0}]

  let data = _.cloneDeep(dataSource), // 下面的代码中要对data进行修改，所以要clone
    result = [],
    total = data.reduce((t, item) => {
      return item.val + t;
    }, 0),
    total_split = [],
    total_temp = 0,
    index = 0,
    t = 0,
    percentList1 = [];

  if (data.length == 0 || percentList.length == 0) return result;

  data.sort(function(a, b) {
    return b.val - a.val;
  }); // 倒序，大的在前

  data.forEach(item => {
    item.percent = item.val + t;
    t += item.val;
  });

  t = 0;
  percentList.forEach(item => {
    percentList1.push(item + t);
    t += item;
  });
  if (t != 100) {
    throw new Error("拆分比例不是100%");
  }
  // percentList1 = percentList1.map(item=>item/t);

  // [50,30,20] =>[50,80,100]
  total_split = percentList1.map(item => (item * total) / 100); // 从比例数组映射出值数组
  result = percentList.map(item => {
    return { data: [] };
  });
  while (data.length) {
    let json_now = data.shift(); // 取出第一个元素，同时data的长度会减1
    total_temp = json_now.percent * 1;
    result[index].data.push(json_now);

    if (total_temp >= total_split[index]) {
      if (
        Math.abs(total_temp - total_split[index]) >
        Math.abs(total_temp - json_now.val - total_split[index])
      ) {
        data.unshift(json_now);
        result[index].data.pop();
      }
      index++;
      if (index >= percentList.length) break;
    }
  }
  // 给 result添加其它字段
  result.forEach(item => {
    item.total = item.data.reduce((initVal, item) => {
      return initVal + item.val;
    }, 0);
    item.percent = item.total / total;
  });
  return result; //.reverse();
};

const _createSeries = (
  res,
  colorList = ["blue", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc"]
) => {
  let totalNumber = res.reduce((val, arr) => {
    return val + arr.data.length;
  }, 0);

  let valuePercent = res.map(arr => {
    return 100 * arr.percent;
  });
  let numberPercent = res.map(arr => {
    return 100 * (arr.data.length / totalNumber);
  });
  const left = getZuobiao(valuePercent.map(item => item / 100));
  const right = getDaoZuobiao(numberPercent.map(item => item / 100));

  var series = [
    {
      type: "custom",
      renderItem: createRenderItem(left.arr, valuePercent, colorList),
      data: valuePercent,
      tooltip: {
        formatter: function(item, index) {
          let str = res[item.dataIndex].data
            .map((it, idx) => {
              return `${idx + 1}. ${it.name}: ${it.val}`;
            })
            .join("<br>");

          return [`${item.data.toFixed(digestNumber)}%`, str].join("<br>");
          // return `${item.data}% <br> aaaa`
        }
      },
      label: {
        show: true,
        formatter: e => {
          return (
            e.data.toFixed(digestNumber) +
            "%" +
            "\n 合计:" +
            res[e.dataIndex].total
          );
        }
      }
    },
    {
      type: "custom",
      renderItem: createRenderItem(right.arr, numberPercent, colorList),
      data: numberPercent,
      tooltip: {
        formatter: function(item, index) {
          let str = res[item.dataIndex].data
            .map((it, idx) => {
              return `${idx + 1}. ${it.name}: ${it.val}`;
            })
            .join("<br>");

          return [`${item.data.toFixed(digestNumber)}%`, str].join("<br>");
        }
      },
      label: {
        show: true,
        formatter: e => {
          return (
            e.data.toFixed(digestNumber) +
            "%" +
            "\n 合计:" +
            res[e.dataIndex].data.length +
            "个"
          );
        }
      }
    }
  ];

  left.center.forEach((item, index) => {
    series.push({
      type: "line",
      lineStyle: {
        color: colorList[index],
        type: "dashed"
      },
      itemStyle: {
        borderStyle: "dashed"
      },
      showSymbol: false,
      data: [[item.x, item.y], [right.center[index].x, right.center[index].y]]
    });
  });

  return series;
};

// option = {
//     tooltip:{trigger:"item"},
//     xAxis: {min:0,max:220,show:false},
//     yAxis: {min:0,max:120,show:false},
//     series: series
// }

const echarts = require("echarts");
let myChart = null;
export default {
  props: {
    value: {
      type: Array,
      default: () => {
        return [
          { id: 1, name: "sku1", val: Math.ceil(80 * Math.random()) },
          { id: 2, name: "sku2", val: Math.ceil(80 * Math.random()) },
          { id: 3, name: "sku3", val: Math.ceil(80 * Math.random()) },
          { id: 4, name: "sku4", val: Math.ceil(80 * Math.random()) },
          { id: 5, name: "sku5", val: Math.ceil(80 * Math.random()) },
          { id: 6, name: "sku6", val: Math.ceil(80 * Math.random()) },
          { id: 7, name: "sku7", val: Math.ceil(80 * Math.random()) },
          { id: 8, name: "sku8", val: Math.ceil(80 * Math.random()) }
        ];
      }
    },
    width: { type: Number, defalut: 200 },
    height: { type: Number, default: 200 },
    leftName: { type: String, default: "GMV" },
    rightName: { type: String, default: "数量" },
    percentList: { type: Array },
    digestNumber: { type: Number, default: 2 }
  },
  data() {
    return {
      initPercentList: this.percentList,
      selectedBarIndexList: [true, true, true, true]
    };
  },
  computed: {
    cColor() {
      let color = [
        "#E3AE2E",
        "#F68460",
        "#61ADE0",
        "#8AC346",
        "#B090B7",
        "#5FB9B0",
        "#797CC5"
      ];
      let rs = color.map((item, index) => {
        return this.selectedBarIndexList[index] ? color[index] : "#ccc";
      });
      return rs;
    }
  },

  created() {
    digestNumber = this.digestNumber;

    //this.selectedBarIndexList = Array.from(new Array(this.initPercentList.length), (val,index)=>index)
    this.selectedBarIndexList = new Array(this.initPercentList.length).fill(
      true
    );
    ///console.info(result)

    this.series = _createSeries(
      _createData(this.value, this.initPercentList),
      this.cColor
    );
  },
  mounted() {
    // 基于准备好的dom，初始化echarts实例
    document.getElementById("echartDom").style.width = this.width + "px";
    document.getElementById("echartDom").style.height = this.height + "px";

    var myChart = echarts.init(document.getElementById("echartDom"));
    let that = this;
    // 绘制图表
    myChart.setOption({
      grid: {
        left: 5,
        right: 5,
        top: 5,
        bottom: 20
      },
      tooltip: { trigger: "item" },
      xAxis: {
        min: 0,
        max: 180,
        show: true,
        interval: 10,
        axisLabel: {
          formatter: function(val) {
            if (val == 50) {
              return that.leftName;
            } else if (val == 130) {
              return that.rightName;
            } else return "";
          }
        },
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { show: false }
      },
      yAxis: {
        min: 0,
        max: 120,
        show: false,
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: that.series
    });

    myChart.on("click", e => {
      that.selectedBarIndexList = that.selectedBarIndexList.map(
        (item, index) => {
          return index === e.dataIndex ? !item : item;
        }
      );

      that.series = _createSeries(
        _createData(that.value, that.initPercentList),
        that.cColor
      );

      myChart.setOption(
        {
          grid: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 20
          },
          tooltip: { trigger: "item" },
          xAxis: {
            min: 0,
            max: 180,
            show: true,
            interval: 10,
            axisLabel: {
              formatter: function(val) {
                if (val == 50) {
                  return "GMV";
                } else if (val == 130) {
                  return "数量";
                } else return "";
              }
            },
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: { show: false }
          },
          yAxis: {
            min: 0,
            max: 120,
            show: false,
            axisTick: { show: false },
            axisLine: { show: false }
          },
          series: that.series
        },
        true
      );
    });
  },
  watch: {
    value: {
      handler: val => {
        let result = createData(val, this.initPercentList);
      }
      // immediate:true
    }
  }
};
</script>
