<template>
  <div id="app">
    <el-menu ref="menu" :default-active="path" class="menu" mode="horizontal"
        background-color="#545c64" text-color="#fff" active-text-color="#ffd04b" >
      <!--v-if="user.type == 'DEPT_MANAGER'"-->
      <el-submenu index="1" v-if="user.type == 'DEPT_MANAGER'">
        <template slot="title">经营者报表</template>
        <el-menu-item index="ManagerReached"><router-link to="/ManagerReached">销售达成</router-link></el-menu-item>
      </el-submenu>
      <!--v-if="user.type == 'SALER'"-->
      <el-submenu index="2" v-if="user.type == 'SALER'">
        <template slot="title">销售分析</template>
        <el-menu-item index="2-1"><router-link to="/SaleReached">销售达成</router-link></el-menu-item>
        <el-menu-item index="2-2"><router-link to="/SaleDetail">销售明细分析</router-link></el-menu-item>
      </el-submenu>

      <el-submenu index="3" v-if="user.type == 'DEPT_MANAGER'">
        <template slot="title">销售目标</template>
        <el-menu-item index="saleTarget"><router-link to="/saleTarget">目标制定</router-link></el-menu-item>
        <!-- <el-menu-item index="3-2"><router-link to="/saleTarget">目标制定-采销经理</router-link></el-menu-item> -->
        <!--<el-menu-item index="3-3">目标对比</el-menu-item>-->
      </el-submenu>

      <el-submenu index="4">
        <template slot="title">销售计划</template>
        <el-menu-item index="salePlan"><router-link to="/salePlan">品类品牌-月周天计划</router-link> </el-menu-item>
      </el-submenu>

      <el-submenu index="5">
        <template slot="title">数据报表</template>
        <el-menu-item index="versionManager"><router-link to="/versionManager">目标查看</router-link> </el-menu-item>
      </el-submenu>

      <el-menu-item index="6">
        <a href="http://it.itsv.jd.com/itcreate" target="_blank">意见反馈</a>
      </el-menu-item>

      <div style="position:absolute;right:20px;top:5px;">
        <Authority ref="authority"></Authority>
      </div>
    </el-menu>
    <div ref="pageContainer">
      <router-view></router-view>
    </div>

  </div>
</template>
<script>
import "@/assets/less/basic.less"; // 全局样式
import { authority as Api } from "./api/index";
import { mapMutations, mapGetters } from "vuex";
import Authority from "@/components/common/Authority";
let loadingInstance = null;
export default {
  name: "App",
  components: {
    Authority
  },
  data() {
    return {
      path: ""
    };
  },
  beforeDestroy() {
    if (loadingInstance) {
      try {
        loadingInstance.close();
      } catch (e) {}
    }
  },
  methods: {
    ...mapMutations([
      "setAuthority",
      "setVersionList",
      "setUserTreeData",
      "setCurrentVersionType"
    ])
  },
  computed: {
    ...mapGetters({
      erp: "getErp",
      user: "getUser"
    }),
    /** */
    activeMenu() {
      let path = this.$router.currentRoute.path;
      console.info("当前的路由:", path);
      if (path == "/SaleDetail") {
        return "2-2";
      } else if (path == "/SaleReached") {
        return "2-1";
      } else if (path == "/ManagerReached") {
        return "1-1";
      } else if (path == "/saleTarget") {
        return "3-1";
      } else if (path == "/salePlan") {
        return "salePlan";
      } else if (path == "/versionManager") {
        return "versionManager";
      } else if (path == "/StockCover") {
        return "5-2";
      }
      return "3-1";
    }
  },
  created() {
    setTimeout(() => {
      let arr = window.location.href.split("/");
      let path = "";
      if (arr.length > 0) {
        this.path = arr[arr.length - 1];
      } else {
        this.path = "salePlan";
      }
      Api.getRole({})
        .then(rs => {
          if (
            rs.success == true &&
            rs.data.roleMap &&
            JSON.stringify(rs.data.roleMap) != "{}"
          ) {
            this.setAuthority(rs.data);
          } else {
            return Promise.reject("获取角色信息失败，请联系管理员");
          }
        })
        .then(() => this.$refs.authority.initRole())
        .then(() => {
          let cond = { dept3Id: this.user.dept3Id, roleType: this.user.type };
          if (this.user.type == "SALER") {
            cond.currentErp = this.user.salerId;
          } else if (this.user.type == "DEPT_MANAGER") {
            cond.currentErp = this.user.erp;
          }
          loadingInstance = this._loading("请求品类品牌....");
          this._api.common.getTree(cond).then(
            this._do(
              "请求品类品牌",
              d => {
                loadingInstance && loadingInstance.close();
                console.info("加载左侧树完成......,保存到store");
                this.setUserTreeData(d);
              },
              () => {
                loadingInstance && loadingInstance.close();
              }
            )
          );
          this._bus.$emit(this._CONST.E_USERINFO_CHANGE);
          //this.$router.push({path:this.path})
        })
        .catch(err => {
          this._error(err);
        });
    }, 1000);
  }
};
</script>

