<!--金字塔图-->
<template>
  <div style="height: 500px;" ref="pyramidChart">

  </div>
</template>

<script>
  import echarts from 'echarts';
  export default{
    name:'PyramidChart',
    data(){
      return {
        myChart:{},
      }
    },
    methods:{
      initCharts(){
        let dom = this.$refs.pyramidChart;
        this.myChart = echarts.init(dom);
        this.myChart.setOption(this.option,true);

        //chart图表点击事件
        this.myChart.on('click',function(params){
          console.log("click",params);
        });
      },
      setCharts(){
        this.myChart.setOption(this.option,true);
      }
    },
    computed: {
      option(){
        let option = {
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c}%"
          },
          color:['#61ADE0','#88C6EF','#A8D9FA','#BDE4FE','#D2EDFF'],
          toolbox: {
            orient: 'vertical',
            top: 'center',
            feature: {
              dataView: {readOnly: false},
              restore: {},
              saveAsImage: {}
            }
          },
          legend: {
//            orient: 'vertical',
            bottom: 5,
            data: ['展现', '点击', '访问', '咨询', '订单']
          },
          calculable: true,
          series: [

            {
              name: '金字塔',
              type: 'funnel',
              width: '40%',
              height: '80%',
              left: '5%',
              top: '5%',
              sort: 'ascending',
              data: [
                {value: 60, name: '访问'},
                {value: 40, name: '咨询'},
                {value: 20, name: '订单'},
                {value: 80, name: '点击'},
                {value: 100, name: '展现'}
              ]
            },
            {
              name: '漏斗图',
              type: 'funnel',
              width: '40%',
              height: '80%',
              left: '55%',
              top: '5%',
              label: {
                normal: {
                  show: false,
                  position: 'left'
                }
              },
              data: [
                {value: 60, name: '访问'},
                {value: 40, name: '咨询'},
                {value: 20, name: '订单'},
                {value: 80, name: '点击'},
                {value: 100, name: '展现'}
              ]
            }
          ]
        };
        return option;
      },
    },
    mounted(){
      setTimeout(() => {
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
