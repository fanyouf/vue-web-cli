<!--气泡图-->
<template>
  <div :style="{height: height+'px'}" ref="scatterChart">

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
      datas:{
        type:Array,
        required:false,
        default:function () {
          return undefined
        }
      }
    },
    data(){
      return {
        myChart:{},
      }
    },
    methods:{
      initCharts(){
        let dom = this.$refs.scatterChart;
        this.myChart = echarts.init(dom);
        this.myChart.setOption(this.option,true);

        //chart图表点击事件
        this.myChart.on('click',function(params){
          console.log("click",params);
        });
      },
      setCharts(){
        this.myChart.setOption(this.option,true);
      },
      reloadCharts(){
        if (!this.myChart) {
          this.initCharts();
          return;
        }
        this.setCharts();
      },
    },
    computed: {
      option(){
        let self = this;
        //data = [x轴，y轴，name，legend名称]
        let option = {
          legend: {
            right: 10,
            data: this.legendList
          },
          xAxis: {
            name:this.xName,
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            },
            axisLabel:{
              formatter:function (value,index) {
                if(self.xIsRatio == true){
                  return parseFloat(value * 100).toFixed(1) + '%';
                }else{
                  return value;
                }
              }
            }
          },
          yAxis: {
            name:this.yName,
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            },
            scale: true,
            axisLabel:{
              formatter:function (value,index) {
                if(self.yIsRatio == true){
                  return parseFloat(value * 100).toFixed(1) + '%';
                }else{
                  return value;
                }
              }
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: function (params) {
//              console.log(params)
              return params.value[2] + ' <br/> '+ 'GMV:'+params.value[4] + '<br/>'
                + 'GMV占比:' + parseFloat(params.value[1] * 100) .toFixed(2) +'%' + '<br/>'
                + '同比增长:' + parseFloat(params.value[0] * 100).toFixed(2) + '%';
            }
          },
          series: [{
            name: '品牌',
            data: this.datas,
            type: 'scatter',
            //圆圈大小按照gmv占比大小界定
            symbolSize: function (data) {
              if(data == null || data[1] == null || data[1] * 100 *5 < 20) return 20;
              if(data[1] * 100 * 5 > 80) return 80;
              return data[1] * 100 * 5;
            },
            label: {
              show:false,
              formatter: function (param) {
                return param.data[3] ;
//                  return param.data[3] + '\n 占比：' + param.data[1] + '\n 同比：' + param.data[0] ;
              },
              color:"#000",
              fontSize:"16",
//              emphasis: {
//                show: true,
//                formatter: function (param) {
//                  return param.data[3] ;
//                },
//                position: 'center',
//                color:"#000",
//                fontSize:"16"
//              }
            },
            itemStyle: {
              normal: {
                shadowBlur: 10,
                shadowColor: 'rgba(25, 100, 150, 0.5)',
                shadowOffsetY: 5,
                color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
                  offset: 0,
                  color: 'rgb(129, 227, 238)'
                }, {
                  offset: 1,
                  color: 'rgb(25, 183, 207)'
                }])
              }
            }
          }]
        };
        return option;
      },
      legendList(){
        console.log("this.datas",this.datas)
        if(this.datas != undefined && this.datas.length > 0){
          let legendSet = this.datas.map(data => data[3]);
          return Array.from(legendSet);
        }
        return [];
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
