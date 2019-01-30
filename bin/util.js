
const fs = require('fs');

function writeJson(filePath,{name,description}){
    let data2 = fs.readFileSync(filePath, 'utf8');
    
    data2 = JSON.parse(data2);
    data2.name = name;
    data2.description = description;
    let Str_ans = JSON.stringify(data2,null, 4);
    fs.writeFileSync(filePath, Str_ans, 'utf8');
}

function _copy(src, dist) {
      
    let paths = fs.readdirSync(src);
    paths.forEach(function(path) {
        var _src = src + '/' +path;
        var _dist = dist + '/' +path;
        let stat = fs.statSync(_src);
        // console.info(_src,_dist);
                // 判断是文件还是目录
        if(stat.isFile()) {
            fs.writeFileSync(_dist, fs.readFileSync(_src));
        } else if(stat.isDirectory()) {
        // 当是目录是，递归复制
            copyDir(_src, _dist)
        }
    })
  
}

function copyDir(src, dist) {
    // debugger;
    // let stat = fs.statSync(dist);
    
    fs.mkdirSync(dist);
    // console.info("mkdirSync",src,dist)
    _copy(src, dist);
  }
  exports.copyDir = copyDir
  exports.writeJson = writeJson

