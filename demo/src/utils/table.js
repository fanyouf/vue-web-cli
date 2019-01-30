export default {
  //  页面导入明细数据，并且更新整个表格。
  // 在导入数据功能中使用
  UpdateCellDataFromExcelJSON(table, colOrderList, sourceTable) {
    let counter = 0,
      obj = null,
      keys = [],
      rs = []
    const equalFun = (function(cols) {
      return (detailItem, excelItem) => {
        let arr = []
        cols.forEach((colName, index) => {
          if (colName === 'saler') {
            arr.push(detailItem['col' + (index + 1)].id === excelItem['采销ERP'])
          } else if (colName === 'brand') {
            arr.push(detailItem['col' + (index + 1)].id === excelItem['品牌ID'])
          } else if (colName.includes('cate')) {
            let levelIndex = colName.substr(4, 1) // 1, 2, 3
            let colNameInExcel = ''
            if (levelIndex === '1') {
              colNameInExcel = '一级品类ID'
            } else if (levelIndex === '2') {
              colNameInExcel = '二级品类ID'
            } else if (levelIndex === '3') {
              colNameInExcel = '三级品类ID'
            }

            arr.push(detailItem['col' + (index + 1)].id === excelItem[colNameInExcel])
          }
        })

        return arr.every(item => item)
      }
    })(colOrderList)

    try {
      table.forEach(item => {
        obj = sourceTable.find(it => equalFun(it, item))
        if (obj) {
          keys = Object.keys(item)
          obj.data.forEach(it => {
            if (keys.includes(it.dateDimension)) {
              if (it.val * 1 !== item[it.dateDimension] * 1) {
                it.val = item[it.dateDimension] * 1
                counter++
              }
            }
          })
        }
      })
      this._info(`导入成功，总更新${counter}条数据`)
    } catch (e) {
      this._info(`导入失败！`)
      console.info(e)
    }
    return rs
  }
}
