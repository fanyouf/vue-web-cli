<template>
    <div>
        <Modal
        v-model="visiable"
        :title="title"
        @on-cancel="visiable=false"
        @on-ok="hFileUpload">
        <div>
          <div class="h5">第一步：下载模板</div>
          <p v-for="(item,index) in links" v-bind:key="index">
            <a @click.prevent.stop="downLoad(item.param)">{{item.txt}}</a>
          </p>
          <div v-if="isSKUPlan">
              <p>选择月份:<DatePicker v-model="yearMonth" size="small" type="month" placeholder="Select date" style="width: 100px"></DatePicker>
              <a @click.prevent.stop="downLoadSKUTemplate">下载促销销售计划</a></p>
            </div>
        </div>
        <div>
          <div class="h5">第二步：选择要上传的excel文件</div>
          <!-- <label class="ivu-btn ivu-btn-primary ivu-btn-samll" for="xFile">上传文件</label> -->
          <form enctype="multipart/form-data" novalidate >
            <!-- <input
              style="position:absolute;clip:rect(0 0 0 0);"
              type="file" name="file"
                   id="xFile"
                   @change="hFilesChange($event.target.files)"
                   class="input-file"> -->
              <input
                type="file"
                name="file"
                id="xFile"
                @change="hFilesChange($event.target.files)"
              >
          </form>
        </div>
        <div v-if="isSelectFileType">
          <div class="h5">第三步：选择上传文件的类型</div>
          <RadioGroup v-model="targetFileType">
            <Radio label="depChallengeTarget">部门考核目标</Radio>
            <Radio label="saleTargetModify">明细目标</Radio>
          </RadioGroup>
        </div>
      </Modal>


        <span v-show="isShow" title="上传" >
            <svg v-if="isEditable" class="icon icon-btn" aria-hidden="true" @click="visiable=true">
              <use xlink:href="#icon-shangchuan-jihuo"></use>
            </svg>
            <svg v-else class="icon icon-btn" aria-hidden="true" >
              <use xlink:href="#icon-shangchuan-zhihui"></use>
            </svg>
          </span>
    </div>
    
</template>
<script>
const TITLE_MAP = {
  target: "上传目标数据",
  skuPlan: "上传SKU计划数据",
  summaryPlan: "上传计划数据"
};
const DOWNLOAD_LINK_MAP = {
  target: [
    { txt: "下载部门考核目标模板", param: "dept" },
    { txt: "下载明细目标模板", param: "detail" }
  ],
  skuPlan: [], // { txt: '下载促销计划模板' }
  summaryPlan: [{ txt: "下载明细计划模板" }]
};
export default {
  props: {
    isSKUPlan: { type: Boolean, default: false },
    isEditable: { type: Boolean, default: false },
    isShow: { type: Boolean, default: false },
    uploadType: {
      type: String,
      default: "target",
      validator: val => {
        return ["target", "skuPlan", "summaryPlan"].includes(val);
      }
    }
  },
  computed: {
    links() {
      return DOWNLOAD_LINK_MAP[this.uploadType];
    },
    title() {
      return TITLE_MAP[this.uploadType];
    },
    isSelectFileType() {
      return this.uploadType === "target";
    }
  },
  data() {
    return {
      yearMonth: new Date(),
      visiable: false,
      uploadFileName: "",
      targetFileType: "depChallengeTarget"
    };
  },
  methods: {
    downLoadSKUTemplate() {
      let year = this.yearMonth.getFullYear();
      let monthList = [this.yearMonth.getMonth() + 1];
      let param = {
        type: "SKU",
        year,
        monthList
      };
      this.$emit("downloadBeforeUpload", param);
    },
    downLoad(param) {
      this.$emit("downloadBeforeUpload", param);
    },
    hFilesChange(file) {
      this.uploadFileName = file[0];
    },
    hFileUpload() {
      if (!this.uploadFileName) {
        this._error("没有选择文件");
        return;
      }
      let param = { fileName: this.uploadFileName };
      if (this.isSelectFileType) {
        Object.assign(param, { targetFileType: this.targetFileType });
      }

      this.$emit("fileUpload", param);
    }
  }
};
</script>
