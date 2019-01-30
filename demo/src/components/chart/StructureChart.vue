<!--结构分析图-->
<template>
  <div style="height: 500px;" ref="structureChart">

  </div>
</template>

<script>
  import echarts from 'echarts';
  export default{
    props:{
      gmvList:{
        type:Array,
        required:false,
        default:function () {
          return undefined;
        }
      },
      percentList:{
        type:Array,
        required:false,
        default:function () {
          return undefined;
        }
      }
    },
    data(){
      return {
        myChart:null,
        indexArr:[]
      }
    },
    methods:{
      initCharts(){
        if(this.myChart){
          this.myChart.dispose();    //销毁实例对象
        }
        let dom = this.$refs.structureChart;
        this.myChart = echarts.init(dom);

        console.log("this.series",this.series);
        this.indexArr = this.series.map( (ser,index) => { return index });
        this.option.color = this.color;
        this.myChart.setOption(this.option,true);

        //chart图表点击事件
        let self = this;
        this.myChart.on('click',function(params){
          console.log("click",params);
          let seriesIndex = params.seriesIndex;
          let findIndex = self.indexArr.findIndex(index => index == seriesIndex);
          console.log("findIndex",findIndex)
          if(findIndex != -1){
            self.indexArr = self.indexArr.filter(index => index != seriesIndex);
            self.myChart.setOption(self.option,true);
          }else{
            self.indexArr.push(seriesIndex);
            self.myChart.setOption(self.option,true);
          }
          console.log("this.indexArr",self.indexArr)
          let finalIds = [];
          self.indexArr.forEach(index => {
            let ids = self.series[index].ids;
            if(ids != undefined && ids.length > 0){
              finalIds = finalIds.concat(ids);
            }
          });
          console.log("finalIds",finalIds);
          self.$emit('chooseIdChange',finalIds);
        });
      },
      setCharts(){
        if (!this.myChart) {
          this.initCharts();
          return;
        }
        this.initCharts();
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
      color(){
        let color = ['#E3AE2E','#F68460','#61ADE0','#8AC346','#B090B7','#5FB9B0','#797CC5','#83C9EE'];
        console.log("color this.indexArr",this.indexArr)
        if(this.indexArr != undefined){
          color.forEach((col,index) => {
            if(this.indexArr.indexOf(index) == -1){
              color[index] = '#CCCCCC';
            }
          });
        }
        //console.log("color",color)
        return color;
      },
      option(){
        let self = this;
        let option = {
          color:self.color,
          tooltip : {
            trigger: 'item',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
              type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter:function(param){
//              console.log("param",param);
              let data = self.series[param.seriesIndex];
              let gmv = isNaN(data.gmv) ? 0 : data.gmv;
              let num = data.num;
              let format = '';
              if(param.name == 'GMV'){
                format = format + "GMV：" + gmv + '<br/>';
              }else if(param.name == '数量'){
                format = format + "数量：" + num + '<br/>';
              }
              format = format + '占比:' + parseFloat(param.value * 100).toFixed(2) + '%' + '<br/>';
              return format;
            }
          },
          legend: {
            data:['GMV','数量'],
            bottom:10
          },
          xAxis : [
            {
              type : 'category',
              data : ['GMV','数量'],
              axisLine:{
                show:false
              },
              axisTick:{
                show:false
              }
            }
          ],
          yAxis : [
            {
              type : 'value',
              show:false
            }
          ],
          series : this.series
        };
        return option;
      },
      series(){
        if(this.gmvList == undefined || this.gmvList.length == 0
          || this.percentList == undefined || this.percentList.length == 0)
          return [];
        let totalGmv = 0,totalNum = 0;
        this.gmvList.forEach(gmv =>{
          totalGmv = totalGmv + (gmv.gmv == null ? 0 : gmv.gmv);
          //totalNum = totalNum + (gmv.skuNum == null ? 0 : gmv.skuNum);
          totalNum = totalNum + 1;
        });
        let gmvList = this._utils.cloneObj(this.gmvList);
        gmvList.sort( (a1,a2) => a2.gmv - a1.gmv);
//        console.log("totalGmv",totalGmv,"gmvList",gmvList);
        let valueList = this.percentList.map(percent => totalGmv * percent / 100);

        let result = this.percentList.map(percent => { return { data:[]} } );
        let total_temp = 0;
        let index = 0;
        while(gmvList.length){
          let gmv = gmvList.shift();
          total_temp += (gmv.gmv == null ? 0 : gmv.gmv);
          result[index].data.push(gmv);

          if(total_temp >= valueList[index] ){
            index ++;
            if(index >= this.percentList.length)
              break;
            total_temp = 0;
          }
        }

        let seriesData = [];
        for(let i=0;i<result.length;i++){
          let datas = result[i].data;
          let gmv = 0;let num = 0;
          let ids = [];
          datas.forEach(data => {
            gmv += (data.gmv == null ? 0 : data.gmv);
            //num += (data.skuNum == null ? 0 : data.skuNum);
            num += 1;
            ids.push(data.id);
          });
          let gmvPercent = parseFloat(gmv / totalGmv);
          let numPercent = totalNum == 0 ? 0 : num / totalNum;
          let name = 'GMV占比:' + parseFloat(gmvPercent * 100 ).toFixed(2) + '%';
          let series = {};
          series.name = name;
          series.type = 'bar';
          series.stack = 'total';
          series.gmv = isNaN(gmv) ? 0 : gmv;
          series.num = num;
          series.ids = ids;
          series.barMinHeight = 30;
          series.data = [gmvPercent,numPercent];
          series.label = {
            show:true,
            position:'inside',
            formatter:function (param) {
//              console.log(param)
              if(param.name == 'GMV'){
                return "GMV占比:" +  parseFloat(gmvPercent * 100 ).toFixed(2) + '%' + "\n" + "GMV:"+ gmv.toFixed(2);
              }else if(param.name == '数量'){
                return "数量:" + num + "\n" + "数量占比:"+ parseFloat(numPercent * 100 ).toFixed(2) + '%';
              }
              return "GMV占比:" +  parseFloat(gmvPercent * 100 ).toFixed(2) + '%' + "\n" + "GMV:"+ gmv.toFixed(2) + "\n" + "数量:" + num;
            }
          };
          series.emphasis = {
            label:{
              fontWeight :"bold",
            },
            itemStyle: {
                borderColor:"#ccc",
                borderWidth:2,
                shadowBlur: 5,
                shadowOffsetX: 3,
                shadowOffsetY: 3,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
          };
          series.itemStyle = {
            borderColor:'#ffffff',
            borderWidth:2,
            color:this.color[i]
          };
          seriesData.push(series);
        }
        seriesData = seriesData.filter(ser => {
          let dataArr = ser.data;
          if(dataArr == undefined || dataArr.length <= 1) return false;
          let gmv = dataArr[0];
          let num = dataArr[1];
          return !isNaN(gmv) && !isNaN(num) && !(gmv == 0 && num == 0);
        })
        console.log("seriesData1",seriesData)
        return seriesData;
      }
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
