<template>
  <TargetAndForcat
    :pSideBarCond="pSideBarCond"
    pVersionType="assessment">
  </TargetAndForcat>
</template>
<script>
import TargetAndForcat from './TAndF'

export default {
  props: {
    pSideBarCond: { type: Object, required: true }
  },
  components: { TargetAndForcat }
}
</script>

