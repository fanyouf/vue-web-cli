<template lang="html">
  <div class="">
    <span style="font-weight: bold;font-size:15px;margin-left:5px">分析看板</span>
    <br/> <br/>
    <span style="margin-left:35px">数据筛选</span>
    <Select v-model="val"  size="small"   style="width:550px;overflow:hidden">
        <Option v-for="item in list" :value="item.value" :key="item.value">{{ item.label }}</Option>
    </Select>
    <br/> <br/>
  <!--  <label for="">&nbsp;{{info}}</label>-->
  </div>
</template>
<script>
import {mapGetters,mapMutations} from 'vuex'
export default {
  created(){
    // this.val = this._utils.cloneObj(this.getAnalyzeBoard.childrenIdList)
  },
  computed:{
    ...mapGetters('cond',['getSelectedNode','getAnalyzeBoard']),
    list(){
      let ids = this.getSelectedNode.childrenIdList
      let data= this.getSelectedNode.childrenNameList.map((item,index) => {
        let obj = {}
        obj.value =  ids[index]
        obj.label = item
        return obj
      })
    // if(this.val==""){
        this.val=data.length>0?data[0].value:"";
    //  }
      return data;
    }
  },
  data(){
    return {
      val: "",
      info:"已选"
    }
  },
  methods:{
    ...mapMutations('cond',['setAnalyzeBoard']),
    selectAll(){
        this.val = this._utils.cloneObj(this.getSelectedNode.childrenIdList)
    },
    getValue(){
      return this.val
    },
    getAllValue(){
      return  this.list.map(function(item) {return item.value});
      },
    getSelectList(){
         let value=[...this.val];
         var arrayFilter = this.list.filter(function(item) {
         if(value.indexOf(item.value)>-1){
           return item
         }
         });
         return arrayFilter
       },
    getAllSelectList(){
           let value=[...this.val];
           var arrayFilter = this.list.filter(function(item) {
             return item
           });
           return arrayFilter
         },
    changeVal(){
      console.log("changeVal",this.val);
      this.$emit("queryPic");
    }

  },

  props:{
    value:{type:Array,}
  },
  watch:{
    val(){
      this.changeVal();
      if(this.val.length == this.list.length){
        this.info = "全选"+this.val.length+"项"
      }
      else {
        this.info = "已选"+this.val.length+"项"
      }
      this.$emit("input",this.val);
    }
  }
}
</script>
