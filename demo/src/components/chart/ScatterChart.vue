<!--气泡图-->
<template>
  <div :style="{height: height+'px'}" ref="scatterChart">

  </div>
</template>

<script>
  import echarts from 'echarts';
  var clolrArr = ['#EA6565', '#FFD85B', '#B8E986', '#8BD58D', '#61ADE0', '#83C9EE', '#B090B7', '#5FB9B0', '#E78947',];
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
          return undefined;
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
        this.initCharts();
      },
    },
    computed: {
      grid(){
        let grid = {
          left:100,
          right:'5%',
        };
        if(window.screen.width > 1600){
          grid.left = '5%';
        }
        return grid;
      },
      option(){
        let self = this;
        let option = {
          legend: {
            bottom: 5,
            type:'scroll',
            data: this.legendList
          },
          color: clolrArr,
          tooltip:{
            trigger: 'item',
            formatter: function (params) {
//              console.log(params)
              return params.marker + params.seriesName + '<br/>'+"SKU数量:" + params.name + '<br/>' + "GMV:" + params.value.toFixed(2) + '<br/>';
            }
          },
          xAxis: {
            name:this.xName,
//            nameLocation:'middle',
//            nameTextStyle:{
//              color:'#000',
//              fontWeight:'bold',
//              fontSize:14,
//              padding:[5,0,5,0]
//            },
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
            },
            data:this.xAxisData
          },
          yAxis: {
            name:this.yName,
//            nameLocation:'middle',
//            nameTextStyle:{
//              color:'#000',
//              fontWeight:'bold',
//              fontSize:14,
//              padding:[5,15,5,0]
//            },
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
          series: self.series
        };
        option.grid = this.grid;
        return option;
      },
      legendList(){
        if(this.datas != undefined && this.datas.length > 0){
          let legends = this.datas.map(data => data.name);
          return legends;
        }
        return [];
      },
      xAxisData(){
        if(this.datas == undefined || this.datas.length == 0) return [];
        return this.datas.map(da => da.x);
      },
      series(){
        if(this.datas == undefined || this.datas.length == 0) return [];
        let self = this;
        let seriesArr = this.datas.map( (data,index) => {
          let series = {};
          series.name = data.name;
          series.type = 'scatter';
          let arr = [];
          for(let i=0;i<index;i++){
            arr.push(null);
          }
          arr.push(data.y);
          series.data = arr;
          series.symbolSize = function (param) {
            let size = 50;
            let minSize = 20;
            let maxSize = 100;
            if(!isNaN(data.size)){
              if(data.size >= maxSize){
                size = maxSize;
              }else{
                size = data.size;
              }
            }
            return size;
          }
          series.label = {
//            emphasis: {
//              show: true,
//              formatter: function (param) {
////                console.log("formatter",param);
//                return param.seriesName + '\n ' + self.xName + ':' + param.name + '\n ' + self.yName + ':' + param.data ;
//              },
//              position: 'bottom',
//              color:"#000",
//              fontSize:"16"
//            }
          };
          series.itemStyle = {
            normal: {
              shadowBlur: 10,
              shadowColor: 'rgba(25, 100, 150, 0.5)',
              shadowOffsetY: 5,
//              color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
//                offset: 0,
//                color: clolrArr[index % 9]
//              }, {
//                offset: 1,
//                color: clolrArr[ (index + 8) % 9]
//              }])
            }
          };
          return series;
        });
        return seriesArr;
      }
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
