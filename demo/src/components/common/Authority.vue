<template>
  <!--权限组件-->
  <div>
    <div style="background: #545c64;color:#fff;" v-on:click="chooseAuthority">
      <Avatar style="background-color: #87d068" icon="person"/>
      你好，{{ erp }}
      <div v-if="user.type=='SALER'">采销经理 / {{ user.dept3Name }} / {{ user.salerName }}</div>
      <div v-else-if="user.type=='DEPT_MANAGER'">部门负责人 / {{ user.dept3Name }}</div>
      <Modal v-model="showAuthority" title="权限选择" @on-ok="confirmAuthority" @on-cancel="cancel">
        <Cascader :data="cascader" v-model="role" v-on:on-change="cascadeChange"></Cascader>
      </Modal>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
var Authority_Map = [
  {
    currentRoute: "/SaleDetail",
    type: "DEPT_MANAGER",
    targetRoute: "/ManagerReached"
  },
  {
    currentRoute: "/SaleReached",
    type: "DEPT_MANAGER",
    targetRoute: "/ManagerReached"
  },
  {
    currentRoute: "/ManagerReached",
    type: "SALER",
    targetRoute: "/SaleReached"
  },
  //    {currentRoute:"/salePlan",type:"DEPT_MANAGER",targetRoute:"/saleTarget"},
  { currentRoute: "/saleTarget", type: "SALER", targetRoute: "/salePlan" }
];
import Vue from "vue";
export default {
  created() {
    this._bus.$on("E_TABLEEDIT_STATUS_CHANGE", this.hTableEditChange);
  },
  beforeDestroy() {
    this._bus.$off("E_TABLEEDIT_STATUS_CHANGE", this.hTableEditChange);
  },
  data() {
    return {
      showAuthority: false,
      role: [],
      type: "",
      dept3Id: "",
      dept3Name: "",
      salerId: "",
      salerName: "",
      name: "",
      loading: false,

      isEdit: false
    };
  },
  methods: {
    ...mapMutations([
      "setAuthority",
      "setUser",
      "setVersionList",
      "setUserTreeData"
    ]),
    hTableEditChange(flag) {
      this.isEdit = flag;
    },
    cascadeChange(value, selectedData) {
      console.log("权限选择变化", value, selectedData);
      this.type = value[0];
      if(value.length >= 2){
        this.dept3Id = value[1];
        this.dept3Name = selectedData[1].label;
      }
      if (value.length == 3) {
        this.salerId = value[2];
        this.salerName = selectedData[2].label;
      }
    },
    initRole() {
      //初始化权限
      this.role = [this.user.type, this.user.dept3Id];
      this.type = this.user.type;
      this.dept3Id = this.user.dept3Id;
      this.dept3Name = this.user.dept3Name;
      this.name = this.user.name;
      this.salerId = this.user.salerId;
      this.salerName = this.user.salerName;
      if (this.user.type == "SALER") {
        this.role.push(this.user.salerId);
      }
    },
    confirmAuthority() {
      let user = {
        type: this.type,
        dept3Id: this.dept3Id,
        erp: this.erp,
        dept3Name: this.dept3Name,
        name: this.user.name,
        salerId: this.salerId,
        salerName: this.salerName
      };
      console.info("confirmAuthority", user);
      //重新加载treeData
      let cond = { dept3Id: user.dept3Id, roleType: user.type };
      if (user.type == "SALER") {
        cond.currentErp = user.salerId;
      } else if (user.type == "DEPT_MANAGER") {
        cond.currentErp = user.erp;
      }
      const loadingInstance = this._loading("请求品类品牌....");
      this._api.common
        .getTree(cond, this, "loading")
        .then(
          this._do("请求品类品牌", d => {
            console.info("加载左侧树完成......,保存到store", d);

            user.treeData = d;
            this.setUser(user);
            console.log("------------用户信息-----------", user);
            loadingInstance.close();
          })
        )
        .then(() => {
          this._bus.$emit(this._CONST.E_USERINFO_CHANGE);
        })
        .then(() => {
          Authority_Map.forEach(map => {
            if (
              this.$router.currentRoute.path == map.currentRoute &&
              this.type == map.type
            ) {
              this.$router.push(map.targetRoute);
              return;
            }
          });
        });
    },
    cancel() {
      this.role = [this.user.type, this.user.dept3Id];
      this.type = this.user.type;
      this.dept3Id = this.user.dept3Id;
      this.dept3Name = this.user.dept3Name;
      this.salerId = this.user.salerId;
      this.salerName = this.user.salerName;
      if (this.user.type == "SALER") {
        this.role.push(this.user.salerId);
      }
    },
    chooseAuthority() {
      if (this.isEdit) {
        this._info("在切换角色前，请先关闭编辑！");
        return;
      }

      this.showAuthority = true;
    }
  },
  computed: {
    ...mapGetters({
      erp: "getErp",
      roleType: "getRoleType",
      roleMap: "getRoleMap",
      user: "getUser"
    }),
    cascader() {
      //级联选择框
      let cascader = [];
      if (this.roleMap != undefined) {
        if (
          this.roleMap.DEPT_MANAGER != undefined &&
          this.roleMap.DEPT_MANAGER.length > 0
        ) {
          let managerList = this.roleMap.DEPT_MANAGER;
          let cascader1 = {};
          cascader1.value = "DEPT_MANAGER";
          cascader1.label = "部门负责人";
          cascader1.children = managerList.map(dept => {
            return { value: dept.dept3Id, label: dept.dept3Name };
          });
          cascader.push(cascader1);
        }

        if (this.roleMap.SALER != undefined && this.roleMap.SALER.length > 0) {
          let salerList = this.roleMap.SALER;
          console.log("salerList", salerList);

          let dept3Arr = Array.from(
            new Set(salerList.map(item => item.dept3Id))
          );

          console.log("dept3Arr", dept3Arr);
          let cascader2 = {};
          cascader2.value = "SALER";
          cascader2.label = "采销经理";

          cascader2.children = dept3Arr.map(dept3Id => {
            let deptFilterList = salerList.filter(
              dept => dept.dept3Id == dept3Id
            );
            let cascader3 = {
              value: dept3Id,
              label: deptFilterList[0].dept3Name
            };
            cascader3.children = deptFilterList.map(dept => {
              let saler = {
                value: dept.salerId,
                label: dept.salerName == "-" ? dept.salerId : dept.salerName
              };
              return saler;
            });
            return cascader3;
          });
          cascader.push(cascader2);
        }
      }
      console.log("cascader",cascader)
      return cascader;
    }
  },
  mounted() {}
};
</script>
