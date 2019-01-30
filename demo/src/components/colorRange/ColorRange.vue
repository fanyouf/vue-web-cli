<template>
  <div style="padding: 5px;">
    <Row>
      <Col span="22">
        <Col span="6">
          <!--v-on:click="updateColor1"-->
          <Row><div :style="{background: color1,height: '24px'}"></div></Row>
          <Row> {{ begin | valueFilter(isRatio) }} ~ {{ colorList[0].value | valueFilter(isRatio) }}</Row>
          <Modal v-model="update1" title="修改色阶1颜色">
            <ColorPicker v-model="color1" recommend />
          </Modal>
        </Col>
        <Col span="6">
          <Row><div :style="{background: color2,height: '24px'}"></div></Row>
          <Row> {{ colorList[0].value | valueFilter(isRatio) }} ~ {{ colorList[1].value | valueFilter(isRatio) }}</Row>
        </Col>
        <Col span="6">
          <Row><div :style="{background: color3,height: '24px'}"></div></Row>
          <Row> {{ colorList[1].value | valueFilter(isRatio) }} ~ {{ colorList[2].value | valueFilter(isRatio) }}</Row>
        </Col>
        <Col span="6">
          <Row><div :style="{background: color4,height: '24px'}"></div></Row>
          <Row v-if="colorList[3].value != undefined">{{ colorList[2].value | valueFilter(isRatio) }} ~ {{ colorList[3].value | valueFilter(isRatio) }}</Row>
          <Row v-else>{{ colorList[2].value | valueFilter(isRatio) }} ~ 无限大 </Row>
        </Col>
      </Col>
      <Col span="2">
        <Poptip placement="bottom" width="500" v-model="updateRange">
          <Icon type="ios-cog" size="30" style="cursor:pointer"></Icon>
          <!--<svg class="icon" aria-hidden="true" title="列表图">-->
            <!--<use xlink:href="#icon-shezhi"></use>-->
          <!--</svg>-->
          <div slot="content">
            <Row style="text-align: left;">设置四个色阶为:</Row>
            <Row>
              <Col span="6" style="text-align: left;">
                <!--<Row>{{ begin | valueFilter(isRatio) }} ~  <Input v-model="value1" size="small" style="width: 40px;"/></Row>-->
                <Row>{{ begin | valueFilter(isRatio) }} ~  <InputNumber style="width: 55px;" v-model="value1"/></Row>
                <!--<InputNumber style="width: 40px;" v-model="value1"/>-->
              </Col>
              <Col span="6" style="text-align: left;">
                <Row>{{ value1 | valueFilter(isRatio) }} ~ <InputNumber v-model="value2" style="width: 55px;"/></Row>
              </Col>
              <Col span="6" style="text-align: left;">
                <Row>{{ value2 | valueFilter(isRatio) }} ~ <InputNumber v-model="value3" style="width: 55px;"/></Row>
              </Col>
              <Col span="6" style="text-align: left;line-height: 32px;">
                <Row v-if="colorList[3].value != undefined">
                  {{ value3 | valueFilter(isRatio) }} ~<InputNumber v-model="value4" style="width: 55px;"/>
                </Row>
                <Row v-else>{{ value3 | valueFilter(isRatio) }} ~ 无限大</Row>
              </Col>
            </Row>
            <Row style="text-align: right;" class="mt5">
              <Button type="default" size="small" @click="cancelUpdateRange">取消</Button>
              <Button type="primary" size="small" @click="saveValueRange">保存</Button>
            </Row>
          </div>
        </Poptip>
      </Col>
    </Row>


  </div>
</template>

<script>
import Vue from "vue";
export default {
  name: "",
  data() {
    return {
      color1: "white",
      color2: "white",
      color3: "white",
      color4: "white",
      updateRange: false,
      update1: false,
      value1: 0,
      value2: 0,
      value3: 0,
      value4: 0
    };
  },
  props: {
    colorList: {
      type: Array,
      required: true
    },
    isRatio: {
      type: Boolean,
      required: false,
      default: function() {
        return false;
      }
    },
    begin: {
      type: String,
      required: false,
      default: function() {
        return "0";
      }
    },
    end: {
      type: String,
      required: false
    }
  },
  computed: {},
  methods: {
    iconClick() {
      console.log("icon点击事件");
    },
    cancelUpdateRange() {
      this.updateRange = false;
    },
    updateColor1() {
      this.update1 = true;
    },
    saveValueRange() {
      Vue.set(this.colorList[0], "value", this.value1);
      Vue.set(this.colorList[1], "value", this.value2);
      Vue.set(this.colorList[2], "value", this.value3);
      if (this.colorList[3].value != undefined) {
        Vue.set(this.colorList[3], "value", this.value4);
      }
      console.log("this.colorList", this.colorList);
      this.updateRange = false;
    }
  },
  filters: {
    valueFilter(val, isRatio) {
      if (isNaN(val)) {
        return val;
      }
      if (isRatio == true) {
        return val + "%";
      }
      return val;
    }
  },
  mounted() {
    if (this.colorList != undefined && this.colorList.length == 4) {
      console.log("设置默认值", this.colorList);
      let color1 = this.colorList[0];
      this.value1 = color1.value;
      this.color1 = color1.color;

      let color2 = this.colorList[1];
      this.value2 = color2.value;
      this.color2 = color2.color;

      let color3 = this.colorList[2];
      this.value3 = color3.value;
      this.color3 = color3.color;

      let color4 = this.colorList[3];
      this.value4 = color4.value;
      this.color4 = color4.color;
    }
  },
  watch: {
    colorList: {
      handler(val) {
        if (this.colorList != undefined && this.colorList.length == 4) {
          console.log("设置默认值", this.colorList);
          let color1 = this.colorList[0];
          this.value1 = color1.value;
          this.color1 = color1.color;

          let color2 = this.colorList[1];
          this.value2 = color2.value;
          this.color2 = color2.color;

          let color3 = this.colorList[2];
          this.value3 = color3.value;
          this.color3 = color3.color;

          let color4 = this.colorList[3];
          this.value4 = color4.value;
          this.color4 = color4.color;
        }
      }
    }
  }
};
</script>
