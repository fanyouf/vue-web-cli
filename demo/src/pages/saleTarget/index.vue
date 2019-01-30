<template>
  <base-template>
    <template slot="sideBar">
      <sidebar
        pageType="target"
        @sideBarQuery="hSideBarQuery">
      </sidebar>
    </template>
    <template slot="mainContainer">
      <nav>
        <div class="nav-level1">
          <span @click="hMenuChangeClick('assessment')"
            :class="{'current': componentName=='assessment'}">考核目标</span>

          <span @click="hMenuChangeClick('challenge')" 
          :class="{'current': componentName=='challenge'}">挑战目标</span>
        </div>
      </nav>
    
      <Modal
        v-model="isConfirmBox"
        title="系统提示"
        @on-cancel="cancel"
        @on-ok="ok">
        <p>您正在编辑目标，确定要离开吗？</p>
      </Modal>

      <keep-alive>
        <component :is="componentName" 
        :pSideBarCond="sideBarCond"
        :tabName="componentName"></component>
      </keep-alive>
    </template>
  </base-template>
</template>
<script>
import assessment from "./indexAssessment";
import challenge from "./indexChallenge";
import sidebar from "@/components/sideBar/sideBar";
import BaseTemplate from "../template";
import { mapMutations, mapGetters } from "vuex";

export default {
  beforeDestroy() {
    this._bus.$off("EDIT_STATE_CHANGE", this.hEditStatusChange);
    this.clearStack("target")
  },
  created() {
    this._bus.$on("EDIT_STATE_CHANGE", this.hEditStatusChange);
    this._bus.$emit("E_TABLEEDIT_STATUS_CHANGE", false);
    this.hMenuChangeClick("assessment");
  },
  components: {
    BaseTemplate,
    challenge,
    assessment,
    sidebar
  },
  data() {
    return {
      sideBarCond: {},
      isShowSideBar: true, //  控制侧边栏
      isEditTable: false, //  是否正在编辑
      isConfirmBox: false, //  是否展示提醒框
      clickTabName: "assessment", //  当前点击是gmv还是销售
      componentName: "assessment"
    };
  },
  computed: {
    ...mapGetters(["getUser"])
  },
  methods: {
    ...mapMutations("cond", ["setPageType"]),
    ...mapMutations("stack", ["setPageType","clearStack"]),
    hMenuChangeClick(m) {
      //gmv和计划切换时，如果当前是编辑状态，提示是否离开 add by gaoqiong3
      this.componentName = m;
      if (m === "challenge") {
        this.setPageType(this._CONST.PAGETYPE.challengeTarget);
      } else if (m === "assessment") {
        this.setPageType(this._CONST.PAGETYPE.assessmentTarget);
      }
    },
    hSideBarQuery(cond) {
      // 1.添加信息,
      let _cond = Object.assign({}, cond, {
        roleType: this.getUser.type,
        dept3Id: this.getUser.dept3Id
      });
      console.info(
        "目标index页收到siderBaryQuery事件，左侧节点的条件是",
        _cond
      );

      this.sideBarCond = _cond;

      // 2.发出事件
      this._bus.$emit(this._CONST.E_SIDEBAR_SELECTEDNODE_CHANGE, _cond);
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
