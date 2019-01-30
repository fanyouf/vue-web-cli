<!-- 销售计划 的主页 -->
<template lang="html">
  <div class="page">
    <div class="toggleBtn">
      <span title="隐藏 / 显示侧边栏" @click="isShowSideBar=!isShowSideBar">
        <Icon v-if="isShowSideBar" type="md-arrow-dropleft"></Icon>
        <Icon v-else type="md-arrow-dropright"></Icon>
      </span>
    </div>
    <transition name="slide-fade">
    
    <div class="sideBar" v-show="isShowSideBar" ref="sideBar">
      <slot name="sideBar">侧边栏</slot>
    </div>
    </transition>
    <div class="mainContainer" ref="mainContainer">
      <slot name ="mainContainer">整体区域</slot>
    </div>
  </div>
</template>
<style>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(-252px);
  opacity: 0;
}
</style>

<script>
export default {
  data() {
    return {
      isShowSideBar: true
    };
  },
  methods: {
    fn() {
      console.info("fn...........");
      this.$refs.mainContainer.style.height =
        document.documentElement.clientHeight -
        this.$refs.mainContainer.offsetTop -
        70 +
        "px";
      this.$refs.sideBar.style.height = this.$refs.mainContainer.style.height;
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.fn);
  },
  mounted() {
    this.$refs.mainContainer.style.height =
      document.documentElement.clientHeight -
      this.$refs.mainContainer.offsetTop -
      70 +
      "px";
    this.$refs.sideBar.style.height = this.$refs.mainContainer.style.height;

    window.addEventListener("resize", this.fn);
  }
};
</script>
