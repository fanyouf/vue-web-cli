<template lang="html">
  <Poptip placement="bottom" trigger="hover">
    <span  title="内容拓展">
      <svg v-if="isEditable"  class="icon icon-btn" aria-hidden="true">
        <use xlink:href="#icon-neirongtuozhan-jihuo"></use>
      </svg>
      <svg v-else  class="icon icon-btn" aria-hidden="true">
        <use xlink:href="#icon-neirongtuozhan-zhihui"></use>
      </svg>
    </span>
    <div  v-if="isEditable" slot="content" class="w100">
      <div style="font-weight: bold">表格显示</div>
      <div v-for="item in tableList" :keys="item.value">
        <Checkbox v-show="isShow(item.value)" v-model="item.checked">{{item.label}}</Checkbox>
      </div>
    </div>
  </Poptip>
</template>
<style scoped>
.ivu-checkbox-wrapper {
  display: block;
  margin: 5px;
}
</style>
<script>
export default {
  methods: {
    isShow(val) {
      // 只有 1、渗透率 2、同比 3、环比 是可以被隐藏的
      return ['tstl', 'ttb', 'thb'].includes(val)
    }
  },
  props: {
    isEditable: { type: Boolean, default: false },
    tableList: {
      type: Array,
      default: function() {
        return [{ label: '同比分析', value: 'ttb', checked: true }, { label: '环比分析', value: 'thb', checked: true }, { label: 'GMV明细', value: 'tmx', checked: true }]
      }
    }
  },
  watch: {
    tableList: {
      handler(val) {
        // console.dir(val)
      },
      immediate: true
    }
  }
}
</script>
