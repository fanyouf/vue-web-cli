<template>
  <div style="float:right">
    <Poptip
      placement="bottom-end"
      trigger="hover"
      v-model="isShow">
      <!-- <Button>布局设置</Button>  -->
      <Icon style="cursor:pointer" type="logo-buffer" size="24" title="布局设置" /> 
      <!-- <svg class="icon" aria-hidden="true" title="布局设置">
        <use xlink:href="#icon-shezhi"  title="布局设置"></use>
      </svg> -->
      <div slot="content" title="拖动排序">
        <draggable v-model="items" @start="drag=true" @end="handleDragEnd">
        
          <div class="dragItem" v-for="(element,index) in items" :key="index" >
            <Tag> <i class='el-icon-rank'></i>
              <Checkbox v-model="element.visiable" @on-change="changeVisiable"> {{element.name}}</Checkbox>
            </Tag>
          </div>
        </draggable>
      </div>
    </Poptip>
  </div>
</template>

<script>
import draggable from "vuedraggable";
export default {
  props: {
    pitems: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  components: {
    draggable
  },
  data: function() {
    return {
      items: this.pitems,
      isShow: false
    };
  },
  methods: {
    handleDragEnd() {
      // drag=false
      this.$emit("itemSortChange", [...this.items]);
    },
    changeVisiable() {
      // handlerItemSortChange
      this.$emit("itemSortChange", [...this.items]);
    },
    save() {
      this.isShow = false;
      this.$emit("itemSortChange", [...this.items]);
    }
  }
};
</script>

<style lang="css">
.dragItem {
  padding: 2px;
}
.list-complete-enter,
.list-complete-leave-active {
  opacity: 0;
}
.sortable-ghost .el-tag {
  color: red;
}
</style>
