<template>
  <!--销售达成、销售明细分析页面公共 查询条件，包含展开模式、层级模式-->
  <div class="inline-block">

    <Poptip placement="bottom-end" width="400" v-model="showCondi" v-on:on-popper-hide="cancel">
      <div class="inline-block" @click="inputClick">
        <Input v-model="showName" disabled icon="chevron-down" style="width: 400px;"/>
      </div>

      <div slot="content">
        <div>
          <Tabs type="card" v-model="defaultMode" v-on:on-click="tabsClick">
            <TabPane label="展开模式" name="expand">
              <div>
                <Select style="width: 346px;" v-model="dimension" v-on:on-change="dimensionChange">
                  <Option value="cate1Id">一级品类</Option>
                  <Option value="cate2Id">二级品类</Option>
                  <Option value="cate3Id">三级品类</Option>
                  <Option value="brand">品牌</Option>
                  <Option value="sku">SKU</Option>
                </Select>
              </div>
              <div style="padding-top: 10px;">
                <Input icon="search" placeholder="关键字" style="width: 346px;" v-model="expandKeyText"/>
              </div>
              <div>
                <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;padding-top: 15px;">
                  <div class="inline-block half-width" style="padding-left: 5px;">
                    <Checkbox :indeterminate="indeterminate" :value="checkAll"
                      @click.prevent.native="handleCheckAll">全选</Checkbox>
                  </div>

                  <Poptip title="快速选择" content="content" placement="bottom-start" v-model="showFastSelect">
                    <div class="inline-block half-width align-right pr20" v-on:click="fastSelect">
                      <svg class="icon" aria-hidden="true" title="筛选" style="width: 1em; height: 1em;">
                        <use xlink:href="#icon-shaixuan-zhihui"></use>
                      </svg>
                      快速选择
                      <!--<Icon type="social-apple"></Icon>-->
                    </div>
                    <div slot="content">
                      <div>
                        <RadioGroup v-model="fast" vertical>
                          <Radio label="lt20">GMV 前20%</Radio>
                          <Radio label="lt40">GMV 20%~40%</Radio>
                          <Radio label="lt60">GMV 40%~60%</Radio>
                          <Radio label="lt80">GMV 60%~80%</Radio>
                          <Radio label="lt100">GMV 80%~100%</Radio>
                        </RadioGroup>
                      </div>
                      <div>
                        <Button type="text" size="small" v-on:click="fastFilterChange">确定</Button>
                        <Button type="text" size="small" v-on:click="cancelFastFilter">取消</Button>
                      </div>
                    </div>
                  </Poptip>
                </div>
                <CheckboxGroup v-model="checkedItemList" @on-change="checkedItemListChange">
                  <div style="height: 250px;overflow-y: scroll;border:1px solid #e9e9e9">
                    <div v-for="item in filterItemList" :key="item.id" style="padding-left: 5px;">
                      <Checkbox :label="item.id">{{ item.label }} {{ item.id }}</Checkbox>
                      <!--{{ item.sort }}-->
                    </div>
                  </div>
                  <!--<div><Checkbox label="香蕉"></Checkbox></div>-->
                </CheckboxGroup>
              </div>
            </TabPane>
            <TabPane label="层级模式" name="level">
              <div>
                数据维度:
                <RadioGroup v-model="level_dimension">
                  <Radio label="cate">品类-品牌-SKU</Radio>
                  <Radio label="brand">品牌-品类-SKU</Radio>
                </RadioGroup>
              </div>
              <div style="padding-bottom: 10px;">
                <Input icon="search" placeholder="关键字" style="width: 346px;" v-model="levelKeyText"/>
              </div>
              <div style="height: 300px;overflow-y: scroll;border: 1px solid #e9e9e9;padding-top: 6px;">
                <el-tree :data="treeData" show-checkbox default-expand-all node-key="id" ref="tree"
                         highlight-current :props="defaultProps">
                </el-tree>
              </div>
            </TabPane>
          </Tabs>
        </div>
        <div style="text-align: right">
          <Button type="primary" v-on:click="confirm">确定</Button>
          <Button type="primary" v-on:click="cancel">取消</Button>
        </div>
      </div>
    </Poptip>

  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  export default {
    name:'DimeisionCondition',
    props:{
      mode:{//模式，展开模式或层级模式
        type:String,
        required:false,
        default:function () {
          return undefined;
        }
      },
      view:{//视图，展开模式为一二三级品类、品牌、SKU；层级模式为树顺序
        type:String,
        required:false,
        default:function () {
          return undefined;
        }
      },
      idList:{//选中idList
        type:Array,
        required:false,
        default:function () {
          return undefined;
        }
      },
      syncDataMethod:{
        type:Function,
        required:false,
        default:function () {
          return undefined;
        }
      }
    },
    data(){
      return {
        levelName:'一级品类A-二级品类A-三级品类A-品牌A-SKU 11873',
        showCondi:false,
        showFastSelect:false,//展示快速选择对话框
        fast: '',//快速选择
        defaultMode:'expand',//默认模式,展开模式expand、层级模式level,
        dimension:'cate1Id',//展开级别，即按照什么展开。一二三级品类、品牌、SKU
        expandKeyText:'',//展开模式搜索关键字
        levelKeyText:'',//层级模式关键字
        level_dimension:'cate',//数据维度，品类-品牌-sku：cate，品牌-品类-sku：brand
        indeterminate: false,//公共条件用,控制样式，是否显示全选状态,false为全选
        checkAll: true,//公共条件用，是否全选
        checkedItemList:[],//公共条件用，所有选中的checkbox
        treeData: [
          {
            id: 1,
            label: '一级 1',
            children: [{
              id: 4,
              label: '二级 1-1',
              children: [{
                id: 9,
                label: '三级 1-1-1'
              }, {
                id: 10,
                label: '三级 1-1-2'
              }]
            }]
          },
          {
            id: 2,
            label: '一级 2',
            children: [{
              id: 5,
              label: '二级 2-1'
            }, {
              id: 6,
              label: '二级 2-2'
            }]
          },
          {
            id: 3,
            label: '一级 3',
            children: [{
              id: 7,
              label: '二级 3-1'
            }, {
              id: 8,
              label: '二级 3-2'
            }]
          },
          {
            id: 4,
            label: '一级 4',
            children: [{
              id: 7,
              label: '二级 4-1'
            }, {
              id: 8,
              label: '二级 4-2'
            }]
          }
        ],
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      }
    },
    methods:{
      inputClick(){
        this.showCondi = true;
      },
      handleCheckAll () {//公共查询条件用，全选点击事件
        if (this.indeterminate) {
          this.checkAll = false;
        } else {
          this.checkAll = !this.checkAll;
        }
        this.indeterminate = false;

        if (this.checkAll) {
          this.checkedItemList = this.allItemLabel;
        } else {
          this.checkedItemList = [];
        }
      },
      checkedItemListChange (data) {//公共查询条件用,多选框变化事件
        if (data.length === this.originItemList.length) {
          this.indeterminate = false;
          this.checkAll = true;
        }else {
          this.indeterminate = true;
          this.checkAll = false;
        }
      },
      tabsClick(event){
        console.log("tab签变化",event);
        console.log("this.defaultMode",this.defaultMode);
      },
      dimensionChange(level){//展开层级变化
        this.indeterminate = true;
//        this.checkedItemList = this.allItemLabel;//checkbox全选
      },
      fastSelect(){
        this.showFastSelect = true;
      },
      getCondition(){
        let condition = {};
        condition.mode = this.defaultMode;
        condition.dimension = this.dimension;
        condition.idList = this.checkedItemList;
        return condition;
      },
      confirm(){
        let condition = this.getCondition();
        if(this.syncDataMethod != undefined){
          this.syncDataMethod.call(this,condition);
        }
        this.showCondi = false;
      },
      cancel(){
        if(this.mode != undefined){
          this.defaultMode = this.mode;
        }
        if(this.view != undefined){
          this.dimension = this.view;
        }
        if(this.idList != undefined && this.idList.length > 0){
          this.checkedItemList = this.idList;
        }
        this.showCondi = false;
      },
      fastFilterChange(){
        console.log("快速筛选变化",this.fast);
        if(this.originItemList == undefined || this.originItemList.length <= 0) return;
        let length = this.originItemList.length;
        let start,end = 0;
        if(this.fast == 'lt20'){
          start = 0;
          end = length * 0.2;
        }else if(this.fast == 'lt40'){
          start = length * 0.2;
          end = length * 0.4;
        }else if(this.fast == 'lt60'){
          start = length * 0.4;
          end = length * 0.6;
        }else if(this.fast == 'lt80'){
          start = length * 0.6;
          end = length * 0.8;
        }else if(this.fast == 'lt100'){
          start = length * 0.8;
          end = length;
        }
        let filterList = this.originItemList.filter(item => {
          return item.sort >= start && item.sort <= end;
        });
        if(filterList != undefined && filterList.length > 0){
          let filterLabelList = filterList.map(item => {
            return item.id;
          });
          this.checkedItemList = filterLabelList;
        }
      },
      cancelFastFilter(){
        this.showFastSelect = false;
      }
    },
    computed:{
      ...mapGetters({
        cate1IdList:'getCate1IdList',
        cate2IdList:'getCate2IdList',
        cate3IdList:'getCate3IdList',
        brandIdList:'getBrandIdList',
        salerIdList:'getSalerIdList',
        skuIdList:'getSkuIdList',
      }),
      showName(){//input框展示名称
        if(this.defaultMode == 'expand'){
          let labelList = [];
          if(this.checkedItemList != undefined && this.checkedItemList.length > 0 && this.originItemList.length > 0){
            let filterList = this.originItemList.filter( (item,index) => {
              return this.checkedItemList.indexOf(item.id) != -1;
            });
            if(filterList != undefined && filterList.length > 0){
              labelList = filterList.map(item => { return item.label});
            }
          }
          return labelList.toString();
        }else if(this.defaultMode == 'level'){

        }
        return '';
      },
      originItemList(){
        if(this.dimension == 'cate1Id'){
          return this.cate1IdList;
        }else if(this.dimension == 'cate2Id'){
          return this.cate2IdList;
        }else if(this.dimension == 'cate3Id'){
          return this.cate3IdList;
        }else if(this.dimension == 'brand'){
          return this.brandIdList;
        }else if(this.dimension == 'saler'){
          return this.salerIdList;
        }else if(this.dimension == 'sku'){
          return this.skuIdList;
        }
        return undefined;
      },
      filterItemList(){//模糊匹配checkbox
        let filterItemList = [];
        if(this.originItemList != undefined && this.originItemList.length > 0){
          filterItemList = this.originItemList.filter( item => { return item.label.indexOf(this.expandKeyText) != -1;});
        }
        return filterItemList;
      },
      allItemLabel(){
        let allItemLabel = [];
        if(this.originItemList != undefined && this.originItemList.length > 0){
          allItemLabel = this.originItemList.map(item => {return item.id});
        }
        return allItemLabel;
      }
    },
    mounted(){
      setTimeout( () => {
        if(this.mode != undefined){
          this.defaultMode = this.mode;
        }
        console.log("this.view",this.view,this.idList)
        if(this.view != undefined){
          this.dimension = this.view;
        }
        if(this.idList != undefined && this.idList.length > 0){
          console.log("this.idList",this.idList)
          this.checkedItemList = this.idList;
        }else{
          this.checkedItemList = this.allItemLabel;//初始化，checkbox全选
        }
      },200);
    }
  }
</script>
