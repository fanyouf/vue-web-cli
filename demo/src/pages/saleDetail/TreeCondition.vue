<template>
  <div class="inline-block">

    <Poptip placement="bottom-end" width="400" v-model="showCondi" v-on:on-popper-hide="cancel">
      <div class="inline-block" @click="inputClick">
        <Input v-model="showName" readonly icon="chevron-down" style="width: 300px;"/>
      </div>

      <div slot="content">
        <div>
          <Select v-model="dimension" style="width:300px" v-on:on-change="dimensionChange">
            <Option value="cate_brand">品类-品牌架构</Option>
            <Option value="brand_cate">品牌-品类架构</Option>
          </Select>

          <Poptip placement="bottom-start" trigger="hover">
            <svg class="icon icon-btn" aria-hidden="true">
              <use xlink:href="#icon-cengji-moren"></use>
            </svg>
            <div slot="content">
              <RadioGroup v-model="categroyLevel" @on-change="categroyLevelChange" vertical>
                <Radio label="cate1"><span>一级品类</span></Radio>
                <Radio label="cate2"><span>二级品类</span></Radio>
                <Radio label="cate3"><span>三级品类</span></Radio>
              </RadioGroup>
            </div>
          </Poptip>
          <Poptip placement="bottom" trigger="hover">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-wuxuliebiao-moren"></use>
            </svg>
            <div slot="content">
              <RadioGroup v-model="sortOrder" @on-change="sortOrderChange" vertical>
                <Radio label="order_m1"><span>按M-1占比排序</span></Radio>
                <Radio label="order_id"><span>按ID顺序排序</span></Radio>
              </RadioGroup>
            </div>
          </Poptip>
        </div>
        <div>
          <Input icon="search" placeholder="输入名称或id搜索" style="width: 346px;" v-model="filterText"/>
        </div>
        <div style="padding-bottom: 10px;">
          <Checkbox v-model="single" @on-change="salerChange">采销经理</Checkbox>
        </div>
        <div style="height: 300px;overflow-y: scroll;border: 1px solid #e9e9e9;padding-top: 6px;">
          <el-tree
            ref="tree"
            show-checkbox
            node-key="value"
            :data="treeShowData"
            :check-strictly="true"
            :default-checked-keys="checkedKeys"
            :default-expanded-keys="expandKeys"
            @check="hCheck"
            @node-click="hCheckChange"
            @check-change="hCurrentChange">
          </el-tree>
        </div>

        <div style="text-align: right">
          <Button type="primary" v-on:click="confirm">确定</Button>
          <Button type="primary" v-on:click="cancel">取消</Button>
        </div>
      </div>
    </Poptip>

  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  export default {
    props:{
      syncMethod:{
        type:Function,
        required:false,
        default:function () {
          return undefined;
        }
      },
      treeCondition:{
        type:Object,
        required:false,
        default:function () {
          return {};
        }
      }
    },
    data(){
      return {
        levelName: '一级品类A-二级品类A-三级品类A-品牌A-SKU 11873',
        dimension: "cate_brand",
        categroyLevel: 'cate1',
        sortOrder: 'order_m1',
        single: false,
        showCondi: false,
        filterText: '',
        checkedKeys:[],
        selectedNodeList:[],
        expandKeys:['root'],//默认展开层级,
        checkedNodes:[],//选中节点名称
      }
    },
    methods:{
      inputClick(){
        this.showCondi = true;
      },
      getCondition(){
        let condition = {};
        condition.dimension = this.dimension;
        condition.sortOrder = this.sortOrder;
        condition.categroyLevel = this.categroyLevel;
        let checkedNodes = this.$refs.tree.getCheckedNodes();
        if(checkedNodes != undefined && checkedNodes.length > 0){
          let level = checkedNodes[0].level;
          condition.level = level;
          let idList = checkedNodes.map(node => node.id);
          let levelInfo = JSON.parse(checkedNodes[0].levelInfo);
          let parentId = levelInfo.parentId;
          let parentLevel = levelInfo.parentLevel;
          condition.idList = idList;
          condition.parentId = parentId;
          condition.parentLevel = parentLevel;
        }
        return condition;
      },
      confirm(){
        let condition = this.getCondition();
        console.log("condition",condition);
        if(this.syncMethod != undefined){
          this.syncMethod.call(this,condition);
        }
        this.showCondi = false;
      },
      cancel(){
        if(this.treeCondition.dimension != undefined) this.dimension = this.treeCondition.dimension;
        if(this.treeCondition.categroyLevel != undefined) this.categroyLevel = this.treeCondition.categroyLevel;
        if(this.treeCondition.sortOrder != undefined) this.sortOrder = this.treeCondition.sortOrder;

        while(this.$refs.tree == undefined && this.expandList != undefined){

        }
        setTimeout(()=>{
          if(this.treeCondition.idList != undefined && this.treeCondition.idList.length > 0){
            let pre = this.treeCondition.parentId != undefined && this.treeCondition.parentLevel != 'root' ? this.treeCondition.parentId + '-' : '';
            let keys = this.treeCondition.idList.map(id => pre + id);
            if(this.$refs.tree != undefined){
              this.$refs.tree.setCheckedKeys(keys);
              this.checkedNodes = this.$refs.tree.getCheckedNodes();
            }
          }
        },1500);
        this.showCondi = false;
      },
      dimensionChange(dim){
        console.log(dim);
      },
      sortOrderChange(sort){
        console.log(sort)
      },
      categroyLevelChange(level){
        console.log(level)
      },
      salerChange(choose){
        console.log(choose);
      },
      _createNodeInfo(orderKey,index,item){
        if(index <0){
          throw new Error("在创建节点上的冗余信息时，index值错误.....")
        }
        let str = {
          childrenLevel      : orderKey[index],
          parentId   : index==0 ? "8888" : item[orderKey[index-1]+"Id"],
          parentLevel: index==0 ? "root" : orderKey[index-1]
        }
        return JSON.stringify(str);
      }
      ,
      constructTree(orderKey, index, jsonArray) {
        if(index > orderKey.length - 1) return null;
        let nodeMap = {}

        jsonArray.forEach(item => {
          let levelInfo = this._createNodeInfo(orderKey,index,item);
          let id = item[orderKey[index] + "Id"]
          if(nodeMap[id]) {
            nodeMap[id]["children"].push(item);
          } else {
            let parentId = undefined;
            if(index > 0){
              parentId = item[orderKey[index-1] + "Id"];
            }
            let temp = {
              "levelInfo":levelInfo,
              "level":orderKey[index],
              "label": item[orderKey[index] + "Name"]+"-"+id,
              "value": parentId == undefined ? id : parentId + '-'+id,
              "children": [item],
              "gmv":item.gmv,
              "id":id
            }
            nodeMap[id] = temp;
          }
        })

        let result = []
        for(var keyName in nodeMap) {
          let gmv = 0
          nodeMap[keyName]["children"].forEach(item => { gmv+=item.gmv })
          nodeMap[keyName]["children"] = this.constructTree(orderKey, index + 1, nodeMap[keyName]["children"])
          nodeMap[keyName]["gmv"] = gmv;
          nodeMap[keyName]["label"] = nodeMap[keyName]["label"]+"-"+gmv;
          nodeMap[keyName]["level"] = orderKey[index]
          result.push(nodeMap[keyName])
        }

        if(this.sortOrder === "order_m1"){
          result.sort(function(a,b){
            return b.gmv - a.gmv
          })
        }
        else{
          result.sort(function(a,b){
            return b.value - a.value
          })
        }
        // 在兄弟节点中添加一个头部的结点，方便用户直接通过它去选中全部的兄弟节点
        let levelInfo = this._createNodeInfo(orderKey,index,jsonArray[0]);

        result.unshift({level:orderKey[index],label:'全部',levelInfo,value:8888+levelInfo})
        return result;
      },
      hCurrentChange(currentNode,isSelected){
        console.log("currentNode",currentNode);
        if(this.isSelecedAll(currentNode)){ // 如查选中了全部这个节点
          var brotherNodes = this.findbrother(currentNode);
          //console.info('全部节点对应的兄弟节点是',brotherNodes,"当前选中的结点是",this.selectedNodeList);

//          console.log("currentNode",currentNode)
          if(isSelected){// 需要去选中它的兄弟结点
            this.selectedNodeList = [...brotherNodes];
            //console.info(this.selectedNodeList)
            this.$refs.tree.setCheckedNodes(this.selectedNodeList)
          }
          else{ // 需要去取消选中的兄弟结点
            this.selectedNodeList = this.selectedNodeList.filter(el => !brotherNodes.includes(el))
            //console.info(this.selectedNodeList)
            this.$refs.tree.setCheckedNodes(this.selectedNodeList)
          }
        }else{
          console.log("this.selectedNodeList",this.selectedNodeList);
          console.log(this.$refs.tree.getCheckedNodes());
          if(isSelected == true){
            let level = currentNode.level;
            let levelInfo = currentNode.levelInfo;
            let checkedNodes = this.$refs.tree.getCheckedNodes();
            let sameLevelNodes = checkedNodes.filter(node => {
              return node.level == level && node.levelInfo == levelInfo;
            });
            let keys = sameLevelNodes.map(node => node.value);
            if(keys == undefined || keys.length == 0){
              keys = [];
            }
            keys.push(currentNode.value);
            this.$refs.tree.setCheckedKeys(keys);
          }
        }

        this.checkedNodes = this.$refs.tree.getCheckedNodes();

      },
      hCheck(data,nodeInfo){
        this.selectedNodeList = nodeInfo.checkedNodes
      },
      hCheckChange(node1){
        this.$refs.tree.setChecked(node1,true)
      },
      isSelecedAll(node){
        return node.label === '全部' && node.value.substring(0,4) === '8888';
      },
      findNode(node, tree, obj) {
        var value = node.value;
        var levelInfo = node.levelInfo
        if (obj.ok)
          return;

        for (var i = 0; i < tree.length; i++) {
          var item = tree[i]
          if (item.value == value && item.levelInfo == levelInfo) {
            obj.ok = true
            obj.rs = tree
            break;
          }
        }
        if (!obj.ok) {
          for (var i = 0; i < tree.length; i++) {
            var item = tree[i]
            !obj.ok && item.children && this.findNode(node, item.children, obj)
          }
        }
      },
      findbrother(node){
        // 在树当中找到当前结点的父节点，从而找到全部兄弟结点
        var obj = {ok:false,rs:null}

        this.findNode(node, this.treeShowData, obj)
        console.info("在树当中找到当前结点的父节点，从而找到全部兄弟结点",obj)
        if(!obj.rs || obj.rs.length==0){
          throw new Error("在树当中找到当前结点的父节点，从而找到全部兄弟结点失败")
          return []
        }
        return obj.rs

      },
    },
    computed:{
      ...mapGetters({
        erp:'getErp',
        cate1IdList:'getCate1IdList',
        cate2IdList:'getCate2IdList',
        expandList:'getExpandList'
      }),
      showName(){//input框展示名称
        let checkedNodes = this.checkedNodes;
        if(checkedNodes != undefined && checkedNodes.length > 0){
          let labels = checkedNodes.map(node => {
            return node.label;
          });
          return labels.toString();
        }
        return '';
      },
      treeShowData(){
        let data = this.expandList;
        let level = [];
        if(this.dimension.split("_")[0] ==="cate"){
          level.push(this.categroyLevel);
          level.push("brand");
        } else {
          level.push("brand");
          level.push(this.categroyLevel);
        }
        let rs = this.constructTree(level, 0, data);
        // 如果是三级部门负责人，则在树的最外层加上三级部门负责人，作为根结点
        let rs1 = [{label:this.erp,id:this.erp,value:'root',children:rs}]
        console.info("通过",this.data,"生成树结构是.....",rs1)
        return rs1;
      }
    },
    mounted(){
      setTimeout(()=>{
        if(this.treeCondition.dimension != undefined) this.dimension = this.treeCondition.dimension;
        if(this.treeCondition.categroyLevel != undefined) this.categroyLevel = this.treeCondition.categroyLevel;
        if(this.treeCondition.sortOrder != undefined) this.sortOrder = this.treeCondition.sortOrder;

        while(this.$refs.tree == undefined && this.expandList != undefined){

        }
//        console.log("treeCondition",this.treeCondition)
        setTimeout(()=>{
          if(this.treeCondition.idList != undefined && this.treeCondition.idList.length > 0){
            let pre = this.treeCondition.parentId != undefined && this.treeCondition.parentLevel != 'root' ? this.treeCondition.parentId + '-' : '';
            let keys = this.treeCondition.idList.map(id => pre + id);
//            console.log("keys",keys)
            if(this.$refs.tree != undefined){
              this.$refs.tree.setCheckedKeys(keys);
              this.checkedNodes = this.$refs.tree.getCheckedNodes();
            }
          }
        },1500);
      },200);
    }
  }
</script>
