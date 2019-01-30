<template lang="html">
  <div class="sideBarContent" style="position:relative;">
    <div
      title="当编辑表格或者查看预测页时，此处不可编辑！"
      v-show="isShowMask"
      style="cursor: not-allowed;display:flex;z-index:1000;position:absolute;top:0;left:0;right:0;bottom:0;background-color:rgba(255,255,255,.4)">
    </div>
    <sidebartool
      ref="sidebartool"
      @query="query"
      :pSelectedNodeNumber="selectedNodeNumber"
      :pCondition="condition"
    >
    </sidebartool>
    <div >
      <el-tree
        ref="tree"
        show-checkbox
        v-loading="isTreeLoading"
        node-key="key"
        :data="dTree"
        :check-strictly="false"
        :default-expand-all="true"
        :default-expanded-keys="defaultExpandedKeys"
        :default-checked-keys="checkedKeys"
        :filter-node-method="filterNode"

        @check="hCheckChange">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span :title="node.label">{{ node.label }}</span>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import sidebartool from "./sideBarTool";
import { common as api } from "@/api";
const _ = require("lodash");
export default {
  beforeDestroy() {
    this._bus.$off(this._CONST.E_SIDEBAR_SKU_CHANGE, this.showSKUChange);
    this._bus.$off("ENABLE_SIDEBAR", this.hEnableSideBar);

    this._bus.$off("E_FORECASTPAGE_SHOW_CHANGE", this.hForcasetPageChange);
    this._bus.$off("E_TABLEEDIT_STATUS_CHANGE", this.hTableEditChange);
  },
  created() {
    this._bus.$on(this._CONST.E_SIDEBAR_SKU_CHANGE, this.showSKUChange);

    this._bus.$on("ENABLE_SIDEBAR", this.hEnableSideBar);
    this._bus.$on("E_FORECASTPAGE_SHOW_CHANGE", this.hForcasetPageChange); // 如果进入表格编辑状态，则把侧边栏覆盖掉，让它不可用
    this._bus.$on("E_TABLEEDIT_STATUS_CHANGE", this.hTableEditChange); // 如果进入了预测选项卡，则把侧边栏覆盖掉，让它不可用

    // console.info("-----------------------sideBar创建---------------------")
    this.data = this.user.treeData;
    this.isInit = false;

    this.initDataDimension();
  },

  data() {
    return {
      expanded: true,
      expandFlag: false,
      expand: false,
      loadSkuChosedFlag: false,

      isTreeLoading: false, // 默认是false,如果是true，则会显示加载状态

      // condition被传入到sideBarTool中被直接修改
      condition: {
        categroyLevel: "cate3",
        dataDimension: [
          { value: "cate", label: "三级品类", checked: false },
          { value: "brand", label: "品牌", checked: true },
          { value: "saler", label: "采销", checked: false }
        ],
        sortOrder: "order_m1",
        searchKeyword: ""
      },
      data: [],
      level: [], // 用于生成树的层级的数组
      defaultExpandedKeys: [],
      checkedKeys: [],
      selectedNodeList: [],
      isInit: true, // 是否是第一次生成树，如果是，则需要要默认选中节点，并发布 sideBarToolChange事件

      selectedNodeNumber: 0,

      isTableEdit: false,
      isForcasetPage: false
    };
  },
  components: { sidebartool },
  props: { pageType: { type: String, required: true } },
  computed: {
    ...mapGetters(["erp"]),
    ...mapGetters({ user: "getUser" }),
    ...mapGetters("cond", ["getTreeData"]),
    isShowMask() {
      // 没有编辑表格，也没有查看预测页
      return this.isTableEdit || this.isForcasetPage;
    },

    sideBarClass() {
      if ((this.skuTooLong = true)) {
        return { limitHeight: true, autoHeight: false };
      }
      return { limitHeight: false, autoHeight: true };
    },

    dTree() {
      // 生成左侧树结构用会到data和condition数据。
      let data = _.cloneDeep(this.data);

      // 给data添加额外的信息
      this.level = [];
      this.condition.dataDimension.forEach(item => {
        if (item.checked) {
          if (item.value === "cate") {
            this.level.push(this.condition.categroyLevel);
          } else {
            this.level.push(item.value);
          }
        }
      });

      data.forEach(item => {
        item.idList = this.level.map(it => item[it + "Id"]).join("-");
        item.labelList = this.level.map(it => item[it + "Name"]).join("-");
      });

      // if(this.condition.dataDimension.split("_")[0] ==="cate"){
      //   level.push(this.condition.categroyLevel);
      //   level.push("brand");
      // } else {
      //   level.push("brand")
      //   level.push(this.condition.categroyLevel)
      // }
      console.info("准备生成树，层级是:", this.level, "数据是:", data);
      let rs = this.constructTree(this.level, 0, data);
      // console.info("生成树结束",rs.length,level,data,rs);
      // 如果是三级部门负责人，则在树的最外层加上三级部门负责人，作为根结点
      //let rs1 = [{label:this.user.name,id:this.erp,value:'root',children:rs,key:this.erp}]
      let erp = this.user.type == "SALER" ? this.user.salerId : this.user.erp;
      let rootLabel =
        this.user.type == "SALER"
          ? this.user.salerName == "-"
            ? this.user.salerId
            : this.user.salerName
          : this.user.name == "-"
          ? this.user.erp
          : this.user.name;
      let rs1 = [
        { label: rootLabel, id: erp, value: "root", children: rs, key: erp }
      ];

      // console.info("通过",data,"生成树结构是",rs1,"二级孩子的个数是",rs1[0].children.length)
      return rs1;
    }
  },
  methods: {
    showSKUChange(flag) {
      this.isShowSKU = flag;
    },
    hEnableSideBar() {
      // 在挑战目标和考核目标之间切换时：
      // 1. 会直接切到目标选项卡，
      // 2. 让sideBar可编辑
      // 3. 让toolbar上的编辑按钮处于关闭状态
      this.isShowMask = false;
      this.isForcaset = false;
    },
    initDataDimension() {
      if (this.user.type === "SALER") {
        this.condition.dataDimension = [
          { value: "cate", label: "三级品类", checked: false },
          { value: "brand", label: "品牌", checked: true }
        ];
      } else {
        this.condition.dataDimension = [
          { value: "cate", label: "三级品类", checked: false },
          { value: "brand", label: "品牌", checked: true },
          { value: "saler", label: "采销", checked: false }
        ];
      }
    },
    hTableEditChange(val) {
      this.isTableEdit = val;
    },
    hForcasetPageChange(val) {
      this.isForcasetPage = val;
    },
    filterNode(value, data) {
      value = value.toString().trim();
      // console.info(value,data)
      if (!value) return true;
      if (!data.label) return true;
      return data.label.indexOf(value) !== -1;
    },

    hCheckChange(currentNode, info) {
      this.selectedNodeNumber = this.validateSelectedNode(
        this.$refs.tree.getCheckedNodes()
      ).length;
    },
    _createNodeInfo(orderKey, index, item) {
      let parentLevel = this.user.type,
        str = {};
      // 给节点添加冗余信息:层次信息
      if (index < 0) {
        throw new Error("在创建节点上的冗余信息时，index值错误.....");
      }
      parentLevel = this.user.type == "DEPT_MANAGER" ? "dept3" : "saler";
      let parentId =
        this.user.type == "DEPT_MANAGER" ? this.user.erp : this.user.salerId;
      let parentName =
        this.user.type == "DEPT_MANAGER" ? this.user.erp : this.user.salerId;
      str = {
        childrenLevel: orderKey[index],
        parentName:
          index == 0 ? parentName : item[orderKey[index - 1] + "Name"],
        parentId:
          index == 0
            ? parentLevel === "dept3"
              ? this.user.dept3Id
              : parentId
            : item[orderKey[index - 1] + "Id"],
        parentLevel: index == 0 ? parentLevel : orderKey[index - 1]
      };
      if (orderKey.findIndex(key => key == "saler") != -1) {
        str.containSaler = item["salerId"];
      }

      return JSON.stringify(str);
    },
    constructTree(orderKey, index, jsonArray) {
      if (index > orderKey.length - 1) return null;
      let nodeMap = {};

      jsonArray.forEach(item => {
        let levelInfo = this._createNodeInfo(orderKey, index, item);
        let id = item[orderKey[index] + "Id"];
        if (nodeMap[id]) {
          nodeMap[id]["children"].push(item);
        } else {
          let parentId = undefined;
          if (index > 0) {
            parentId = item[orderKey[index - 1] + "Id"];
          }
          parentId == undefined ? id : parentId + "-" + id;
          let levelInfoJson = JSON.parse(levelInfo);
          if (levelInfoJson.containSaler != undefined) {
            parentId =
              parentId == undefined
                ? levelInfoJson.containSaler + "-" + id
                : levelInfoJson.containSaler + "-" + parentId;
          }
          let temp = {
            key: parentId == undefined ? id : parentId + "-" + id,
            levelInfo: levelInfo,
            level: orderKey[index],
            label: item[orderKey[index] + "Name"],
            labelList: item.labelList,
            idList: item.idList, // 最多三个级别
            value: id,
            children: [item],
            gmv: item.gmv,
            salerId: this.condition.isSaler == true ? item.salerId : undefined
          };
          nodeMap[id] = temp;
        }
      });
      let result = [];
      for (var keyName in nodeMap) {
        let gmv = 0;
        nodeMap[keyName]["children"].forEach(item => {
          gmv += item.gmv;
        });
        nodeMap[keyName]["children"] = this.constructTree(
          orderKey,
          index + 1,
          nodeMap[keyName]["children"]
        );
        nodeMap[keyName]["gmv"] = gmv;
        //nodeMap[keyName]["label"] = nodeMap[keyName]["label"]+"-"+gmv;
        nodeMap[keyName]["label"] = nodeMap[keyName]["label"];
        nodeMap[keyName]["level"] = orderKey[index];
        result.push(nodeMap[keyName]);
      }
      if (this.condition.sortOrder === "order_m1") {
        //console.info("按m-1排序",result)
        result.sort(function(a, b) {
          return b.gmv - a.gmv;
        });
      } else {
        result.sort(function(a, b) {
          return b.value - a.value;
        });
      }
      return result;
    },
    validateSelectedNode(selectedNode) {
      let arr = this.condition.dataDimension.filter(item => item.checked);
      if (arr.length === 0) {
        this._error("数据维度不能全为空!");
        return [];
      }
      // 过滤出最低的维度
      let minimumLevelName = arr[arr.length - 1].value;
      if (minimumLevelName === "cate") {
        minimumLevelName = this.condition.categroyLevel;
      }
      let nodes = selectedNode.filter(item => {
        return item.level === minimumLevelName;
      });
      console.info(selectedNode, nodes, minimumLevelName);

      return nodes;
    },
    query(selectedNode) {
      selectedNode = selectedNode || this.$refs.tree.getCheckedNodes();

      let nodes = this.validateSelectedNode(selectedNode);

      if (nodes.length <= 0) {
        console.dir(selectedNode, nodes);
        this._error("至少选中一个有效节点！");
        return;
      }
      let cond = {
        dataDimensionList: this.level,
        salerId: this.user.salerId,
        idList: nodes.map(item => item.idList),
        nameList: nodes.map(item => item.labelList)
        // childrenNameList:nodes.filter(item=>item.label!='全部').map(item=>item.label)
      };

      this.$emit("sideBarQuery", cond);
    }
  },
  watch: {
    "condition.searchKeyword": {
      // 关键字过滤
      handler(val) {
        this.$refs.tree.filter(val);
      }
    },
    "user.type": function(newVal) {
      this.initDataDimension();
    },
    "user.treeData": {
      handler() {
        this.initDataDimension();
        this.isInit = false;
        this.data = this.user.treeData;
      },
      deep: false
    },
    dTree(newData,oldData) {
      if(newData === oldData){
        return;
      }
      console.info("dtree 变化了....", newData); // 树变了，再次选中当前的节
      //默认展开keys
      let parentKeys = [];
      parentKeys.push(newData[0].id);
      this.defaultExpandedKeys = parentKeys;

      if (
        newData[0].children &&
        newData[0].children.length
      ) {

        if (newData[0].children.length < this._CONST.MAX_SIDEBAR_NODE_NUMBER) {
          console.info(`${newData[0].children.length} < ${this._CONST.MAX_SIDEBAR_NODE_NUMBER}`)
          this.selectedNodeList = newData[0].children;
          // console.info("...发出左侧点已经选中的信息...");
          if(this.isInit == false){

            this.query(this.selectedNodeList);
            this.isInit = true;
          }
        }
        else{
          console.info(`${newData[0].children.length} > ${this._CONST.MAX_SIDEBAR_NODE_NUMBER}`)
          this.selectedNodeList= []
          console.info(newData[0].children.length)
        }
      }
      setTimeout(() => {
        if (this.$refs.tree) {
          console.info("this.selectedNodeList",this.selectedNodeList)
          this.$refs.tree.setCheckedNodes(this.selectedNodeList);

          this.selectedNodeNumber = this.validateSelectedNode(
            this.$refs.tree.getCheckedNodes()
          ).length;

          // this.selectedNodeNumber = this.selectedNodeList.length;
        }
      });
    }
  }
};
</script>

<style scoped>
.limitHeight {
  height: 800px;
  overflow: auto;
}
.autoHeight {
  height: 100%;
}
</style>
