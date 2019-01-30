<template>
  <div style="position:relative;" id="stockBarContainer">
    <div class="analyzeBoard-content-title">
      <div>
      <helpIcon :title="titleInfo"></helpIcon>{{title}}

      <split 
        :title="titleType"
        v-model="percentList"
      ></split>

      <Poptip v-show="zeroNegativeList.length" trigger="hover" placement="bottom">
          <span style="color:red">!有值为0或者负值</span>
          <div slot="content">
            <p>以下项目的GMV是0或负值，不会体现在柱状图中</p>
            <CheckboxGroup v-model="zeroNegativeSelected" style="max-height: 300px;overflow: auto">
              <Checkbox v-for="(item,index) in zeroNegativeList" :key="index" :label="item.id" style="display: block;">
                <span> {{item.name}}-{{item.val}}</span>
              </Checkbox>
            </CheckboxGroup>
            <p>可勾选项目，并显示在下方表格中</p>
          </div>
        </Poptip>
      </div>
    </div>
    <div v-loading="loading" :id="stockBarId" style="height:400px;"></div>
  </div>
</template>

<script>
const _ = require("lodash")

import split from "./BarsAndScatter_Bars_split"
import helpIcon from "@/components/common/helpIcon"


let title = "GMV"
let option = {
    color:[ '#1350B1','#2C72C7','#5D76B0', '#7794C9','#B0B1C7'].reverse(),
    tooltip: {
      trigger: 'item'
    },
    calculable: true,
    xAxis: {
            type : 'category',
            data : ['GMV','数量'],
            axisTick:{show: false},
            axisLine:{show: false}
          },
    yAxis : {type : 'value',show:false},
    series: []
};

export default {
  props:{
    titleType:{type:String,required:true},
    pPageType:{type:String,required:true},
    pChangeCurrentChildrenIdList:{type:Function},
    pDataBar:{type:Array,required:true},    //  数据源
  },
  components:{split,helpIcon},
  data(){
    return {
      title:"销售结构分析",

      titleInfo:"分析各段GMV/销量所对应的品类/品牌/SKU数量，目的在于分析出核心品类/品牌/SKU，是否存在二八法则（百分之二十的品类/品牌/SKU贡献了百分之八十的GMV/销量）等规律。",
      percentList         :[50,40,10],     //  从split中获取的百分比值
      dataList            :[],     //  给chart提供的画图数据
      loading             :false,
      selectedBarIndexList:[],     // 柱子上当前被选中的部分的索引值,
      currentSelectLength : -1,
      isActive            :false,
      zeroNegativeList    :[],     //可能用于拆分柱子的数据中有负值，或者是0.这部分数据不能参与柱子的拆分计算
      zeroNegativeSelected:[],     // 默认把负值或者是0的数据直接进入选中状态
      childrenIdList      :[]
    }
  },
  computed:{
    popKeyWord(){
      //"GMV", // 气泡图中可能是 [GMV|销量] pageType:"planSale"
      return this.getPageType === "planSale" ? "销量" : "GMV";
    },
    stockBarId(){return "stockBar"+Math.random().toString().substring(2);},
    cColor(){
      let color = ['#E3AE2E','#F68460','#61ADE0','#8AC346','#B090B7','#5FB9B0','#797CC5'];
      if(this.selectedBarIndexList != undefined){
        color.forEach((col,index) => {
          if(this.selectedBarIndexList.indexOf(index) == -1){
            color[index] = '#CCCCCC';
          }
        });
      }
      return color;
    },
  },


  beforeDestroy(){
    this._bus.$off(this._CONST.E_SIDEBAR_LEVEL_CHANGE,this.setTipInfo)
    
  },
  created(){
    this.isActive = true;
    this._bus.$on(this._CONST.E_SIDEBAR_LEVEL_CHANGE,this.setTipInfo)
    title = option.xAxis.data[0] = this.titleType;
  },

  methods:{
    setTipInfo(level){
      let obj = {
        "sku": "SKU",
        "saler": "人员",
        "cate1": "一级品类",
        "cate2": "二级品类",
        "cate3": "三级品类",
        "brand": "品牌",
      }
      if(!obj[level]){throw new Error("设置stockBar的sfj")}
      level = obj[level] || ""
      this.title = level + '销售结构分析';
    },
    
    draw(data){
      let that  = this,
          title = {},
          indexs= [];

      if(!document.getElementById(this.stockBarId))
        return;

      if(this.myChart){
        this.myChart.dispose();    //销毁实例对象
      }
      this.myChart = this._echarts.init(document.getElementById(this.stockBarId));

      this.dataList = this.createData(data,this.percentList)
      let newOption = this.createOption(data,this.dataList);

      this.selectedBarIndexList = this._utils.createArray(this.dataList.length);
      console.log("selectedBarIndexList",this.selectedBarIndexList)

      newOption.color = this.cColor;

      this.myChart &&  this.myChart.setOption(newOption,true);
      this.initChartEvent(data,this.dataList)

    },
    createOption(data,dataList){
      let that = this,
          title ={},
          len   = data.filter(item=>item.val > 0).length,
          series = [];

      series = dataList.map( (item,index) => {
        let obj = {
          name:  that.popKeyWord + index,
          type: 'bar',
          stack: '总量',
          // barMinHeight:40,
          itemStyle:{
            borderWidth:1,
            borderColor:'#ccc',
          },
          label: {
            normal: {
              show: true,
              position: 'inside',
              formatter: function(e){
                if(e.dataIndex == 0)    //第一项数据，表示gmv
                {
                  if(e.data.value == 0 && e.data.gmv == 0 )
                    return ""
                  return that.popKeyWord + ":" +e.data.gmv.toFixed(2) + (that.popKeyWord ==='GMV' ? '元':'个')+"\n" + "占比:"+parseFloat(e.data.value).toFixed(2)+"%";  //'占比: {c}%\n gmv:{@gmv1}'
                }
                else if(e.dataIndex == 1) //第二项数据，表示数据
                {
                  if(e.data.value == 0 && e.data.len == 0 )
                    return ""
                  return "个数:"+e.data.len + "\n" + "占比:"+parseFloat(e.data.value).toFixed(2)+"%"; //'占比: {c}%\n gmv:{@gmv1}'
                }

              }
            }
          },
          emphasis: {
            label:{
              fontWeight :"bold",
            },
            itemStyle: {
              borderColor:"#fff",
              borderWidth:2,
              shadowBlur: 3,
              shadowOffsetX: 2,
              shadowOffsetY: 2,
              shadowColor: 'rgba(97,173,224, 0.5)'
            }
          },
          itemStyle: {
            borderColor:'#ffffff',
            borderWidth:2
          }
        }
        obj.data = [{value:Number(item.percent*100).toFixed(2),gmv:item.total},
          {value:Number(item.data.length *100 / len).toFixed(2),len:item.data.length}];

        return obj;
      });

      if(series.length == 0){
        title = {
          text:"暂无数据",
          left:"center",
          top:"middle"
        }
      }
      let tooltip = {
        position: function (point, e, dom, rect, size) {
          var goodDetailInfo = "";
          var strArr = []
          try{
            if(dataList[e.seriesIndex].data){
              let d = dataList[e.seriesIndex].data;
              let unit = that.popKeyWord ==='GMV' ? '元':'个'
              d.forEach((item,idx) => {
                strArr.push(`${idx+1}. ${item.name}:${item.val} ${unit}`)
              })
            }
            goodDetailInfo = strArr.join("<br>")

          }catch(e){
            console.info(e)
          }

          let formatter = '';
          if(e.dataIndex == 0)
            formatter =  that.popKeyWord+"占比:"+e.value +"% <br>" + goodDetailInfo;
          else if(e.dataIndex == 1){
            formatter =  "数量占比:" + e.value + "% <br>"+ goodDetailInfo;
          }
          let chartId = that.stockBarId;
          let paddingScreenLeft = $('#'+chartId).offset().left;
          let paddingScreenTop = $('#'+chartId).offset().top;
          $(dom).css("position","fixed");
          $(dom).html('<div>'+formatter+'</div>');
//          console.log("dom",$(dom).css('left'));
          //鼠标位置 + 图距离左侧距离 + 5
          return [point[0] + paddingScreenLeft + 5,point[1] + paddingScreenTop];
        },
//        enterable:true,//tootip是否可鼠标进入
//        confine:true,//适用内容过多时
        backgroundColor: 'rgba(50,50,50,0.5)',
        trigger: 'item',
        //  formatter:function(e){
        //    //console.info(e,that.dataList);
        //    var goodDetailInfo = "";
        //    var strArr = []
        //    try{
        //      if(that.dataList[e.seriesIndex].data){
        //        let d = that.dataList[e.seriesIndex].data;
        //        let unit = that.popKeyWord ==='GMV' ? '元':'个'
        //        d.forEach((item,idx) => {
        //          strArr.push(`${idx+1}. ${item.name}:${item.val} ${unit}`)
        //        })
        //      }
        //      goodDetailInfo = strArr.join("<br>")

        //    }catch(e){
        //      console.info(e)
        //    }

        //    if(e.dataIndex == 0)
        //      return that.popKeyWord+"占比:"+e.value +"% <br>" + goodDetailInfo;
        //    else if(e.dataIndex == 1){
        //      return "数量占比:" + e.value + "% <br>"+ goodDetailInfo;
        //    }
        //  }
      }
      let newOption = Object.assign({},option,{'series':series,tooltip},{title:title})
      return newOption;
    },
    // 按拆分比例列表，对数据进行加工，以便于图形显示
    createData(dataSource,percentList){
        //[{"id":"880","name":"洗衣机","val":879706.362,"yoy":6.413012417E7},
        // {"id":"878","name":"冰箱","val":620490.121,"yoy":2.2859184807E8},
        // {"id":"877","name":"家电配件","val":25424.336,"yoy":0.0}]
      this.zeroNegativeList = dataSource.filter(item => item.val <= 0 );

      let data = this._utils.cloneObj(dataSource.filter(item=>item.val > 0)), // 下面的代码中要对data进行修改，所以要clone
          result = [],
          total = data.reduce((t,item)=>{return item.val + t},0),
          total_split = [],
          total_temp = 0,
          index = 0,
          t = 0,
          percentList1 = [];

      if(data.length == 0 || percentList.length == 0)
        return result;

      data.sort(function(a,b){return b.val - a.val;}) // 倒序，大的在前
     
      data.forEach(item => { item.percent = item.val + t; t += item.val} )
      
      t = 0;
      percentList.forEach(item => {
        percentList1.push(item + t);
        t += item;
      })
      if(t != 100){
        console.info(t);
        throw new Error("拆分比例不是100%");
      }
      // percentList1 = percentList1.map(item=>item/t);

      // [50,30,20] =>[50,80,100]
      total_split = percentList1.map(item => item * total/100);  // 从比例数组映射出值数组
      result = percentList.map(item => {return { data:[]} });
      while(data.length){
        let json_now = data.shift(); // 取出第一个元素，同时data的长度会减1
        total_temp = json_now.percent*1
        result[index].data.push(json_now);

        if(total_temp >= total_split[index]){
          if(Math.abs(total_temp - total_split[index]) > Math.abs(total_temp-json_now.val - total_split[index])){
            data.unshift(json_now);
            result[index].data.pop();
          }
          index++
          if(index >= percentList.length)
            break;
        }
      }
      // 给 result添加其它字段
      result.forEach(item => {
        item.total = item.data.reduce((initVal,item)=>{return initVal+item.val},0)
        item.percent = item.total / total;
      })
      return result.reverse();
    },
    // // 如果本次查询是由于sideBar中的查询按钮而导致的话，则param中是有值的：{eventSource: "sideBar"}
    // emit(rs,param){
    //   this._bus.$emit(this._CONST.E_SCATTER_DATA, rs);// 通知散点图去更改数据
    //   let childrenIdList = rs.map(item => item.id)
    //   this.childrenIdList = rs.map(item => item.id);
    //   // 把负值对应的id也给带上
    //   // console.info("111111111111111111", this.zeroNegativeSelected )
    //   childrenIdList = childrenIdList.concat(this.zeroNegativeSelected)
    //   childrenIdList = [...new Set(childrenIdList)];
    //   console.dir(this.$listeners)
    //   // this.pChangeCurrentChildrenIdList(childrenIdList);
    //   //this.setCurrentNode({childrenIdList}) // 把当前散点图中选

    //   // 接下来去通知表格,由于sideBar被按下了，而导致了所以需要去重画表格
    //   if(param && param.eventSource === "sideBar")
    //     this._bus.$emit("CURRENTNODECHANGEDFROMSTOCK",{childrenIdList})

    //   console.info("柱子上单击，设置当前的node是",childrenIdList)
    //   this.currentSelectLength = rs.length; // 按传过来的值去选柱子
    // },
    
    initChartEvent(data,dataList){
      let that = this;
      this.myChart.on("click",function(e){
        let index = e.seriesIndex;
        let rs = [];
        let newOption = that.createOption(data,dataList);

        that._utils.switchArray(that.selectedBarIndexList, index) // 如果有就删除，如果没有就加入
        that.selectedBarIndexList.forEach(item => {
          if(dataList[item]){
            rs = [...rs, ...dataList[item]["data"]]
          }
        })

        that.$emit("changeDataForScatter",rs);
        console.info(that,that.pChangeCurrentChildrenIdList)
        that.pChangeCurrentChildrenIdList(rs.map(item=>item.id));

        
//childrenIdList
        console.info(that.pPageType+"用来画散点图的数据是：",rs)
        
        // let indexs = that._utils.createArray(that.result.length);
       // that.emit(rs)

        newOption.color = that.cColor;
        that.myChart.setOption(newOption,true);
      })
    }
  },
  watch:{
    zeroNegativeSelected(val){
      // 把值为0的数据也添加到currentNode中，这样在表格中才会查询这些项目
      var zeroList = this.zeroNegativeSelected
      let  childrenIdList = this.childrenIdList;
      childrenIdList = zeroList.concat(childrenIdList)
      childrenIdList = [...new Set(childrenIdList)];
      this.setCurrentNode({childrenIdList}) // 把当前散点图中选
      // console.info(childrenIdList);
    },
    pDataBar(){
      this.draw(this.pDataBar);
    },
    percentList(val,oldVal){   //  split中的拆分比例变化了
      console.info(this.percentList)
      this.draw(this.pDataBar)
    }
  }
}
</script>
