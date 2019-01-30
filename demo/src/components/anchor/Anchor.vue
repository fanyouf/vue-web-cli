<template>
  <!--锚点快速定位组件-->
  <div class="anchor">
    <ButtonGroup vertical v-if="anchorList.length > 0">
      <div v-for="anchor in anchorList" :key="anchor.id">
        <Button type="ghost" style="background: #595D68;color: #fff;" :title="anchor.desc" @click="scrollTo(anchor.id)">{{ anchor.name }}</Button>
      </div>
    </ButtonGroup>
  </div>
</template>

<script>
  export default{
    name:'',
    props:{
      anchorList:{
        //需要锚点定位数组，对象属性包含id、名称和描述
        type:Array,
        required:true
      }
    },
    data(){
      return {}
    },
    components:{

    },
    computed:{

    },
    methods:{
      scrollTo(id){
        console.log('锚点跳转id',id);
        if(document.getElementById(id) == undefined) return;
        document.getElementById(id).scrollIntoView();
      }
    },
    mounted(){

    },
    filters:{

    }
  }
</script>

<style scoped>
  /*绝对定位，上下居中，距离右侧20px*/
  .anchor{
    position: fixed;
    bottom:50%;
    right: 20px;
  }
</style>
