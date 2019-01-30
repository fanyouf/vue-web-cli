<!--本月GMV/销售进度概况-->
<template>
  <div>
    <div class="card-title"><h4>本月GMV/销售进度</h4></div>

    <div class="card-content" v-loading="loading">
      <DetailCard :subject="'GMV(元)'" type="gmv" :value="getValue('GMV')" :yoy="getYoy('GMV')" :mom="getMom('GMV')" :height="200"
                  :reached="getReached('GMV')" desc="本月已发生GMV金额，取自数据管家"></DetailCard>
      <DetailCard :subject="'目标GMV(元)'" type="target" :value="getValue('target')" :yoy="getYoy('target')" :mom="getMom('target')" :height="200"
                  :reached="getReached('target')" desc="采销经理销售目标汇总"></DetailCard>
      <!--<DetailCard :subject="'销售毛利'" type="profit" :value="getValue('profit')" :yoy="getYoy('profit')" :mom="getMom('profit')"-->
                  <!--:height="200"></DetailCard>-->
      <!--<DetailCard :subject="'销售毛利率'" type="profitRate" :value="getValue('profitRate')" :yoy="getYoy('profitRate')" :mom="getMom('profitRate')"-->
                  <!--:isRatio="true" :height="200"></DetailCard>-->
      <DetailCard :subject="'存货周转'" type="turnOver" :value="getValue('turnOver')" :yoy="getYoy('turnOver')" :mom="getMom('turnOver')"
                  :height="200" desc="月至今采销视角的平均库存周转，数据取自库存健康"></DetailCard>
      <DetailCard :subject="'PV现货率'" type="pvSpot" :value="getValue('pvSpot')" :yoy="getYoy('pvSpot')" :mom="getMom('pvSpot')"
                  :height="200" :isRatio="true" desc="月至今采销视角的平均PV现货率，数据取自库存健康"></DetailCard>
    </div>
  </div>
</template>

<script>
  import DetailCard from '@/components/card/DetailCard'
  import moment from 'moment'
  import { saleReached as Api } from '@/api/index.js'
  export default{
    name:'Overview',
    components:{
      DetailCard
    },
    data(){
      return {
        boardDatas:[],
        loading:false
      }
    },
    methods:{
      queryOverview(){//查询本月GMV/进度概览数据
        let condition = this.$parent.$parent.getCommonCondition();
        // this.loading = true;
        let beginDate = "",endDate = "";
        if(condition.dateType != undefined){
          let format = 'YYYY-MM-DD';
          if(condition.dateType == 'M') format = 'YYYY-MM';
          if(condition.dateType == 'W') format = 'YYYY-WW';
          beginDate = moment(condition.beginDate,format).format('YYYY-MM');
          endDate = moment(condition.endDate,format).format('YYYY-MM');
        }
        let childrenIdList = [];
        childrenIdList.push(condition.salerId);
        let realConditon = Object.assign(condition,{
          dateType:'M',
          beginDate:beginDate,
          endDate:endDate,
          subject:['pvSpotRate','inventoryTurnoverRatio'],
          isOverview:true,
          childrenLevel:'saler',
          parentLevel:'saler',
          parentId:condition.salerId,
          salerId:condition.salerId,
//          childrenIdList:childrenIdList,
          childrenNameList:null
        })
        Api.getTheMonthDetail(realConditon,this,"loading").then( this._do("概况",rs => {
          this.$parent.$parent.updateModuleState('overview',true);
          this.loading = false;
          if(rs != undefined && rs.length > 0){
            this.boardDatas = rs;
            console.log("this.boardDatas",this.boardDatas)
          }
        })).catch(error => {
          this.loading = false;
          this.$Message.error({content: '失败：'+error, duration: 10, closable: true});
        })
      },
      getData(type){
        if(this.boardDatas != undefined && this.boardDatas.length > 0 ){
          let module = this.boardDatas.find( (board,index) => {
            return board != null && board.type === type;
          });
          return module;
        }
        return undefined;
      },
      getValue(type){
        let moduleData = this.getData(type);
        if(moduleData == undefined) return "-";
        if(moduleData.value == undefined) return "-";
        return moduleData.value;
      },
      getMom(type){
//        if(type == 'pvSpot' || type == 'turnOver') return undefined;
        let moduleData = this.getData(type);
        if(moduleData == undefined) return "-";
        if(moduleData.mom == undefined) return "-";
        return moduleData.mom;
      },
      getYoy(type){
//        if(type == 'pvSpot' || type == 'turnOver') return undefined;
        let moduleData = this.getData(type);
        if(moduleData == undefined) return "-";
        if(moduleData.yoy == undefined) return "-";
        return moduleData.yoy;
      },
      getReached(type){
        if(type == 'pvSpot' || type == 'turnOver') return undefined;
        let moduleData = this.getData(type);
        if(moduleData == undefined) return "-";
        if(moduleData.reached == undefined) return "-";
        return moduleData.reached;
      }
    }
  }
</script>
