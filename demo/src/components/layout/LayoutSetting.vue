<template>
  <!--功能模块布局-->
  <div class="inline-block">
    <Poptip class="align-center" title="保存布局" content="content" placement="bottom-end" width="500" v-model="showLayout"
            v-on:on-popper-hide="popperHide">
      <div>
        <!--@click="showLayoutSetting"-->
        <svg class="icon" aria-hidden="true" title="布局" @click="showLayoutSetting">
          <use v-show="model!='layout'" xlink:href="#icon-buju-moren"></use>
          <use v-show="model=='layout'" xlink:href="#icon-buju-xuanzhong"></use>
        </svg>
      </div>
      <div slot="content" class="align-center">
        <div>
          <Table :columns="columns" :data="layoutData"></Table>
        </div>
        <div class="pt10  align-left">
          当前布局
          <div class="pt10 align-left">
            名称：<Input placeholder="布局名称" v-model="layoutName" style="width: 400px"/>
          </div>
          <div class="pt10 align-left">
            描述：<Input placeholder="布局描述" v-model="layoutDesc" style="width: 400px"/>
          </div>
          <div class="pt10 align-right">
            <Checkbox v-model="isDefault">设为默认布局</Checkbox>
          </div>
        </div>
        <div class="pt10">
          <Button type="success" size="small" v-on:click="saveLayout">确定</Button>
          <Button type="warning" size="small" v-on:click="cancel">取消</Button>
        </div>
      </div>
    </Poptip>
  </div>
</template>

<script>
  import "@/assets/less/layout/layout.less"
  import { mapGetters } from 'vuex';
  export default{
    props:{
      page:{//页面
        type:String,
        required:true
      },
      module:{//功能模块
        type:String,
        required:true,
      },
      condition:{
        type:Object,
        required:true
      },
    },
    data(){
      return {
        model:'',
        layoutName:'',//布局名称
        layoutDesc:'',//布局描述
        isDefault:true,//是否默认布局
        layoutArray:[],//cookie中保存布局
        showLayout:false,
        columns: [
          {
            title: '名称',
            key: 'name'
          },
          {
            title: '描述',
            key: 'desc'
          },
          {
            title: '默认布局',
            key: 'isDefault',
            render: (h,params) => {
              return h('div', [
                h('Radio', {
                  props: {
                    disabled: true,
                    value:params.row.isDefault
                  },
                }, 'Radio')
              ]);
            }
          },
          {
            title: '操作',
            key: 'action',
            width: 150,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.remove(params.row.key,params.row.name)
                    }
                  }
                }, '删除'),
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.apply(params.row.key,params.row.name)
                    }
                  }
                }, '应用')
              ]);
            }
          }
        ]
      }
    },
    methods:{
      showLayoutSetting(){
        this.model = 'layout';
        this.showLayout = true;
      },
      popperHide(){
        this.cancel();
      },
      cancel(){//取消编辑布局
        this.model = '';
        this.layoutName = '';
        this.layoutDesc = '';
        this.showLayout = false;
      },
      saveLayout(){
        if(this.layoutName == '' || this.layoutName == undefined){
          this.$Message.error({content: '布局名称不能为空！', duration: 10, closable: true});
          return;
        }
        if(this.condition.treeCondition){
          let treeCondition = this.condition.treeCondition;
          if(treeCondition.queryCondition){
            let queryCondition = treeCondition.queryCondition;
            if(queryCondition.childrenLevel){
              if(queryCondition.childrenLevel == 'sku'){
                this.$Message.warning({content: '布局不支持保存sku维度!', duration: 10, closable: true});
                return;
              }
            }
          }
        }
        let conditionObject = Object.assign({
          name:this.layoutName,
          desc:this.layoutDesc,
          isDefault:this.isDefault,
        },this.condition);

        console.log("保存布局设置",conditionObject);

        if(this.isDefault == true && this.layoutArray != undefined && this.layoutArray.length > 0){
          let defaultArr = this.layoutArray.filter(layout => {
            return layout.condition['isDefault'] == true;
          });
          if(defaultArr != undefined && defaultArr.length > 0){
            defaultArr.forEach(layout => {
              let key = layout.key;
              let condition = layout.condition;
              condition.isDefault = false;
              this.setCookie(key,condition);
            });
          }
        }

        let cookieKey = this.getCookieKey();
        this.setCookie(cookieKey + this.layoutName,conditionObject);
        this.layoutArray = this.getCookieByKey();
        this.$Message.success({content: '已保存布局：'+this.layoutName, duration: 10, closable: true});
        this.layoutName = '';
        this.layoutDesc = '';
      },
      getCookieKey(){
        return this.page + "_" + this.module + "_" + this.erp + "_" + this.user.type + "_" + this.user.dept3Id+"_";
      },
      setCookie(c_name,value,days){
        console.log("保存布局",c_name,value);

        var d = new Date();
        days = days == undefined ? 180 : days;
        d.setTime(d.getTime() + (days*24*60*60*1000));
        var expires = "expires="+d.toUTCString();

        //document.cookie = c_name + "=" +escape(JSON.stringify(value)) + ";" + expires;
        localStorage.setItem(c_name,JSON.stringify(value));
      },
      getCookieByKey(){//根据cookieKey模糊匹配布局
//        if (document.cookie.length>0) {
//          let cookieKey = this.getCookieKey();
//          let cookieArray = document.cookie.split(";");
//          if(cookieArray != undefined && cookieArray.length > 0){
//            let layouts = cookieArray.filter( cookie => {
//              return cookie.indexOf(cookieKey) != -1;
//            });
//            if(layouts != undefined && layouts.length > 0){
//              let layoutList = layouts.map(layout => {
//                let c_start = layout.indexOf("=");
//                if(c_start != -1){
//                  let c_end = layout.indexOf(";");
//                  if (c_end == -1 || c_end == undefined) c_end = layout.length;
//                  let condition = layout.substr(c_start+1,c_end);
//                  let key = layout.substr(0,c_start);
//                  return {key:key.trim(),condition:JSON.parse(unescape(condition))};
//                }
//                return null;
//              });
//              return layoutList;
//            }
//          }
//        }
        if(localStorage.length > 0){
          var storage = window.localStorage;
          let keys =  [];
          for(var i=0;i<storage.length;i++){
            let key = storage.key(i);
            //JSON.parse(storage.getItem(key))
            keys.push(key);
          }
          if(keys.length > 0){
            let cookieKey = this.getCookieKey();
            let layoutsKeys = keys.filter(key => {
              return key.indexOf(cookieKey) != -1;
            });
            if(layoutsKeys != undefined || layoutsKeys.length > 0){
              let layoutList = layoutsKeys.map(key => {
                return { key:key.trim(),condition:JSON.parse(storage.getItem(key)) };
              });
              return layoutList;
            }
          }
        }
        return null;
      },
      remove (cookieKey,layoutName) {
        console.log("删除cookie",cookieKey);
//        this.setCookie(cookieKey,null,-1);
        window.localStorage.removeItem(cookieKey);
        this.layoutArray = this.getCookieByKey();
        this.$Message.success({content: '已删除布局：'+layoutName, duration: 10, closable: true});
      },
      apply(cookieKey,layoutName) {
        console.log("应用cookie",cookieKey);
        let filters = this.layoutArray.filter(layout => {
          return layout.key == cookieKey;
        });
        if(filters != undefined && filters.length > 0){
          let applyLayout = filters[0].condition;
          console.log("应用的布局是:",applyLayout);
          this.$emit('applyLayout',applyLayout);
        }
      },
      getDefaultLayout(){//向父组件暴露获取默认布局方法
        this.initLayoutArr();
        if(this.layoutArray != undefined && this.layoutArray.length > 0){
          let defaultArr = this.layoutArray.filter(layout => {
            return layout.condition['isDefault'] == true;
          });
          if(defaultArr != undefined && defaultArr.length > 0){
            return defaultArr[0].condition;
          }
        }
        return undefined;
      },
      initLayoutArr(){
        this.layoutArray = this.getCookieByKey();
      }
    },
    computed:{
      ...mapGetters({
        erp:'getErp',
        user:'getUser',
      }),
      layoutData(){
        let layoutData = [];
        if(this.layoutArray != undefined && this.layoutArray.length > 0){
          this.layoutArray.forEach( layout => {
            let condition = layout.condition;
            let key = layout.key;
            let name = condition['name'];
            let desc = condition['desc'];
            let isDefault = condition['isDefault'];
            layoutData.push({key:key,name:name,desc:desc,isDefault:isDefault});
          });
        }
        return layoutData;
      }
    },
    mounted(){
//      let object = this.getCookieByKey();
//      this.layoutArray = this.getCookieByKey();
    },
    created(){
      this._bus.$on(this._CONST.E_USERINFO_CHANGE,this.initLayoutArr);
    }
  }
</script>
