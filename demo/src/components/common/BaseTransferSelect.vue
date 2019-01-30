<template>
<Poptip v-model="visible">
        <a :title="showInfo" @click.prevent="visible = true">{{pTipInfo}}</a>
        <div slot="content">
            <Transfer
                :titles="pTitle"
                :data="pDataSource"
                :target-keys="targetKeys"
                :render-format="render1"
                @on-change="handleChange"></Transfer>
            <p style="margin-top:5px;float:right;">
                <Button size="small" @click="visible=false">取消</Button> &nbsp;&nbsp;&nbsp;&nbsp;
                <Button size="small" @click="ok" type="primary">确定</Button>
            </p>
        </div>
    </Poptip>
</template>
<script>
    export default {
        props:{
            pTipInfo:{type:String,default:"布局设置"},
            pTitle:{type:Array,default:()=>{return ['可选字段','显示字段']}},
            pDataSource:{type:Array,default:()=>{
                return [
                    {label:"同期销售进度",key:"TQXSJD"},
                    {label:"实际GMV",key:"SJGMV"},
                    {label:"销售目标",key:"XSMB"},
                    {label:"目标实际达成率(MTD)",key:"MBDCL"},
                    {label:"计划合计",key:"JHHJ"},
                    {label:"计划实际达成率",key:"JHDCL"}]
            }},
            value:{type:Array,default:()=>[]}
        },
        data () {
            return {
                visible:false,
                targetKeys:this.value
            }
        },
        computed:{
            showInfo(){
                let str = this.pDataSource.filter(item => {
                    return this.targetKeys.includes(item.key)
                }).map(item=>item.label).join(",")
                return this.pTipInfo + " 已选:"+ str
            }
        },
        methods: {
            ok(){
                this.$emit("input",this.targetKeys);
                this.visible = false;
            },
            render1 (item) {
                return item.label;
            },
            handleChange (newTargetKeys, direction, moveKeys) {
                // console.log(newTargetKeys);
                // console.log(direction);
                // console.log(moveKeys);
                this.targetKeys = newTargetKeys;
            }
        },
        watch:{
            value:{
                handler(newval){
                    this.targetKeys = newval
                },
                immediate:true
            }
        }
    }
</script>


