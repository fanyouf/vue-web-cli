<template>
  <div>
    <!--:disabled="isEffectDisabled"-->
    <Button type="info" @click="visible = true"  style="height: 28px;line-height: 1;">
      &nbsp;目标生效&nbsp;<Icon type="ios-lightbulb"></Icon>
    </Button>
    <Modal v-model="visible" title="目标生效" @on-ok="ok" @on-cancel="cancel">
      <p>您确定将当前目标生效吗？</p><br/>
      <p>生效成功后，当前目标将应用到销售计划，销售达成及分析页面！</p>
      <!--<p>当前目标版本生效，并应用到目标查询、销售计划、销售达成、销售明细分析页面。</p>-->
      <!-- <RadioGroup v-model="targetType">
        <Radio label="CHALLENGE">
            <span>挑战目标</span>
        </Radio>
        <Radio label="ASSESSMENT">
            <span>考核目标</span>
        </Radio>
      </RadioGroup> -->
    </Modal>
  </div>
</template>
<script>
export default {
  props: {
    hEmitEvent: { type: Function, required: true }
  },
  data() {
    return {
      visible: false,
      targetType: 'CHALLENGE',
      isEffectDisabled: true
    }
  },
  methods: {
    ok() {
      this.hEmitEvent()
    },
    cancel() {
      this.visible = false
    },
    hTargetSaveSuccess(isDisabled) {
      //目标保存成功，目标生效按钮才可用
      this.isEffectDisabled = isDisabled
    }
  },
  beforeDestroy() {
    this._bus.$off(this._CONST.E_TARGET_SAVE_SUCCESS, this.hTargetSaveSuccess)
  },
  created() {
    this._bus.$on(this._CONST.E_TARGET_SAVE_SUCCESS, this.hTargetSaveSuccess)
  }
}
</script>
