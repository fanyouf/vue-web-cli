<template>
  <div class="analyzeBoard">
    <div class="analyzeBoard-title">
        <h4>分析看板</h4>
        <span>
          <i v-show="status=='status_expend'" class="iconfont icon-btn icon-shouqi" @click="hCollapse()"></i>
          <i v-show="status=='status_collapse'"  class="iconfont icon-btn icon-zhankai" @click="hExpend()"></i>
        </span>
    </div>
    <div class="analyzeBoard-condition">
      <div class="analyzeBoard-condition-btns">
        <date-range ref="refDateRange" :dateRange="condition.dateRange[componentName]"></date-range>
        <qmwd v-model="condition.dateDimension"></qmwd>
        <BaseMutileSelector 
          :pDataSource="dataForDropDownList" 
          v-model="dropDownselectedList"
          :pIsAllSelect="true"
          v-show="componentName=='barsAndScatter'"></BaseMutileSelector>
        <Button size="small" type="primary" @click="hClickQuery"> 查询 </Button>
      </div>
      <div class="analyzeBoard-condition-icons">
        <svg class="icon" aria-hidden="true" title="气泡散点图" @click="hIcon('barsAndScatter')">
          <use v-show="componentName!='barsAndScatter'" xlink:href="#icon-qipaotu-yuan-moren"></use>
          <use v-show="componentName=='barsAndScatter'" xlink:href="#icon-qipaotu-yuan-xuanzhong" ></use>
        </svg>
        <svg class="icon" aria-hidden="true" title="趋势分析图"  @click="hIcon('lines')">
          <use v-show="componentName!='lines'" xlink:href="#icon-zhexian-yuan-moren"></use>
          <use v-show="componentName=='lines'" xlink:href="#icon-zhexian-yuan-xuanzhong"></use>
        </svg>
        <svg class="icon" aria-hidden="true" title="趋势分析图"  @click="hIcon('histogram')">
          <use v-show="componentName!='histogram'" xlink:href="#icon-zhuzhuangtu-yuan-moren"></use>
          <use v-show="componentName=='histogram'" xlink:href="#icon-zhuzhuangtu-yuan-xuanzhong"></use>
        </svg>
      </div>
    </div>
    <div class="analyzeBoard-content" v-show="status=='status_collapse'">
      <keep-alive>
        <component 
          :is="componentName"
          :titleType="titleType"
          :pQueryDataType="pQueryDataType"
          :pSiderBarCondition="siderBarCondition"
          :pTimeDimension="dateDimension"
          :pMonthRange="monthRange"
          :pcurrentChildrenIdList="currentQueryList"
          :pPageType="pPageType"
          :pVersionType ="pVersionType"
          :pChangeCurrentChildrenIdList="changeCurrentChildrenIdList"
          
          ></component>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import dateRange from "@/components/common/dateRange.vue";
import qmwd from "@/components/common/qmwd.vue";
import BaseMutileSelector from "@/components/common/BaseMultiSelector.vue";
import barsAndScatter from "./BarsAndScatter";

import moment from "moment";

const prevMonth = moment()
  .subtract(1, "month")
  .format("YYYY-MM");

const currentMonth = moment()
  .subtract(0, "month")
  .format("YYYY-MM");
const currentYear = new Date().getFullYear();

let lastQueryTime = null;

export default {
  props: {
    titleType: { type: String, required: true }, //GMV 或者是 销量
    pQueryDataType: { type: String, required: true },
    pPageType: { type: String, required: true }, // plan target，决定 dateRange的默认时间
    pVersionType: { type: String, default: "assessemnt" }
  },
  components: {
    dateRange,
    qmwd,
    BaseMutileSelector,
    barsAndScatter,
    histogram: resolve => require(["./histogram"], resolve),
    lines: resolve => require(["./line"], resolve)
  },

  data() {
    return {
      componentName: "barsAndScatter",
      status: "status_collapse",
      condition: {
        dateRange: {},
        qmwd: "M"
      },
      dateDimension: "m",
      monthRange: {},
      isActive: false,
      oldSelectedNodeStr: "",

      siderBarCondition: {},
      dataForDropDownList: [], // 从queryCondition中再次封装，并传给下拉列表的数据。
      dropDownselectedList: [], // 用户在下拉列表中选中的信息

      currentQueryList: [], // 当前查询的信息。因为 dropDownselectedList是双向绑定的，所以，这里不能直接使用。

      changeCurrentChildrenIdList: rs => {
        this.currentQueryList = rs;
        // 在柱子上点击,不直接更新表格
        this.$emit(
          "updateTableCondition",
          { ...this.siderBarCondition, currentChildrenIdList: rs },
          false
        );
      }
    };
  },
  methods: {
    /**
     * 响应 E_SIDEBAR_SELECTEDNODE_CHANGE 事件
     * cond : 从sideBar中传递来的条件
     */
    hSideBarQuery(cond) {
      if (!this.isActive) {
        return;
      }
      this.siderBarCondition = cond;

      // 1. 如果是左侧的节点变化了，则直接跳回到结构分析图
      this.componentName = "barsAndScatter";

      // 2. 设置下拉列表的数据源，并全部选中
      this.dataForDropDownList = cond.childrenIdList.map((item, index) => {
        return {
          label: cond.childrenNameList[index],
          value: item
        };
      });
      this.dropDownselectedList = [...cond.childrenIdList];

      // 3.启动查询
      this.hClickQuery();

      this.$emit("updateTableCondition", {
        ...cond,
        currentChildrenIdList: cond.childrenIdList
      });
    },

    /***
     *
     */
    hClickQuery() {
      this.dateDimension = this.condition.dateDimension;

      this.currentQueryList = [...this.dropDownselectedList];
      let { start, end } = this.condition.dateRange[this.componentName];
      this.monthRange = this._moment.dateRangeAdpter(
        start,
        end,
        this.dateDimension
      );

      if (this.currentQueryList.length === 0) {
        this._info("没有选中任何项目");
        return;
      }
      // 注意 如果直接emit，则数据并没有及时更新
      setTimeout(() => {
        this._bus.$emit(this._CONST.E_ANALYZEBOARD_QUERY);
      });

      //  它在三种情况下会被触发：
      // 1. 页面初始加载时：
      //     （1）sideBar发出点击事件
      //     （2）由于它也是第一次加载进来，自己自带的 activated 也会发一次请求。
      //      这两次事件的派发都会带上参数
      //      注意：这里它会发出来两次，解决的办法是判断两次之间的时间间隔，如果过小，就直接阻止第二次
      // 2. 从某个选项卡切到另一个选项卡
      //     （1）页面初始打开的是考核目标，接下来用户切到了挑战目标，这里相当于是activated中再次触发。
      // 3. 用户直接点击了查询按钮。此时param是undefined

      //  分析面板上的图

      // if(this.dataForDropDownList.length === 0 && childrenIdList.length === 0 ){
      //   // 说明是它active时发出的事件，此时左侧树中还没有选中的节点，所以整个下拉列表中都没有值。
      //   return;
      // }
      // if(this.dataForDropDownList.length  && childrenIdList.length === 0 ){
      //   this._error("分析看板中请至少选中一个节点")
      //   return;
      // }

      // if(this._validate(cond,this._api.validate.analyzeBoardQuery)){
      //   console.info(Date.now(),lastQueryTime,Date.now() - lastQueryTime)
      //   if(!lastQueryTime){
      //     lastQueryTime = Date.now()
      //   }
      //   else if(Date.now() - lastQueryTime < 3000){
      //     return;
      //   }
      //   else{
      //     lastQueryTime = Date.now()
      //   }
      // }

      // 时间区间，维度变化时，同步设置到三个组件的属性。

      // 点击查询时，传递

      //   let  {start,end}  = this.dateSpan;//this.$refs.refDateRange.getValue();
      //   let dateDimension = this.$refs.refQmwd.getValue();

      //   let t = this._moment.dateRangeAdpter(start,end,dateDimension);
      //  // let {parentId,parentLevel,parentName,childrenLevel} = this.siderBarCondition;
      //   let condition = Object.assign(
      //     {},
      //     {
      //       ...this.siderBarCondition,
      //       // startDate:t.start,
      //       // endDate:t.end,
      //       // dateDimension,
      //       dataType:this.pQueryDataType,
      //     },
      //     {childrenIdList:[...this.currentQueryList]})

      //   // 把sidebar的条件和用户选择的条件结合在一起
      //   this.siderBarCondition = condition;

      //   console.info("分析面板query通过了条件验证，保存当前条件：",condition,"并发布E_ANALYZEBOARD_QUERY事件...")
      //  this._bus.$emit(this._CONST.E_ANALYZEBOARD_QUERY,condition);

      // this.oldSelectedNodeStr = JSON.stringify(this.getSelectedNode.childrenIdList)
    },
    hCollapse() {
      this.status = "status_collapse";
    },
    hExpend() {
      this.status = "status_expend";
    },
    hIcon(modelName) {
      this.componentName = modelName;
      this.status = "status_collapse";
    }
  },

  created() {
    this.isActive = true;

    if (this.pPageType == "target") {
      this.condition.dateRange = {
        barsAndScatter: { start: currentMonth, end: currentMonth }, //当月
        lines: { start: currentYear + "-01", end: currentYear + "-12" }, //本年
        histogram: { start: currentYear + "-01", end: currentYear + "-12" } //本年
      };
    } else {
      this.condition.dateRange = {
        barsAndScatter: { start: prevMonth, end: prevMonth }, //上月
        lines: { start: currentYear + "-01", end: currentYear + "-12" }, //本年
        histogram: { start: currentYear + "-01", end: currentYear + "-12" } //本年
      };
    }

    this._bus.$on(
      this._CONST.E_SIDEBAR_SELECTEDNODE_CHANGE,
      this.hSideBarQuery
    );
  },
  beforeDestroy() {
    this._bus.$off(
      this._CONST.E_SIDEBAR_SELECTEDNODE_CHANGE,
      this.hSideBarQuery
    );
  },
  activated() {
    this.isActive = true;
  },
  deactivated() {
    this.isActive = false;
  }
};
</script>
