<template>
  <div class="page">
    <div class="card">
      <div>
        <Input v-model="dept3Id" style="width: 200px;" placeholder="请输入三级部门id"/>

    <BaseMultiSelector
      :isSelectNone="false"
      v-model="dataDimension"
    >
    </BaseMultiSelector>


      品类类型

          <RadioGroup v-model="cateLevel">
            <Radio label="cate1">
                <span>一级品类</span>
            </Radio>
            <Radio label="cate2">
                <span>二级品类</span>
            </Radio>
            <Radio label="cate3">
                <span>三级品类</span>
            </Radio>
          </RadioGroup>
        <Button type="primary" @click="download">下载</Button>
      </div>

      <div style="padding-top: 20px;">
        <Upload style="display: inline-block"
                type="drag"
                :before-upload="handleUpload"
                action="//jsonplaceholder.typicode.com/posts/">
          <div style="padding: 20px 0;width:400px;">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
            <p>点击或拖拽上传</p>
          </div>
        </Upload>
        <div v-if="file !== null">
          Upload file: {{ file.name }}
          <Button type="success" @click="upload" :loading="loadingStatus">{{ loadingStatus ? '上传中' : '确认上传' }}</Button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
import { historyUpload as Api } from '@/api/index'
import BaseMultiSelector from '@/components/common/BaseMultiSelector'

export default {
  components: {
    BaseMultiSelector
  },
  data() {
    return {
      cateLevel: 'cate3', //下载维度
      dataDimension: [{ value: 'cate', label: '品类', checked: false }, { value: 'brand', label: '品牌', checked: true }, { value: 'saler', label: '采销', checked: false }],

      disabled: true,
      file: null,
      loadingStatus: false,
      dept3Id: ''
    }
  },
  methods: {
    syncDisabled() {
      this.disabled = false
    },
    download() {
      console.log('下载excel')
      if (this.dept3Id == null || this.dept3Id == '') {
        this.$Message.error({ content: '三级部门id呢', duration: 10, closable: true })
        return
      }
      let param = this.requestParam
      console.log(param)
      Api.downloadSupplementTemplate(param).then(rs => {
        console.log('下载结果     ' + rs)
      })
    },
    handleUpload(file) {
      this.file = file
      return false
    },
    upload() {
      this.loadingStatus = true
      console.log('file', this.file)
      let param = this.requestParam
      param.file = this.file
      Api.uploadSupplement(param)
        .then(rs => {
          console.log('上传结果', rs)
          this.file = null
          this.loadingStatus = false
          if (rs.success == true) {
            this.$Message.success({ content: '上传成功', duration: 10, closable: true })
          } else {
            this.$Message.error({ content: '上传失败:' + rs.message, duration: 10, closable: true })
          }
        })
        .catch(error => {
          this.file = null
          this.loadingStatus = false
          this.$Message.error({ content: '失败:' + error, duration: 10, closable: true })
        })
    }
  },
  computed: {
    ...mapGetters({
      erp: 'getErp',
      user: 'getUser'
    }),
    dataDimensionList() {
      let rs = []
      this.dataDimension.forEach(item => {
        if (item.checked) {
          if (item.value === 'cate') {
            rs.push(this.cateLevel)
          } else {
            rs.push(item.value)
          }
        }
      })
      return rs
    },
    requestParam() {
      let param = {
        dept3Id: this.dept3Id,
        dataDimensionList: this.dataDimensionList
      }
      return param
    }
  },
  created() {
    this._bus.$on(this._CONST.E_USERINFO_CHANGE, this.syncDisabled)
  },
  beforeDestroy() {
    this._bus.$off(this._CONST.E_USERINFO_CHANGE, this.syncDisabled)
  }
}
</script>
