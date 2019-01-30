<template lang="html">
  <Poptip placement="bottom" trigger="hover">
    <span title="金额单位">
      <svg v-if="isEditable"  class="icon icon-btn" aria-hidden="true">
        <use xlink:href="#icon-danwei-jihuo"></use>
      </svg>
      <svg v-else  class="icon icon-btn" aria-hidden="true">
        <use xlink:href="#icon-danwei-zhihui"></use>
      </svg>
    </span>

    <div v-if="isEditable" slot="content" class="w100">
      <div >金额单位</div>
      <RadioGroup v-model="type" vertical>
        <Radio v-for="(item, index) in list" v-bind:key="index" :label="item.value"><span>{{item.label}}</span></Radio>
      </RadioGroup>
    </div>
  </Poptip>
</template>

<script>
export default {
  data() {
    return {
      type: 'yuan',
      list: [{ value: 'yuan', label: '元' }, { value: 'thousand', label: '千' }, { value: 'wan', label: '万' }, { value: 'million', label: '百万' }]
    }
  },
  props: {
    defaultType: {
      type: String,
      default: 'yuan'
    },
    isEditable: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    type(newType) {
      this.$emit('moneyUnitChange', newType)
    }
  }
}
</script>
