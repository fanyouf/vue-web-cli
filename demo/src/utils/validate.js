class Validate {
  rs = []
  obj = {}
  constructor(obj) {
    this.obj = obj
  }
  beIn(propName, arr, tip) {
    this.noNull(propName, tip)
    let val = this.obj[propName]
    if (val === undefined) {
      console.error(propName, this.obj)
      return this
    }
    val = val.toUpperCase()
    if (!arr.includes(val)) {
      this.rs.push(`${tip}不合法[${val}]`)
    }
    return this
  }
  boolean(propName, tip) {
    let val = this.obj[propName]

    if (typeof val !== 'boolean') {
      this.rs.push(`${tip}类型错误`)
    }
    return this
  }
  mustBeTrue(propName, tip) {
    if (true === this.obj[propName]) {
      this.rs.push(`${tip}必须为真`)
    }
    return this
  }
  noNull(propName, tip) {
    let val = this.obj[propName]
    if (!val) {
      this.rs.push(`${tip}不能为空！`)
    } else {
      if (Array.isArray(val)) {
        if (val.length === 0) {
          this.rs.push(`${tip}不能为空！`)
        }
      }
    }
    return this
  }

  end() {
    if (this.rs.length) {
      console.info(this.obj)
      return this.rs.join('<br>')
    }
    return true
  }
}

const func = obj => {
  return new Validate(obj)
}

export default func
