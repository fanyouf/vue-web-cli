// 校验树节点不为空，为空不查询
import { mapMutations,mapGetters } from 'vuex';

export default {
  computed:{
    ...mapGetters({
      erp:'getErp',
      user:'getUser',
    }),
  },
  methods:{
    validateTreeData(){
      console.log("this.user",this.user);
      if(this.user.treeData == undefined || this.user.treeData.length == 0){
        this.$Notice.warning({
          title: '提醒',
          desc: '所选角色树节点为空!'
        });
        return false;
      }
      // this.$Notice.success({
      //   title: '提醒',
      //   desc: '所选角色树节点不为空!'
      // });
      return true;
    },
    validateUserInfo(showWarning){
      if(this.user && this.user.dept3Id != undefined && this.user.dept3Id != -1){
        return true;
      }
      if(showWarning){
        this.$Notice.warning({
          title: '提醒',
          desc: '您没有权限！'
        });
      }
      return false;
    }
  }
}
