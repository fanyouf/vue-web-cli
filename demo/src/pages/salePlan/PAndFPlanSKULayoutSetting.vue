<template>
  <Poptip trigger="click" content="content" placement="bottom-start">
    <div :title="selectedInfo" style="cursor:pointer">
        <span> 指标显示设置:</span> <Input style="width:180px;" size="small" :value="selectedInfo" readonly></Input>
    </div>
    <div slot="content">
      <div style="margin:3px 3px 3px 0px;border-bottom:1px solid #ccc"><Checkbox
        :indeterminate="indeterminate"
        :value="checkAll"
        @click.prevent.native="handleCheckAll"> {{currentTip}}</Checkbox>
      </div>
        <CheckboxGroup class="list" v-model="selectedlabelArr" @on-change="checkAllGroupChange">
          <Checkbox v-for="(item,index) in list" :label="item" :key="index">{{item}}</Checkbox>
      </CheckboxGroup>
    </div>
  </Poptip>
</template>
<style scoped>
.list > label {
  display: block;
}
</style>

<script>
const _ = require("lodash");

export default {
  props: {
    pLayoutSetting: { type: Array, required: true }
  },
  data() {
    return {
      indeterminate: false,
      checkAll: true,
      selectedlabelArr: []
    };
  },
  computed: {
    list() {
      console.info("list", this.pLayoutSetting.map(item => item.label));
      return this.pLayoutSetting.map(item => item.label);
    },
    selectedInfo() {
      return this.selectedlabelArr.length
        ? this.selectedlabelArr.join("-")
        : "没有选择任何项";
    },
    allLabelArr() {
      return this.value.map();
    },
    currentTip() {
      let tipStr = "";
      if (this.selectedlabelArr.length === 0) {
        tipStr = "全选";
      } else {
        if (this.selectedlabelArr.length === this.list.length) {
          tipStr = "全选";
        } else {
          tipStr =
            "已选: " +
            [this.selectedlabelArr.length, this.list.length].join("/");
        }
      }
      return tipStr;
    }
  },
  methods: {
    handleCheckAll() {
      if (this.indeterminate) {
        this.checkAll = false;
      } else {
        this.checkAll = !this.checkAll;
      }
      this.indeterminate = false;

      if (this.checkAll) {
        this.selectedlabelArr = this.list;
      } else {
        this.selectedlabelArr = [];
      }
      this.pLayoutSetting.forEach(item => {
        item.checked = this.checkAll;
      });
    },
    checkAllGroupChange(data) {
      if (data.length === this.pLayoutSetting.length) {
        this.indeterminate = false;
        this.checkAll = true;
      } else if (data.length > 0) {
        this.indeterminate = true;
        this.checkAll = false;
      } else {
        this.indeterminate = false;
        this.checkAll = false;
      }

      this.pLayoutSetting.forEach(item => {
        if (data.includes(item.label)) {
          item.checked = true;
        } else {
          item.checked = false;
        }
      });
      // this.$emit("change",_.cloneDeep(data))

      console.info(data, this.pLayoutSetting);
    }
  },
  watch: {
    pLayoutSetting(val, old) {
      if (JSON.stringify(val) !== JSON.stringify(old)) {
        setTimeout(() => {
          // console.info(this.pLayoutSetting)

          this.selectedlabelArr = this.pLayoutSetting
            .filter(item => item.checked)
            .map(item => item.label);
          // console.info(this.selectedlabelArr)
        });
      }
    }
  }
};
</script>

