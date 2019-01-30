<template>
  <div style="width: 100%">
    <item-sort
      :pitems="panelList"
      @itemSortChange="handlerItemSortChange" />

    <fixed-nav
      :pitems="panelList"
      :pCurPanelName="curPanelName"
      @gotoTop="scrollToTop"
      @gotoItem="scrollto" />

    <div class="panelList" ref="panels">
      <!-- <el-card class="box-card" v-for="o in 4" :key="o" :ref="'card'+o" :data-name="'card'+o">
          {{'内容 ' + o }}
      </el-card> -->
      <!-- 这里放置块级元素：
      （1）class是box-card
      （2）:data-name是卡片的名字 -->
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.card-box {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin: 5px;
}
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
<script>
import ItemSort from "./ItemSort";
import fixedNav from "./fixedNav";
let curTime = Date.now();
let timer = null;
export default {
  name: "App",
  components: {
    ItemSort,
    fixedNav
  },
  data() {
    return {
      panelList: [],
      curPanelName: "",
      isScrollByClick: false
    };
  },
  methods: {
    handlerScroll() {
      if (this.isScrollByClick) {
        return;
      }

      let panels = this.panelList
        .filter(item => item.visiable)
        .map(item => {
          return {
            visiable: item.visiable,
            name: item.name,
            panel: item.panel
          };
        });

      if (panels.length < 0) {
        return;
      }

      if (Date.now() - curTime > 500) {
        // 找到当前的面板,条件有两个：
        // - top值为正；
        // - top值最小;
        panels.forEach(item => {
          item.top = item.panel.getBoundingClientRect().top;
        });

        panels.sort((a, b) => {
          if (a.top < 0 && b.top < 0) {
            return -1;
          }
          if (a.top < 0 && b.top > 0) {
            return 1;
          }
          if (a.top > 0 && b.top < 0) {
            return -1;
          }
          if (a.top > 0 && b.top > 0) {
            return a.top - b.top;
          }
        });
        this.curPanelName = panels[0].name;
        curTime = Date.now();
        console.info("done.............", curTime, Date.now());
      }
    },
    scrollToTop() {
      this.scrollAnimationToY(0);
    },
    scrollAnimationToY(targetY) {
      this.isScrollByClick = true;
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(() => {
        const currentY =
          document.documentElement.scrollTop || document.body.scrollTop;
        let needScrollTop = targetY - currentY;
        if (Math.abs(needScrollTop) < 3) {
          window.scrollTo(0, targetY);
          clearInterval(timer);
          this.isScrollByClick = false;
        } else {
          let dt = needScrollTop / 5;
          let toY = currentY + dt;
          window.scrollTo(0, toY);
        }
      });
    },
    scrollto(panelName) {
      let children = [...this.$refs.panels.children];

      let rst = children.find(item => {
        return item.dataset.name == panelName;
      });
      console.info(panelName, rst.offsetTop);
      this.curPanelName = panelName;
      try {
        this.scrollAnimationToY(rst.offsetTop);
      } catch (e) {
        window.scrollTo(0, rst.offsetTop);
      }
      console.info(panelName, rst.offsetTop);
    },
    handlerItemSortChange(d) {
      let children = [...this.$refs.panels.children];
      d.forEach((item, index) => {
        let rst = children.find(d => {
          return d.dataset.name == item.name;
        });
        if (rst) {
          rst.style.order = index;
          rst.style.display = item.visiable ? "block" : "none";
        }
      });

      this.panelList = d;
    }
  },
  mounted() {
    let children = [...this.$refs.panels.children];

    children.forEach(item => {
      if (item.className == "card") {
        this.panelList.push({
          panel: item,
          name: item.dataset.name,
          visiable: true
        });
      }
    });
    if (this.panelList.length) {
      this.curPanelName = this.panelList[0].name;
    }

    window.addEventListener("scroll", this.handlerScroll);
  },
  beforeDestroy() {
    if (timer) {
      clearInterval(timer);
    }
    window.removeEventListener("scroll", this.handlerScroll);
  }
};
</script>

<style>
.panelList {
  display: flex;
  flex-direction: column;
}
/* 
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
}
.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
}

body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
} */
</style>
