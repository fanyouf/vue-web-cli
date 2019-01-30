<template>
    <div>
      <Modal
        v-model="isShowSaveAs"
        title="目标另存为"
        @on-cancel="isShowSaveAs=false"
        @on-ok="emitSaveAs">
        <p>另存为：</p>
        <RadioGroup v-model="targetVersionType">
          <Radio label="CHALLENGE">挑战目标</Radio>
          <Radio label="ASSESSMENT">考核目标</Radio>
        </RadioGroup>
      </Modal>

      <div style="display:flex;" class="toolbar">
        <div class="toolbar">
          <div v-show="conf[type]['edit']">
            <label for="">编辑:</label>
            <i-switch v-model="isEditable"
                      :disabled="!isEnableToOpenEdit"
                      @on-change="hEditStatusChange">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </div>
          

          <!-- <span v-show="conf[type]['save']" title="保存" style="margin-left: 6px;">
            <svg v-if="isEditable" class="icon icon-btn" aria-hidden="true"  @click="save">
              <use xlink:href="#icon-baocun-jihuo"></use>
            </svg>
            <svg v-else  class="icon icon-btn" aria-hidden="true">
              <use xlink:href="#icon-baocun-zhihui"></use>
            </svg>
          </span> -->

          <bDownload
            :isSKUPlan="isSKUPlan"
            :isShow="!!conf[type]['download']"
            :isEditable="true"
            @toolbarDownload="toolbarDownload"
          ></bDownload>

          <bUpload
            v-if="!!conf[type]['upload']"
            :uploadType="toolType"
            :isSKUPlan="isSKUPlan"
            :isShow="!!conf[type]['upload']"
            :isEditable="isEditable"
            @downloadBeforeUpload="hDownloadBeforeUpload"
            @fileUpload="hFileUpload"
          ></bUpload>

          <span v-show="conf[type]['refresh']" title="重置" >
            <svg v-if="isEditable" class="icon icon-btn" aria-hidden="true" @click="refresh">
              <use xlink:href="#icon-zhongzhi-jihuo"></use>
            </svg>
            <svg v-else class="icon icon-btn" aria-hidden="true" >
              <use xlink:href="#icon-zhongzhi-zhihui"></use>
            </svg>
          </span>
          <span v-show="conf[type]['back']" title="后退" >
            <svg v-if="isBack"  class="icon icon-btn" aria-hidden="true" @click="back()">
              <use xlink:href="#icon-chexiao-jihuo"></use>
            </svg>
            <svg v-else  class="icon icon-btn" aria-hidden="true">
              <use xlink:href="#icon-chexiao-zhihui"></use>
            </svg>
          </span>
          <span v-show="conf[type]['prev']" title="前进" >
            <svg v-if="isPrev"  class="icon icon-btn" aria-hidden="true" @click="prev()">
              <use xlink:href="#icon-huifuchexiao-jihuo"></use>
            </svg>
            <svg v-else  class="icon icon-btn" aria-hidden="true">
              <use xlink:href="#icon-huifuchexiao-zhihui"></use>
            </svg>
          </span>

          <bmoneyunit 
            v-show="conf[type]['moneyunit']" 
            :isEditable="true"
            @moneyUnitChange="hMoneyUnitChange">
          </bmoneyunit>

          <!-- <bband v-show="conf[type]['band']"  :isEditable="false"></bband> -->
          <!--Band这一期不做-->
          <!-- <bstructure 
            v-show="conf[type]['structure']" 
            :isEditable="isEditable">
          </bstructure> -->

          <!-- <battribute v-show="conf[type]['attribute']"  :isEditable="isEditable"></battribute> -->
          <!--销售计划二期，不使用属性，放在第三期-->
          <bdatacalibration
            ref="bdatacalibration"
            @JIARIchange="toolbarJIARIchange"
            @clearJIARIFix="toolbarClearJIARIFix"
            :isEditable="isEditable"
            v-show="conf[type]['dataCalibration']"></bdatacalibration>

          <bshowtables  :isEditable="true" v-show="conf[type]['showTable']"  :tableList="tableList"></bshowtables>
          <div v-show="conf[type]['forecast']"> 
            <span> | </span>
            <Button @click="hgetForecastData" :disabled="!isEditable" size="small">加载预测数据</Button>
            <Button @click="hClearForecastData" :disabled="!isEditable" size="small">删除页面数据</Button>
            <span> | </span>
          </div>

          <modify-total :isEditable="isEditable" v-show="conf[type]['total']" class="btn__modify__total"></modify-total>
        </div>
        <div v-show="conf[type]['switchSKU']">
          <div>
            <label for="">汇总计划</label>
            <i-switch 
                @on-change="hPlanTypeChange">
            </i-switch>
            <label for="">SKU计划</label>
          </div>    
        </div>

        <div v-show="conf[type]['save']" style="margin-left: 6px;">
          <Button :disabled="!isEditable" type="primary" size="small" @click="save">保存</Button>
        </div>

      </div>
      <div class="pd15" style="padding-bottom:0">
        <Icon type="social-yen"></Icon>金额单位：{{moneyunitName}}
      </div>
    </div>
</template>
<style scoped>
.h3 {
  font-weight: normal;
  margin: 8px 0px;
  font-size: 14px;
}
</style>
<script>
import modifyTotal from "./modifyTotal.vue";
import bdatacalibration from "./bdatacalibration.vue";
import bDownload from "./bDownload";
import bUpload from "./bUpload";
import { mapGetters, mapMutations } from "vuex";
export default {
  value: {
    type: String,
    require: false
  },
  props: {
    isEnableToOpenEdit: { type: Boolean, default: true },
    querySuccess: { type: Boolean, default: true },
    tableList: { type: Array, required: true },
    toolType: {
      type: String,
      default: "target",
      validator: val => {
        return ["target", "skuPlan", "summaryPlan", "view"].includes(val);
      }
    }
  },
  components: {
    bDownload,
    bUpload,
    modifyTotal,
    bmoneyunit: resolve => require(["./bMoneyUnit"], resolve),
    battribute: resolve => require(["./bAttribute"], resolve),
    bband: resolve => require(["./bBand"], resolve),
    bdatacalibration,
    //'bdatacalibration': (resolve) => require(['./bDataCalibration'], resolve),
    bstructure: resolve => require(["./bStructure"], resolve),
    bshowtables: resolve => require(["./bShowtables"], resolve)
  },

  beforeDestroy() {
    this._bus.$off("DISABLE_TOOLBAR", this.hDisableToolBar);
  },
  created() {
    this.type = this.toolType;
    this._bus.$on("DISABLE_TOOLBAR", this.hDisableToolBar);
  },
  computed: {
    ...mapGetters("stack", ["isPrev", "isBack"]),
    ...mapGetters("cond", ["getPageType", "getIsSelectedAll"]),
    ...mapGetters(["getUser"]),
    cEditSwitchDisabled() {
      // 编辑功能是否启用
      if (
        this.getUser.type === "DEPT_MANAGER" &&
        this.getPageType.indexOf("plan") != -1
      ) {
        return true;
      }
      return false;
    },
    moneyUnit() {
      return this._CONST.MONEYUNIT_MAP[this.value];
    },
    cUploadType() {}
  },
  data() {
    return {
      isSKUPlan: false,
      isShowSKUPlanDownloadDialog: false,
      moneyunitName: "元",
      isShowUpload: false,
      isShowSaveAs: false,
      isEditable: false,
      conf: {
        target: {
          edit: 1,
          save: 1,
          saveAs: 1,
          download: 1,
          upload: 1,
          refresh: 1,
          back: 1,
          prev: 1,
          moneyunit: 1,
          band: 0,
          attribute: 0,
          dataCalibration: 0,
          structure: 0,
          showTable: 1,
          total: 1,
          switchSKU: 0,
          forecast: 1
        },
        summaryPlan: {
          edit: 1,
          save: 1,
          saveAs: 0,
          download: 1,
          upload: 1,
          refresh: 1,
          back: 1,
          prev: 1,
          moneyunit: 1,
          band: 0,
          attribute: 0,
          dataCalibration: 0,
          structure: 1,
          showTable: 1,
          total: 1,
          switchSKU: 1,
          forecast: 1
        },
        skuPlan: {
          edit: 1,
          save: 1,
          saveAs: 0,
          download: 1,
          upload: 1,
          refresh: 1,
          back: 1,
          prev: 1,
          moneyunit: 1,
          band: 0,
          attribute: 0,
          dataCalibration: 0,
          structure: 1,
          showTable: 0,
          total: 0,
          switchSKU: 1,
          forecast: 1
        },
        view: {
          edit: 0,
          save: 0,
          saveAs: 0,
          download: 1,
          upload: 0,
          refresh: 0,
          back: 0,
          prev: 0,
          moneyunit: 1,
          band: 0,
          attribute: 0,
          dataCalibration: 0,
          structure: 0,
          showTable: 1,
          total: 0,
          switchSKU: 0,
          forecast: 0
        }
        // "sku"   :{edit:1,save:1,saveAs:0,download:1,upload:1,refresh:1,back:1,prev:1,moneyunit:1,band:1,attribute:1,dataCalibration:1,structure:1,showTable:1,total:1},
      },
      type: "", // 工具条的状态名字
      targetVersionType: "CHALLENGE",
      uploadVersionType: "depChallengeTarget",
      uploadFileName: ""
    };
  },
  methods: {
    hMoneyUnitChange(newType) {
      this.moneyunitName = this._CONST.MONEYUNIT_MAP[newType];
      this.$emit("input", newType);
    },
    hPlanTypeChange(rs) {
      let type = rs === true ? "SKUPLAN" : "SUMMARYPLAN";

      this.isSKUPlan = rs;
      this.$emit("toolbarPlanTypeChange", type);
    },
    hDisableToolBar() {
      this.isEditable = false;
    },
    hSaveAs() {
      this.isShowSaveAs = true;
    },

    toolbarJIEQIchange(val) {
      this.$emit("toolbarJIEQIchange", val);
    },
    toolbarJIARIchange(val) {
      this.$emit("toolbarJIARIchange", val);
    },
    toolbarClearJIARIFix(val) {
      this.$emit("toolbarClearJIARIFix", val);
    },
    hDownloadBeforeUpload(param) {
      this.$emit("toolbarDownloadBeforeUpload", param);
    },

    save() {
      this.$emit("toolbarSave");
    },
    refresh() {
      this.$emit("toolbarRefresh");
    },
    emitSaveAs() {
      this.$emit("toolbarSaveAs", this.targetVersionType);
    },
    hEditStatusChange() {
      // 开启或者关闭编辑
      this.$emit("toolbarEditStatusChange", this.isEditable);
      this._bus.$emit("E_TABLEEDIT_STATUS_CHANGE", this.isEditable);
    },
    prev() {
      if (this.isPrev) this.$emit("toolbarDataPrev");
    },
    back() {
      if (this.isBack) this.$emit("toolbarDataBack");
    },
    hFileUpload(payload) {
      //  { fileName: this.uploadFileName,targetFileType: this.targetFileType })

      this.$emit("toolbarFileUpload", payload);
    },
    clearJIARIFix() {
      this.$refs.bdatacalibration.clearJIARIFix();
    },
    hgetForecastData() {
      this.$emit("toolbargetForecastData");
    },
    hClearForecastData() {
      this.$emit("toolbarClearForecastData");
    },
    toolbarDownload() {
      this.$emit("toolbarDownload");
    }
  },

  watch: {
    // value: {
    //   handler(val) {
    //     this.moneyunitName = this._CONST.MONEYUNIT_MAP(val)
    //   },
    //   deep: true
    // },
    toolType(newValue) {
      this.type = this.toolType;
    }
  }
};
</script>
