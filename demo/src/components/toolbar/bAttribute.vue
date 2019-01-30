<template lang="html">
  <Poptip placement="bottom" class="toolbar-ibtncontainer-attribute">
    <span title="属性管理">
      <svg class="icon icon-btn" aria-hidden="true">
        <use xlink:href="#icon-shuxingguanli-zhihui"></use>
      </svg>
    </span>
    <div slot="content">
      <div class="toolbar-ibtnbody-title">展示属性</div>
      <RadioGroup v-model="value">
        <Radio v-for="item in attributes" :key="item.label" :label="item.value">
            <span>{{item.label}}</span>
        </Radio>
      </RadioGroup>
      <Checkbox v-model="attributeGroup">属性分项汇总</Checkbox>
    </div>
  </Poptip>
</template>

<script>
export default {
  props: {
     isEditable:{type:Boolean,default:false},
    },
  data(){
    return {
      value:"",
      attributeGroup:true,
      attributes:[
        {value:'1',label:'材质'},
        {value:'2',label:'颜色'},
        {value:'3',label:'功能'},
        {value:'4',label:'尺码'},
        {value:'5',label:'产地'},
        {value:'6',label:'容量'},
        {value:'7',label:'SPU'},
        {value:'8',label:'款式'},

      ]
    }
  }
}
</script>
