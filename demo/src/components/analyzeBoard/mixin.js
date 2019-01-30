export default {
  methods:{
    mixinGetHandlerMap(fName,type){
      let handler = null;
      if(type.toLowerCase().indexOf('target') > -1){
        handler = this._api.saleTarget[fName];
      }else if(type.toLowerCase().indexOf('plan') > -1){
        handler = this._api.salePlan[fName];
      }
      else{
        throw new Error("getHandlerMap设置api错误：没有合法的pageType,当前的pageType是"+type)
      }
      return handler
    }
  }
}
