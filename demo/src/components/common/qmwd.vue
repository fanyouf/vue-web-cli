<template lang="html">
  <div class="flexa">
    <label style="width:70px;">数据维度:</label>
    <Select class="mw60" size="small"  v-model="val" placeholder="请选择数据维度">
        <Option v-for="item in list" :value="item.value" :key="item.value">{{ item.label }}</Option>
    </Select>
  </div>

</template>

<script>
export default {
  props: {
    value: { type: String }
  },
  data() {
    return {
      val: this.value,
      list: [
        { label: "季", value: "Q" },
        { label: "月", value: "M" },
        { label: "周", value: "W" },
        { label: "天", value: "D" }
      ]
    };
  },
  watch: {
    val(newVal, oldVal) {
      this.$emit("input", newVal);
    }
  }
};
</script>
