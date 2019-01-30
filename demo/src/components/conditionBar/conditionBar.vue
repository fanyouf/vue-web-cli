<template lang="html">
  <div class="conditionBar">
    <div class="conditionBar-datetime flexa">
      <div>
        <DateDimension ref="c_date" v-model="dateDimensionData" :isViewDetail="isViewDetail"></DateDimension>
      </div>
      <Button size="small" type="info"  @click="query" class="ml15"  style="height: 28px;line-height: 1;">查询</Button>
    </div>
    <div class="conditionBar-btns">
      <target-apply
        :hEmitEvent="emitEffectTargetEvent"
          v-show="isShowEffectTarget"></target-apply>
    </div>
  </div>
</template>

<script>
import DateDimension from '../common/DateDimension'
import { mapGetters, mapMutations } from 'vuex'
import targetApply from './targetApply'

export default {
  props: {
    isViewDetail:{
      type:Boolean,
      default:false
    },
    dateDimensionData: {
      type: Object,
      required: true
    },
    isShowEffectTarget: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      yearList: [],
      cond: {
        year: 2018,
        qmwd: 'M',
        level: 'QM'
      }
    }
  },
  components: {targetApply, DateDimension },
  beforeDestroy() {
    // this._bus.$off(this._CONST.E_DATELEVEL_CHANGE, this.hDateLevel)
  },
  created() {
    // this.getConditionBar && (this.cond.year = this.getConditionBar.year)
    // this.getConditionBar && (this.cond.dateDimension = this.getConditionBar.dateDimension)
    // this.getConditionBar && (this.cond.level = this.getConditionBar.level)

    // this._bus.$on(this._CONST.E_DATELEVEL_CHANGE, this.hDateLevel)

    let currrentYear = new Date().getFullYear() - 3
    for (var i = 0; i < 5; i++) {
      this.yearList.push({
        value: currrentYear + i,
        label: currrentYear + i
      })
    }
  },
  computed: {
    ...mapGetters('cond', ['getConditionBar', 'getPageType']),
    dateTimeTypeList() {
      let filterArr = this.cond.level.split('')
      let rs = this._CONST.dateDimension.filter(item => {
        return filterArr.includes(item.value)
      })
      return rs
    }
  },
  methods: {
    hDateLevelChange(dateLevel) {
      this.cond.level = dateLevel
      this.$nextTick(() => {
        this.cond.dateDimension = dateLevel === 'QM' ? 'M' : 'W'
      })
    },
    query() {
      this.$emit('conditionBarChange')
    },
    emitEffectTargetEvent() {
      this.$emit('effectTarget')
    },
    splitTarget() {
      console.info('splitTarget')
    },
    modifyTotal() {
      console.info('modifyTotal')
    },
    saveValue() {
      console.info('saveValue')
    }
  }
}
</script>
