<template lang="html">
  <Poptip placement="bottom">
    <span  title="结构占比">
      <svg v-if="isEditable"  class="icon icon-btn" aria-hidden="true">
        <use xlink:href="#icon-zhanbi-jihuo"></use>
      </svg>
      <svg v-else  class="icon icon-btn" aria-hidden="true">
        <use xlink:href="#icon-zhanbi-zhihui"></use>
      </svg>
    </span>
    <div  v-if="isEditable" slot="content">
      <div v-for="item in list" :keys="item.value">
        <Checkbox  v-model="item.checked" @on-change="change">{{item.label}}</Checkbox>
      </div>
    </div>
  </Poptip>
</template>

<script>
export default {
  props: {
     isEditable:{type:Boolean,default:false},
    },
  data() {
    return {
      list:[{value:"bandA",label:"bandA",checked:false,},{value:"bandB",label:"bandB",checked:true},{value:"bandC",label:"bandC",checked:true}]
    }
  },
  methods:{
    change(){
      this._bus.$emit(this._CONST.E_TOOLBAR_BAND_CHANGE,this.list)
    }
  }
}
</script>
