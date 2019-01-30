<template>
  <!--最大化-->
  <div style="display: inline-block">
    <div style="float:right;" @click="expandScreen">
      <svg class="icon" aria-hidden="true" title="全屏" v-on:click="expandScreen">
        <use xlink:href="#icon-zuidahua-moren"></use>
      </svg>

      <Modal v-model="showModal" @on-ok="ok" @on-cancel="cancel" :width="screenWidth" :closable="false">
        <div v-if="showModal == true">
          <slot></slot>
        </div>
      </Modal>
    </div>

    <slot v-if="showSlot"></slot>
  </div>
</template>

<script>
  export default{
    props:{
      showSlot:{
        type:Boolean,
        required:false,
        default:function () {
          return false;
        }
      }
    },
    data(){
      return {
        showModal:false
      }
    },
    methods:{
      expandScreen(){
        console.log(this.showModal)
        this.showModal = true;
      },
      ok(){
        this.showModal = false;
      },
      cancel(){
        this.showModal = false;
      }
    },
    computed:{
      screenWidth(){
        return window.screen.width;
      },
      screenHeight(){
        return window.screen.height;
      }
    }
  }
</script>
