<!--结构及同比分析-->
<template>
  <div>
    <div class="card-title">
      <div style="text-align: left; width: 50%"><h4>结构及同比分析</h4></div>
      <div style="text-align: right; width: 50%;display: inline-block">
        <!--<FastFilter ref="filter" :originList="originItemList" :syncMethod="syncFilterList"></FastFilter>-->
        <svg class="icon" aria-hidden="true" title="列表图" @click="changeToBar">
          <use xlink:href="#icon-zhuzhuangtu-moren"></use>
        </svg>
        <svg class="icon" aria-hidden="true" title="气泡图" @click="changeToScatter">
          <use xlink:href="#icon-qipaotu-yuan-moren"></use>
        </svg>
      </div>
    </div>

    <div class="title-border">&nbsp;</div>

    <div class="common-padding">
      <div style="width: 50%;float: left;">
        <div>
          结构分析
          <split v-model="percentList"></split>
		  (*灰色为未选中部分)
          &nbsp;&nbsp;
          筛选：
          <FastFilter ref="filter" :originList="originItemList" :syncMethod="syncFilterList" :isInput="true"></FastFilter>
        </div>
        <div v-loading="loading">
          <StructureChart ref="structure" :gmvList="gmvSortFilterList" :percentList="percentList"
                          @chooseIdChange="chooseIdChange"></StructureChart>
        </div>
      </div>
      <div style="width: 50%;float:right;">
        <div>
          <Select style="width: 120px;" v-model="sort" v-on:on-change="sortChange">
            <Option value="gmvAsc">GMV升序</Option>
            <Option value="gmvDesc">GMV降序</Option>
            <Option value="yoyAsc">同比升序</Option>
            <Option value="yoyDesc">同比降序</Option>
          </Select>

          <span>(单位万元，明细为元)(*图表内部滚动滚轮放大缩小)</span>

          <div style="float:right;">
            <expand v-if="showBar"><PlusMinsChart :height="600" :gmvList="plusGmvList"></PlusMinsChart></expand>
            <expand v-else>
              <GMVScatter :height="600" xName="同比增长" yName="GMV占比" :xIsRatio="xIsRatio" :yIsRatio="yIsRatio"
                          :datas="scatterDatas"></GMVScatter>
            </expand>
          </div>
        </div>

        <div v-loading="loading">
          <PlusMinsChart ref="plus" :gmvList="plusGmvList" v-if="showBar"></PlusMinsChart>

          <GMVScatter ref="gmvChart" :height="500" xName="同比增长" yName="GMV占比" :xIsRatio="xIsRatio" :yIsRatio="yIsRatio"
                      :datas="scatterDatas" v-else></GMVScatter>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import PyramidChart from '@/components/chart/PyramidChart'
  import StructureChart from '@/components/chart/StructureChart'
  import PlusMinsChart from '@/components/chart/PlusMinsChart'
  import ScatterChart from '@/components/chart/ScatterChart'
  import GMVScatter from '@/components/chart/GMVScatter'
  import FastFilter from '@/components/filter/FastFilter'
  import split from '@/components/analyzeBoard/BarsAndScatter_Bars_split'
  import expand from './expand.vue'
  import { saleReached as Api } from '@/api/index.js'
  export default{
    name:'StructureYOY',
    components:{
      PyramidChart,PlusMinsChart,ScatterChart,GMVScatter,StructureChart,split,expand,FastFilter
    },
    data(){
      return {
        sort:'gmvDesc',
        showBar:true,
        yIsRatio:true,
        xIsRatio:true,
        percentList:[60,30,10],
        dataList:[],
        loading:false,
        filterList:[],//快速选择筛选的filterList
        chooseIds:[],//结构图选择模块的id列表
      }
    },
    methods:{
      queryStructureYOY(){//查询结构及同比分析
        let condition = this.$parent.$parent.getCommonCondition();
        // this.loading = true;
        Api.getGMVYoy(condition,this,"loading").then( this._do("结构及同比分析",rs => {
          this.$parent.$parent.updateModuleState('structure',true);
          if(rs != undefined){
            this.dataList = rs;
//            this.dataList.forEach(data => {
//              let old = data.old == null ? 0: data.old;
//              let gmv = data.gmv == null ? 0 : data.gmv;
//              let yoy = (gmv - old) / old;
//              data.yoy = yoy;
//            });
            this.chooseIds = this.dataList.map(data => data.id);
          }

          setTimeout(() => {
            this.$refs.structure.reloadCharts();
            if(this.showBar == true){
              this.$refs.plus.reloadCharts();
            }else{
              this.$refs.gmvChart.reloadCharts();
            }
            this.loading = false;
          },1000);
        })).catch( error => {
          this.loading = false;
          this.$Message.error({content: '失败：'+error, duration: 10, closable: true});
        });
      },
      changeToBar(){
        this.showBar = true;
      },
      changeToScatter(){
        this.showBar = false;
      },
      sortChange(sort){
        setTimeout(() => {
          this.$refs.plus.reloadCharts();
        },200);
      },
      splitChange(percentList){   //  split中的拆分比例变化了
        console.log("percentList",percentList);
        this.percentList = percentList;
        setTimeout(() => {
          this.$refs.structure.reloadCharts();
        },200);
      },
      syncFilterList(filterList){//同步快速选择组件的filterList
        console.log("同步选择filterList",filterList)
        this.filterList = filterList;
        setTimeout( ()=>{
          if(this.showBar == true){
            this.$refs.plus.reloadCharts();
          }else{
            this.$refs.gmvChart.reloadCharts();
          }
//          this.$refs.plus.reloadCharts();
          this.$refs.structure.reloadCharts();
        },1000);
      },
      chooseIdChange(ids){
        console.log("同步结构图选择id",ids);
        this.chooseIds = ids;
        setTimeout(()=>{
          if(this.showBar == true){
            this.$refs.plus.setCharts();
          }else{
            this.$refs.gmvChart.setCharts();
          }
        },200);
      }
    },
    computed:{
      gmvSortList(){
        if(this.dataList == undefined || this.dataList.length == 0) return [];
        let gmvList = this.dataList;
        if(this.sort == 'gmvAsc'){
          gmvList.sort( (a1,a2) => ( (isNaN(a2.gmv) || a2.gmv==null) ? 0 : a2.gmv) - ( (isNaN(a1.gmv) || a1.gmv==null) ? 0 : a1.gmv))
        }else if(this.sort == 'gmvDesc'){
          gmvList.sort( (a1,a2) => ( (isNaN(a1.gmv) || a1.gmv==null) ? 0 : a1.gmv) - ( (isNaN(a2.gmv) || a2.gmv==null) ? 0 : a2.gmv))
        }else if(this.sort == 'yoyAsc'){
          gmvList.sort( (a1,a2) => {
//          ( (isNaN(a2.yoy) || a2.yoy==null) ? 0 : a2.yoy) - ( (isNaN(a1.yoy) || a1.yoy==null) ? 0 : a1.yoy)
            let yoy1 = 0,yoy2 = 0;
            if(a1.gmv != null && a1.old != null && a1.old != 0){
              yoy1 = (a1.gmv - a1.old) / a1.old;
            }
            if(a2.gmv != null && a2.old != null && a2.old != 0){
              yoy2 = (a2.gmv - a2.old) / a2.old;
            }
            return yoy2 - yoy1;
          });
        }else if(this.sort == 'yoyDesc'){
//          gmvList.sort( (a1,a2) => ( (isNaN(a1.yoy) || a1.yoy==null) ? 0 : a1.yoy) - ( (isNaN(a2.yoy) || a2.yoy==null) ? 0 : a2.yoy))
          gmvList.sort( (a1,a2) => {
//          ( (isNaN(a2.yoy) || a2.yoy==null) ? 0 : a2.yoy) - ( (isNaN(a1.yoy) || a1.yoy==null) ? 0 : a1.yoy)
            let yoy1 = 0,yoy2 = 0;
            if(a1.gmv != null && a1.old != null && a1.old != 0){
              yoy1 = (a1.gmv - a1.old) / a1.old;
            }
            if(a2.gmv != null && a2.old != null && a2.old != 0){
              yoy2 = (a2.gmv - a2.old) / a2.old;
            }
            return yoy1 - yoy2;
          });
        }
        console.log("gmvList",gmvList)
        return gmvList;
      },
      gmvSortFilterList(){
        if(this.filterList == undefined || this.filterList.length == 0){
          return this.gmvSortList;
        }
        let gmvSortFilterList = this.gmvSortList.filter(gmv => this.filterList.indexOf(gmv.name) != -1);
        return gmvSortFilterList;
      },
      plusGmvList(){//条形图源数据
        if(this.chooseIds == undefined || this.chooseIds.length == 0){
          return [];
        }
        let plusGmvList = this.gmvSortFilterList.filter(gmv => this.chooseIds.indexOf(gmv.id) != -1);
        return plusGmvList;
      },
      scatterDatas(){
        if(this.plusGmvList == undefined || this.plusGmvList.length == 0) return [];
        let totalGmv = 0;
        this.plusGmvList.forEach(gmv =>{
          let value = gmv.gmv == null ? 0 : gmv.gmv;
          totalGmv = totalGmv + value;
        });
        let scatterDatas = this.plusGmvList.map(gmv =>{
          let old = gmv.old == null ? 0 : gmv.old;
          let value = gmv.gmv == null ? 0 : gmv.gmv;
          let yoy = 0;
          if(old != 0){
            yoy = (value - old) / old;
          }
          let name = gmv.name;
          let percent = totalGmv == 0 ? 1 : (value / totalGmv);
          return [yoy,percent,gmv.name,gmv.name,value];
        });
        return scatterDatas;
      },
      originItemList(){
        if(this.gmvSortList == undefined || this.gmvSortList.length ==0){
          return [];
        }
        let mapList = this.gmvSortList.map(gmv => {
          return { label:gmv.name,value:gmv.gmv };
        });
        return mapList.sort((m1,m2) => m2.value - m1.value);
      }
    },
    created(){
      this._bus.$on(this._CONST.E_SPLIT_CHANGE, this.splitChange); // 监听split组件中的事件变化
    },
    beforeDestroy(){
      this._bus.$off(this._CONST.E_SPLIT_CHANGE, this.splitChange);
    },
    watch:{
      percentList(val,oldVal){   //  split中的拆分比例变化了
        console.info(this.percentList)
        setTimeout(() => {
          this.$refs.structure.reloadCharts();
        },200);
      }
    }
  }
</script>
