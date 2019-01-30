<template lang="html">
  <div class="fixedNav" v-bind:style="style" v-if="list.length">
    <ul>
      <li v-for="(item,index) in list" v-bind:key="index"  v-bind:class="{'cur':pCurPanelName===item.name}" :title="item.name"  @click="click" :data-name="item.name">
        <span :data-name="item.name">{{item.name}}</span>
      </li>
      <li title="回顶部"  @click.stop="goTop"><span > ^ </span></li>
    </ul>
  </div>
</template>

<style scoped>
.fixedNav {
  position: fixed;
  right: 5px;
  bottom: 50%;
  transform: translateY(50%);
  background: rgba(255, 255, 255, 0.8);
  /* border-bottom: 1px solid #dedede; */
  outline: 1px solid #dedede;
  border-radius: 2px;
  z-index: 1000;
}
ul,
li {
  list-style: none;
}
li {
  background-color: #fff;
  padding: 5px;
  cursor: pointer;
  text-align: center;
  color: #666666;
  /* margin-left: 5px;
  margin-right: 5px; */
  border-bottom: 1px solid #dedede;
  width: 4em;
  height: 4em;
  display: flex;
}
li span {
  margin: auto;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
li:hover {
  background-color: #2d8cf0;
  color: #fff;
  font-weight: bold;
}
.cur {
  color: #fff;
  background-color: #2d8cf0;

  font-weight: bold;
}
</style>
<script>
export default {
  props: {
    pRight: {
      type: Number,
      default: 15
    },
    pitems: {
      type: Array,
      required: true
    },
    pCurPanelName: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      style: {
        right: this.pRight + "px"
      }
    };
  },
  computed: {
    list() {
      return this.pitems.filter(item => {
        return item.visiable;
      });
    }
  },
  methods: {
    click(e) {
      this.$emit("gotoItem", e.target.dataset.name || "");
    },
    goTop() {
      this.$emit("gotoTop");
    }
  }
};
</script>

<style lang="css">
</style>
