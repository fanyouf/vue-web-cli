<template>
  <div class="card-content-detailCard">
    <!-- :style="{width: width+'px',height: height+'px',background:'#F5F5F5'}" -->
    <!--:style="{width: width+'px',height: height+'px',background:'#F5F5F5'}"-->
    <div>
      <div style="border-bottom: 1px solid #FFFFFF">
        <!--style="display: inline-block"-->
        <div>
          <div class="subject-title" style="display: inline-block;width: 45%;">{{ subject }}</div>
          <div style="display: inline-block;width: 50%;text-align: right;">
            <Poptip trigger="hover" title="说明" :content="desc" placement="top-end">
              <Icon v-if="icon != undefined" :type="icon" size="20"></Icon>
            </Poptip>
          </div>
        </div>
        <div class="subject-value text-hid">
          <!--{{ value | formatPercent(isRatio,subject) }}-->
          <!--<Tooltip :content="value" placement="top">-->
            <!--<div class="subject-value text-hid">{{ value | formatPercent(isRatio,subject) }}</div>-->
            <!--&lt;!&ndash;{{ value | formatPercent(isRatio,subject) }}&ndash;&gt;-->
          <!--</Tooltip>-->
          <div class="subject-value text-hid">{{ value | formatPercent(isRatio,subject) }}</div>
        </div>
      </div>
      <!--v-if="yoy !== undefined"-->
      <div style="padding-bottom:21px;padding-top:21px;">
        <div>
          <Col span="12" style="text-align: left">同比去年</Col>
          <Col span="12" style="text-align: right"><YOYShow :value="yoy"></YOYShow></Col>
        </div>
        <div>
          <Col span="12" style="text-align: left">环比上月</Col>
          <Col span="12" style="text-align: right"><YOYShow :value="mom"></YOYShow></Col>
        </div>
        <div v-if="reached !== undefined">
          <Col span="12" style="text-align: left">目标达成</Col>
          <Col span="12" style="text-align: right">{{ reached | formatPercent(isReached) }}</Col>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import YOYShow from '@/components/yoy/YOYShow'
  import { outputMoney } from '@/filter/math.js'
  import "@/assets/less/saledetail/detailCard.less"
//  import '@/assets/css/card/Card.css'
  export default{
    name:'DetailCard',
    components:{
      YOYShow
    },
    props:{
      subject:{
        type:String,
        required:true
      },
      value:{
        required:true
      },
      isRatio:{
        type:Boolean,
        required:false,
        default:function () {
          return false;
        }
      },
      yoy:{
        required:false,
        default:function () {
          return undefined;
        }
      },
      mom:{
        required:false,
        default:function () {
          return undefined;
        }
      },
      reached:{
        required:false,
        default:function () {
          return undefined;
        }
      },
      width:{
        type:Number,
        required:false,
        default:function () {
          return 200;
        },
        validator:function (value) {
          return value > 0 && value < 250;
        }
      },
      height:{
        type:Number,
        required:false,
        default:function () {
          return 100;
        }
      },
      icon:{
        type:String,
        required:false,
        default:function () {
          return "help-circled"
        }
      },
      desc:{
        type:String,
        required:false,
        default:function () {
          return undefined
        }
      },
    },
    data(){
      return {
        isReached:true
      }
    },
    computed:{

    },
    filters:{
      formatPercent(val,isRatio,subject){
        if(val == undefined || isNaN(val)){
          return "-";
        }
        if(subject == "GMV(元)" || subject == "目标GMV(元)" || subject == "销售毛利"){
          return outputMoney(val);
        }
        if(isRatio == true){
          return parseFloat(val * 100).toFixed(1) + '%';
        }
        if(subject == '存货周转'){
          return val.toFixed(1);
        }
        return val.toFixed(2);
      }
    }
  }
</script>
