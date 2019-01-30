<template>
  <div class="inline-block">
    <Poptip placement="bottom-start" v-model="showCondi">
      <div class="inline-block" @click="inputClick">
        <Input v-model="showName" size="small" readonly  :style="inputStyle"/>
      </div>
      <div slot="content" style="padding-left:10px;padding-top:10px;">
        <div class="sideBar" style="box-shadow: 0 0 0px rgba(0,0,0,.3);padding-top: 0px;width: auto;">
          <sidebar ref="out" :pageType="pageType" @sideBarQuery="sideBarQuery"
                  :initByCookie="initByCookie" :reference="reference" @nameChange="syncNodes"></sidebar>
        </div>
      </div>
    </Poptip>

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import sidebar from "@/components/sideBar/sideBarCopy.vue";
export default {
  props: {
    syncMethod: {
      type: Function,
      required: false,
      default: function() {
        return undefined;
      }
    },
    treeCondition: {
      type: Object,
      required: false,
      default: function() {
        return {};
      }
    },
    initByCookie: {
      type: Boolean,
      required: false,
      default: function() {
        return true;
      }
    },
    reference: {
      type: String,
      required: false,
      default: function() {
        return "tree";
      }
    }
  },
  components: {
    sidebar
  },
  data() {
    return {
      showCondi: false,
      selectedNodeNames: [],
      condition: null,
      executeOnce: false
    };
  },
  methods: {
    inputClick() {
      this.showCondi = true;
    },
    sideBarQuery(cond) {
      console.info("左侧节点的条件是", cond, this.reference);
      this.condition = cond;
      //        if(this.executeOnce == false){
      //          this.condition = cond;
      //        }
      //        if(this.syncMethod != undefined){
      //          this.syncMethod.call(this,cond);
      //        }
      this.showCondi = false;
    },
    syncNodes(nodes) {
      this.selectedNodeNames = nodes.map(item => item.label);
    },
    syncLayoutCondition(condition) {
      if (this.$refs.out != undefined) {
        this.$refs.out.setLayoutCondition(condition);
      }
    },
    getTreeCondition() {
      if (this.$refs.out != undefined) {
        setTimeout(() => {
          this.$refs.out.query(null);
        }, 1000);
      }
    },
    initExecuteOnce() {
      this.executeOnce = false;
    }
  },
  computed: {
    ...mapGetters({ user: "getUser" }),
    showName() {
      //input框展示名称
      return this.selectedNodeNames.toString();
    },
    treeWidth() {
      if (window.screen.width <= 1400) {
        return 350;
      } else if (window.screen.width >= 1600) {
        return 400;
      }
      return 275;
    },
    inputStyle() {
      let style = {};
      if (window.screen.width <= 1400) {
        style.width = "250px";
      } else if (window.screen.width >= 1600) {
        style.width = "400px";
      }
      return style;
    },
    pageType() {
      if (this.user.type == "DEPT_MANAGER") {
        return "target";
      }
      return "reached";
    }
  },
  mounted() {},
  watch: {
    condition: {
      handler(newVal, oldVal) {
        //          console.log("LayoutTree initQuery",newVal,oldVal)
        if (newVal != null && this.executeOnce == false) {
          //监听条件变化，第一次执行initQuery，因为第一次会触发组件的查询方法
          console.log("LayoutTree initQuery", newVal, oldVal);
          this.executeOnce = true;
          this.$emit("initQuery", this.condition);
        } else if (this.syncMethod != undefined) {
          //否则只同步树的条件
          this.syncMethod.call(this, newVal);
        }
        //引用的组件中，判断树条件是否来源于cookie，
        //1.条件从cookie中取，那么仅在同步cookie方法中查询
        //2.不从cookie中取，那么initQuery方法中查询
      },
      deep: true
    },
    "user.treeData": {
      handler() {
        console.log("树源数据变化,this.initExecuteOnce");
        this.initExecuteOnce();
      },
      deep: true
    }
  },
  created() {
    this._bus.$on(this._CONST.E_USERINFO_CHANGE, this.initExecuteOnce);
  },
  beforeDestroy() {
    this._bus.$off(this._CONST.E_USERINFO_CHANGE, this.initExecuteOnce);
  }
};
</script>
