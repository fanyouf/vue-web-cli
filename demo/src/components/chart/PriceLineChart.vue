<!--气泡图-->
<template>
  <div>
    <div style="display: none;">
 {{legendData}}    <br/>   <br/>
  {{xAxisData}}<br/> <br/>
  {{seriesData}}<br/> <br/>   </div>
    <div :style="{height: height+'px'}" ref="scatterChart">

  </div>
  </div>
</template>

<script>
  import echarts from 'echarts';
  export default{
    props:{
      height:{
        type:Number,
        required:false,
        default:function () {
          return 500;
        }
      },
      xName:{
        type:String,
        required:false,
        default:function () {
          return undefined;
        }
      },
      yName:{
        type:String,
        required:false,
        default:function () {
          return undefined;
        }
      },
      xIsRatio:{
        type:Boolean,
        required:false,
        default:function () {
          return false;
        }
      },
      yIsRatio:{
        type:Boolean,
        required:false,
        default:function () {
          return false;
        }
      },
      legendData:{
        type:Array,
        required:false,
        default:[]
      }   ,
      xAxisData:{
            type:Array,
            required:false,
            default:[]
          }  ,
      seriesData:{
                type:Array,
                required:false,
                default:[]
              },

    },
    data(){
      return {
        myChart:{},
      }
    },
    computed: {
    },
    methods:{
      initCharts(){
        let dom = this.$refs.scatterChart;
        this.myChart = echarts.init(dom);
        this.myChart.setOption(this.option,true);
      },
      setCharts(){
        this.myChart.setOption(this.option,true);
      }
    },
    computed: {
      option(){
        let option = {
            title: {
                text: '',
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },

            },
            legend: {
              data:this.legendData
              // data:['辅助','支出','收入']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type : 'category',
                splitLine: {show:false},
                 data: this.xAxisData
                //data : ["11月1日","11月2日","11月3日","11月4日","11月5日","11月6日","11月7日","11月8日","11月9日"]
            },
            yAxis: {
                type : 'value'
            },
            series: [
                {
                  //  name: '辅助',
                    name:this.legendData[0],
                    type: 'line',
                    stack: '总量',
                    data:this.seriesData[0]
                     // data: [0, 900, 1245, 1530, 1376, 1376, 1511, 1689, 1856, 1495, 1292]
                },
                {
                   // name: '收入',
                  name:this.legendData[1],
                    type: 'line',
                    stack: '总量',
                  data:this.seriesData[1]
                   // data: [900, 345, 393, '-', '-', 135, 178, 286, '-', '-', '-']
                },
                {
                   // name: '支出',
                  name:this.legendData[2],
                    type: 'line',
                    stack: '总量',
                  data:this.seriesData[2]
                   // data: ['-', '-', '-', 108, 154, '-', '-', '-', 119, 361, 203]
                }
            ]
        };
        return      option;
      },

    },
    mounted(){
      setTimeout( () => {
        this.initCharts();
      },1000);
    },
    updated(){
      if (!this.myChart) {
        this.initCharts();
      }
      this.setCharts();
    }
  }
</script>
