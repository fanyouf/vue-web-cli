#!/usr/bin/env node
var program = require('commander');
const inquirer = require('inquirer')
const path = require('path');
const fs = require('fs');

const { copyDir,writeJson } = require("./util")

// 定义版本和参数选项
program
  .version('1.1.0', '-v, --version')
  .option('-create, --c', '创建项目')

// 必须在.parse()之前，因为node的emit()是即时的
program.on('--help', function(){
  console.log('this is an example:');
  console.log('      cli-web create projectName');
});

program
    .command('create')
    .alias('c')
    .description('创建新的项目')
    .option('-a, --name [moduleName]', '项目名称')
    .action(() => {
        var promps = [{
            type: 'input',
            name: 'name',
            message: '请输入项目名称',
            validate: function (input){
                if(!input) {
                    return '不能为空'
                }
                return true
            }
          },{
            type: 'input',
            name: 'description',
            message: '请输入项目描述'}
        ]
        inquirer.prompt(promps).then(function (answers) {
            console.info(answers);
            let {name,description} =answers
            let url = path.resolve('./');
            let sourUrl = path.resolve(__dirname, '..')
            sourUrl = path.join(sourUrl,'demo')
            let curUrl =  path.join(url,name); 
           
            console.log('文件夹创建完毕....',curUrl)
            console.log('资源文件夹....',sourUrl);
            copyDir(sourUrl, curUrl,(e)=>{

                console.log('复制资源时错误....');
                console.log(e);
                
            })
            writeJson(path.join(curUrl,"package.json"),{name,description})

            console.log('项目创建完毕....');
            console.log(`  cd ${name}`)
            console.log("  npm install")
            console.log("  阅读 README.md 得到更多内容")

        })
    })
    program.parse(process.argv);
