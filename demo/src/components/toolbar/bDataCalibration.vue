<template lang="html">
  <Poptip trigger="hover" placement="bottom">
    <span title="同比数据校准">
      <svg v-if="isEditable"  class="icon icon-btn" aria-hidden="true">
        <use xlink:href="#icon-shujuxiaozhun-jihuo"></use>
      </svg>
      <svg v-else  class="icon icon-btn" aria-hidden="true">
         <use xlink:href="#icon-shujuxiaozhun-zhihui"></use>
      </svg>
    </span>
    <div slot="content" v-if="isEditable">
      <div style="font-weight: bold">同比校准</div>
      <div v-show="value != ''">
        <Button style="margin:5px;" size="small" @click="clearJIARIFix">清除{{jiariName}}校准</Button>
      </div>
      <RadioGroup v-model="value" @on-change = "hSelectChange" vertical>
        <Radio   v-for="item in list" :label="item.value" :key="item.value">
          <span>{{item.label}}</span>
        </Radio>
      </RadioGroup>
      <!--<Select v-model="value"-->
      <!--@on-change = "hSelectChange"-->
      <!--size="small">-->
      <!--<Option v-for="item in list" :value="item.value" :key="item.value">{{ item.label }}</Option>-->
      <!--</Select>-->
    </div>
  </Poptip>
</template>

<script>
export default {
  props: { isEditable: { type: Boolean, default: false } },
  computed: {
    jiariName() {
      if (this.value != '') {
        let obj = this.list.find(item => item.value == this.value)
        return obj ? obj.label : ''
      }
      return ''
    }
  },
  methods: {
    hSelectChange(val) {
      let holidayName = ''

      if (val != '') {
        let rs = this.list.find(item => item.value == val)
        if (rs) {
          holidayName = rs.label
        }
        this.$emit('JIARIchange', { holidayCode: val, holidayName })
      }
    },
    clearJIARIFix() {
      this.$emit('clearJIARIFix', this.value)
      this.value = ''
    }
  },
  data() {
    return {
      value: '',
      list: [
        { value: 'laba', label: '腊八节' },
        { value: 'xiaonian', label: '小年' },
        { value: 'chuxi', label: '除夕' },
        { value: 'chunjie', label: '春节' },
        { value: 'yuanxiao', label: '元宵' },
        { value: 'longtaitou', label: '龙抬头' },
        { value: 'hanshi', label: '寒食节' },
        { value: 'qingming', label: '清明节' },
        { value: 'duanwu', label: '端午节' },
        { value: 'qixi', label: '七夕' },
        { value: 'zhongyuan', label: '中元节' },
        { value: 'zhongqiu', label: '中秋' },
        { value: 'chongyang', label: '重阳' }
      ]
    }
  }
}
</script>
