var localStorage = window.localStorage;
function Storage(project,module,variables=[]) {
  var key_prefix = project + "_" + ( module  ? "" : module+"_" );
  var rs = {};
  variables.forEach(variable => {
    if(typeof(variable) === 'string'){
      let first = variable.substr(0,1).toUpperCase();
      let end = variable.substr(1,variable.length);
      let firstUpper = first+end;
      let key = key_prefix + variable;
      let getMethod = "get"+firstUpper;
      rs[getMethod] = () => {
        let obj = localStorage.getItem(key);
        return JSON.parse(obj);
      }
      let setMethod = "set"+firstUpper;
      rs[setMethod] = (obj) => {
        localStorage.setItem(key,JSON.stringify(obj));
      }
      let removeMethod = "remove"+firstUpper;
      rs[removeMethod] = () => {
        return localStorage.removeItem(key);
      }
    }
  });
  return rs;
}
//
// var storage = new Storage("sps","plan",['pageSize','dataList']);
// console.log(storage)
// storage.setPageSize(10);
// var x = storage.getPageSize();
// console.log(x);
// storage.setDataList({aa:100,ccc:"zzz",dbd:['12','13']});
// var y = storage.getDataList();
// console.log(y);
