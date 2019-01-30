<!--正负交错条形图-->
<template>
  <div :style="{height: height+'px'}" ref="pieChart">

  </div>
</template>

<script>
  import echarts from 'echarts';
  export default{
    name:'PieChart',
    props:{
      name:{
        type:String,
        required:false,
        default:function () {
          return undefined;
        }
      },
      datas:{
        type:Array,
        required:false,
        default:function () {
          //{ name:'',value:1099 }
          return undefined;
        }
      },
      height:{
        type:Number,
        required:false,
        default:function () {
          return 500;
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
        let dom = this.$refs.pieChart;
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
        let option = {
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          series: [{
            name: this.name,
            type: 'pie',
            radius: '68%',
            center: ['50%', '50%'],
            clockwise: false,
            data: this.datas,
            label: {
              normal: {
                textStyle: {
                  color: '#999',
                  fontSize: 14,
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            itemStyle: {
              normal: {
                borderWidth: 2,
                borderColor: '#ffffff',
              },
              emphasis: {
                borderWidth: 0,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }],
          color: [
            '#EA6565',
            '#FFD85B',
            '#B8E986',
            '#8BD58D',
            '#61ADE0',
            '#83C9EE',
            '#B090B7',
            '#5FB9B0',
            '#E78947',
          ],
          backgroundColor: '#fff',
          legend: {
            bottom:5,
            type:'scroll',
          },
        };
        return option;
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
