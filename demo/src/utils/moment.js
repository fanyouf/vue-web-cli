const moment = require('moment');
function getYearWeek(date){
  let week = moment(date).week();
  let year = moment(date).weekYear();
  week = week < 10 ? "0" + week : week;
  return year + "-" + week;
}
function getYearWeekAddOne(date){//考虑到后端周的取值情况 用前端的当前逻辑周+1
  let week = moment(date).week();
  let year = moment(date).weekYear();
  week=week+1;
  week = week < 10 ? "0" + week : week;
  return year + "-" + week;
}
function getYearQuarter(date){
  let quarter =moment().quarter();
  let year =moment().year()
  return year+"-0"+quarter;
}

export default{
  getPrevMonth(){
    return moment().subtract(1,'month').format('YYYY-MM')
  },
  getYearWeek,
  getYearWeekAddOne,
  getYearQuarter,
  getNow(){
    return moment().format("YYYY-MM-DD-HH-mm-SS")
  },
  getCurrentTimeDimension(date=new Date()){  //获取按天 周 月 季 的维度
    let currentYearMonth=moment().subtract(0,'month').format('YYYY-MM');
    let currentYearWeek= getYearWeekAddOne(date);
    let currentYearDay=moment().format("YYYY-MM-DD");
    let currentYearQuarter=getYearQuarter(date);
    return [currentYearDay,currentYearWeek,currentYearMonth,currentYearQuarter]
  },
  getStartAndEndUntilNow(type = 'M'){
    if(type == 'M'){
      return {
        start:moment(moment().year()+'-01').format("YYYY-MM"),
        end:moment(moment().year()+'-' +(moment().month()+1)).format("YYYY-MM")
      }
    } else if(type == 'W'){
      return {
        start:moment().year()+'-01',
        end:moment().format("YYYY-WW")
      }
    }else if(type == 'D'){
      return {
        start:moment().year()+'-01-01',
        end:moment().format("YYYY-MM-DD")
      }
    }else {
      throw new Error("getStartAndEndUntilNow目前不支持类型:"+type)
      return ;
    }
  },
  createDateArray(start,end){
    var start = moment(start);
    var end = moment(end);
    let arr = []
    while(end-start > 0){
        arr.push(start.format("YYYY-MM-DD"))
        start.add(1,'days');
    }
    return arr
  },
  dateRangeAdpter(start,end,type){
    if(type == "D"){
      start = moment(start).startOf('month').format("YYYY-MM-DD")
      end = moment(end).endOf('month').format("YYYY-MM-DD")
    }
    else if(type =="W"){
      start = moment(start).startOf('month').toDate()
      end = moment(end).endOf('month').toDate()
      //格式化ww为周一为一周起始，WW为周日为一周起始
      start = getYearWeek(start);
      end = getYearWeek(end);
    }
    else if(type == "Q"){
      start = moment(start).startOf('month').format("YYYY-0Q")
      end = moment(end).endOf('month').format("YYYY-0Q")
    }
    else if(type == "M"){
      start = moment(start).startOf('month').format("YYYY-MM")
      end = moment(end).endOf('month').format("YYYY-MM")
    }
    return {start,end}
  },
}
