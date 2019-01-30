<template>
  <div style="padding:20px;">
    <h3>目标查看</h3>
    <el-table v-loading="loading" :data="data" height="200" stripe border="">
      <el-table-column prop="date" label="日期" width="180"></el-table-column>
      <el-table-column prop="versionType" label="目标类型">
        <template slot-scope="scope">{{mapName(scope.row.versionType)}}</template>
      </el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="creater" label="作者"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button @click.native.prevent="viewDetail(scope.$index, data)" type="text" size="small">查看</el-button>
          <el-button @click.native.prevent="handleEditremark(scope.$index, data)" type="text" size="small">编辑备注</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Modal title="编辑备注信息" v-model="editRow.isEditing" @on-ok="updateRemark">
      <p>
        <Input v-model="editRow.remark" />
      </p>
    </Modal>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
const _ = require('lodash')

export default {
  created() {
    this.setPageType(this._CONST.PAGETYPE_TARGET_VIEW)
    if (this.getUser.dept3Id != -1) this.query()
    //        setTimeout(()=>{
    //          this.setPageType(this._CONST.PAGETYPE_TARGET_VIEW)
    //          this.query();
    //        },1000)
  },
  computed: {
    ...mapGetters(['getUser'])
  },
  data() {
    return {
      loading: false,
      data: [],
      currentPage: 12,
      editRow: {
        remark: '',
        isEditing: false,
        id: '',
        index: -1,
        type: ''
      }
    }
  },
  methods: {
    ...mapMutations('cond', ['setPageType']),
    mapName(name) {
      name = name.toString().toUpperCase()
      return this._CONST.VERSIOIN_TYPE_VALUE_MAP[name] || '未知'
    },
    query() {
      // this.loading = true;
      this._api.saleTargetVersion.listVersion({ roleType: this.getUser.type, dept3Id: this.getUser.dept3Id }, this, 'loading').then(
        this._do('查询版本数据', d => {
          this.data = d
        })
      )
    },
    viewDetail(index, data) {
      this.$router.push({ path: 'viewVersionDetail/' + data[index]['versionType'] })
    },
    updateRemark() {
      console.info(`把${this.data[this.editRow.index].remark}改成${this.editRow.remark}`)

      let versionType = this.editRow.type //CHALLENGE|ASSESSMENT|DRAFT//挑战|考核|草稿
      this._api.saleTargetVersion
        .updateVersion(
          {
            dept3Id: this.getUser.dept3Id,
            roleType: this.getUser.type,
            versionType,
            remark: this.editRow.remark.trim()
          },
          this,
          'loading'
        )
        .then(
          this._do('编辑版本信息', () => {
            this.query()
          })
        )
    },
    handleEditremark(index, data) {
      console.info(index, data)
      this.editRow.type = data[index]['versionType']
      this.editRow.remark = data[index]['remark']
      this.editRow.isEditing = true
      this.editRow.index = index
      this.editRow.id = data[index]['id']
    }
  },
  watch: {
    getUser: function(val) {
      this.query()
    }
  }
}
</script>
