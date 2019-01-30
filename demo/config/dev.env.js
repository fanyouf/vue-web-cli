'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  SER_URL: '"http://sps.ls.jd.com:1601/sps"',
  FRONT_URL: '"http://test.ssa.jd.com/sso/login?ReturnUrl=http://sps.ls.jd.com:8080"'
})
