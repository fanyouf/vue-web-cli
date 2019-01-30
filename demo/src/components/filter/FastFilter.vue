<template>
  <!--快速筛选组件-->
  <div class="inline-block">
    <Poptip class="align-center" title="快速选择" content="content" v-model="visible"
            placement="bottom-start" :width="filterWidth"
            v-on:on-popper-hide="popperHide">
      <div>
        <!--@click="showLayoutSetting"-->
        <svg v-if="isInput == undefined" class="icon" aria-hidden="true" title="筛选" @click="showFilter">
          <use v-show="model!='filter'" xlink:href="#icon-chaxun-moren"></use>
          <use v-show="model=='filter'" xlink:href="#icon-chaxun-moren"></use>
        </svg>

        <Input v-else v-model="showName" size="small" readonly icon="chevron-down" style="width:200px;"/>
      </div>
      <div slot="content" class="align-center">
        <div class="align-left inline-block filter-fast" v-if="showRadio == true">
          <div>
            <RadioGroup v-model="fast" vertical v-on:on-change="fastFilterChange">
              <Radio label="lt20">前20%</Radio>
              <Radio label="lt40">20%~40%</Radio>
              <Radio label="lt60">40%~60%</Radio>
              <Radio label="lt80">60%~80%</Radio>
              <Radio label="lt100">80%~100%</Radio>
            </RadioGroup>
          </div>
        </div>
        <div :class="computedClass">
          <div class="inline-block filter-search">
            <div class="search-padding">
              <Input v-model="searchText" size="small" placeholder="搜索">
              <Button slot="append" icon="ios-search" size="small"></Button>
              </Input>
            </div>
            <div class="align-left pr5 filter-scroll">
              <!--@on-change="checkedListChange"-->
              <CheckboxGroup v-model="checkedList">
                <div v-for="check in filterItemList" :key="check + Math.random()" class="text-hidden" style="width: 170px;">
                  <Checkbox :label="check.label"></Checkbox>
                </div>
              </CheckboxGroup>
            </div>
          </div>

          <div class="align-center h20">
            <Button size="small" type="primary" v-on:click="checkAll">全选</Button>
            <Button size="small" type="warning" v-on:click="clearAll">清空</Button>
            <Button size="small" type="error" v-on:click="cancelChecked">取消</Button>
            <Button size="small" type="success" v-on:click="confirmChecked">确定</Button>
          </div>
        </div>
      </div>
    </Poptip>
  </div>
</template>

<script>
import "@/assets/less/filter/filter.less";
export default {
  props: {
    originList: {
      //展示所有checkbox { label:'采销1',value:35 }
      type: Array,
      required: false,
      default: function() {
        return [];
      }
    },
    showRadio: {
      type: Boolean,
      required: false,
      default: function() {
        return true;
      }
    },
    syncMethod: {
      type: Function,
      required: false,
      default: function() {
        return undefined;
      }
    },
    isInput: {
      type: Boolean,
      required: false,
      default: function() {
        return undefined;
      }
    }
  },
  data() {
    return {
      visible: false,
      model: "",
      fast: "",
      searchText: "", //搜索文字
      checkedList: [] //所有勾选的item
    };
  },
  methods: {
    showFilter() {
      this.model = "filter";
      this.visible = !this.visible;
    },
    popperHide() {
      this.model = "";
      this.searchText = "";
      //        this.fast = '';
      this.visible = false;
    },
    checkedListChange(data) {
      //勾选框数据变化
      //        console.log("勾选框数据变化",data)
    },
    checkAll() {
      this.fast = "";
      this.checkedList = this.originList.map(item => item.label);
    },
    clearAll() {
      this.checkedList = [];
      this.fast = "";
    },
    fastFilterChange(data) {
      console.log("快速筛选变化", data, this.fast);
      if (this.originList == undefined || this.originList.length <= 0) return;
      let length = this.originList.length;
      let start,
        end = 0;
      if (data == "lt20") {
        start = 0;
        end = length * 0.2;
      } else if (data == "lt40") {
        start = length * 0.2;
        end = length * 0.4;
      } else if (data == "lt60") {
        start = length * 0.4;
        end = length * 0.6;
      } else if (data == "lt80") {
        start = length * 0.6;
        end = length * 0.8;
      } else if (data == "lt100") {
        start = length * 0.8;
        end = length;
      }
      let filters = this.originList.filter((item, index) => {
        return index >= start && index < end;
      });
      if (filters != undefined && filters.length > 0) {
        this.checkedList = filters.map(item => item.label);
      }
    },
    confirmChecked() {
      //确定
      this.visible = false;

      if (this.syncMethod != undefined) {
        this.syncMethod.call(this, this.checkedList);
      }
    },
    cancelChecked() {
      //取消
      this.visible = false;
      this.checkedList = "";
    }
  },
  computed: {
    filterItemList() {
      let filterItemList = [];
      if (this.searchText != undefined && this.originList.length > 0) {
        filterItemList = this.originList.filter(item => {
          if (item.label == null || item.label == "null") {
            return false;
          }
          return (
            item.label.indexOf(this.searchText) != -1 ||
            item.label.indexOf(this.searchText) != -1
          );
        });
      }
      return filterItemList;
    },
    filterWidth() {
      if (this.showRadio == false) {
        return 300;
      }
      return 400;
    },
    computedClass() {
      if (this.showRadio == true) {
        return "inline-block filter-right";
      }
      return "inline-block";
    },
    showName() {
      return this.checkedList.toString();
    }
  },
  mounted() {},
  watch: {
    originList: {
      handler(val) {
        this.checkedList = this.originList.map(origin => origin.label);
      }
    }
  }
};
</script>
