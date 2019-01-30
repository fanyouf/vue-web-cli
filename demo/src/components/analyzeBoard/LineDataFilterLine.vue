<template lang="html">
  <div class="flexa">
    <label for="" title="默认只显示10条">图形筛选:</label>
    <Poptip  placement="bottom" >
      <Input size="small" :value="info" :readonly="true" style="width: 200px"></Input>
      <div slot="content" >
        <div v-if="list.length > 0">
          <CheckboxGroup v-model="val" style="max-height: 300px;overflow: auto">
            <Checkbox v-for="(item,index) in list" :key="index" :label="item.value" style="display: block;">
              <span>{{item.label}}</span>
            </Checkbox>
          </CheckboxGroup>
        </div>
        <div v-else>没有数据项</div>
      </div>
    </Poptip>
  </div>
</template>
<script>

export default {
  props:{
      list:{
          type:Array,required:true
      },
      value:{type:Array,}
  },
  computed:{
    info(){
        if(this.val.length === this.list.length){
          return '全选'+this.val.length+"项";
        }
        return '已选'+this.val.length+"/"+this.list.length+"项";
    }
  },
  data(){
    return {
      val: this.value,
    }
  },
  watch:{
    value(){
        this.val = this.value
    },
    val(){
        this.$emit("input",this.val)
    }
  }
}
</script>
