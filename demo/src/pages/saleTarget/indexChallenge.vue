<template>
  <TargetAndForcat
    :pSideBarCond="pSideBarCond"
    pVersionType="challenge">
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

