<template>
  <div v-if="value == null" class="noWrap">
    <Icon type="arrow-down-c" color="green"></Icon>
    <span style="color: green;">-%</span>
  </div>

  <div v-else-if="value>=0" class="noWrap">
    <Icon type="arrow-up-c" color="red"></Icon>
    <span style="color: red;">{{ value | formatRadio }}%</span>
  </div>

  <div v-else class="noWrap">
    <Icon type="arrow-down-c" color="green"></Icon>
    <span style="color: green;">{{ value | formatRadio }}%</span>
  </div>

</template>


<script>
  export default {
    name:"YOYShow",
    props:{
      value:{
        required:true
      },
    },
    data(){
      return {
      };
    },
    filters:{
      formatRadio:(value) => {
        if(isNaN(value)){
          return "-";
        }
        return parseFloat(value * 100).toFixed(1);
      }
    }
  }
</script>

<style scoped>
  .noWrap{
    overflow:hidden;
    white-space: nowrap;
    text-overflow:ellipsis;
  }
</style>
