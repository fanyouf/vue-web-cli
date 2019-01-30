<template>
  <div v-on:click="circleClick">
    <Row style="padding-left: 20px;padding-right: 20px;">
      <Row style="padding-top:20px;padding-bottom: 10px;text-align: center">
        <i-circle :trail-width="4" :stroke-width="5"
                  :size="size" :percent="percent" stroke-linecap="square" :stroke-color="color">
          <div class="demo-Circle-custom">
            <h1>{{ schedule }}</h1>
            <p>{{ detail }}</p>
          </div>
        </i-circle>
      </Row>
      <Row style="text-align: center">
        <div style="font-family: ArialMT;font-size: 16px;color:#333333;">{{ title }}</div>
      </Row>
    </Row>
  </div>
</template>

<script>
  import "@/assets/less/circle/circle.less"
  export default{
    name:'DetailCircle',
    data(){
      return {}
    },
    props:{
      size:{
        type:Number,
        required:false,
        default:function () {
          return 150;
        }
      },
      percent:{
        type:Number,
        required:false,
        default:function () {
          return 0;
        }
      },
      schedule:{
        type:Number,
        required:true
      },
      title:{
        type:String,
        required:false,
        default:function () {
          return '';
        }
      },
      detail:{
        type:String,
        required:false,
        default:function () {
          return '';
        }
      },
      color:{
        type:String,
        required:false,
        default:function () {
          return '#43a3fb';
        }
      }
    },
    methods:{
      circleClick(){
        this.$emit('detailClick',{sku:'12211'});
      }
    },
    filters:{

    }
  }
</script>
