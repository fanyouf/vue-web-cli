/**
 * @mixin
 */
import { mapMutations } from 'vuex'
export default {
  data() {
    return {
      mxYearMonth: 2018,
      mxDiffDataColumns: [],
      mxDiffDataDetail: [],
      mxDiffLoading: false,

      mxTabDataTotal: [],
      mxTabDataColumnsDimension: [],
      mxTabDataColumns:[],
      mxTabDataDetail: [],
      mxLoading: false
    }
  },

  methods: {
    ...mapMutations('stack', ['goBack', 'goPrev', 'addStack', 'initStack'])
  },
  props: {
    pValidDecimalPlacesForNumber: { type: Number, default: 1 },
    pVisiableTableKeys: { type: Array },
    pMoneyUnit: { type: String },
    pIsEdit: { type: Boolean, default: false },
    pDataType: { type: String },
    pCondition: { type: Object, required: true }
  }
}
