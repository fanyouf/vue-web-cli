<template lang="html">
  <Poptip placement="bottom-start" v-model="visible">
    <svg class="icon icon-btn" aria-hidden="true" title="占比设置">
      <use xlink:href="#icon-shezhi"></use>
    </svg>
    <div slot="content" style="font-weight: normal">
      <p>将{{title}}数据按如下比例切分成: <InputNumber :min="0" :max="8" @change="setNumber" size="mini" :value="partPercentList.length"></InputNumber 部分</p>
      <ul>
        <li v-for="(item,index) in partPercentList">
          <span style="margin-right:5px">{{index+1}}:</span><InputNumber size="small" :max="100" :min="1" v-model="item.val"></InputNumber> %
        </li>
      </ul>
      <div class="">
        <Button type="primary" size="small" name="button" @click="save">保存</Button>
        <Button type="primary" size="small" name="button" @click="cancel">取消</Button>
      </div>
      <div v-if="tipInfo.length" style="color:red">{{tipInfo}}
        </div>
    </div>
  </Poptip>
</template>
<style scoped="">
  li{margin:3px 0;}
</style>
<script>
export default {
    props:{
      title:{type:String,default:"GMV"},
      value:{type:Array,required:true}
    },
  // created(){
  //   //  从全局配置中获取
  //   this.partPercentList = this._CONST.SPLITPERCENTS.map(item => {
  //     return {val:item}
  //   })

  //   this.percentList = this._utils.cloneObj(this.partPercentList);//

  //   // this._bus.$on(this._CONST.E_SPLIT_CHANGE, this.splitChange);

  //   if(this.percentList.length == 0){
  //     throw new Error("拆分比例不能一项也没有")
  //   }
  //   this.percentList.forEach(item => {
  //     if("val" in item){}
  //     else{
  //       throw new Error("拆分比例必须是固定的格式[{val:40},.....]")
  //     }
  //   })
  //   this._bus.$emit(this._CONST.E_SPLIT_CHANGE, this.partPercentList.map(item=>{return item.val/100}));
  // },
  data(){
    return {
      partPercentList:this.value ? this.value.map(item=>{return {val:item}}) : [],
      visible:false,
      tipInfo:"",
    }
  },
  methods:{
    isEqual100(){
      return this.partPercentList.reduce((initVal,item)=>{return item.val + initVal},0) == 100
    },
    save(){
      if(this.isEqual100()){
        //  this._info("保存拆分结果")
        this.visible = false;
        this.tipInfo =""

        this.backup =  this._utils.cloneObj(this.partPercentList); // 用户保存之后，保留备份

        this.$emit("input", this.partPercentList.map(item=>{return item.val}));
      }
      else{
        this.tipInfo = "拆分比例之和必须等于100!"
      }
    },
    cancel(){
      this.visible = false;
      // setTimeout( ()=>{
      //   if(this.backup){
      //     this.partPercentList = this._utils.cloneObj(this.backup);
      //   }
      //   else{
      //     this.partPercentList = this._utils.cloneObj(this.percentList);
      //   }
      // }, 1000)
    },
    setNumber(newValue){
      let oldValue = this.partPercentList.length
      if(newValue >=0 && newValue <=8){
        if(oldValue < newValue){
          for(var i = 1; i <= newValue - oldValue; i++){
            this.partPercentList.push({val:0})
          }
        }
        else{
          for(var i = 1; i <= oldValue - newValue; i++){
            this.partPercentList.pop()
          }
        }
      }
      else{
        this.tipInfo = "最多8份"
      }
    },
  }
}
</script>
