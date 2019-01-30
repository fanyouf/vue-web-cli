<template>
    <div>
        <Modal
        v-model="isShowSKUPlanDownloadDialog"
        title="下载SKU计划"
        @on-cancel="isShowSKUPlanDownloadDialog=false">
        
        <p>明细销售计划 <a href="">下载</a></p>
        </Modal>

        <span v-show="isShow" title="下载" >
            <svg v-if="isEditable" class="icon icon-btn" aria-hidden="true" @click="hDownload">
                <use xlink:href="#icon-xiazai-jihuo"></use>
            </svg>
            <svg  v-else class="icon icon-btn" aria-hidden="true">
                <use xlink:href="#icon-xiazai-zhihui"></use>
            </svg>
        </span>
    </div>
    
</template>
<script>
export default {
  props: {
    isSKUPlan: { type: Boolean, default: false },
    isEditable: { type: Boolean, default: false },
    isShow: { type: Boolean, default: false }
  },
  data() {
    return {
      isShowSKUPlanDownloadDialog: false
    };
  },
  methods: {
    hDownload() {
      this.$emit("toolbarDownload");
      // if (this.isSKUPlan) {
      //   this.isShowSKUPlanDownloadDialog = true;
      // } else {
      //   // 非sku计划（目标，或者是汇总计划）时，启动普通的前端表格数据下载
      //   this.$emit("toolbarDownload");
      // }
    }
  }
};
</script>
