<template>
    <div class="skuplanmodify">
        <div class="borderBottom" style="padding-bottom:20px;">{{pTitle}}</div>
        <div class="borderBottom">
            <p class="flexa">
              <label for="gmv" style="width:80px;">GMV</label>
                <Input
                    v-if="isDetail"
                    disabled
                    size="small" 
                    style="width:200px;"
                    v-model="val.gmv"> 
                </Input>

                <Poptip v-else trigger="focus">
                  <Input
                      size="small" 
                      :disabled="pIsReadOnly"
                      style="width:200px;"
                      v-model="val.gmv"> 
                  </Input>

                  <div slot="content" style="font-size:30px;">{{ formatNumber }}</div>
                </Poptip> 
            </p>
            <p class="flexa" v-show="isDetail">
                <label for="volume" style="width:80px;">销量</label>
                <Input  
                    size="small" 
                    :disabled="pIsReadOnly"
                    v-model="val.volume" 
                    style="width:200px;"
                    @on-change="hChangeVolume">
                </Input>{{volumeTip}}
            </p>
            <p class="flexa" v-show="isDetail">
                <label for="price" style="width:80px;">价格</label>
                <Input  
                :disabled="pIsReadOnly"
                    size="small" 
                    v-model="val.price"
                    style="width:200px;"
                    @on-change="hChangePrice">
                </Input>
            </p>
        </div>
        <div class="borderBottom" v-show="isDetail">
            <p class="flexa"><label for=""  style="width:80px;">页面价</label> 
            <Input
                size="small" 
                :disabled="pIsReadOnly"
                v-model="val.pagePrice" 
                style="width:200px;"
                @on-change="hChangePagePrice">
            </Input></p>
        </div>
        <div v-show="isDetail">
            <p><label>活动列表[{{val.promotionList.length}}]</label></p>
            <ul>
                <li v-for="(item,index) in val.promotionList" :key="index" class="list-item flexa">
                    <label style="width:80px;flex:0 0 auto;">活动{{index+1}}</label>
                    <Input size="small" @click.stop v-model="item.label" :disabled="pIsReadOnly"></Input> 
                    <span v-if="false ===pIsReadOnly" style="cursor:pointer;width:80px;margin-left:10px;" @click.stop="hDeleteActive(index)"><Icon type="ios-minus-outline"></Icon>删除</span>
                </li>
            </ul>
            
            <p style="text-align:right;">
                <span v-if="false ===pIsReadOnly" style="cursor:pointer" @click.stop="hAddActive" title=" 新增活动">
                    <Button type="info" size="small"><Icon type="ios-add-circle-outline" />新增</Button>
                </span>
            </p>
        </div>

        <div class="btns" v-show="false === pIsReadOnly">
            <Button  @click.stop="hCancel">取消</Button> <Button @click.stop="hSave" type="primary" >确认</Button>
        </div>
    </div>
</template>
<style scoped>
.borderBottom {
  border-bottom: 1px solid #ccc;
}
.skuplanmodify {
  background-color: #fff;
  padding: 10px;
}
.skuplanmodify p {
  margin: 5px 0;
  line-height: 1.5;
}
.skuplanmodify li {
  margin: 5px 0;
}
.btns {
  display: flex;
  justify-content: space-between;
  margin: 20px 70px 0px;
}
</style>

<script>
const _ = require("lodash");
import filter from "@/utils/filter";
export default {
  props: {
    pTitle: { type: String, default: "修改" },
    value: { type: Object, required: true },
    modifyMode: { required: true },
    pIsReadOnly: { require: true }
  },
  data() {
    return {
      val: _.cloneDeep(this.value)
    };
  },
  computed: {
    volumeTip() {
      if (isNaN(this.val.volume)) {
        return "必须是数值";
      }
      return "";
    },
    formatNumber() {
      let gmv = this.val.gmv;
      if (isNaN(gmv)) {
        return "必须是数值";
      }

      return filter.formatCurrency(gmv);
    },

    isDetail() {
      return this.modifyMode === this._CONST.SKUPLAN_MODIFY_MODE.detail;
    }
  },
  methods: {
    hCancel() {
      this.$emit("cancel");
    },

    hSave() {
      if (isNaN(this.val.gmv)) {
        this._error("gmv必须是数值");
        return;
      }
      if (isNaN(this.val.price)) {
        this._error("价格必须是数值");
        return;
      }
      if (isNaN(this.val.volume)) {
        this._error("销量必须是数值");
        return;
      }

      if (isNaN(this.val.pagePrice)) {
        this._error("页面价必须是数值");
        return;
      }

      this.$emit("input", _.cloneDeep(this.val));
      this.$emit("savemodify", _.cloneDeep(this.val));
    },
    hChangeGMV(e) {
      let val = e.target.value;
      this.val.volume = val / this.val.price;
    },
    hChangeVolume(e) {
      let val = e.target.value;
      this.val.gmv = val * this.val.price;
    },
    hChangePrice(e) {
      let val = e.target.value;
      this.val.gmv = val * this.val.volume;
    },
    hChangePagePrice() {},
    hDeleteActive(index) {
      this.val.promotionList.splice(index, 1);
    },
    hAddActive() {
      this.val.promotionList.push({ label: "" });
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.val = {
          gmv: newVal.gmv,
          volume: newVal.volume,
          price: newVal.price,
          pagePrice: newVal.pagePrice,
          promotionList: _.cloneDeep(newVal.promotionList)
        };
      },
      immediate: true
    }
  }
};
</script>
