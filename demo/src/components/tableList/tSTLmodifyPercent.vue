<template>
    <div>
        <el-table
            :data="percentData"
            width="100%"
        >
            <el-table-column
            key="id"
            :label="pEditProp"
            label-class-name="drag"
            >
            <template slot-scope="scope">
                <div v-if="scope.$index === 0">
                    <span>{{scope.row.val | int}}</span>
                </div>
                <div v-else-if="scope.$index==1">
                    <span>100%</span>
                </div>
                <div v-else>
                    <div v-if="scope.row.dataType ==='percent'&&scope.row.editable" class="" >
                        <input
                        style="width:40px;height:15px;"
                        v-mustBenumber="'nonumber'"
                        v-model="scope.row.val"
                        >
                        </input>
                        <label style="">%</label>
                    </div>
                <div v-else>
                    {{scope.row.val | percent}}
                    </div>
                </div>
                
            </template>
            </el-table-column>
        </el-table>
        <div class="flexa stlbtns">
            <Button size="small" style="margin:2px;padding:2px;" @click='hCompute' title="计算"><Icon type="ios-calculator-outline" /></Button>
            <Button size="small" style="margin:2px;padding:2px;" @click='hSavePercentModify' icon="checkmark-round" title="应用"><Icon type="ios-checkmark-circle-outline" /></Button>
            <Button size="small" style="margin:2px;padding:2px;" @click="hCancel" icon="close-round" title="取消"><Icon type="ios-close-circle-outline" /></Button>
        </div>
    </div>
</template>


<script>
export default {
    props:{
        pPercentData:{
            type:Array,
            required:true
        },
        pEditProp:{
            type:String,
            required:true
        }
    },
    data(){
        return {
            percentData:this.pPercentData
        }
    },
    methods:{
        hCancel() {
            this.isPercentTableComputed = false;
            this.$emit("modifyPercentCancel")
        },

    
        hCompute() {
            this.isPercentTableComputed = false;

            //共一列数据，第一行是总值 ，其它列是比例值。
            let totalPercent = 0,
                staticPercent = 0,
                percentToReset = 0, // 用于分配的比例
                willChangeSum = 0,
                willChangeNumber = 0, // 要被修改的元素的个数
                currentPercentSum = 0;

            this.percentData.forEach(item => {
                // 如果用户没有录入值，则表示这个值需要被自动计算
                if (item.editable) {
                    if (item.dataType === "percent") {
                        if (item.val.toString().trim() === "") {
                            willChangeSum += item.backVal * 1;
                            willChangeNumber++;
                        } else {
                        // 表示用户键入了值，以用户的值为准
                            staticPercent += item.val * 1;
                        }
                        currentPercentSum += item.val * 1;
                    }
                }
            });
            console.info(`当前用户录入的比例${currentPercentSum}`);
            if (currentPercentSum - 100 > 0.01) {
                this._error("总比例[" + currentPercentSum + "]之和>100%，请核实。");
                return false;
            }

            if (willChangeNumber === 0 && Math.abs(currentPercentSum - 100) > 0.05) {
                this._error("所填入的总比例不等于100%，请核实。");
                return false;
            }

            percentToReset = 100 - staticPercent; //这是余下待分配的值

            if (willChangeNumber > 0 && percentToReset < 0) {
                this._error("所填入的总比例已经>100%，请核实。");
                return false;
            }

            this.percentData.forEach(item => {
                if (item.dataType === "percent" && item.editable) {
                    if (item.val.toString().trim() === "") {
                        if (willChangeSum === 0) {
                            item.val = percentToReset / willChangeNumber;
                        } else {
                            item.val = (item.backVal / willChangeSum) * percentToReset;
                        }
                    }
                }
            });
            this.isPercentTableComputed = true;

            console.info("再拆分完成....", this.percentData);
            return true;
        },
        
        /**
         * 保存渗透率修改
         */
        hSavePercentModify() {
            if (false === this.hCompute()) {
                return;
            }
            
            console.info(this.percentData)
            this.$emit("savePercentListModify",{percentData:this.percentData,prop:this.pEditProp});
        },
    },
    watch:{
        pPercentData(newData,oldData){
            this.percentData = newData;

            this.percentData.forEach((item,index)=>{
                item.backVal = item.val;
                if(index === 0){
                    item.editable =false;
                }
                if(item.dataType === "percent" && item.editable){
                    item.val = '';
                }
                
            })

            console.info("要调整的百分比值是：", this.percentData);

        }
    }
}
</script>

