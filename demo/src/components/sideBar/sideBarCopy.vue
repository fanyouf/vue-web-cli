<template lang="html">
  <div class="sideBarContent" >

    <sidebartool @query="query" :initCondition="condition" :pageType="pageType"></sidebartool>
    <div style="height:300px;overflow:auto">
      <el-tree
        :ref="reference"
        show-checkbox
        v-loading="isTreeloading"
        node-key="key"
        :data="dTree"
        :check-strictly="true"
        :default-expanded-keys="defaultExpandedKeys"
        :default-checked-keys="checkedKeys"
        :filter-node-method="filterNode"
        @check="hCheck"
        @node-click="hCheckChange"
        @check-change="hCurrentChange">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span v-show="isShowSKU && level.length &&  node.data.level == level[level.length-1] && node.data.label != '全部'">
            <Button
              type="primary"
              size="small"
              @click.prevent="() =>loadSKU(node,data)">
              +
            </Button>
          </span>
          <span :title="node.label">{{ node.label }}</span>
        </span>
      </el-tree>
    </div>

  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import sidebartool from "./sideBarToolCopy";
import { common as api } from "@/api";
const _ = require("lodash");
export default {
  beforeDestroy() {
    this._bus.$off(this._CONST.E_SIDEBAR_SKU_CHANGE, this.showSKUChange);
  },
  components: {
    sidebartool
  },
  computed: {
    ...mapGetters(["erp"]),
    ...mapGetters({ user: "getUser" }),
    ...mapGetters("cond", ["getTreeData"]),
    //用会到data和condition数据。
    // condition被传入到sideBarTool中被直接修改
    dTree() {
      // 生成左侧树结构
      let data = this._utils.cloneObj(this.data);
      if (data == undefined || data.length == 0) return [];

      let level = [];
      // 2. 显示层次
      // 采销经理显示与否是可以勾选的
      this.condition.isSaler && level.push("saler");

      if (this.condition.dataDimension.split("_")[0] === "cate") {
        level.push(this.condition.categroyLevel);
        level.push("brand");
      } else {
        level.push("brand");
        level.push(this.condition.categroyLevel);
      }

      //        console.info("*******************准备生成树",level,data);
      let rs = this.constructTree(level, 0, data);
      //        console.info("***************************生成树end",rs.length,level,data,rs);
      // 如果是三级部门负责人，则在树的最外层加上三级部门负责人，作为根结点
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
      this.level = level;
      //        console.info("通过",data,"生成树结构是.....",rs1,"二级孩子的个数是",rs1[0].children.length)
      return rs1;
    }
  },
  created() {
    this._bus.$on(this._CONST.E_SIDEBAR_SKU_CHANGE, this.showSKUChange);
    this.data = this.user.treeData;
    this.isInit = false;
  },
  data() {
    return {
      isShowSKU: false,
      isTreeloading: false, // 默认是false,如果是true，则会显示加载状态
      condition: {
        categroyLevel: "cate3",
        dataDimension: "cate_brand",
        sortOrder: "order_m1",
        searchKeyword: "",
        isSaler: false // 不要把 采销经理这个层级洗中
        // selectedNode:[],
      },
      data: [],
      level: [], // 用于生成数的层级数组
      defaultExpandedKeys: [],
      checkedKeys: [],
      selectedNodeList: [],
      isInit: true, // 是否是第一次生成树，如果是，则需要要默认选中节点，并发布 sideBarToolChange事件
      executeOnce: true
    };
  },
  methods: {
    filterNode(value, data) {
      value = value.toString().trim();
      //        console.info(value,data)
      if (!value) return true;
      if (!data.label) return true;
      return data.label.indexOf(value) !== -1;
    },
    showSKUChange(flag) {
      this.isShowSKU = flag;
    },
    loadSKU(node, data) {
      console.info("loading...........sku");
      console.info(node);
      console.info(data);
      console.info(this.dTree);
      // "levelInfo":levelInfo,
      // "level":orderKey[index],
      // "label": item[orderKey[index] + "Name"]+"-"+id,
      // "value": id,
      let levelInfo = JSON.stringify({
        childrenLevel: "sku",
        parentId: data.value,
        parentLevel: data.level,
        skuKey: node.key
      });

      let curId = data.value;
      let curlevel = data.level;
      let dept3Id = this.user.dept3Id;
      let roleType = this.user.type;
      let curInfo = JSON.parse(data.levelInfo);
      let parentId = curInfo.parentId;
      let parentLevel = curInfo.parentLevel;

      let condi = {
        dept3Id: dept3Id,
        roleType: roleType
      };
      if (data.salerId != undefined) {
        condi["salerId"] = data.salerId;
      }
      if (curlevel == "brand") {
        condi["brandId"] = curId;
        //          condi['cateId'] = parentId;
        //          condi['cateLevel'] = parentLevel;
        condi[parentLevel + "Id"] = parentId;
      } else {
        //          condi['cateId'] = curId;
        //          condi['cateLevel'] = curlevel;
        condi["brandId"] = parentId;
        condi[curlevel + "id"] = curId;
      }
      if (this.user.type == "SALER") {
        condi.currentErp = this.user.salerId;
        condi.salerId = this.user.salerId;
      }
      let skuList = [];
      // this.isTreeloading = true;
      this._api.common
        .getSku(condi, this, "isTreeloading")
        .then(
          this._do("请求sku_ok", d => {
            console.log("sku data", d);
            skuList = d;
          })
        )
        .then(() => {
          console.log("skuList", skuList);
          let obj = {};
          this.findNodeInTree(data, this.dTree, obj);
          console.info(obj);
          if (obj.ok) {
            let children = skuList.map(sku => {
              return {
                levelInfo: levelInfo,
                level: "sku",
                label: sku.skuId + " " + sku.skuName,
                value: sku.skuId,
                key: sku.skuId
              };
            });
            children.unshift({
              level: "sku",
              label: "全部",
              value: 8888 + levelInfo,
              key: 8888 + levelInfo,
              levelInfo: levelInfo
            });
            obj.rs.children = children;
            node.expanded = true;
          } else {
            throw new Error("没能找到树中的结点");
          }
          this.isTreeloading = false;
        });
    },
    isSelecedAll(node) {
      return node.label === "全部" && node.value.substring(0, 4) === "8888";
    },
    findNode(node, tree, obj) {
      var value = node.value;
      var levelInfo = node.levelInfo;
      if (obj.ok) return;

      for (var i = 0; i < tree.length; i++) {
        var item = tree[i];
        if (item.value == value && item.levelInfo == levelInfo) {
          obj.ok = true;
          obj.rs = tree;
          //            console.info("找到了目标，此时tree的长度是",tree.length)
          break;
        }
      }
      if (!obj.ok) {
        for (var i = 0; i < tree.length; i++) {
          var item = tree[i];
          if (obj.ok) break;
          else item.children && this.findNode(node, item.children, obj);
        }
      }
    },

    findNodeInTree(node, tree, obj) {
      var value = node.value;
      var levelInfo = node.levelInfo;
      if (obj.ok) return;

      for (var i = 0; i < tree.length; i++) {
        var item = tree[i];
        if (item.value == value && item.levelInfo == levelInfo) {
          obj.ok = true;
          obj.rs = item;
          break;
        }
      }
      if (!obj.ok) {
        for (var i = 0; i < tree.length; i++) {
          var item = tree[i];
          !obj.ok &&
            item.children &&
            this.findNodeInTree(node, item.children, obj);
        }
      }
    },

    findbrother(node) {
      // 在树当中找到当前结点的父节点，从而找到全部兄弟结点
      var obj = { ok: false, rs: null };
      this.findNode(node, this.dTree, obj);
      //        console.info("在树当中找到当前结点",node,"的父节点，从而找到全部兄弟结点",obj)
      if (!obj.rs || obj.rs.length == 0) {
        throw new Error(
          "在树当中找到当前结点的父节点，从而找到全部兄弟结点失败"
        );
        return [];
      }
      return obj.rs;
    },

    hCurrentChange(currentNode, isSelected) {
      //        console.info("11111111",currentNode, isSelected)
      if (this.isSelecedAll(currentNode)) {
        // 如查选中了全部这个节点
        var brotherNodes = this.findbrother({
          value: currentNode.value,
          levelInfo: currentNode.levelInfo
        });
        //          console.info('全部',currentNode,'--节点对应的兄弟节点是',brotherNodes);
        let levelInfo = JSON.parse(currentNode.levelInfo);

        if (isSelected) {
          // 需要去选中它的兄弟结点
          //  从this.checkedKeys中去掉当前的vale,
          //  把它的兄弟结点加入进去
          //this.selectedNodeList.length = 0;
          this.selectedNodeList = brotherNodes;
          if (levelInfo.childrenLevel == "sku" && brotherNodes.length > 300) {
            this.selectedNodeList = brotherNodes.slice(0, 301);
            //this._warning("最多只支持查询100个SKU")
            this.$Notice.warning({
              title: "提醒",
              desc: "最多只支持查询300个SKU"
            });
          }
          //console.info(this.selectedNodeList)
          this.$refs[this.reference].setCheckedNodes(this.selectedNodeList);
        } else {
          // 需要去取消选中的兄弟结点
          this.selectedNodeList = this.selectedNodeList.filter(
            el => !brotherNodes.includes(el)
          );
          if (this.executeOnce == true) {
            console.info(
              "this.selectedNodeList",
              this.selectedNodeList,
              brotherNodes
            );
            this.$refs[this.reference].setCheckedNodes(this.selectedNodeList);
          }
        }
      }
      let filters = this.$refs[this.reference]
        .getCheckedNodes()
        .filter(item => item.label != "全部");
      this._bus.$emit(
        this._CONST.E_SIDEBAR_SELECTEDNODENUMBER_CHANGE,
        filters.length
      );
      this.$emit("nameChange", filters);
    },
    hCheck(data, nodeInfo) {
      //console.info("当前选中的是",nodeInfo.checkedNodes);
      //console.info(checkedNodes,checkedKeys,halfCheckedNodes,halfCheckedKeys)
      //this.selectedNodeList = nodeInfo.checkedNodes
    },
    hCheckChange(node1) {},
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
        //          console.log("levelInfo",levelInfo,"orderKey",orderKey)
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
            //"label": item[orderKey[index] + "Name"]+"-"+id,
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
        //          nodeMap[keyName]["label"] = nodeMap[keyName]["label"]+"-"+gmv;
        nodeMap[keyName]["label"] = nodeMap[keyName]["label"];
        nodeMap[keyName]["level"] = orderKey[index];
        result.push(nodeMap[keyName]);
      }

      if (this.condition.sortOrder === "order_m1") {
        result.sort(function(a, b) {
          return b.gmv - a.gmv;
        });
      } else {
        result.sort(function(a, b) {
          return b.value - a.value;
        });
      }
      // 在兄弟节点中添加一个头部的结点，方便用户直接通过它去选中全部的兄弟节点
      let levelInfo = this._createNodeInfo(orderKey, index, jsonArray[0]);

      result.unshift({
        level: orderKey[index],
        label: "全部",
        levelInfo,
        value: 8888 + levelInfo,
        key: 8888 + levelInfo
      });
      //        console.info(orderKey, index,result);
      return result;
    },
    query(selectedNode) {
      // 获取节点信息，通知父组件：应该是某个具体的页面了。
      selectedNode =
        selectedNode || this.$refs[this.reference].getCheckedNodes();
      let levelInfo = selectedNode[0].levelInfo;
      let levelObj = JSON.parse(levelInfo);
      let salerId = selectedNode[selectedNode.length - 1].salerId;
      console.log("query levelInfo", levelInfo);
      let isSameLevel = selectedNode.every(item => {
        let itemInfo = JSON.parse(item.levelInfo);
        let noSaler =
          itemInfo.childrenLevel == levelObj.childrenLevel &&
          itemInfo.parentId == levelObj.parentId &&
          itemInfo.parentLevel == levelObj.parentLevel;
        if (levelObj.containSaler && levelObj.childrenLevel != "saler") {
          noSaler = noSaler && itemInfo.containSaler == levelObj.containSaler;
        }
        if (levelObj.skuKey && levelObj.childrenLevel == "sku") {
          noSaler = noSaler && levelObj.skuKey == itemInfo.skuKey;
        }
        return noSaler;
      });
      if (isSameLevel) {
        // 1. 是否所有的节点都在同一个层级下。
        let obj = JSON.parse(levelInfo);
        let curSalerId = this.user.type == "SALER" ? this.user.salerId : "";
        let cond = {
          salerId: !salerId ? curSalerId : salerId,
          childrenLevel: obj.childrenLevel,
          parentId: obj.parentId,
          parentLevel: obj.parentLevel,
          childrenIdList: selectedNode
            .filter(item => item.label != "全部")
            .map(item => item.value)
            .toString()
          //            childrenNameList:selectedNode.filter(item=>item.label!='全部').map(item=>item.label)
        };
        if (
          cond.childrenLevel == "sku" &&
          selectedNode
            .filter(item => item.label != "全部")
            .map(item => item.value).length > 300
        ) {
          this._error("暂不支持超过300条sku的查询");
          return;
        }
        console.info("sideBar收到，并转发sideBarQuery事件");
        let layout = {
          isShowSKU: this.isShowSKU,
          condition: this.condition,
          level: this.level,
          defaultExpandedKeys: this.defaultExpandedKeys,
          checkedKeys: this.$refs[this.reference].getCheckedKeys(),
          isInit: this.isInit,
          queryCondition: cond
        };
        this.$emit("sideBarQuery", layout); // 通知父级
      } else {
        this._error("是否所有的节点都在同一个层级下");
      }
    },
    getLayoutCondition(queryCondition) {
      let layout = {
        isShowSKU: this.isShowSKU,
        condition: this.condition,
        level: this.level,
        defaultExpandedKeys: this.defaultExpandedKeys,
        checkedKeys: this.$refs[this.reference].getCheckedKeys(),
        isInit: this.isInit,
        queryCondition: queryCondition
      };
      return layout;
    },
    setLayoutCondition(layoutCondition) {
      console.log("setLayoutCondition", layoutCondition);
      if (this.initByCookie == false) return;
      this.executeOnce = false;
      //        let condi = this.getLayoutCondition();
      //        if(condi.checkedKeys.length == layoutCondition.checkedKeys.length) return;
      this.isShowSKU = layoutCondition.isShowSKU;
      this.condition = layoutCondition.condition;
      let keys = this._utils.cloneObj(layoutCondition.checkedKeys);
      this.checkedKeys = layoutCondition.checkedKeys;
      this.defaultExpandedKeys = layoutCondition.defaultExpandedKeys;
      setTimeout(() => {
        console.log(11223333333, "setChecked", this.reference, keys);
        this.$refs[this.reference].setCheckedKeys(keys);

        let filters = this.$refs[this.reference]
          .getCheckedNodes()
          .filter(item => item.label != "全部");
        this.$emit("nameChange", filters);

        setTimeout(() => {
          this.executeOnce = true;
        }, 200);
      }, 2000);
    }
  },
  props: {
    pageType: {
      type: String,
      required: true
    },
    initByCookie: {
      type: Boolean,
      required: false,
      default: function() {
        return true;
      }
    },
    layoutCondition: {
      type: Object,
      required: false,
      default: function() {
        return undefined;
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
  watch: {
    "condition.searchKeyword": {
      handler(val) {
        this.$refs[this.reference].filter(val);
      }
    },
    "user.treeData": {
      handler() {
        this.isInit = false;
        this.data = this.user.treeData;
        //          this.executeOnce = false;
        //          setTimeout(() => {
        //            this.executeOnce = true;
        //          },2000);
      },
      deep: true
    },
    dTree(newData) {
      if (newData == undefined || newData.length == 0) return;
      console.info("dtree 变化了....", newData); // 树变了，再次选中当前的节

      this.selectedNodeList = newData[0].children;
      //默认展开keys
      let parentKeys = [];
      parentKeys.push(newData[0].id);
      this.defaultExpandedKeys = parentKeys;
      console.log("this.defaultExpandedKeys", this.defaultExpandedKeys);
      if (
        this.isInit == false &&
        newData[0].children &&
        newData[0].children.length > 1
      ) {
        // 第一次生成树，默认选中节点

        this.isInit = true;
        console.info("第一次生成树，默认选中节点", this.selectedNodeList);
        if (this.selectedNodeList.length > 0 && this.data.length > 0) {
          console.info("发出左侧点已经选中的信息");
          this.query(this.selectedNodeList);
        }

        setTimeout(() => {
          console.log("-----------默认选中子节点", this.selectedNodeList);
          if (this.$refs[this.reference] != undefined) {
            this.$refs[this.reference].setCheckedNodes(
              this.selectedNodeList.filter(node => node.label != "全部")
            );
          }
        }, 50);
      }
    }
  }
};
</script>
