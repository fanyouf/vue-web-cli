<template>
  <div class="pop">
    <Poptip trigger="hover" placement="bottom-end">
      <label style="cursor: pointer"> 节气&节假日</label>
      <div slot="content" style="width: 180px;">
        <Collapse accordion>
          <Panel name="1">
            阴历节日
            <div slot="content">
              <CheckboxGroup v-model="val">
               <Checkbox v-for="(item,index) in holiday" :key="index" :label="item.value" style="display: block;">
                  <span>{{item.label}}</span>
                </Checkbox>
              </CheckboxGroup>
            </div>
          </Panel>
          <Panel name="2">
            节气
            <div slot="content">
              <CheckboxGroup v-model="val">
                <Checkbox v-for="(item,index) in jieqi" :key="index" :label="item.value" style="display: block;">
                  <span>{{item.label}}</span>
                </Checkbox>
              </CheckboxGroup>
            </div>
          </Panel>
        </Collapse>
      </div>
    </Poptip>
  </div>
</template>
<style scoped>
  .pop{font-weight:normal;}
  .pop .ivu-poptip-content{width: 180px;}
  .pop .ivu-collapse-content{padding:0 8px;}
  .pop .ivu-collapse-content>.ivu-collapse-content-box {
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .pop .ivu-collapse>.ivu-collapse-item>.ivu-collapse-header {
    height: 26px;
    line-height: 26px;
    padding-left: 30px;
  }
</style>
<script>
  export default {
    props: {
      value: {type: Array,},
      holiday:{type:Array,required:true},
      jieqi:{type:Array,required:true},
    },
    data(){
      return {
        val:[],
        jiejiariList:[
          {value: 'laba', label: '腊八节',},
          {value: 'xiaonian', label: '小年',},
          {value: 'chuxi', label: '除夕',},
          {value: 'chunjie', label: '春节',},
          {value: 'yuanxiao', label: "元宵"},
          {value: 'longtaitou', label: "龙抬头"},
          {value: 'hanshi', label: "寒食节"},
          {value: 'qingming', label: "清明节"},
          {value: 'duanwu', label: "端午节"},
          {value: 'qixi', label: "七夕"},
          {value: 'zhongyuan', label: "中元节"},
          {value: 'zhongqiu', label: "中秋"},
          {value: 'chongyang', label: "重阳"},
        ],
        jieqiList: [
          {value: "lichun", label: "立春（2月4日或5日）"},
          {value: "yushui", label: "雨水（2月19日或20日）"},
          {value: "jingzhe", label: "惊蛰（3月15日或16日）"},
          {value: "chunfen", label: "春分（3月20日或21日）"},
          {value: "qingming", label: "清明（4月4日或5日）"},
          {value: "guyu", label: "谷雨（4月20日或21日）"},
          {value: "lixia", label: "立夏（5月5日或6日）"},
          {value: "xiaoman", label: "小满（5月21日或22日）"},
          {value: "mangzhong", label: "芒种（6月5日或6日）"},
          {value: "xiazhi", label: "夏至（6月21日或22日）"},
          {value: "xiaoshu", label: "小暑（7月7日或8日）"},
          {value: "dashu", label: "大暑（7月22日或23日）"},
          {value: "liqiu", label: "立秋（8月7日或8日）"},
          {value: "chushu", label: "处暑（8月23日或24日）"},
          {value: "bailu", label: "白露（9月7日或8日）"},
          {value: "qiufen", label: "秋分（9月23日或24日）"},
          {value: "hanlu", label: "寒露（10月8日或9日）"},
          {value: "shuangjiang", label: "霜降（10月23日或24日）"},
          {value: "lidong", label: "立冬（11月7日或8日）"},
          {value: "xiaoxue", label: "小雪（11月23日或24日）"},
          {value: "daxue", label: "大雪（12月7日或8日）"},
          {value: "dongzhi", label: "冬至（12月22日或23日）"},
          {value: "xiaohan", label: "小寒（1月5日或6日）"},
          {value: "dahan", label: "大寒（1月20日或21日）"},
        ]
      }
    },
    created(){
      this.val = this.value
    },
    watch: {
      val(){
        console.info(this.val);
        this.$emit("input", this.val)
      }
    }

  }
</script>
