<template>
  <div class="page">
    <div class="card" data-name='权限分配'>
      <div>
        一级部门：
        <Select v-model="dept1Id" style="width:150px" clearable>
          <Option v-for="item in dept1IdList" :value="item.dept1Id" :key="item.dept1Id">{{ item.dept1Name }}</Option>
        </Select>
        二级部门：
        <Select v-model="dept2Id" style="width:150px" clearable>
          <Option v-for="item in dept2IdList" :value="item.dept2Id" :key="item.dept2Id">{{ item.dept2Name }}</Option>
        </Select>
        三级部门：
        <Select v-model="dept3Id" style="width:150px" clearable>
          <Option v-for="item in dept3IdList" :value="item.dept3Id" :key="item.dept3Id">{{ item.dept3Name }}</Option>
        </Select>
        角色：
        <Select v-model="roleType" style="width:150px" clearable>
          <Option v-for="item in roleTypeList" :value="item.type" :key="item.type">{{ item.name }}</Option>
        </Select>
        权限来源：
        <Select v-model="origin" style="width:150px" clearable>
          <Option value="default" >默认</Option>
          <Option value="assign" >分配</Option>
        </Select>
      </div>
      <div style="padding-top: 10px;">
        ERP:
        <Input v-model="searchErp" placeholder="请输入erp" clearable style="width: 200px;"/>
        <Button type="primary" v-on:click="queryAuthoritySetting">查询</Button>
        <Button type="success" v-on:click="addSetting">新增</Button>
      </div>
      <div style="padding-top: 10px;">
        <Table :width="tableWidth" border :columns="authorityColumns" :data="authorityDatas"></Table>

        <div style="padding-top: 10px;">
          <Page :total="totalNum" size="small" :page-size="pageSize" show-elevator v-on:on-change="pageChange"></Page>
        </div>
      </div>

      <Modal v-model="showSetting" title="新增权限配置" :closable="false" :mask-closable="false"
             @on-ok="saveAuthority" @on-cancel="cancelAddAuthority">
        <div style="padding-top: 5px;">
          一级部门：
          <Select v-model="authority.dept1Id" style="width:150px" clearable>
            <Option v-for="item in adddept1IdList" :value="item.dept1Id" :key="item.dept1Id">{{ item.dept1Name }}</Option>
          </Select>
          二级部门：
          <Select v-model="authority.dept2Id" style="width:150px" clearable>
            <Option v-for="item in adddept2IdList" :value="item.dept2Id" :key="item.dept2Id">{{ item.dept2Name }}</Option>
          </Select>
        </div>
        <div style="padding-top: 5px;">
          三级部门：
          <!--v-on:on-change="dept3IdChange"-->
          <Select v-model="authority.dept3Id" style="width:150px" clearable v-on:on-change="dept3IdChange">
            <Option v-for="item in adddept3IdList" :value="item.dept3Id" :key="item.dept3Id">{{ item.dept3Name }}</Option>
          </Select>
          权限类型：
          <Select v-model="authority.roleType" style="width:150px" clearable>
            <Option v-for="item in roleTypeList" :value="item.type" :key="item.type">{{ item.name }}</Option>
          </Select>
        </div>
        <div style="padding-top: 5px;">
          ERP:
          <Input v-model="authority.addErp" placeholder="请输入erp" clearable style="width: 200px;"/>
        </div>
        <div v-loading="loading" style="padding-top: 5px;" v-if="authority.roleType == 'SALER'">
          销售ERP:
          <Select v-model="authority.salerErp" style="width:150px" clearable filterable>
            <Option v-for="item in salerList" :value="item.salerId" :key="item.salerId">{{ item.salerName }}</Option>
          </Select>
          <!--<Input v-model="authority.salerErp" placeholder="请输入erp" clearable style="width: 200px;"/>-->
          <!--<div style="padding-top: 5px;">-->
            <!--销售名称:-->
            <!--<Input v-model="authority.salerName" placeholder="请输入销售员姓名" clearable style="width: 200px;"/>-->
          <!--</div>-->
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
  import pageContainer from "@/components/common/pageContainer/pageContainer"
  import { authority as Api } from '@/api/index'
  import { mapMutations,mapGetters } from 'vuex'
  export default{
    data() {
      return {
        authorityColumns: [
          {
            title: 'ERP',
            key: 'erp',
            width: 150,
            fixed:'left',
            render: (h, params) => {
              return h('div', [
                h('Icon', {
                  props: {
                    type: 'person'
                  }
                }),
                h('strong', params.row.erp)
              ]);
            }
          },
          {
            title: '权限类型',
            key: 'erpRoleType',
            width: 150,
            fixed:'left',
            render: (h, params) => {
              if(params.row.erpRoleType == null){
                return h('div', ["-"]);
              }
              return h('div', [params.row.erpRoleType == 'DEPT_MANAGER' ? "部门负责人" : '销售员']);
            }
          },
          {
            title: '销售员erp',
            key: 'salerId',
            width: 150,
            fixed:'left',
            render: (h, params) => {
              if(params.row.erpRoleType != 'SALER'){
                return h('div', ["-"]);
              }
              return h('div', [params.row.salerId]);
            }
          },
          {
            title: '一级部门ID',
            key: 'dept1Id',
            width: 100,
          },
          {
            title: '一级部门名称',
            key: 'dept1Name',
            width: 150,
          },
          {
            title: '二级部门ID',
            key: 'dept2Id',
            width: 100,
          },
          {
            title: '二级部门名称',
            key: 'dept2Name',
            width: 150,
          },
          {
            title: '三级部门ID',
            key: 'dept3Id',
            width: 100,
          },
          {
            title: '三级部门名称',
            key: 'dept3Name',
            width: 150,
          },
          {
            title: '权限来源',
            key: 'origin',
            width: 150,
            fixed:'left',
            render: (h, params) => {
              return h('div', [params.row.origin == 'default' ? "默认" : '分配']);
            }
          },
          {
            title: '操作',
            key: 'action',
            width: 100,
            align: 'center',
            fixed:'right',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.remove(params.index)
                    }
                  }
                }, '删除')
              ]);
            }
          }
        ],
        authorityList:[],
        deptIdList: [
          {
            value: 'New York',
            label: 'New York'
          },
          {
            value: 'London',
            label: 'London'
          },
          {
            value: 'Sydney',
            label: 'Sydney'
          },
          {
            value: 'Ottawa',
            label: 'Ottawa'
          },
          {
            value: 'Paris',
            label: 'Paris'
          },
          {
            value: 'Canberra',
            label: 'Canberra'
          }
        ],
        dept1Id: '',
        dept2Id:'',
        dept3Id:'',
        roleTypeList:[
          { type:'DEPT_MANAGER',name:'部门负责人' },
          { type:'SALER',name:'采销' },
        ],
        roleType:'',
        dept1List:[],
        dept2List:[],
        dept3List:[],
        origin:'',//权限来源，默认：default，分配：assign
        pageSize:11,//每页大小11个
        curPage:1,
        searchErp:'',//搜索erp
        showSetting:false,
        authority:{
          dept1Id: '',
          dept2Id:'',
          dept3Id:'',
          addErp:'',
          salerErp:'',
          roleType:'',
          salerName:''
        },
        salerList:[],//所有采销列表
        loading:false,
      }
    },
    methods:{
      show (index) {
        this.$Modal.info({
          title: 'User Info',
          content: `Name：${this.data6[index].name}<br>Age：${this.data6[index].age}<br>Address：${this.data6[index].address}`
        })
      },
      remove (index) {
        let obj = this.authorityDatas[index];
        if(obj == undefined) return;
        if(obj.origin == 'default'){
          this.$Notice.warning({title: '提醒', desc: '不可删除系统默认权限!'});
          return;
        }
        this.$Modal.confirm({
          title: '确认',
          content: '是否确认删除该权限？',
          onOk: () => {
            this.$Message.info('Clicked ok');
            Api.deleteAuthoritySetting(obj).then(rs => {
              if(rs && rs.success){
                this.$Notice.success({title: '失败', desc: rs.message});
              }else{
                this.$Notice.error({title: '失败', desc: rs.message});
              }
            }).then( () => {
              this.queryAuthoritySetting();
            });
          },
          onCancel: () => {
            this.$Message.info('Clicked cancel');
          }
        });
      },
      pageChange(page){
        this.curPage = page;
      },
      queryAuthoritySetting(){
        console.log("查询权限设置");
        if( (this.dept1Id == null || this.dept1Id == '') && (this.searchErp == null || this.searchErp == '')){
          this.$Notice.error({title: '参数错误', desc: '请至少选择一个一级部门或输入一个erp'});
          return;
        }
        let param = {};
        if(this.dept1Id != null && this.dept1Id != ''){
          param.dept1Id = this.dept1Id;
        }
        if(this.dept2Id != null && this.dept2Id != ''){
          param.dept2Id = this.dept2Id;
        }
        if(this.dept3Id != null && this.dept3Id != ''){
          param.dept3Id = this.dept3Id;
        }
        if(this.roleType != null && this.roleType != ''){
          param.roleType = this.roleType;
        }
        if(this.searchErp != null && this.searchErp != ''){
          param.currentErp = this.searchErp;
        }
        if(this.origin != null && this.origin != ''){
          param.origin = this.origin;
        }
        Api.getAuthoritySettings(param).then((rs) => {
          if(rs.success == true){
            console.log("权限列表",rs.data);
            this.$Notice.success({title: '成功', desc: '获取权限列表成功'});
            this.authorityList = rs.data;
          }else{
            this.$Notice.error({title: '失败', desc: rs.message});
          }
        })
      },
      addSetting(){
        this.showSetting = true;
      },
      saveAuthority(){//保存新增权限
        let isValid = true;
        for(var key in this.authority){
          if(key == 'salerName') continue;
          let val = this.authority[key];
          if(this.authority.roleType != 'SALER' && (key == 'salerErp' || key == 'salerName')){
            continue;
          }
          if(val == null || val == ''){
            isValid = false;
          }
        }
        if(!isValid){
          this.$Notice.error({title: '失败', desc: '所有参数均不可为空！'});
          return;
        }
        let param = {
          dept1Id:this.authority.dept1Id,
          dept2Id:this.authority.dept2Id,
          dept3Id:this.authority.dept3Id,
          erp:this.authority.addErp,
          erpRoleType:this.authority.roleType,
          salerId:'-',
          salerName:'-',
          name:'-'
        };
        if(this.authority.roleType == 'SALER'){
          param.salerId = this.authority.salerErp;
          let salerObj = this.salerList.find(obj => {
            return obj.salerId == this.authority.salerErp && obj.dept3Id == this.authority.dept3Id;
          })
          if(salerObj != undefined){
            param.salerName = salerObj.salerName;
          }
          //param.salerName = this.authority.salerName;
        }
        let dept3 = this.dept3List.find(dept => dept.dept3Id == this.authority.dept3Id);
        if(dept3 != undefined){
          param.dept1Name = dept3.dept1Name;
          param.dept2Name = dept3.dept2Name;
          param.dept3Name = dept3.dept3Name;
        }
        console.log("保存对象",param)
        Api.saveAuthoritySetting(param).then( rs => {
          if(rs && rs.success){
            this.$Notice.success({title: '成功', desc: '新增权限成功!'});
          }else{
            this.$Notice.error({title: '失败', desc: rs.message })
          }
        });
        this.cancelAddAuthority();//清空选择
      },
      cancelAddAuthority(){
        this.authority = {
          dept1Id: '',
          dept2Id:'',
          dept3Id:'',
          addErp:'',
          salerErp:'',
          roleType:'',
          salerName:''
        };
      },
      dept3IdChange(id){
        console.log("dept3Id change",id);
        this.authority.salerErp = '';
        this.salerList = [];
        //查询三级部门下的销售员
        if( (this.authority.dept1Id == null || this.authority.dept1Id == '') || (this.authority.dept2Id == null || this.authority.dept2Id == '')
          || (this.authority.dept3Id == null || this.authority.dept3Id == '')){
          //this.$Notice.error({title: '参数错误', desc: '请选择一二三级部门'});
          return;
        }
        let param = {};
        if(this.authority.dept1Id != null && this.authority.dept1Id != ''){
          param.dept1Id = this.authority.dept1Id;
        }
        if(this.authority.dept2Id != null && this.authority.dept2Id != ''){
          param.dept2Id = this.authority.dept2Id;
        }
        if(this.authority.dept3Id != null && this.authority.dept3Id != ''){
          param.dept3Id = this.authority.dept3Id;
        }
        this.loading = true;
        Api.getSalerList(param).then((rs) => {
          this.loading = false;
          if(rs.success == true){
            console.log("salerList",rs.data);
            //this.$Notice.success({title: '成功', desc: '获取权限列表成功'});
            this.salerList = rs.data;
          }else{
            this.$Notice.error({title: '失败', desc: rs.message});
            this.salerList = [];
          }
        });
      }
    },
    computed:{
      tableWidth(){
        if(window.screen.width > 1400){
          return 1250;
        }
        return 1000;
      },
      dept1IdList(){
        return this.dept1List;
      },
      dept2IdList(){
        if(this.dept1Id == '' || this.dept1Id == null || this.dept1Id == undefined) return [];
        return this.dept2List.filter( (dept,index) => {
          return dept.dept1Id == this.dept1Id;
        });
      },
      dept3IdList(){
        if(this.dept2Id == '' || this.dept2Id == null || this.dept2Id == undefined) return [];
        return this.dept3List.filter( (dept,index) => {
          return dept.dept2Id == this.dept2Id;
        });
      },
      adddept1IdList(){
        return this.dept1List;
      },
      adddept2IdList(){
        if(this.authority.dept1Id == '' || this.authority.dept1Id == null || this.authority.dept1Id == undefined) return [];
        return this.dept2List.filter( (dept,index) => {
          return dept.dept1Id == this.authority.dept1Id;
        });
      },
      adddept3IdList(){
        if(this.authority.dept2Id == '' || this.authority.dept2Id == null || this.authority.dept2Id == undefined) return [];
        return this.dept3List.filter( (dept,index) => {
          return dept.dept2Id == this.authority.dept2Id;
        });
      },
      totalNum(){
        if(this.authorityList && this.authorityList.length > 0){
          return this.authorityList.length;
        }
        return 0;
      },
      authorityDatas(){//前端表格需要分页
        let datas = [];
        if(this.authorityList && this.authorityList.length > 0){
          let start = (this.curPage-1) * this.pageSize;
          let end = this.curPage * this.pageSize - 1;
          if(this.authorityList.length -1 < end){
            end = this.authorityList.length -1;
          }
          if(this.authorityList.length < start){//比起始角标小
            return datas;
          }
          for(var i=start;i<=end;i++){
            datas.push(this.authorityList[i]);
          }
        }
        return datas;
      },
    },
    mounted(){
      Api.getBaseDeptInfo({}).then(rs => {
        if(rs.success == true){
          console.log("部门信息",rs.data);
          this.dept1List = rs.data.dept1;
          this.dept2List = rs.data.dept2;
          this.dept3List = rs.data.dept3;
        }
      })
    }
  }
</script>
