<template>
  <Poptip placement="bottom-start" v-model="visiable">
    <Button type="primary" :disabled="!isEditable" @click="visiable = true">修改总值&nbsp;<Icon :type="visiable ? 'ios-arrow-up':'ios-arrow-down'"></Icon></Button>
    <div slot="content">
      <p>修改当前总值:</p>
      <p>
        <Input 
          size="small" 
          v-model="value"
          :disabled="!isEditable">
        </Input>
      </p>
      <p class="padding1">注：按当前比例拆分</p>
      <div class="">
        <Button style="background-color:#2d8cf0;color:#fff;" size="small" type="primary"  @click="save">保存</Button>
        <Button size="small" type="primary"  @click="cancel">取消</Button>
      </div>
    </div>
  </Poptip>
</template>
<style scoped>
p {
  padding: 3px;
}
</style>


<script>
export default {
  props: {
    isEditable: { type: Boolean, required: false }
  },
  beforeDestroy() {
    this._bus.$off(this._CONST.E_TOOLBAR_TOTOAL_INIT, this.hInitSum);
  },
  created() {
    this._bus.$on(this._CONST.E_TOOLBAR_TOTOAL_INIT, this.hInitSum);
  },
  data() {
    return {
      visiable: false,
      value: 0,
      oldValue: -1,
      isSplit: true
    };
  },
  methods: {
    cancel() {
      this.value = this.oldValue;
      this.visiable = false;
    },
    save() {
      this.visiable = false;
      if (isNaN(this.value)) {
        this.$Message.error("输入的为非数值，请重新输入！");
        return;
      }

      if (this.value != this.oldValue) {
        let df = this.oldValue - this.value;
        if (df > this.toModifySum) {
          this._error("你输入的总值过小，不能被拆分！");
          return;
        }
        this._bus.$emit(this._CONST.E_TOOLBAR_TOTOAL_CHANGE, {
          oldValue: this.oldValue,
          newValue: this.value,
          isSplit: this.isSplit
        });
      }
    },
    hInitSum({ sum, toModifySum }) {
      this.value = sum.toFixed(3);
      this.oldValue = sum.toFixed(3);
      this.toModifySum = toModifySum;
    }
  }
};
</script>
