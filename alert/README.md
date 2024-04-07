> 感谢您使用alert插件，本插件由【小莫唐尼】提供，您可以任意修改！
> 
> 说明：本插件为原生js插件，不依赖任何第三方脚本，源码开放可放心使用。

## 插件预览图

![截图](attachment:a809684b49b55989980d3aacf1df74d2)

## 开始使用

### 第一步：下载并引用 样式和脚本

##### 1.引用css样式

```html
  <!-- 基础样式：必须 -->
  <!-- <link rel="stylesheet" href="./alert/css/alert.css"> -->
  <link rel="stylesheet" href="./alert/css/alert.min.css">
  <!-- 动画支持，非必须：animate属性 -->
  <!-- <link rel="stylesheet" href="./alert/css/alert.ani.css"> -->
  <link rel="stylesheet" href="./alert/css/alert.ani.min.css">
```

##### 2.引用js

```html
<!-- <script src="./alert/js/alert.js"></script> -->
<script src="./alert/js/alert.min.js"></script>
```

### 第二步：初始化插件

以下为简单的示例，您可以往下查看所有的配置项，或者查看插件的README.md文档

```html
<script> 
      const tzAlert = new TzAlert({
            center: true, // 内容居中 
            position:'top',// 位置
            animate:'zoom-in',
            title: {
            
                html: '标题',
                color: '#ff80ab',
                fontSize: '18px'
            }, 
            mask: {
                use: true,
                background: 'rgba(0,0,0,.6)'
            },
            tips: {
                html: '点击内容部分即可复制'
            },
            content: {
                html: '我是一段文字，你来复制我啊！！！这里也支持html内容'
            },
            onEvents: function (e) {
                let ctx = e.ctx, cancel = e.cancel, confirm = e.confirm;
                console.log('监听了内部的按钮事件')
                if (cancel) {
                    // tzAlert.close(); // 调用关闭方式1
                    ctx.close();      // 调用方式2
                    console.log('点击了取消按钮');
                }
                else if (confirm) {
                    console.log('点击了确定按钮')
                }
            },
            onMounted: function () {
                console.log('执行我吧')
            }
        });
        tzAlert.open(); // 初始化显示(方式2)
    </script>
```

## 插件配置项

|    参数名     | 参数类型 | 是否必填 |            默认值            |                                                                                                                                                                                                                                                                说明                                                                                                                                                                                                                                                                |
| :-----------: | :------: | :------: | :--------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|     width     |  string  |    是    |            460px             |                                                                                                                                                                                                                                                      弹窗的宽度，必须是px单位                                                                                                                                                                                                                                                      |
|      top      |  string  |    是    |             20px             |                                                                                                                                                                                                                                          距离顶部的距离，可以使用任意css单位，推荐使用px                                                                                                                                                                                                                                           |
|    radius     |  string  |    是    |             6px              |                                                                                                                                                                                                                                                      弹窗的圆角，必须存在单位                                                                                                                                                                                                                                                      |
|    shadow     |  string  |    是    | '0 2px 10px rgba(0,0,0,0.2)' |                                                                                                                                                                                                                                                             弹窗的阴影                                                                                                                                                                                                                                                             |
|    center     | boolean  |    是    |            false             |                                                                                                                                                                                                                                     内容是否居中显示，如标题，tips提示，默认的确认和取消按钮等                                                                                                                                                                                                                                     |
|    useDrop    | boolean  |    是    |             true             |                                                                                                                                                                                                                                           启用拖拽效果，启用后点击弹窗的标题部分即可拖拽                                                                                                                                                                                                                                           |
| useMaskClose  | boolean  |    是    |             true             |                                                                                                                                                                                                                                               点击遮罩层关闭弹窗，前提是启用了遮罩层                                                                                                                                                                                                                                               |
|  useInitShow  | boolean  |    是    |            false             |                                                                                                                                                                                                                                  是否在初始化完成的时候就直接显示弹窗，此时不需要额外调用open方法                                                                                                                                                                                                                                  |
|  useEscClose  | boolean  |    是    |            false             |                                                                                                                                                                                                                                                    是否允许使用`esc`键关闭弹窗                                                                                                                                                                                                                                                     |
| useLockScroll | boolean  |    是    |            false             |                                                                                                                                                                                                                                                是否在弹窗打开的时候锁定页面的滚动条                                                                                                                                                                                                                                                |
|   position    |  string  |    是    |            “top”             |                                                                                                                                                           弹窗的位置，可选值：<br/>`center`=居中<br/>` left`=左边 <br/>`left-top`=左上角 <br/>`left-bottom`=左下角<br/>`top`=顶部 <br/>`right-top`=右上角 <br/>`right`=右边<br/>`right-bottom`=右下角 <br/>`bottom=`底部                                                                                                                                                           |
|    animate    |  string  |    否    |             “ ”              |                                                                                                                                                                                                                                   弹窗动画，可选值：`zoom-in`、`left`、`top`、`right`、`bottom`                                                                                                                                                                                                                                    |
| animateSpeed  |  string  |    否    |             slow             |                                                                                                                                                                                                                                       动画的速度，暂时支持可选： `fast` = 快速  `slow`=正常                                                                                                                                                                                                                                        |
|     copy      |  object  |    是    |       查看下方copy属性       |                                                                                                                                                                                                       对内部`复制事件`的配置，具体的配置项请看下方的`copy`配置项，复制功能仅能对以下的`content`配置项中传入的`html`参数内容                                                                                                                                                                                                        |
|    confirm    |  object  |    是    |       查看下方copy属性       |                                                                                                                                                                                                                                     对`确定按钮`的配置，具体的配置项请看下方的`confirm`配置项                                                                                                                                                                                                                                      |
|    cancel     |  object  |    是    |       查看下方copy属性       |                                                                                                                                                                                                                                      对`取消按钮`的配置，具体的配置项请看下方的`cancel`配置项                                                                                                                                                                                                                                      |
|     mask      |  object  |    是    |       查看下方copy属性       |                                                                                                                                                                                                                                        对`遮罩层`的配置，具体的配置项请看下方的`mask`配置项                                                                                                                                                                                                                                        |
|     title     |  object  |    是    |       查看下方copy属性       |                                                                                                                                                                                                                                      对`弹窗标题`的配置，具体的配置项请看下方的`title`配置项                                                                                                                                                                                                                                       |
|    content    |  object  |    是    |       查看下方copy属性       |                                                                                                                                                                                                                                     对`弹窗内容`的配置，具体的配置项请看下方的`content`配置项                                                                                                                                                                                                                                      |
|     tips      |  object  |    是    |       查看下方copy属性       |                                                                                                                                                                                                                                       对`提示信息`的配置，具体的配置项请看下方的`tips`配置项                                                                                                                                                                                                                                       |
|    bottom     |  object  |    是    |       查看下方copy属性       |                                                                                                                                                                                                                                      对`弹窗底部`的配置，具体的配置项请看下方的`bottom`配置项                                                                                                                                                                                                                                      |
|    onClose    | function |    否    |             null             |                                                                                                                                                                                                                                                            监听关闭事件                                                                                                                                                                                                                                                            |
|   onEvents    | function |    否    |             null             | 监听内部的==确定按钮==和==取消按钮==的点击事件，该方法回调一个参数对象：<br/>`function(e){   }`，`e`可能的返回值为` { ctx , confirm , cancel }`，您可以在此处执行一些业务逻辑，当然您也可以使用上方的 `bottom` 去覆盖原本的确定和取消按钮，然后在 `onMounted` 回调中监听你的事件。<br/>1. `ctx`可以用于调用`close()`关闭弹窗的事件<br/>2.`confirm`类型为`boolean`，该参数为判断  ***==确定按钮==***  的点击情况，返回值为`true`<br/>3.`cancel`类型为`boolean`，该参数为判断  ***<u>==取消按钮==</u>***  的点击情况，返回值为`true` |
|   onMounted   | function |    否    |             null             |                                                                                                                                                                                                                                  该函数会在弹窗初始化或者打开完成后执行，您可以在这里执行一些逻辑                                                                                                                                                                                                                                  |

#### copy配置项

|  参数名   | 参数类型 | 是否必填 | 默认值 |                   说明                    |
| :-------: | :------: | :------: | :----: | :---------------------------------------: |
|    use    | Boolean  |    是    | false  |             是否启用复制功能              |
| onlyText  | Boolean  |    是    |  true  |     是否仅复制文本，否则会复制dom元素     |
|  useTips  | Boolean  |    是    |  true  |     复制成功后是否显示复制成功的提示      |
| isDbClick | Boolean  |    是    |  true  | 是否双击才能够复制，true=双击，false=单击 |

#### confirm配置项

|  参数名   | 参数类型 | 是否必填 |                 默认值                 |                       说明                        |
| :-------: | :------: | :------: | :------------------------------------: | :-----------------------------------------------: |
|    use    | boolean  |    是    |                  true                  |                   是否显示按钮                    |
|   text    |  string  |    是    |                 '确认'                 |                     按钮文字                      |
| textColor |  string  |    否    |                 '#fff'                 |                   按钮文字颜色                    |
|  bgColor  |  string  |    否    |               '#ff80ab'                |                   按钮背景颜色                    |
|  radius   |  string  |    否    |                 '6px'                  |                     按钮圆角                      |
|  border   |  string  |    否    |          '1px solid #ff80ab'           |                     按钮边框                      |
|  shadow   |  string  |    否    | '0px 1px 10px rgba(255, 128, 171, .4)' | 按钮的阴影效果（hover事件使用鼠标经过的时候出现） |
|  padding  |  string  |    否    |               '6px 15px'               |                   按钮的内边距                    |

#### cancel配置项

|  参数名   | 参数类型 | 是否必填 |                默认值                 |                       说明                        |
| :-------: | :------: | :------: | :-----------------------------------: | :-----------------------------------------------: |
|    use    | boolean  |    是    |                 true                  |                   是否显示按钮                    |
|   text    |  string  |    是    |                '取消'                 |                     按钮文字                      |
| textColor |  string  |    否    |                '#333'                 |                   按钮文字颜色                    |
|  bgColor  |  string  |    否    |                '#fff'                 |                   按钮背景颜色                    |
|  radius   |  string  |    否    |                 '6px'                 |                     按钮圆角                      |
|  border   |  string  |    否    |          '1px solid #dcdfe6'          |                     按钮边框                      |
|  shadow   |  string  |    否    | '0px 1px 3px rgba(144, 147, 153, .2)' | 按钮的阴影效果（hover事件使用鼠标经过的时候出现） |
|  padding  |  string  |    否    |              '6px 15px'               |                   按钮的内边距                    |

#### mask配置项

|   参数名   | 参数类型 | 是否必填 |      默认值      |     说明     |
| :--------: | :------: | :------: | :--------------: | :----------: |
|    use     | boolean  |    是    |       true       |  使用遮罩层  |
| background |  string  |    是    | 'rgba(0,0,0,.3)' | 遮罩层的颜色 |

#### title配置项

|   参数名   | 参数类型 | 是否必填 | 默认值 |                      说明                      |
| :--------: | :------: | :------: | :----: | :--------------------------------------------: |
|    html    |  string  |    否    |  " "   | 弹窗的标题内容，支持html，若设置为 "" 则不显示 |
|   color    |  string  |    否    |  " "   |                   文字的颜色                   |
|  fontSize  |  string  |    否    |  " "   |         字体大小，必须携带字体大小单位         |
| fontWeight |  string  |    否    |  " "   |                  字体的加粗值                  |

#### content配置项

| 参数名  | 参数类型 | 是否必填 | 默认值 |           说明           |
| :-----: | :------: | :------: | :----: | :----------------------: |
|  html   |  string  |    否    |   ""   | 弹窗的主体内容，支持html |
| padding |  string  |    否    |   ""   |   弹窗的主体内容内边距   |

#### tips配置项

|   参数名   | 参数类型 | 是否必填 | 默认值 |                       说明                       |
| :--------: | :------: | :------: | :----: | :----------------------------------------------: |
|    html    |  string  |    否    |  " "   | 弹窗提示文字内容，支持html，若设置为 "" 则不显示 |
|   color    |  string  |    否    |  " "   |                    文字的颜色                    |
|  fontSize  |  string  |    否    |  " "   |          字体大小，必须携带字体大小单位          |
| fontWeight |  string  |    否    |  " "   |                   字体的加粗值                   |

#### bottom配置项

| 参数名  | 参数类型 | 是否必填 | 默认值 |                                       说明                                        |
| :-----: | :------: | :------: | :----: | :-------------------------------------------------------------------------------: |
|  show   | boolean  |    是    |  true  | 是否显示底部区域，该参数会影响内部按钮的显示，若赋值false则确定和取消按钮不会显示 |
| isCover | boolean  |    是    | false  |                             是否对内置的按钮进行覆盖                              |
|  html   |  string  |    否    |  " "   |                           弹窗底部的内容，支持html内容                            |

## 内置事件

| 事件名 |                        调用方式                         |       参数        |                                       说明                                       |
| :----: | :-----------------------------------------------------: | :---------------: | :------------------------------------------------------------------------------: |
|  open  |  let tzAlert = new TzAlert(options)<br/>tzAlert.open()  | options（非必填） | 打开弹窗，可以传入参数，参数内容与实例化时候的参数一致，可参考实例化参数进行赋值 |
| close  | let tzAlert = new TzAlert(options) <br/>tzAlert.close() |        无         |                                     关闭弹窗                                     |
