module.exports = {
  // "extends": "standard",
  "parser": "babel-eslint",
  rules: {
    'no-var': 'error', //用let/const代替var
    'no-multiple-empty-lines': 'error', // 不允许多个空行
    'eqeqeq': 'error', // 使用 === 和 !== 代替 == 和 !=
  }
};
