<template>
  <base-template>
    <template slot="sideBar">
      <sidebar
        pageType="plan"
        @sideBarQuery="hSideBarQuery">
      </sidebar>
    </template>
    <template slot = "mainContainer">
      <!-- <nav> -->
        <!-- <div class="nav-level1"> -->
          <!-- <span @click="hMenuChangeClick('gmv')"    :class="{'current': componentName=='gmv'}">GMV</span> -->
          <!-- <span @click="hMenuChangeClick('sale')" :class="{'current': componentName=='sale'}">销量</span> -->
          <!-- <span @click="hMenuChangeClick('price')" v-show="isShowSKU" :class="{'current': level.first=='price'}">售价</span> -->
        <!-- </div> -->
      <!-- </nav> -->
      <!--<ButtonGroup class="nav-level2" v-show="level.first != 'price'">
          <Button @click="hTabChange('forecast')" :class="{'ivu-btn-primary':level.second=='forecast'}">预测</Button>
          <Button @click="hTabChange('plan')" :class="{'ivu-btn-primary' :level.second=='plan'}">计划</Button>
        </ButtonGroup> -->

      <!--gmv和计划切换时，如果当前是编辑状态，提示是否离开 add by gaoqiong3-->
      <Modal
        v-model="isConfirmBox"
        title="系统提示"
        @on-cancel="cancel"
        @on-ok="ok">
        <p>您正在编辑计划，确定要离开吗？</p>
      </Modal>

      <indexGMV 
        :pSideBarCond="sideBarCond"
      ></indexGMV>
 
    </template>
  </base-template>
</template>
<script>
import indexGMV from "./indexGMV";
import sidebar from "@/components/sideBar/sideBar";
import BaseTemplate from "../template";
import { mapMutations, mapGetters } from "vuex";
/**
 * @module index.vue
 * @vue-prop {Number} initialCounter
 * @vue-prop {Number} [step=1] Step
 * @vue-data {Number} counter - Current counter's value
 * @vue-computed {Array.<String>} fooList - A list of foo
 * @vue-computed {Array.<String>} barList - A list of bar
 * @vue-computed {String} message A message
 */
export default {
  beforeDestroy() {
    this._bus.$off("EDIT_STATE_CHANGE", this.hEditStatusChange); //编辑状态是否改变 add by gaoqiong3

    this.clearStack("plan")

  },
  created() {
    this._bus.$on("EDIT_STATE_CHANGE", this.hEditStatusChange); //编辑状态是否改变 add by gaoqiong3

    this._bus.$emit("E_TABLEEDIT_STATUS_CHANGE", false);
  },
  components: {
    BaseTemplate,
    indexGMV,
    sidebar
  },
  data() {
    return {
      sideBarCond: {},
      isShowSideBar: true, //  控制侧边栏
      isEditTable: false, //  是否正在编辑
      isConfirmBox: false //  是否展示提醒框
    };
  },
  computed: {
    ...mapGetters(["getUser"])
  },
  methods: {
    ...mapMutations("stack", ["clearStack"]),

    hSideBarQuery(cond) {
      console.info("计划index页收到siderBaryQuery事件，左侧节点的条件是", cond);

      Object.assign(cond, {
        roleType: this.getUser.type,
        dept3Id: this.getUser.dept3Id
      });

      this.sideBarCond = cond;
      this._bus.$emit(this._CONST.E_SIDEBAR_SELECTEDNODE_CHANGE);
    },

    hEditStatusChange(val) {
      //gmv和计划切换时，如果当前是编辑状态，提示是否离开 add by gaoqiong3
      console.log("编辑状态改变", val);
      this.isEditTable = val;
    },
    ok() {
      //gmv和计划切换时，如果当前是编辑状态，提示是否离开 add by gaoqiong3
      this.isEditTable = false; // 强制把本地状态改成false,则下次再次切换时，就不会提示了
      this._bus.$emit("DISABLE_TOOLBAR"); //被激活时编辑状态改为关闭 add by gaoqiong3
      this._bus.$emit("ENABLE_SIDEBAR"); //被激活时左侧树可用 add by gaoqiong3
      this._hMenuChangeClick(this.clickTabName);
    },
    cancel() {
      //gmv和计划切换时，如果当前是编辑状态，提示是否离开 add by gaoqiong3
      this.isConfirmBox = false;
    }
  }
};
</script>
