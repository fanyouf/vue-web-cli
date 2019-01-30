<!--正负交错条形图-->
<template>
  <div :style="{height: height+'px'}" ref="plusMinsChart">
    <!--<img :src="logo"/>-->
  </div>
</template>

<script>
  import echarts from 'echarts';
  import down from '@/assets/img/arrow-down.png'
  import up from '@/assets/img/arrow-up.png'
  import blue from '@/assets/img/blue.png'
  export default{
    props:{
      height:{
        type:Number,
        required:false,
        default:function () {
          return 500;
        }
      },
      gmvList:{//gmv列表 { id:112,name:'',gmv:'',old:'',yoy:'' }
        type:Array,
        required:false,
        default:function () {
          return [];
        }
      }
    },
    data(){
      return {
        myChart:{},
//        logo:down
      }
    },
    methods:{
      initCharts(){
        let dom = this.$refs.plusMinsChart;
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
      option(){
        let self = this;
        let option = {
          color:['#5FB9B0','#797CC5','#EA6565'],
          tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
              type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter:function(params){
//              console.log("param",params)
              if(params == undefined || params.length == 0) return '';
              let formatter = '';
              let xAxisName = params[0].name + '<br/>';
              formatter = formatter + xAxisName;

              let obj = self.gmvList.filter(g => g.name == params[0].name)[0];
              let cur = params[0];
              let last = params[1];

              let gmv = (obj.gmv == null || isNaN(obj.gmv)) ? "-" :obj.gmv;
              let old = (obj.old == null || isNaN(obj.old)) ? "-" : obj.old;
              formatter = formatter + cur.seriesName + ' : ' + ( isNaN(gmv) ? gmv : gmv.toFixed(1) ) +  '<br/>';
              formatter = formatter + last.seriesName + ' : ' + ( isNaN(old) ? old : Math.abs(old).toFixed(1) ) +  '<br/>';
              let yoy = "-";
              if(!isNaN(gmv) && !isNaN(old) && old != 0){
                yoy = gmv / Math.abs(old) - 1;
              }
              formatter = formatter + '同比:' + ( isNaN(yoy) ? yoy : (yoy * 100).toFixed(2) ) +  '%<br/>';
              return formatter;
            }
          },
          legend: {
            data:[ '前一年GMV','所选时段GMV','同比'],
            bottom:5
          },
          xAxis : [
            {
              show:false,
              type : 'value'
            }
          ],
          yAxis : [
            {
              type : 'category',
              axisTick : {show: false},
              data : this.yAxis,
//              offset:0,
              axisLine:{
                show:false
              },
              axisLabel : {
                formatter : function(params){
                  if(params.length <= 15){
                    return params;
                  }
                  return params.substr(0,15) + "...";
                },
//                align:'left'
              }
            }
          ],
          series : [
            {
              name:'所选时段GMV',
              type:'bar',
              stack: '总量',
              label: {
                normal: {
                  show: true,
                  position: 'insideLeft',
                  formatter:function(params){
                    let name = params.name;
                    let gmv = self.gmvList.filter(gmv => gmv.name == name)[0];
                    let curGmv = gmv.gmv;
                    if(curGmv == null || isNaN(curGmv)){
                      return "-";
                    }
                    return Math.abs(curGmv/10000).toFixed(1);
                  }
                }
              },
              data:this.series[0]
            },
            {
              name:'前一年GMV',
              type:'bar',
              stack: '总量',
              label: {
                normal: {
                  show: true,
                  position: 'insideRight',
                  formatter:function(params){
//                    console.log("11111",params)
                    let name = params.name;
                    let last = self.gmvList.filter(gmv => gmv.name == name)[0];
                    let lastGmv = last.old;
                    if(lastGmv == null || isNaN(lastGmv)){
                      return "-";
                    }
                    return Math.abs(lastGmv/10000).toFixed(1);
                  }
                }
              },
//              barMinHeight:60,
              data:this.series[1]
            },
            {
              name:'同比',
              type:'bar',
              stack:'总量',
              label: {
                normal: {
                  show: true,
                  color: '#333',
                  position: 'insideLeft',
                  formatter:function(params){
                    let value = params.value;
                    let name = params.name;
                    let obj = self.gmvList.filter(g => g.name == name)[0];
                    let yIndex = self.yAxis.indexOf(name);
                    let gmv = self.series[0][yIndex];
                    let lastGmv = ( isNaN(obj.old) || obj.old == null ) ? "-" : obj.old;
                    let yoy = "-";
                    if(!isNaN(gmv) && gmv != null && !isNaN(lastGmv) && lastGmv != 0){
                      yoy = ((Math.abs(gmv) - Math.abs(lastGmv)) / Math.abs(lastGmv) * 100).toFixed(2);
                    }
//                    let yoy = ((Math.abs(gmv) - Math.abs(lastGmv)) / Math.abs(lastGmv) * 100).toFixed(1);
                    if(isNaN(yoy)){
                      return "";
                    }
                    if(!isNaN(yoy) && yoy < 0){
                      return '{down|}{green|'+yoy+'%}';
                    }
                    return '{up|}{red|'+yoy+'%}';
                  },
                  rich:{
                    green:{
                      color:'white',
                      backgroundColor: 'green',
                      padding: [2, 4],
                      borderRadius: 2
                    },
                    red:{
                      color:'white',
                      backgroundColor: 'red',
                      padding: [2, 4],
                      borderRadius: 2
                    },
                    up:{
                      backgroundColor: {
                        image: up
                      }
                    },
                    down:{
                      backgroundColor: {
                        image: down
                      }
                    }
                  }
                }
              },
              lineStyle:{
                width:0
              },
              data:this.series[2]
            },
          ]
        };
        if(this.showDataZoom == true){
          option.dataZoom = [
            {
              type: 'inside',
              yAxisIndex: [0],
              right: "1%",
              start: 0,
              end: 50,
              show: true,
            }
          ];
        }
        option.grid = {
          left:'2%',
          right:'2%',
          containLabel: true
        }
        return option;
      },
      yAxis(){
        let yAxisData = this.gmvList.map(gmv => gmv.name);
        return yAxisData;
      },
      series(){
        if(this.gmvList == undefined || this.gmvList.length == 0) return [ [],[],[]];
        let series = [];
        let curGmv = this.gmvList.map(gmv => gmv.gmv == null ? 0.001 : Math.abs(gmv.gmv));
        let lastYearGMv = this.gmvList.map(gmv => gmv.old == null ? -0.001 :
          (gmv.old == 0 ? -0.001 : Math.abs(gmv.old) * -1));
        let yoy = this.gmvList.map(gmv => 0);
        series.push(curGmv);
        series.push(lastYearGMv);
        series.push(yoy);
        return series;
      },
      showDataZoom(){
        if(this.gmvList == undefined || this.gmvList.length == 0) return false;
        if(this.gmvList.length > 10){
          return true;
        }
        return false;
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
