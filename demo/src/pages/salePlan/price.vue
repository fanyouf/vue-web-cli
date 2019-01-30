<template>
  <div>
    <div class="analyzeBoard">
      <div class="analyzeBoard-condition">
        <div class="analyzeBoard-condition-btns">
          <el-date-picker   size="small" v-model="beginDate" type="date" placeholder="起始日期" format="yyyy年MM月dd日"
                                      :picker-options="pickerOptions" v-on:change="beginDateChange">
                      </el-date-picker>
                      至
                      <el-date-picker    size="small" v-model="endDate" type="date" placeholder="结束日期" format="yyyy年MM月dd日"
                                      :picker-options="pickerOptions" v-on:change="endDateChange">
                      </el-date-picker>

          <Button size="small" type="primary" :loading="loading" @click="query('all')">&nbsp;查询&nbsp;</Button> &nbsp;&nbsp;&nbsp;&nbsp;
          <Button size="small" type="primary" :loading="downLoading" @click="down">&nbsp;下载&nbsp;</Button>
      </div>
      </div>
    </div>

    <div>
      <data-filter ref="dataFilter" @queryPic="queryPic('pic')"></data-filter>
      <PriceLineChart :legendData="legendData" :xAxisData="xAxisData"  :seriesData="seriesData"/>
    </div>

    <div>
      <div class="">
        <div class="flexa">
          <Checkbox v-model="cond.isWarehousePrice">仓报价</Checkbox>
        </div>
      </div>

     <br/> <br/>
      <div class="h4">价格相关</div>
      <PriceTable
        :isWarehousePrice="cond.isWarehousePrice"
        :column="column"
        :tableData="priceData"
        :title="priceKey"/>
      <br/> <br/>

      <div class="h4">销售毛利</div>
      <PriceTable
        :isWarehousePrice="cond.isWarehousePrice"
        :column="column"
        :tableData="profitData"
        :title="profitKey"/>
      <br/> <br/>

      <div class="h4">毛利-成本比Mark-up%</div>
      <PriceTable
        :isWarehousePrice="cond.isWarehousePrice"
        :column="column"
        :tableData="profitRateData"
      :title="profitRateKey"/>

    </div>
    <br/><br/>
    <el-pagination   v-if="totalSize>0"
         @size-change="handleSizeChange"
         @current-change="handleCurrentChange"
         :current-page="curPage"
         :page-sizes="[5, 10, 20]"
         :page-size="pageSize"
         layout="total, sizes, prev, pager, next, jumper"
         :total="totalSize">
       </el-pagination>

    <a href="#" :id="aId" :v-show="false"></a>
  </div>
</template>

<script>
  import Api from '@/api'
  import {mapGetters,mapMutations} from 'vuex'
  import DateTime from "@/components/common/DateTime.vue"
  import qmwd from "@/components/common/qmwd.vue"
  import dataFilter from "./PriceDataFilterSingle.vue"

  import PriceLineChart from "@/components/chart/PriceLineChart"
  import PriceTable from "@/components/table/PriceTable"
  import moment from 'moment'

export default {
  beforeDestroy(){
    this._bus.$off(this._CONST.E_SIDEBAR_SELECTEDNODE_CHANGE,this.hEvent);
  },
  created(){
    this._bus.$on(this._CONST.E_SIDEBAR_SELECTEDNODE_CHANGE,this.hEvent);
  },
  components:{
    DateTime,qmwd,dataFilter, /*dateTime0,*/ PriceLineChart,PriceTable
  },
  computed:{
      ...mapGetters('cond',['getTreeData','getSelectedNode']),
    aId(){
       return "a"+Math.random().toString().substring(2);
     },
      pickerOptions(){
        let self = this;
        let pickerOptions = {
          shortcuts: [{
            text: '昨天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          },{
            text:'月至今',
            onClick(picker){
              console.log("picker",picker,this)
              self._bus.$emit('month2day');
            }
          },/*{
            text:'年至今',
            onClick(picker){
              self._bus.$emit('year2day');
            }
          }*/],
            firstDayOfWeek:1
        }
        return pickerOptions
      }
    },
  data(){
    return {
      titleInfo:[{label:"id",prop:"品类ID"},{label:"name",prop:"品类名称"},{label:"skuId",prop:"skuId"},
                  {label:"skuName",prop:"sku名称"},{label:"priceName",prop:"指标类型"}
      ],
      titleInfo0:{id:"品类ID",name:"品类名称",skuId:"skuId",skuName:"sku名称",priceName:"指标类型"},
      dateType:'D',
      beginDate:new Date(),//起始时间
      endDate:new Date(),//结束时间
      dateRange:{
        start:"2018-05-14",
        end:"2018-05-15",
      },
      priceKey:"price",
      profitKey:"profiteKey",
      profitRateKey:"profiteRateKey",
      keyAndTitleMap:{price:["页面价","促销价","仓报价"],
      profite:["页面毛利","促销毛利","仓报价"],
      profiteRate:["页面毛利率","促销毛利率","仓报价"]
        },
      priceData:[] ,
      profitData:[],
      profitRateData:[],
      column: [],
       legendData:[],
       xAxisData:[],
       seriesData:[],
      //mount:1500,
      loading:false,
      downLoading:false,
      cond:{isWarehousePrice:true},
      skuSelectedIdValMap:[],
      pageSize:5,
      curPage:1,
      totalSize:0,
    }
  },
  methods:{
    handleSizeChange(pageSize){
      this.pageSize=pageSize ;
      this.pageQuery();
    },
    handleCurrentChange(curPage){
      this.curPage=  curPage;
      this.pageQuery();
    },
    pageQuery(){
      this.query("table");
    },
    down(){
      this.downLoading=true;
      let properTitle=["id","name","skuId","skuName","priceName"];
      let titleInfo={id:"品类ID",name:"品类名称",skuId:"skuId",skuName:"sku名称",priceName:"指标类型"};
      for(var i=0;i< this.column.length;i++){
        titleInfo[this.column[i].label]=  this.column[i].label;
        properTitle.push( this.column[i].label);
      }
      let sheetDataTemp=[{sheetName:"价格相关下载",sheetData:this.getSheetData(titleInfo,"price")},
        {sheetName:"价格毛利相关下载",sheetData:this.getSheetData(titleInfo,"profit")},
        {sheetName:"价格毛利率相关下载",sheetData:this.getSheetData(titleInfo,"profitRate")}];
         try{
           this._excel.downloadAll(document.getElementById(this.aId), sheetDataTemp, "售价相关下载","xlsx",properTitle);
           this._info("启动浏览器下载,下载完成")
           this.downLoading=false;
         }
         catch(e){
           this.downLoading=false;
           this._error("下载出现错误")
         }
    },
    getSheetData(titleInfo,key){
      let data=[];
      let dataSource=[];
      if(key=="profitRate")dataSource=   this.profitRateData;
      if(key=="profit")      dataSource=   this.profitData;
      if(key=="price")      dataSource=   this.priceData;
      data.push(titleInfo);
      for(var i=0;i<dataSource.length;i++){
        let info={id:dataSource[i].id,name:dataSource[i].name,
          skuId:dataSource[i].skuId,skuName:dataSource[i].skuName,
          priceName:dataSource[i].priceName}
        for(var j=0;j<this.column.length;j++){
          info[this.column[j].label]=dataSource[i][this.column[j].label].val
        }
        data.push(info);
      }
      return data;
    },
    syncBeginDate(begin){//同步起始时
      this.beginDate = moment(begin).toDate();
      let format = 'YYYY-MM-DD';
      console.log("begindate:"+ moment(this.beginDate ).format(format));
    },
    syncEndDate(end){//同步结束时
      this.endDate = moment(end).toDate();
      let format = 'YYYY-MM-DD';
         console.log("endDate:"+ moment(this.endDate ).format(format));
    },
    syncType(dateType){
      this.dateType = dateType;
    },
    beginDateChange(date){
      let beginMoment = moment(date);
      let endMoment = moment(this.endDate);
      let mills = beginMoment.diff(endMoment);
      if(mills > 0){
        this.$Message.warning({content: '起始日期大于结束日期', duration: 10, closable: true});
        return "";
      }
      this.syncBeginDate(date);
    },
    endDateChange(date){
          let beginMoment = moment(this.beginDate);
          let endMoment = moment(date);
          let mills = beginMoment.diff(endMoment);
          if(mills > 0){
            this.$Message.warning({content: '起始日期大于结束日期', duration: 10, closable: true});
            return "";
          }
          this.syncEndDate(date);
       },
    hEvent(){
      this.$refs.dataFilter.selectAll();
      if(this.$refs.dataFilter!=undefined){
        this.totalSize=this.$refs.dataFilter.getAllValue().length;
      }
     this.query('all');
    },

    getCondition()   {
      let format = 'YYYY-MM-DD';
      let childrenIdList = this.$refs.dataFilter.getAllValue()  ;
        let beignIndex=this.pageSize*(this.curPage-1),endIndex=this.pageSize*this.curPage;
        if(beignIndex<0)    beignIndex=0;
        if(endIndex>childrenIdList.length)       endIndex=childrenIdList.length  ;
        let skuIdsTemp=[];
        for(let k=beignIndex;k<endIndex;k++){
          skuIdsTemp.push(childrenIdList[k]);
        }
        childrenIdList=  skuIdsTemp;
      this.skuSelectedIdValMap=       this.$refs.dataFilter.getAllSelectList(); //现在是考虑所有的
      return { startDate:moment(this.beginDate ).format(format),
        endDate: moment(this.endDate ).format(format),
        childrenIdList:childrenIdList.toString()}
    },
    queryPic(key){//由图触发来的
      this.query(key);
      if(this.priceData.length==0&&this.$refs.dataFilter!=undefined){
        this.totalSize=this.$refs.dataFilter.getAllValue().length;
        this.query('table');
      }
    },
    query(key){
      let cond = this.getCondition();
      cond.key=key;
      if(key=='all'){
              this.pageSize=5;
              this.curPage=1;
              this.totalSize=0;
      }
      if(this.$refs.dataFilter!=undefined){
        this.totalSize=this.$refs.dataFilter.getAllValue().length;
      }
      if(key=="pic")
        cond.childrenIdList=   this.$refs.dataFilter.getValue();//这里只是其中一个选中的*/

      if(!(cond.childrenIdList&&cond.childrenIdList.length>0)){
        this.$Message.warning({content: '没有选择相应的sku', duration: 10, closable: true});
        return "";
      }
      // this.loading = true;
      let _this=this;
      console.info("折线图请求的条件是",cond)
      this._api.salePlan.querySalePriceTableData(cond,this,"loading").then(this._do("请求售价相关信息_ok",d => {
        //从里面拼接值
          this.data = d;
          if(key=="all"||key=="pic")
        _this._processPicData(d);
        if(key=="all"||key=="table")     //才开始查table
        _this._processTableData(d);
      },d=>{
        this.priceData =[];
        this.profitData =[];
        this.profitRateData  =[];
      }))
    },
    getSkuName(skuId){
     let skuNames= this.skuSelectedIdValMap.map(function(d) {
                      if (d.value == skuId) {
                        return d.label
                      }
                    });
                    let skuName=skuNames.filter(function(item) {if(item){return item}});
                    return skuName
    },
    _createData(d,key){
      let _this=this;
      //把请求回来的数据加工成table所需格式
          let data = []
          if(data) {
            d.forEach(item => {
              let id=_this.getSelectedNode.parentId;
              let name=_this.getSelectedNode.parentName;
              let skuId=item.skuId;
              let skuNameFull=_this.getSkuName(item.skuId);
              let  skuName=skuNameFull.substring(skuNameFull.indexOf(")")+1,skuNameFull.length)
              let obj0={},obj1={},obj2={};
              item.detail.forEach(item => {

                if(_this.keyAndTitleMap[key].indexOf(item.priceName)>-1) {
                  let obj = {};
                  if(_this.keyAndTitleMap[key].indexOf(item.priceName)==0)        obj= obj0;
                  if(_this.keyAndTitleMap[key].indexOf(item.priceName)==1)        obj= obj1;
                  if(_this.keyAndTitleMap[key].indexOf(item.priceName)==2)        obj= obj2;
                  obj.id=id;
                  obj.name=name;
                  obj.skuId=skuId;
                  obj.skuName=skuName;
                  obj.expand=false;
                  obj.priceName=item.priceName;
                  let percent=false;
                  if(obj.priceName.indexOf("率")>-1) percent=true;
                  let color="";
                  if(obj.priceName.indexOf("价")>-1) color="blue";
                  if(obj.priceName.indexOf("仓报")>-1) color="red";
                  item.data.forEach(item => {
                  let month=item.month;
                  let day=item.day<10?"0"+item.day:""+item.day;
                //  obj[month+day]  =item.val?item.val:'-';
                    obj[month+day]={val: item.val, percent: percent,color:color}
                })
                }
              })
              data.push(obj0) ;
              data.push(obj1) ;
              data.push(obj2) ;

            })

          }else{ return null;}
          return data
    },
    _processTableData(data){
      let timeSpan=this._getTimeSpan(data); //这个就相当于列了
      let column=[];
      for(let i=0;i<timeSpan.length;i++){
        this.titleInfo.push({label:timeSpan[i],prop:timeSpan[i]})
        column.push({label:timeSpan[i],prop:timeSpan[i]})
      }
      let priceData=this._createData(data,"price");
      let profitData=this._createData(data,"profite");
      let profitRateData=this._createData(data,"profiteRate");
        this.priceData=priceData;
        this.column=column
        this.profitData=profitData;
        this.profitRateData=profitRateData;
    },
    _getTimeSpan(data){
      let xAxisData=[];
      if(data.length>0&&data[0].detail&&data[0].detail.length>0&&data[0].detail[0].data.length>0){
        let timeDatas=  data[0].detail[0].data;
               for(let i=0;i<timeDatas.length;i++){
                 let day=timeDatas[i].day<10?"0"+timeDatas[i].day: timeDatas[i].day;
                 let month=timeDatas[i].month<10?"0"+timeDatas[i].month: timeDatas[i].month;
                 xAxisData.push(month+""+day)
               }
      }
      return       xAxisData;
    },
    _processPicData(data){
        let nameDetail="",seriesData=[];
        let skuId=this.$refs.dataFilter.getValue();
        let  dataSource= data.filter(function(item) {if(item.skuId==skuId){return item}});
        dataSource=dataSource.length>0?dataSource[0]:dataSource;
      if(data.length>0&&dataSource.detail&&dataSource.detail.length>0&&dataSource.detail[0].data.length>0){
        nameDetail=dataSource.skuId+this.getSkuName(dataSource.skuId);
        for(let i=0;i<dataSource.detail.length;i++){
          let lineDataInfo=[];
          let lineSeriesName=dataSource.detail[i].priceName;
          if(this.keyAndTitleMap.price.indexOf(lineSeriesName)>-1) {
            for (let j = 0; j < dataSource.detail[i].data.length; j++) {
              let val        =dataSource.detail[i].data[j].val;
              lineDataInfo.push(val?val:0);
            }
            seriesData.push({name:  lineSeriesName, data: lineDataInfo})
          }
          }
        this.xAxisData=this._getTimeSpan(data);
          let legendDataTemp=[], seriesDataTemp=[];
          for(let i=0;i<seriesData.length;i++){
            legendDataTemp.push(seriesData[i].name);
            seriesDataTemp.push(seriesData[i].data)
          }
          this.legendData=legendDataTemp;
          this.seriesData=seriesDataTemp;
      }
    },
  },
  mounted(){
    //这里也可以走一个查询 init
  }
}
</script>
