<template>
  <div class="page">
    <page-container>
      <div class="condition" >
        <div style="float:right;">
          <!--<Checkbox v-model="lunarYOY">阴历同比</Checkbox>-->
        </div>
      </div>

      <div data-name='概况' class="card">
        <ReachedBoard ref="board"></ReachedBoard>
      </div>

      <div data-name='达成' class="card">
        <ReachedAnalysis ref="reached"></ReachedAnalysis>
      </div>

      <div data-name='趋势' class="card">
        <ReachedTrend ref="trend"></ReachedTrend>
      </div>

    </page-container>
  </div>
</template>

<script>
import pageContainer from "@/components/common/pageContainer/pageContainer";
import ReachedBoard from "./ReachedBoard.vue";
import ReachedAnalysis from "./ReachedAnalysis.vue";
import ReachedTrend from "./ReachedTrend.vue";
import ReachedStock from "./ReachedStockDetail.vue";
import ReachedSubject from "./ReachedSubjectAnalysis.vue";
import "@/assets/less/saleReached/saleReached.less";
import { common } from "@/api/index";
import { mapMutations, mapGetters } from "vuex";
import moment from "moment";
import mixin from "../saleReached/mixin";
export default {
  mixins: [mixin],
  name: "ManagerReached",
  components: {
    pageContainer,
    ReachedBoard,
    ReachedAnalysis,
    ReachedTrend,
    ReachedStock,
    ReachedSubject
  },
  data() {
    return {
      lunarYOY: false, //阴历同比
      stateArr: [
        { module: "board", state: true },
        { module: "reached", state: true },
        { module: "trend", state: true }
      ]
    };
  },
  methods: {
    ...mapMutations([
      "setCate1IdList",
      "setCate2IdList",
      "setCate3IdList",
      "setBrandIdList",
      "setSalerIdList",
      "setSkuIdList",
      "setExpandList"
    ]),
    queryAllModuleData() {
      if (this.user.type != "SALER") {
        this.$router.push("/ManagerReached");
        return;
      }
      if (!this.validateUserInfo(true)) {
        // 校验当前是否有权限
        return;
      }
      this.stateArr.forEach(sa => (sa.state = false));
      let methods = [];
      methods.push(this.$refs.board.queryReachedBoard());
      methods.push(this.$refs.reached.syncLayoutAndQuery());
      methods.push(this.$refs.trend.syncLayout());
      Promise.all(methods).then();
      //        setTimeout( () => {
      //          let methods = [];
      //          methods.push(this.$refs.board.queryReachedBoard());
      //          methods.push(this.$refs.reached.queryReachedAnalysis());
      //          methods.push(this.$refs.trend.syncLayout());
      //          Promise.all(methods).then( );
      //        },200);
    },
    getCommonCondition() {
      let condition = {};
      condition.lunarYOY = this.lunarYOY;
      condition.erp = this.erp;
      condition.dept3Id = this.user.dept3Id;
      condition.roleType = this.user.type;
      condition.salerId = this.user.salerId;
      condition.parentId = this.user.salerId;
      condition.parentLevel = "saler";
      return condition;
    },
    updateModuleState(module, state) {
      //更新模块状态
      let index = this.stateArr.findIndex((sa, index) => {
        return sa.module == module;
      });
      if (index != -1) {
        console.log("this.stateArr", this.stateArr);
        //存在未查询完的模块
        let falseIndex = this.stateArr.findIndex((sa, index) => {
          return sa.state == false;
        });
        //更新对应模块查询状态
        this.stateArr[index].state = state;
        console.log("update this.stateArr", this.stateArr);
        //是否还存在为查询完的模块
        let updateFalseIndex = this.stateArr.findIndex((sa, index) => {
          return sa.state == false;
        });
        if (falseIndex != -1 && updateFalseIndex == -1) {
          //this.$Message.success({content: '成功', duration: 10, closable: true});
          this.$Notice.success({
            title: "Success",
            desc: "查询成功"
          });
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      erp: "getErp",
      user: "getUser"
    }),
    roleType() {
      return this.user.type;
    }
  },
  mounted() {
    if (this.user.type != undefined && this.erp != undefined) {
      this.queryAllModuleData();
    }
  },
  watch: {},
  created() {
    this._bus.$on(this._CONST.E_USERINFO_CHANGE, this.queryAllModuleData);
  },
  beforeDestroy() {
    this._bus.$off(this._CONST.E_USERINFO_CHANGE, this.queryAllModuleData);
  }
};
</script>
