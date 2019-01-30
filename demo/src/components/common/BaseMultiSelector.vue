<template>
  <div
    style="position:relative;display:inline-block;"
    id="baseMultiSelector"
    v-clickoutside="hClickOutSide"
  >
    <div @click="visiable=!visiable">
      <span ref="refTitle">{{title}}</span>
      <input size="small" ref="refInput" style="cursor:pointer" :value="info" :readonly="true">
    </div>
    <div class="context" ref="refContext" v-show="visiable" title="按住元素拖动可排序">
      <div>
        <div v-if="val.length > 0">
          <div v-if="val.length > 3" v-show="isShowBtns">
            <div>
              <Input
                clearable
                v-model="keyword"
                size="small"
                placeholder="请输入条件..."
                style="margin-bottom:5px;max-width: 190px"
              ></Input>
            </div>
            <div>
              <Button size="small" @click="hSelectAll">全选</Button>
              <Button size="small" @click="hSelectNone">全不选</Button>
              <Button size="small" @click="hSelectSwitch">反选</Button>
            </div>
          </div>

          <ul v-if="isSort">
            <li
              class="item item-hover"
              v-for="(item,index) in list"
              :key="index"
              :data-order="index"
              v-drag="handleDrag"
              title="按下拖动可排序"
            >
              {{index+1}}.
              <input
                type="checkbox"
                style="cursor:pointer"
                @click.stop="hClick"
                :value="item.value"
                v-model="item.checked"
              >
              {{item.label}}
            </li>
          </ul>
          <ul v-else>
            <li class="item" v-for="(item,index) in list" :key="index">
              <input type="checkbox" @click="hClick" :value="item.value" v-model="item.checked">
              {{item.label}}
            </li>
          </ul>
        </div>
        <div v-else>没有数据项</div>
      </div>
      <div style="margin-top:5px;" v-show="hasComfirmBtn">
        <Button size="small" @click="hCancel">取消</Button>
        <Button size="small" type="primary" @click="hSave" title="点击确定才会生效">确定</Button>
        <span v-show="errInfo.length">{{errInfo}}</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.context {
  padding: 1em;
  background-color: #fff;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border: 1px solid #ccc;
  position: absolute;
  z-index: 1000;
}
.item {
  padding: 0.2em;
}
.item-hover:hover {
  outline: 1px dotted #ccc;
  cursor: move;
}

.dragging {
  opacity: 0.8;
  color: #6894d1;
}
.drag-over {
  outline: 2px solid #2d8cf0;
}
</style>

<script>
const _ = require("lodash");

export default {
  props: {
    value: { type: Array, required: true }, //双向绑定，可以直接用来设置默认选中项
    title: { type: String, default: "数据维度" },
    isShowBtns: { type: Boolean, default: false },
    hasComfirmBtn: { type: Boolean, default: true },
    isSort: { type: Boolean, default: true },
    isSelectNone: { type: Boolean, default: true }
  },
  beforeDestroy() {
    let body = document.querySelector("body");
    if (body) {
      body.removeEventListener("click", this.bodyClick);
    }
  },
  mounted() {
    console.dir(this.$refs.refTitle.getClientRects());

    this.$refs.refContext.style.left =
      this.$refs.refTitle.offsetWidth + 4 + "px";
    this.$refs.refContext.style.width = this.$refs.refInput.offsetWidth + "px";

    // this.setInfo();
  },
  data() {
    return {
      visiable: false,
      keyword: "",
      val: _.cloneDeep(this.value), // 把父级v-model的值在本地备份
      errInfo: ""
    };
  },
  computed: {
    list() {
      let word = this.keyword.trim();
      if (word === "") return this.val;
      return this.val.filter(item => item.label.indexOf(word) != -1);
    },
    info() {
      let t = this.list.filter(item => item.checked);
      let str = "";
      if (t.length > 5) {
        if (this.list.length == t.length) {
          str = "全选" + this.list.length + "项";
        } else str = "已选" + t.length + "/" + this.list.length + "项";
      } else {
        str = t.map(item => item.label).join("-");
      }
      return str;
    }
  },
  methods: {
    // setInfo() {
    //   let val = this.val;
    //   let str = "",
    //     t = val.filter(item => item.checked).length;
    //   if (val.length > 5) {
    //     if (val.length == t) {
    //       str = "全选" + val.length + "项";
    //     } else str = "已选" + t + "/" + val.length + "项";
    //   } else {
    //     str = val
    //       .filter(item => item.checked)
    //       .map(item => item.label)
    //       .join("-");
    //   }
    //   this.info = str;
    // },
    hClickOutSide() {
      if (this.hasComfirmBtn === false) {
        this.visiable = false;
      }
      this.hCancel();
    },
    bodyClick(e) {
      // console.dir(e.target)
      let flag = false;
      let target = e.target;
      while (target.parentNode) {
        console.dir(target);
        if (target.parentNode.id === "baseMultiSelector") {
          flag = true;
          break;
        }
        if (target.parentNode.nodeName === "BODY") {
          flag = false;
          break;
        }
        target = target.parentNode;
      }
      this.visiable = flag;
    },
    hCancel() {
      this.visiable = false;
      this.val = _.cloneDeep(this.value);
      // this.setInfo(this.val);
    },
    hClick() {
      // 如果没有确认按钮，则每一次用户的选择都必须及时传递
      if (this.hasComfirmBtn === false) {
        setTimeout(() => {
          // this.setInfo(this.val);
          this.$emit("input", _.cloneDeep(this.val));
        });
      }
    },

    hSave() {
      if (
        this.isSelectNone === false &&
        this.val.every(item => item.checked === false)
      ) {
        this.errInfo = "至少选中一项";
        return;
      }
      this.errInfo = "";
      // this.setInfo(this.val);

      this.visiable = false;

      this.$emit("change", _.cloneDeep(this.val)); //对外的事件
      this.$emit("input", _.cloneDeep(this.val));
    },
    handleDrag: function(aindex, bindex) {
      var b = this.val[aindex];
      var a = this.val[bindex];

      this.$set(this.val, aindex, a);
      this.$set(this.val, bindex, b);
    },

    hSelectAll() {
      this.val = this.pDataSource.map(item => item.value);
      this.hClick();
      //this.keyword = ''
    },
    hSelectNone() {
      this.val = [];
      this.hClick();
    },
    hSelectSwitch() {
      this.val = this.pDataSource
        .filter(item => !this.val.includes(item.value))
        .map(item => item.value);
      this.hClick();
    }
  },
  watch: {
    value: {
      handler(val, old) {
        this.val = _.cloneDeep(this.value);
      },
      deep: true
    }
  }
};
</script>
