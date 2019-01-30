'use strict'
//打包给预发环境使用
// sps2sever-sps2sever.spsserver.svc.hcyf.n.jd.local
// sps-service.jd.com
module.exports = {
  NODE_ENV: '"production-pre"',
  SER_URL: '"http://spsyu-service.jd.com/sps"',
  FRONT_URL: '"http://ssa.jd.com/sso/login?ReturnUrl=http://spsyu.jd.com"'
}
