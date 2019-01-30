//文件：/server/server.js
var express = require('express')
var router = express.Router()
var request = require('request')
var cors = require('cors')

var app = express()
var saleTarget = require('./saleTarget.js') //模块化的路由配置文件
var salePlan = require('./salePlan.js')
var common = require('./common.js')
var saleReached = require('./saleReached.js')
var anthority = require('./authority.js')
var saleTree = require('./saleTree.js')
var stockCover = require('./stockCover.js')
var targetVersion = require('./targetVersion.js')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false })) // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()) // for parsing application/json
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart()

//app.use(cors())
//
//
// 让它来跨域吧
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://sps.ls.jd.com:8080') // http://sps.ls.jd.com:8080 http://localhost:8080
  res.header('Access-Control-Allow-Credentials', true)
  res.header(
    'Access-Control-Allow-Headers',
    'access-control-allow-origin,content-type,x-requested-with,Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild'
  )
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
  if (req.method == 'OPTIONS') {
    res.send(200) /*让options请求快速返回*/
  } else {
    next()
  }
})

app.get('/', (req, res) => {
  res.end('这里是数据服务器')
})

app.use('/saleTargetVersion', targetVersion) // 使用路由
app.use('/saleTarget', saleTarget) // 使用路由
app.use('/salePlan', salePlan)
app.use('/common', common)
app.use('/saleReached', saleReached)
app.use('/saleTree', saleTree)
app.use('/stockCover', stockCover)

app.listen(8988, function() {
  console.log('node server is  listening on port 8988!')
})
