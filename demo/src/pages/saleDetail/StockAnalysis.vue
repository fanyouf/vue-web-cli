<!--仓库分析-->
<template>
  <div>
    <div class="card-title">
      <div style="text-align: left;width: 50%;"><h4>仓库分析</h4></div>
      <div style="text-align: right;width: 50%;">
        <div @click="download" style="display: inline-block;">
          <svg class="icon" aria-hidden="true" title="下载">
            <use xlink:href="#icon-xiazai-moren"></use>
          </svg>
        </div>
        <div style="display: inline-block;"><Button type="ghost" v-on:click="toHealthy">库存健康></Button></div>
      </div>
    </div>

    <div class="self-cond">
      类型：
      <RadioGroup type="button" size="large" v-model="storeType" v-on:on-change="storeTypeChange">
        <Radio label="small">中小件</Radio>
        <Radio label="big">大件</Radio>
      </RadioGroup>
    </div>

    <div class="common-padding" style="height: 540px;">
      <div>
        <div style="width: 50%;float: left;" v-loading="barLoading">
          <div class="chart-title">GMV分仓排名及同比分析</div>
          <PlusMinsChart ref="plusMins" :gmvList="barData"></PlusMinsChart>
        </div>
        <div style="width: 50%;float: right;" v-loading="pieLoading">
          <div class="chart-title">仓库占比分析</div>
          <PieChart ref="pie" name="库存分布" :datas="pieChart"></PieChart>
        </div>
      </div>
    </div>

    <div class="common-padding" v-loading="tableLoading">
      <!--<FixedTable></FixedTable>-->
      <Table border :columns="columns" :data="tableData"></Table>
    </div>
  </div>
</template>

<script>
  import FixedTable from '@/components/table/FixedTable'
  import PlusMinsChart from '@/components/chart/PlusMinsChart'
  import PieChart from '@/components/chart/PieChart'
  import { saleReached as Api } from '@/api/index.js'
  export default{
    name:'StockAnalysis',
    components:{
      FixedTable,PlusMinsChart,PieChart
    },
    data(){
      return {
        storeType:'small',
        columns:[
          { title:'名称',key:'name'},
          { title:'GMV',key:'gmv'},
          { title:'GMV同比',key:'gmvYoy'},
          { title:'销量',key:'saleNum'},
          { title:'销量同比',key:'saleNumYoy'},
          { title:'PV现货率',key:'pvSpot'},
          { title:'库存周转',key:'turnOver'},
          { title:'在库占用库存',key:'occupyStock'},
          { title:'在库可用库存',key:'avaliableStock'},
          { title:'PO在途',key:'inTransitPO'},
          { title:'已预约在途',key:'inTransitOrder'},
          { title:'操作',key:'action',width:100,
            render:(h,params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.toHealthy();
                    }
                  }
                }, '查看详情') ]);

            }
          }
        ],
        barLoading:false,
        pieLoading:false,
        tableLoading:false,
        pieChart:[],
        tableData:[],
        barData:[]
      }
    },
    methods:{
      queryStockAnalysis(){//查询仓库分析
        console.log("查询仓库分析");
        let condition = this.$parent.$parent.getCommonCondition();
        let realCondition = Object.assign(condition,{
          storeType:this.storeType
        });
        let methods = [];
        methods.push(this.queryStockGMV(realCondition));
        methods.push(this.queryStockPie(realCondition));
        methods.push(this.queryStockDetailTable(realCondition));
        Promise.all(methods).then();
      },
      queryStockGMV(param){//查询GMV分仓排名及同比分析
        // this.barLoading = true;
        Api.queryStockGMV(param,this,"barLoading").then( this._do("GMV分仓排名及同比分析_ok",rs => {
          if(rs != undefined){
            this.barData = rs;
          }
          setTimeout(() => {
            this.barLoading = false;
            this.$refs.plusMins.reloadCharts();
          },1000);
        })).catch( error => {
          this.barLoading = false;
          this.$Message.error({content: '失败：'+error, duration: 10, closable: true});
        });
      },
      queryStockPie(param){//查询仓库占比分析
        // this.pieLoading = true;
        Api.queryStockPie(param,this,"pieLoading").then( this._do("仓库占比分析_ok",rs => {
          this.pieChart = rs;

          setTimeout(() => {
            this.pieLoading = false;
            this.$refs.pie.reloadCharts();
          },1000);
        })).catch( error => {
          this.pieLoading = false;
          this.$Message.error({content: '失败：'+error, duration: 10, closable: true});
        });
      },
      queryStockDetailTable(param){//查询库存健康指标数据
        this.tableLoading = true;
        Api.queryStockDetailTable(param).then( this._do("健康指标数据_ok",d=>{this.tableLoading=false},rs => {
          this.tableData = rs;
        })).catch( error => {
          this.tableLoading = false;
          this.$Message.error({content: '失败：'+error, duration: 10, closable: true});
        });
      },
      download(){
        console.log("仓库分析，下载");
      },
      storeTypeChange(type){
        console.log("仓库分析，仓库类型变化",type);
        this.queryStockAnalysis();
      },
      toHealthy(){
        //window.location.href = 'http://biip.jd.com/ware/queryWarePage';
        let url = 'http://biip.jd.com/ware/queryWarePage';
        window.open(url,'_blank');
      }
    },
    computed:{
      pieDatas(){
        let pieDatas = [];
        for(var i=0;i<20;i++){
          pieDatas.push({name:'仓库'+i,value:Math.random().toFixed(3) * 100});
        }
        return pieDatas;
      }
    }
  }
</script>
