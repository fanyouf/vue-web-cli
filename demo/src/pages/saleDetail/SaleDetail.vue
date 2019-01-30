<template>
  <div class='page saledetail'>
    <!--v-if="user.type == 'SALER'"-->
    <page-container>

      <div data-name='概况' class="card">
        <Overview ref="overview"></Overview>
      </div>

      <div class="condition" >
        层级:
        <LayoutTree :treeCondition="treeCondition" :syncMethod="syncCondition" :initByCookie="false"
                    @initQuery="initQuery"></LayoutTree>
        &nbsp;&nbsp; | &nbsp;&nbsp;
        <DateTime ref="date" :dateType="dateType" :begin="beginDate" :end="endDate"
                  :syncBegin="syncBeginDate" :syncEnd="syncEndDate" :syncDateType="syncType"></DateTime>

        <Button type="primary" class="btn" v-on:click="queryAllSaleDetail">查询</Button>
      </div>

      <div data-name='指标' class="card">
        <DetailSubject ref="subject"></DetailSubject>
      </div>

      <div data-name='趋势' class="card">
        <TrendAnalysis ref="trend"></TrendAnalysis>
      </div>

      <div data-name='结构' class="card">
        <StructureYOY ref="structure"></StructureYOY>
      </div>

      <div data-name='产值' class="card">
        <OutputValue ref="output"></OutputValue>
      </div>

      <div data-name='库存' class="card">
        <StockDetail ref="stock"></StockDetail>
      </div>

      <!--<div data-name='仓库' class="card">-->
        <!--<StockAnalysis ref="store"></StockAnalysis>-->
      <!--</div>-->

    </page-container>
  </div>
</template>

<script>
  import pageContainer from "@/components/common/pageContainer/pageContainer"
  import Overview from './Overview.vue'
  import TrendAnalysis from './TrendAnalysis.vue'
  import StructureYOY from './StructureYOY.vue'
  import OutputValue from './OutputValue.vue'
  import StockAnalysis from './StockAnalysis.vue'
  import TreeCondition from './TreeCondition.vue'
  import LayoutTree from './LayoutTree.vue'
  import DateTime from '@/components/common/DateTime'
  import DetailSubject from './DetailSubjectAnalysis.vue'
  import StockDetail from './StockDetail.vue'
  import moment from 'moment'
  import { common } from '@/api/index'
  import { mapMutations,mapGetters } from 'vuex';
  import "@/assets/less/saledetail/saledetail.less"
  import mixin from '../saleReached/mixin'
  export default{
    mixins:[mixin],
    name:'SaleDetail',
    components:{
      pageContainer,TrendAnalysis,StructureYOY,OutputValue,StockAnalysis,Overview,
      TreeCondition,DateTime,DetailSubject,StockDetail,LayoutTree
    },
    data(){
      return {
        dateType:'D',//类型，月：month,周:week,日:day
        beginDate:new Date(),
        endDate:new Date(),
        treeCondition:{},
        stateArr:[
          { module:'overview',state:true },
          { module:'subject',state:true },
          { module:'trend',state:true },
          { module:'structure',state:true },
          { module:'output',state:true },
          { module:'stock',state:true },
        ]
      }
    },
    methods:{
      ...mapMutations([
        'setCate1IdList','setCate2IdList','setCate3IdList','setBrandIdList','setSalerIdList','setSkuIdList','setExpandList'
      ]),
      initQuery(condition){
        this.treeCondition = condition;
        this.queryAllSaleDetail();
      },
      queryAllSaleDetail(){//查询销售明细模块
        if(this.user.type != 'SALER'){
          this.$router.push("/ManagerReached");
          return;
        }
        if(!this.validateUserInfo(true)) return;
        if(this.$refs.date.validateDateRange() == false) return;
        if(!this.validateTreeData()){
          return;
        }
        this.stateArr.forEach(sa => sa.state = false);
        let methods = [];
        methods.push(this.$refs.overview.queryOverview());
        methods.push(this.$refs.subject.querySubjectAnalysis());
        methods.push(this.$refs.trend.queryTrendAnalysis());
        methods.push(this.$refs.structure.queryStructureYOY());
        methods.push(this.$refs.output.queryOutputValue());
        methods.push(this.$refs.stock.queryStockDetail());
//        methods.push(this.$refs.store.queryStockAnalysis());
        Promise.all(methods).then( () => {

        });
      },
      getCommonCondition(){
        let condition = {};
        condition.dateType = this.dateType;
        condition.erp = this.erp;
        condition.roleType = this.user.type;
        condition.dept3Id = this.user.dept3Id;
        if(this.dateType != undefined){
          let format = 'YYYY-MM-DD';
          if(this.dateType == 'M') format = 'YYYY-MM';
          if(this.dateType == 'W') format = 'YYYY-WW';
          condition.beginDate = moment(this.beginDate).format(format);
          condition.endDate = moment(this.endDate).format(format);
        }
        Object.assign(condition,this.treeCondition.queryCondition);
        condition.salerId = this.user.salerId;
        return condition;
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
      syncCondition(condition){//同步treeCondition查询条件
        console.log("saledetail sync treeCondition",condition)
        this.treeCondition = condition;
//        if(this.user.type != undefined && this.erp != undefined){
//          this.queryAllSaleDetail();
//        }
      },
      updateModuleState(module,state){//更新模块状态
        let index = this.stateArr.findIndex( (sa,index) => {
          return sa.module == module;
        });
        if(index != -1){
          console.log('this.stateArr',this.stateArr)
          //存在未查询完的模块
          let falseIndex = this.stateArr.findIndex( (sa,index) => {
            return sa.state == false;
          });
          //更新对应模块查询状态
          this.stateArr[index].state = state;
          console.log('update this.stateArr',this.stateArr)
          //是否还存在为查询完的模块
          let updateFalseIndex = this.stateArr.findIndex( (sa,index) => {
            return sa.state == false;
          });
          if(falseIndex != -1 && updateFalseIndex == -1){
            //this.$Message.success({content: '成功', duration: 10, closable: true});
            this.$Notice.success({
              title: 'Success',
              desc: '查询成功'
            });
          }
        }
      }
    },
    computed:{
      ...mapGetters({
        erp:'getErp',
        user:'getUser',
      }),
      ...mapGetters({
        treeData:'getTreeData',
      }),
    },
    mounted(){
      this.beginDate = moment().subtract(1, 'day').toDate();
      this.dateType = "M";
    },
    watch:{

    },
    created(){

    }
  }
</script>
