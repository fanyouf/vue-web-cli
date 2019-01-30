<template>
  <el-table-column :prop="col.prop"
    :label="col.label"
    align="left">
    <template slot-scope="scope">
        <span :title="scope.row[col.prop]" >{{ scope.row[col.prop] }}</span>
      </template>

    <template v-if="col.children">
      <my-column v-for="(item, index) in col.children"
        :key="item.prop"
        :col="item"></my-column>
    </template>

  </el-table-column>
</template>

<script>
export default {
  name: "MyColumn",
  props: {
    col: {
      type: Object
    }
  }
};
</script>
<style scoped>
</style>
