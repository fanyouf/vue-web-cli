<template>
  <PlanAndForecast
    :pSideBarCond="pSideBarCond"
    pDataType="GMV">
  </PlanAndForecast>
</template>
<script>
import PlanAndForecast from './PAndF'

export default {
  props: {
    pSideBarCond: { type: Object, required: true }
  },
  components: { PlanAndForecast }
}
</script>

