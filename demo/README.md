# sps-ui

> sps-ui

## 说明

### 安装与启动
#### 安装
```
npm install
```
#### 启动

1.  先打包静态资源文件
具体配置在：webpack.dll.conf文件。 详细参考资料可见 https://segmentfault.com/a/1190000005969643
```
npm run dll
```

2.1 启动前端
此时没有启动本地node,则不能使用本地mock数据接口。
```
npm run dev
```

2.2 启动前端+启动node端
此时启动了本地node,如果够设置接口的 `isUseMockData`为true，则会使用本地mock数据。
```
npm run dev-server
```

### 打包

提供三种打包的配置，具体见 ./config/prod[*].js 

三种打包配置只在前端地址、后端地址有区别。


1. 打包给测试环境使用
```
npm run build-test
```
具体的配置项在：config/prod-test.env.js中修改

2. 打包给预发环境使用
```
npm run build-pre
```

3. 打包给生产环境使用
```
npm run build
```

# 代码风格建议


## vue的代码规范

[官方推荐](https://cn.vuejs.org/v2/style-guide/index.html)

要有自己的一套科学的，固定的代码风格。可以从官方推荐的风格的基础上再次编辑。

## 组件命名

### 基本要求
 - 单文件名使用大驼峰命名法。如：ItemList.vue
 - 单文件名与组件名保持一致。
 - 组件名中的单词尽量完整。ItemList.vue要比ItList.vue好
### 父子组件
 - 如果一个组件只在某个父组件的场景下有意义，这层关系应该体现在其名字上：子组件名字中带上父组件的信息。
  如:
    - Item.vue （父组件）
    - ItemButton.vue （子组件）
    - ItemInput.vue （子组件）

### 公共组件

- 公共组件加Common前缀。如：CommonButton.vue

### 单文件组件中顶级元素的顺序
```
<template>/* ... */</template>
<script>/* ... */</script>
<style>/* ... */</style>
```
### 组件中options的顺序

```
export default MyComponent{
    // 1. 输入参数
    props:{},
    components:{},
    
    // 2. 本地信息
    data:{},
    computed:{},
    
    // 3. 方法
    methods:{},
    
    // 4. 事件
    created(){},
    mounted(){},
    watch:{},
}
```

### props的命名

加前缀p。这样可以与data()中的数据项区别开。
例如： 
```
props:{
    pTitleName:{type:String,default:""}
}
```

### computed 的命名

加前缀c。这样可以与data()中的数据项区别开。
例如：
```
computed:{
    cTitle(){
        return this.title + "[" + this.pTitleName +"]"
    }
}
```
这样我们有三个与title相关的数据了：
- this.title : 在data()中的数据
- this.pTitleName： props中的数据
- this.cTitle： 计算属性


### methods的命名

可以把methods中的函数项分成两类：
- 事件响应函数:加`前缀h`。
- 其他

举个例子：页面上有个按钮，点击之后获取数据，然后加工数据，给本地数据项赋值。

```
<template>
<div>
    <button @click="hClick"></button>
</div>
</template>
<script>
    methods:{
        hClick(){
            API.GETXXXData().then(rs=>{
                
                this.initData(rs);
            })
        },
        initData(data){
            ....
            return ...;
        }
    }
</script>
```



### Mixin相关的命名

#### mixin文件名的命名格式为：mixin+名词.js。
如：
mixinTable.js

其中所有的设置项 统一加前缀`mx`。
- 如果是计算属性，则前缀是`mxc`
- 如果是props：

```
export default{
    props:{
        mxpTitleName:{type:String ,default:""}  
    },
    computed:{
        mxcTitle(){}  
    },
    methods:{
        mxTableMethod1(){
            
        },
    }
    
}

```

### 多个属性的组件应该分多行撰写。
```
<MyComponent
  foo="a"
  bar="b"
  baz="c"
/>
```

