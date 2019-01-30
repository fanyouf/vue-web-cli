<template>
  <!--stockcover报表-->
  <div class="page">
    <div class="sideBar">
      <sidebar :pageType="'plan'" @sideBarQuery="sideBarQuery"></sidebar>
    </div>

    <div class="mainContainer">
      <div style="background: #F9F9F9;padding: 5px;">
        日期：
        <DateTime ref="date" :dateType="dateType" :begin="beginDate" :end="endDate"
                  :syncBegin="syncBeginDate" :syncEnd="syncEndDate" :syncDateType="syncType"></DateTime>

        <Button type="primary" v-on:click="queryStockCover">查询</Button>
        数据单位：
        <i-switch v-model="unit" size="large">
          <span slot="open">数量</span>
          <span slot="close">金额</span>
        </i-switch>
      </div>
      <div style="background: #F9F9F9;padding: 5px;">
        <svg class="icon icon-btn" aria-hidden="true" title="下载" @click="download()">
          <use xlink:href="#icon-xiazai-jihuo"></use>
        </svg>
        <!--<svg class="icon icon-btn" aria-hidden="true" title="上传" @click="upload()">-->
          <!--<use xlink:href="#icon-shangchuan-jihuo"></use>-->
        <!--</svg>-->

        <Upload style="display: inline-block"
          :before-upload="handleUpload"
          action="//jsonplaceholder.typicode.com/posts/">
          <svg class="icon icon-btn" aria-hidden="true" title="上传">
            <use xlink:href="#icon-shangchuan-jihuo"></use>
          </svg>
        </Upload>
        <div style="display: inline-block" v-if="file !== null">Upload file: {{ file.name }} <Button type="text" @click="upload" :loading="loadingStatus">{{ loadingStatus ? 'Uploading' : 'Click to upload' }}</Button></div>

        库存可用周期:
        <!--<InputNumber style="width: 60px;" v-model="min"></InputNumber> - <InputNumber style="width: 60px;" v-model="max"></InputNumber>-->
        <Input style="width: 60px;" v-model="min"/> - <Input style="width: 60px;" v-model="max"/>
        <Button type="primary" v-on:click="apply">应用</Button>

        <svg class="icon icon-btn" aria-hidden="true" title="设置" @click="setting()">
          <use xlink:href="#icon-zhouqishezhi-xuanzhong"></use>
        </svg>

      </div>

      <div style="padding: 5px;" v-loading="loading">
        <CoverTable ref="cover" :width="'100%'" :columns="periodColumns" :datas="periodData" :available="availableData"></CoverTable>
      </div>

      <Modal v-model="showSetting" title="可用周期设置" @on-ok="ok" @on-cancel="cancel" width="1000">
        <available ref="setting" :datas="availableData" v-if="showSetting"></available>
      </Modal>
    </div>
  </div>
</template>

<script>
  import sidebar from '@/components/sideBar/sideBar.vue'
  import DateTime from '@/components/common/DateTime'
  import available from '@/components/table/AvailableTable'
  import CoverTable from '@/components/table/CoverTable'
  import { stockCover as Api } from '@/api/index.js'
  import { mapGetters } from 'vuex';
  export default{
    components:{ sidebar,DateTime,available,CoverTable },
    data(){
      return {
        isEditable:false,
        unit:true,//数据单位,true:数量,false:金额
        showSetting:false,
        dateType:'day',//类型，月：month,周:week,日:day
        beginDate:new Date(),
        endDate:new Date(),
        min:undefined,
        max:undefined,
        availableData:[],//可用周期设置表格
        periodOriginData:[],//展示表格数据
        file: null,
        loadingStatus: false,
        loading:false,
        treeCondition:{}
      }
    },
    methods:{
      queryStockCover(){
        let condition = {
          erp:this.erp,
          dept3Id:this.user.dept3Id,
          roleType:this.user.type,
          betinDate:this.beginDate,
          endDdate:this.endDate,
          dateTyle:this.dateType,
          unit:this.unit
        };
        // this.loading = true; d=>{this.loading=false},
        Api.queryStockCover(condition,this,"loading").then( this._do("StockCover_ok",rs => {
          // this.loading = false;
          this.periodOriginData = rs.periodOriginData;
          this.availableData = rs.availableData;
        })).catch( error => {
          this.$Message.error({content: '失败：'+error, duration: 10, closable: true});
        });
      },
      sideBarQuery(cond){
        console.info("stockCover报表，左侧节点的条件是",cond);
        this.queryStockCover();
      },
      download(){

      },
      setting(){
        this.showSetting = true;
      },
      ok(){
        this.showSetting = false;
//        console.log("clone",this.$refs.setting.cloneDatas,this.availableData);
        this.availableData = this.$refs.setting.cloneDatas;
      },
      cancel(){
        this.showSetting = false;
      },
      syncBeginDate(begin){//同步起始时间
        this.beginDate = moment(begin).toDate();
      },
      syncEndDate(end){//同步结束时间
        this.endDate = moment(end).toDate();
      },
      syncType(dateType){
        this.dateType = dateType;
      },
      apply(){
//        console.log("value",this.min,this.max,isNaN(this.min));
        if( (isNaN(this.min) && isNaN(this.max)) || (this.min == '' && this.max == '')){
          this.$refs.cover.cancalFilterRule();
        }else{
          this.$refs.cover.applyFilterRule(this.min,this.max);
        }
      },
      handleUpload (file) {
        this.file = file;
        return false;
      },
      upload () {
        this.loadingStatus = true;
        console.log("file",this.file);
        setTimeout(() => {
          this.file = null;
          this.loadingStatus = false;
          this.$Message.success('Success')
        }, 1500);
        Api.uploadAvailableSetting({ file:this.file }).then(rs => {
          console.log("上传结果",rs);
        });
      }
    },
    computed:{
      ...mapGetters({
        erp:'getErp',
        user:'getUser',
      }),
      availableDataList(){
        let datas = [];
        for(var i=0;i<5;i++){
          let danger = parseInt(Math.random() * 100);
          let obj = {
            id:125 + '' + i,
            name:'这是我胡乱起的名字为了测试超长........'+i,
            period:'week',
            danger:danger,
            warning:danger + 5,
            normal:danger + 10,
            poorSale:danger + 15,
          };
          datas.push(obj);
        }
        return datas;
      },
//      periodOriginData(){
////        let enums = ['purchase','inTransit','sale','stock','availablePeriod'];//新增采购、在途库存、销售、期末库存、可用周期
//        let dataList = [];
//        for(var i=0;i<6;i++){
//          let obj = {
//            id:125 + '' + i,
//            name:'这是我胡乱起的名字为了测试超长........'+i,
//          };
//          let itemList = [];
//          for(var num=1;num <=12;num++){
//            let item = {
//              year:2018,
//              month:num,
//              title:num <10 ? 2018 + '-0' + num : 2018 + '-' + num,
//              purchase:parseInt(Math.random() * 10000).toString(),
//              inTransit:parseInt(Math.random() * 10000).toString(),
//              sale:parseInt(Math.random() * 10000).toString(),
//              stock:parseInt(Math.random() * 10000).toString(),
//              availablePeriod:parseFloat(Math.random() * 100).toFixed(2).toString(),
//            };
//            itemList.push(item);
//          }
//          obj.itemList = itemList;
//          dataList.push(obj);
//        }
//        return dataList;
//      },
      periodColumns(){
        if(this.periodOriginData == undefined || this.periodOriginData.length == 0) return [];
        let periodColumns = [];
        let data = this.periodOriginData[0];
        //{ name:'',key:'',isTotal:false,isData:true }
        periodColumns.push({ name:'ID',key:'id',isData:false,fixed:'left' });
        periodColumns.push({ name:'名称',key:'name',isData:false,fixed:'left' });
        periodColumns.push({ name:'数据项',key:'subjectName',isData:false,fixed:'left' });

        let itemList = data.itemList;
        if(itemList != undefined && itemList.length > 0){
          itemList.forEach(item => {
            periodColumns.push({ name:item.title,key:item.title,isData:true });
          });
        }
        return periodColumns;
      },
      periodData(){
        if(this.periodOriginData == undefined || this.periodOriginData.length == 0) return [];
        let periodData = [];
        let enums = ['purchase','inTransit','sale','stock','availablePeriod'];//新增采购、在途库存、销售、期末库存、可用周期
        this.periodOriginData.forEach(period => {
          let id = period.id;
          let name = period.name;
          let itemList = period.itemList;
          enums.forEach(subject => {
            let obj = { id:id,name:name,subject:subject };
            let subjectName = this.subjectEnumMap.filter(obj => obj.key == subject)[0].name;
            obj.subjectName = subjectName;
            itemList.forEach(item => {
              let value = item[subject];
              let title = item.title;
              obj[title] = value;
            });
            periodData.push(obj);
          });
        });
        return periodData;
      },
      subjectEnumMap(){
        let enums = [];
        enums.push({ key:'purchase',name:'新增采购' });
        enums.push({ key:'inTransit',name:'在库库存' });
        enums.push({ key:'sale',name:'实际/预测销售' });
        enums.push({ key:'stock',name:'期末库存' });
        enums.push({ key:'availablePeriod',name:'库存可用周期' });
        return enums;
      }
    },
    mounted(){
//      this.availableData = this.availableDataList;
    },
    watch:{

    }
  }
</script>
