<template>
  <!--销售达成看板，展示达成率、目标、计划、实际等概览信息-->
  <div class="board" v-loading="loading">
    <div class="left mr5">
      <div class="flexb  mb10">
        <CheckCard class="reached mr5" subject="达成率" :value="getValue('reached')" :isRatio="true"
                  icon="md-help-circle" desc="达成率 = 已发生实际销售金额/销售目标金额" :fixedNum="2"></CheckCard>
        <CheckCard class="time" subject="时间进度（本月）" :value="getValue('time')" :isRatio="true" icon="md-help-circle"
                  desc="时间进度=本月已发生天数（T-1）/本月天数" :fixedNum="2"></CheckCard>
      </div>
      <div class="flexb">
        <CheckCard class="target" subject="目标（元）" :value="getValue('target')" icon="md-help-circle"
                  :mom="getMom('target')" :yoy="getYoy('target')" :isThousand="false" :isMoney="true"
                  desc="该角色下所有采销经理销售目标汇总" ></CheckCard>

        <CheckCard v-if="showEstimate" class="target" subject="本月预估（元）" :value="getValue('estimate')" icon="md-help-circle"
                  :mom="getMom('estimate')" :yoy="getYoy('estimate')" :isThousand="false" :isMoney="true"
                  desc="本月预估=月至今销售金额/	（去年同期销售金额/去年同期月度销售金额）"></CheckCard>
        <CheckCard v-else class="target" subject="计划（元）" :value="getValue('plan')" icon="md-help-circle"
                  :mom="getMom('plan')" :yoy="getYoy('plan')" :isThousand="false" :isMoney="true"
                  desc="计划=当月销售计划总金额"></CheckCard>

        <CheckCard class="target" subject="实际（元）" :value="getValue('real')" icon="md-help-circle"
                  :mom="getMom('real')" :yoy="getYoy('real')" :isThousand="false" :isMoney="true"
                  desc="实际=本月已发生GMV金额"></CheckCard>
      </div>
    </div>
    <div class="right " v-if="user.type == 'DEPT_MANAGER'">
      <div class="flexb">
        <CheckCard  class="cate" subject="三级品类(个)" :value="getValue('cate3Num')" icon="md-help-circle"
                    desc="该角色下所有三级品类的数量"></CheckCard>
        <CheckCard  class="cate" subject="采销经理(名)" :value="getValue('salerNum')" icon="md-help-circle"
                    desc="该角色下所有下属采销经理的人数"></CheckCard>
      </div>
      <div class="flexb">
        <CheckCard  class="cate" subject="品牌(个数)" :value="getValue('brandNum')" icon="md-help-circle"
                    desc="该角色下所有品牌的数量"></CheckCard>
        <CheckCard  class="cate" subject="SKU(个数)" :value="getValue('skuNum')" icon="md-help-circle"
                    desc="该角色下所有SKU的数量"></CheckCard>
      </div>
    </div>
    <div class="right" v-else-if="user.type == 'SALER'">
      <div>
        <CheckCard  class="cate" subject="三级品类(个)" :value="getValue('cate3Num')" icon="md-help-circle"
                    desc="该角色下所有三级品类的数量"></CheckCard>
        <CheckCard  class="cate" subject="品牌(个)" :value="getValue('brandNum')" icon="md-help-circle"
                    desc="该角色下所有品牌的数量"></CheckCard>
      </div>
      <div>
        <CheckCard  class="sku" subject="SKU(个)" :value="getValue('skuNum')" icon="md-help-circle"
                    desc="该角色下所有SKU的数量"></CheckCard>
      </div>
    </div>
  </div>
</template>

<script>
import CheckCard from "@/components/card/CheckCard";
import "@/assets/less/reached/reached.less";
import { saleReached as Api } from "@/api/index.js";
import { mapGetters } from "vuex";
export default {
  name: "ReachedBoard",
  components: {
    CheckCard
  },
  data() {
    return {
      boardDatas: [], //查询结果数据,
      loading: false
    };
  },
  methods: {
    queryReachedBoard() {
      //查询达成页面看板数据
      let condition = this.$parent.$parent.getCommonCondition();
      // this.loading = true;
      Api.getSaleBoardData(condition, this, "loading")
        .then(
          this._do("看板数据", d => {
            this.$parent.$parent.updateModuleState("board", true);
            console.info("看板数据：", d);
            if (d != undefined && d.length > 0) {
              this.boardDatas = d;
            }
            this.loading = false;
          })
        )
        .catch(error => {
          this.$Message.error({
            content: "失败：" + error,
            duration: 10,
            closable: true
          });
        });
    },
    getData(type) {
      if (this.boardDatas != undefined && this.boardDatas.length > 0) {
        let module = this.boardDatas.find((board, index) => {
          return board.type === type;
        });
        return module;
      }
      return undefined;
    },
    getValue(type) {
      let moduleData = this.getData(type);
      if (moduleData == undefined) return null;
      if (moduleData.value == undefined) return null;
      return moduleData.value;
    },
    getMom(type) {
      let moduleData = this.getData(type);
      if (moduleData == undefined) return null;
      if (moduleData.mom == undefined) return null;
      return moduleData.mom;
    },
    getYoy(type) {
      let moduleData = this.getData(type);
      if (moduleData == undefined) return null;
      if (moduleData.yoy == undefined) return null;
      return moduleData.yoy;
    }
  },
  computed: {
    ...mapGetters({
      user: "getUser"
    }),
    showEstimate() {
      if (this.user.dept3Id != -1) {
        let deptIdArray = [
          { id: 470, name: "空调一部" },
          { id: 945, name: "空调二部 " },
          { id: 946, name: "格力组" },
          { id: 2005, name: "美的组" },
          { id: 2006, name: "奥克斯组" },
          { id: 2007, name: "中央空调组" },
          { id: 1506, name: "自营功能箱包" }
          //            {id:1541,name:'乱写测试'}
        ];
        let index = deptIdArray.findIndex(arr => arr.id == this.user.dept3Id);
        if (index != -1) {
          return true;
        }
      }
      return false;
    }
  }
};
</script>
