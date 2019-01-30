<template lang="html">
  <Poptip placement="bottom">
    <span title="展示BAND">
      <svg v-if="isEditable"  class="icon icon-btn" aria-hidden="true">
        <use xlink:href="#icon-Band-jihuo"></use>
      </svg>
      <svg v-else  class="icon icon-btn" aria-hidden="true">
        <use xlink:href="#icon-Band-zhihui"></use>
      </svg>
    </span>
    <div v-if="isEditable" slot="content">
      <div>展示BAND</div>
      <!-- @on-change="hDataDimension" v-model="initCondition.dataDimension" -->
      <Cascader  trigger="hover" :data="brand" :clearable="false" ></Cascader>
      <Checkbox v-model="isSaler" @on-change="hIsSaler">采销经理</Checkbox>
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
      isSaler:false,
      brand:[{
          value: '销售额BAND',
          label: '销售额BAND',
          children: [{
              value: '7天销售额 BAND',
              label: '7天销售额 BAND',
              children: [{
                  value: '一级区域',
                  label: '一级区域'
                },
                {
                  value: '二级区域',
                  label: '二级区域'
                },
                {
                  value: '三级区域',
                  label: '三级区域'
                }
              ]
            },
            {
              value: '21天销售额 BAND',
              label: '21天销售额 BAND',
              children: [{
                  value: '一级区域',
                  label: '一级区域'
                },
                {
                  value: '二级区域',
                  label: '二级区域'
                },
                {
                  value: '三级区域',
                  label: '三级区域'
                }
              ]
            },
            {
              value: 'M-1天销售额 BAND',
              label: 'M-1天销售额 BAND',
              children: [{
                  value: '一级区域',
                  label: '一级区域'
                },
                {
                  value: '二级区域',
                  label: '二级区域'
                },
                {
                  value: '三级区域',
                  label: '三级区域'
                }
              ]
            }
          ]
        },
        {
          value: '销量BAND',
          label: '销量BAND',
        },
        {
          value: '点击BAND',
          label: '点击BAND',
        }
      ]
    }
  },
  methods:{
    hIsSaler(){

    }
  }
}
</script>
