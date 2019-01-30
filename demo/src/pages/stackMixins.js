import { mapGetters, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapGetters('stack', ['getStack'])
  },
  methods: {
    ...mapMutations('stack', ['goBack', 'goPrev', 'addStack', 'initStack']),
    mxhStackBack(dataSetName='mxTabDataDetail') {
      this.goBack()
      console.info('后退按钮被点击：获取的值为', this.getStack)
      this[dataSetName] = this._utils.cloneObj(this.getStack.detail)
    },
    mxhStackPrev(dataSetName='mxTabDataDetail') {
      this.goPrev()
      console.info('前进按钮被点击：获取的值为', this.getStack)
      this[dataSetName] = this._utils.cloneObj(this.getStack.detail)
    },
    mxhStackInit(obj) {
      this.initStack(obj)
    },
    /**
     *
     * 数据变化了。要保存一份到stack中
     * @param {Array} obj 要保存的数据
     */
    mxhStackAdd(obj) {
      console.info('数据修改了，保存到stack中', obj)
      this.addStack(obj)
    }
  }
}
