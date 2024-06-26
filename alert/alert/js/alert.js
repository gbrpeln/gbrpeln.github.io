
(function () {
    'use strict';

    // 缓存管理
    const CacheManager = {};

    // 缓存keys
    const CacheManagerKeys = {
        OldOptions: 'OLD_OPTIONS_',// 旧的配置前缀
        IsAppendStyle: 'TZ_ALERT_IS_APPEND_STYLE',// 样式标记
    };

    // 存储管理
    const StorageManager = {
        set(key, value) {
            sessionStorage.setItem(key, JSON.stringify(value));
        },
        get(key) {
            let r = sessionStorage.getItem(key);
            return r == null ? null : JSON.parse(r);
        }
    };

    // 随机工具
    const RandomHelper = {
        renderIdKey: '',
        // 生成随机的id
        fnGenerateRandomId(type = 'guid') {
            switch (type) {
                case 'timespan':
                    this.renderIdKey = new Date().getTime();
                    break;
                case 'guid':
                    this.renderIdKey = this.fnGenerateRandomIdByGuid();
                    break;
            }
            StorageManager.set(this.renderIdKey, this.renderIdKey)
        },
        fnSetUserCustomId(id) {
            this.renderIdKey = id;
            StorageManager.set(this.renderIdKey, this.renderIdKey)
        },
        fnGenerateRandomIdByGuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };

    // 管理定时器
    const Timeout = {
        close: null,
        doClose: null,
        okTips: null,
    };

    // 工具
    const Utils = {
        /**
         * 深度合并
         * @param {*} obj1 对象1
         * @param {*} obj2 对象2
         * @param {*} filter 过滤不需要合并的数据
         * @returns 合并后的对象
         */
        fnDeepMerge(obj1, obj2, filter = []) {
            let key;
            for (key in obj2) {
                if (filter.includes(key)) continue;
                obj1[key] =
                    obj1[key] &&
                        obj1[key].toString() === "[object Object]" &&
                        (obj2[key] && obj2[key].toString() === "[object Object]")
                        ? this.fnDeepMerge(obj1[key], obj2[key], [])
                        : (obj1[key] = obj2[key]);
            }
            return obj1;
        },
        /**
         * 获取被检查的数据类型
         * @param {*} any 被检查的数据
         * @returns 检查结果
         */
        fnCheckCloneType(any) {
            return Object.prototype.toString.call(any).slice(8, -1);
        },
        /**
         * 深克隆
         * @param {*} any 被克隆的数据
         * @returns 深克隆后的数据
         */
        fnDeepClone(any) {
            if (this.fnCheckCloneType(any) === 'Object') { // 拷贝对象
                let o = {};
                for (let key in any) {
                    o[key] = this.fnDeepClone(any[key]);
                };
                return o;
            } else if (this.fnCheckCloneType(any) === 'Array') { // 拷贝数组
                var arr = [];
                for (let i = 0, leng = any.length; i < leng; i++) {
                    arr[i] = this.fnDeepClone(any[i]);
                };
                return arr;
            } else if (this.fnCheckCloneType(any) === 'Function') { // 拷贝函数
                return new Function('return ' + any.toString()).call(this);
            } else if (this.fnCheckCloneType(any) === 'Date') { // 拷贝日期
                return new Date(any.valueOf());
            } else if (this.fnCheckCloneType(any) === 'RegExp') { // 拷贝正则
                return new RegExp(any);
            } else if (this.fnCheckCloneType(any) === 'Map') { // 拷贝Map 集合
                let m = new Map();
                any.forEach((v, k) => {
                    m.set(k, this.fnDeepClone(v));
                });
                return m;
            } else if (this.fnCheckCloneType(any) === 'Set') { // 拷贝Set 集合
                let s = new Set();
                for (let val of any.values()) {
                    s.add(this.fnDeepClone(val));
                }
                return s;
            }
            return any;
        },
        /**
         * 将对象转为css样式字符串
         * @param {*} obj 样式对象
         * @returns css样式字符串
         */
        fnObjToStyleString(obj) {
            let s = '';
            for (let key in obj) {
                s += `${key}:${obj[key]};`
            }
            return s;
        }
    };

    // html helper
    const HtmlHelper = {
        /**
         * 按钮元素
         * @param {string} 按钮类型 
         * @param {string} style 样式
         * @param {string} content text|html
         * @returns 
         */
        buttonHtml(type, style, content) {
            switch (type) {
                case 'confirm':
                    return `<button class="alert-btn" id="AlertConfirm${RandomHelper.renderIdKey}" style="${style}">${content}</button>`;
                case 'cancel':
                    return `<button class="alert-btn" id="AlertCancel${RandomHelper.renderIdKey}" style="${style}">${content}</button>`;
            }
        },
        /**
         * 设置dom状态
         * @param {object} ctx 插件上下文，TzAlert实例的this
         * @param {string} elName 元素的名称对应 TzAlert实例中的el对象中的key
         * @param {string} show 设置显示状态
         * @param {string} html text|html
         */
        fnSetDom(ctx, elName, show, html = '') {
            if (show) {
                ctx.el[elName] && (ctx.el[elName].style.display = 'flex');
                ctx.el[elName] && (ctx.el[elName].innerHTML = (ctx.options[elName].html || '') + html);
            } else {
                ctx.el[elName] && (ctx.el[elName].style.display = 'none');
            }
        },
        /**
         * 非首次且重新配置后渲染
         * @param {object} ctx 插件上下文，TzAlert实例的this
         */
        diffRenderHtml(ctx) {
            // 获取样式 
            let allStyles = this.fnGetStyles(ctx);
            // 设置样式
            ctx.el.alert.style = allStyles.alertStyle;
            ctx.el.title.style = allStyles.titleStyle;
            ctx.el.content.style = allStyles.contentStyle;
            ctx.el.tips.style = allStyles.tipsStyle;
            ctx.el.okTips.style = allStyles.okTipsStyle;
            ctx.el.bottom.style = allStyles.bottomStyle;
            ctx.el.mask && (ctx.el.mask.style = allStyles.maskStyle);

            // 控制状态
            let showTitle = ctx.options.title.html != '';
            let showContent = ctx.options.content.html != '';
            let showTips = ctx.options.tips.html != '';
            let showBottom = ctx.options.bottom.html != '';

            if (!showBottom) {
                showBottom = ctx.options.confirm.use || ctx.options.cancel.use;
            }
            let _defaultBtnHtml = '';
            if (ctx.options.cancel.use) {
                _defaultBtnHtml += HtmlHelper.buttonHtml('cancel', allStyles.cancelStyle, ctx.options.cancel.text);
            }
            if (ctx.options.confirm.use) {
                _defaultBtnHtml += HtmlHelper.buttonHtml('confirm', allStyles.confirmStyle, ctx.options.confirm.text);
            }
            HtmlHelper.fnSetDom(ctx, 'title', showTitle);
            HtmlHelper.fnSetDom(ctx, 'content', showContent);
            HtmlHelper.fnSetDom(ctx, 'tips', showTips);
            HtmlHelper.fnSetDom(ctx, 'bottom', showBottom, _defaultBtnHtml);

            this.fnCreateMask(ctx); // 遮罩层

            ctx.el.confirm = document.getElementById(`AlertConfirm${RandomHelper.renderIdKey}`); // 需要重新获取dom
            ctx.el.cancel = document.getElementById(`AlertCancel${RandomHelper.renderIdKey}`);   // 需要重新获取dom

            EventHandler.fnBindEvents(ctx);
            ctx.status.show = true;

            if (ctx.options.onMounted && typeof ctx.options.onMounted === 'function') {
                setTimeout(function () { ctx.options.onMounted(); }, 0);
            }
        },
        /**
         * 创建遮罩层
         * @param {object} ctx 插件上下文，TzAlert实例的this
         */
        fnCreateMask(ctx) {
            ctx.el.mask && ctx.el.mask.remove();
            // 遮罩层
            if (ctx.options.mask.use) {
                const { maskStyle } = this.fnGetStyles(ctx);
                const mask = document.createElement('div');
                mask.setAttribute('id', `AlertMask${RandomHelper.renderIdKey}`);
                mask.className = 'alert-mask';
                mask.style = maskStyle;
                document.body.appendChild(mask);
                ctx.el.mask = document.getElementById(`AlertMask${RandomHelper.renderIdKey}`);
                // 监听事件
                if (ctx.options.useMaskClose) {
                    mask.onclick = function (e) {
                        e.preventDefault();
                        ctx.close();
                    };
                } else {
                    mask.onclick = null;
                }
            }
        },
        /**
         * 获取样式
         * @param {object} ctx 插件上下文，TzAlert实例的this
         * @returns 当前弹窗所有的dom元素的样式
         */
        fnGetStyles(ctx) {
            // 获取位置样式
            let positionStyle = this.fnGetPositionStyle(ctx);
            let alertStyle = {
                width: ctx.options.width,
                top: ctx.options.top,
                'box-shadow': ctx.options.shadow,
                'border-radius': ctx.options.radius,
                'margin-left': - ctx.options.width.replace('px', '') / 2 + 'px',
            };
            alertStyle = Utils.fnDeepMerge(alertStyle, positionStyle); // 合并样式
            let titleStyle = {
                'justify-content': ctx.options.center ? 'center' : 'flex-start',
                'font-size': ctx.options.title.fontSize,
                'font-weight': ctx.options.title.fontWeight,
                'color': ctx.options.title.color,
            };
            let contentStyle = {
                'padding': ctx.options.content.padding,
                'justify-content': ctx.options.center ? 'center' : 'flex-start',
            };
            let tipsStyle = {
                'font-size': ctx.options.tips.fontSize,
                'font-weight': ctx.options.tips.fontWeight,
                'color': ctx.options.tips.color,
                'justify-content': ctx.options.center ? 'center' : 'flex-start',
            };
            let okTipsStyle = {
                'text-align': ctx.options.center ? 'center' : 'inherit',
            };
            let bottomStyle = {
                'justify-content': ctx.options.center ? 'center' : 'flex-end',
            };
            let confirmStyle = {
                '--textColor': ctx.options.confirm.textColor,
                '--bgColor': ctx.options.confirm.bgColor,
                '--shadow': ctx.options.confirm.shadow,
                'border-radius': ctx.options.confirm.radius,
                padding: ctx.options.confirm.padding,
                border: ctx.options.confirm.border,
            };
            let cancelStyle = {
                '--textColor': ctx.options.cancel.textColor,
                '--bgColor': ctx.options.cancel.bgColor,
                '--shadow': ctx.options.cancel.shadow,
                'border-radius': ctx.options.cancel.radius,
                padding: ctx.options.cancel.padding,
                border: ctx.options.cancel.border,
            };

            let maskStyle = {
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                background: ctx.options.mask.background,
            };

            alertStyle = Utils.fnObjToStyleString(alertStyle);
            titleStyle = Utils.fnObjToStyleString(titleStyle);
            contentStyle = Utils.fnObjToStyleString(contentStyle);
            tipsStyle = Utils.fnObjToStyleString(tipsStyle);
            okTipsStyle = Utils.fnObjToStyleString(okTipsStyle);
            bottomStyle = Utils.fnObjToStyleString(bottomStyle);
            confirmStyle = Utils.fnObjToStyleString(confirmStyle);
            cancelStyle = Utils.fnObjToStyleString(cancelStyle);
            maskStyle = Utils.fnObjToStyleString(maskStyle);

            return {
                alertStyle, titleStyle, contentStyle, tipsStyle,
                okTipsStyle, bottomStyle, confirmStyle, cancelStyle, maskStyle
            };
        },
        /**
         * 获取位置样式
         * @param {string} position 位置
         * @returns 样式对象
         */
        fnGetPositionStyle(ctx) {
            let _position = ctx.options.position; // 位置
            let _gap = ctx.options.gap;           // 间距
            let _styles = {};             // 回调样式
            let _animateSpeed = ctx.options.animateSpeed == 'fast' ? 200 : 600 + 'ms';
            switch (_position) {
                case 'center':
                    _styles = {
                        left: '50%',
                        top: '50%',
                        right: 'initial',
                        bottom: 'initial',
                        transform: 'translate(-50%, -50%)',
                        '--left-offset': '50%',
                        '--top-offset': '50%',
                        '--right-offset': 'initial',
                        '--bottom-offset': 'initial',
                        '--animate-speed': _animateSpeed
                    };
                    break;
                case 'left':
                    _styles = {
                        left: _gap + 'px',
                        top: '50%',
                        right: 'initial',
                        bottom: 'initial',
                        transform: 'translateY(-50%)',
                        '--left-offset': _gap + 'px',
                        '--top-offset': '50%',
                        '--right-offset': 'initial',
                        '--bottom-offset': 'initial',
                        '--animate-speed': _animateSpeed
                    };
                    break;
                case 'left-top':
                    _styles = {
                        left: _gap + 'px',
                        top: _gap + 'px',
                        right: 'initial',
                        bottom: 'initial',
                        '--left-offset': _gap + 'px',
                        '--top-offset': _gap + 'px',
                        '--right-offset': 'initial',
                        '--bottom-offset': 'initial',
                        '--animate-speed': _animateSpeed
                    };
                    break;
                case 'left-bottom':
                    _styles = {
                        left: _gap + 'px',
                        top: 'initial',
                        right: 'initial',
                        bottom: _gap + 'px',
                        '--left-offset': _gap + 'px',
                        '--top-offset': 'initial',
                        '--right-offset': 'initial',
                        '--bottom-offset': _gap + 'px',
                        '--animate-speed': _animateSpeed
                    };
                    break;
                case 'top':
                    _styles = {
                        left: '50%',
                        top: _gap + 'px',
                        right: 'initial',
                        bottom: 'initial',
                        transform: 'translateX(-50%)',
                        '--left-offset': '50%',
                        '--top-offset': _gap + 'px',
                        '--right-offset': 'initial',
                        '--bottom-offset': 'initial',
                        '--animate-speed': _animateSpeed
                    };
                    break;

                case 'right':
                    _styles = {
                        left: 'initial',
                        top: '50%',
                        right: _gap + 'px',
                        bottom: 'initial',
                        transform: 'translateY(-50%)',
                        '--left-offset': 'initial',
                        '--top-offset': '50%',
                        '--right-offset': _gap + 'px',
                        '--bottom-offset': 'initial',
                        '--animate-speed': _animateSpeed
                    };
                    break;
                case 'right-top':
                    _styles = {
                        left: 'initial',
                        top: _gap + 'px',
                        right: _gap + 'px',
                        bottom: 'initial',
                        '--left-offset': 'initial%',
                        '--top-offset': _gap + 'px',
                        '--right-offset': _gap + 'px',
                        '--bottom-offset': 'initial',
                        '--animate-speed': _animateSpeed
                    };
                    break;
                case 'right-bottom':
                    _styles = {
                        left: 'initial',
                        top: 'initial',
                        right: _gap + 'px',
                        bottom: _gap + 'px',
                        '--left-offset': 'initial',
                        '--top-offset': 'initial',
                        '--right-offset': _gap + 'px',
                        '--bottom-offset': _gap + 'px',
                        '--animate-speed': _animateSpeed
                    };
                    break;
                case 'bottom':
                    _styles = {
                        left: '50%',
                        top: 'initial',
                        right: 'initial',
                        bottom: _gap + 'px',
                        transform: 'translateX(-50%)',
                        '--left-offset': '50%',
                        '--top-offset': 'initial',
                        '--right-offset': 'initial',
                        '--bottom-offset': _gap + 'px',
                        '--animate-speed': _animateSpeed
                    };
                    break;
            }
            _styles['margin-left'] = 'initial';
            return _styles;
        },
    };

    // 事件
    const EventHandler = {
        // 拖拽
        fnOnDrop(ctx) {
            const _this = this;
            const alert = ctx.el.alert,
                title = ctx.el.title;

            let x, y; //鼠标相对与div左边，上边的偏移
            let isDrop = false; //移动状态的判断鼠标按下才能移动
            title.onmousedown = function (e) {
                title.style.cursor = 'move';
                var e = e || window.event; //要用event这个对象来获取鼠标的位置
                x = e.clientX - alert.offsetLeft;
                y = e.clientY - alert.offsetTop;
                isDrop = true; //设为true表示可以移动 
            };
            document.onmousemove = function (e) {
                //是否为可移动状态                　　　　　　　　　　　 　　　　　　　
                if (isDrop) {
                    var e = e || window.event;
                    var moveX = e.clientX - x; //得到距离左边移动距离                    　　
                    var moveY = e.clientY - y; //得到距离上边移动距离
                    //可移动最大距离
                    var maxX = document.documentElement.clientWidth - alert.offsetWidth;  // 矫正偏差限定左边距离
                    var maxY = document.documentElement.clientHeight - alert.offsetHeight;

                    //范围限定 （原始）
                    // moveX = Math.min(maxX, Math.max(0, moveX));
                    // moveY = Math.min(maxY, Math.max(0, moveY));
                    // if (moveX > alert.offsetWidth / 2) { // 矫正偏差限定左边距离
                    //     alert.style.left = moveX + "px";
                    // }
                    // alert.style.top = moveY + "px";


                    // 范围限定
                    // 需要根据position 判断 
                    _this.fnHandleDrawMove(ctx, alert, moveX, moveY, maxX, maxY);
                } else {
                    return;
                }
            };
            document.onmouseup = function () {
                isDrop = false; //设置为false不可移动
                title.style.cursor = 'initial';
            };
        },

        /**
         * 执行拖拽操作
         * @param {object} ctx 当前插件上下文
         * @param {dom} alert 需要操作的dom元素
         * @param {number} moveX X轴移动距离
         * @param {number} moveY Y轴移动距离
         * @param {number} maxX 最大X轴移动距离
         * @param {number} maxY 最大Y轴移动距离
         */
        fnHandleDrawMove(ctx, alert, moveX, moveY, maxX, maxY) {
            let _position = ctx.options.position; // 位置
            switch (_position) {
                case 'center':
                    if (moveX > alert.offsetWidth / 2 && moveX < maxX + alert.offsetWidth / 2) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > alert.offsetHeight / 2 && moveY < maxY + alert.offsetHeight / 2) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'left':
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > alert.offsetHeight / 2 && moveY < maxY + alert.offsetHeight / 2) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'left-top':
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'left-bottom':
                    alert.style.bottom = 'initial';
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'top':
                    if (moveX > alert.offsetWidth / 2 && moveX < maxX + alert.offsetWidth / 2) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;

                case 'right':
                    alert.style.right = 'initial';
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > alert.offsetHeight / 2 && moveY < maxY + alert.offsetHeight / 2) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'right-top':
                    alert.style.right = 'initial';
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'right-bottom':
                    alert.style.right = 'initial';
                    alert.style.bottom = 'initial';
                    if (moveX > 0 && moveX < maxX) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;
                case 'bottom':
                    alert.style.bottom = 'initial';
                    if (moveX > alert.offsetWidth / 2 && moveX < maxX + alert.offsetWidth / 2) {
                        alert.style.left = moveX + "px";
                    }
                    if (moveY > 0 && moveY < maxY) {
                        alert.style.top = moveY + "px";
                    }
                    break;
            }
            alert.style.setProperty('--left-offset', alert.offsetLeft + 'px');
            alert.style.setProperty('--right-offset', document.documentElement.clientWidth - (alert.offsetLeft + alert.offsetWidth) + 'px');
            alert.style.setProperty('--top-offset', alert.offsetTop + 'px');
            alert.style.setProperty('--bottom-offset', document.documentElement.clientHeight - (alert.offsetHeight + alert.offsetTop) + 'px');
        },

        // 绑定监听事件
        fnBindEvents(ctx) {
            const { alert, close, content, okTips, confirm, cancel } = ctx.el;   // es6
            // 确定按钮
            if (confirm) {
                confirm.onclick = function (e) {
                    e.preventDefault();
                    if (ctx.options.onEvents && typeof ctx.options.onEvents === 'function') {
                        ctx.options.onEvents({ ctx: ctx, confirm: true });
                    } else {
                        ctx.close();
                    }
                };
            }
            // 取消按钮
            if (cancel) {
                cancel.onclick = function (e) {
                    e.preventDefault();
                    if (ctx.options.onEvents && typeof ctx.options.onEvents === 'function') {
                        ctx.options.onEvents({ ctx: ctx, cancel: true });
                    } else {
                        ctx.close();
                    }
                };
            }
            if (ctx.options.copy.use) {
                // 复制
                const doCopy = function () {
                    const copyContent = ctx.options.copy.onlyText ? content.innerText : content.innerHTML;
                    navigator.clipboard.writeText(copyContent);
                    if (ctx.options.copy.useTips) {
                        okTips.innerText = '提示：内容复制成功，使用 [ ctrl + v ] 快捷键即可快速粘贴！';
                        clearTimeout(Timeout.okTips);
                        Timeout.okTips = setTimeout(function () {
                            okTips.innerText = '';
                        }, 3000)
                    }
                };

                if (ctx.options.copy.isDbClick) {
                    content.onclick = null;
                    content.ondblclick = function (e) {
                        e.preventDefault();
                        doCopy();
                    };
                } else {
                    content.ondblclick = null;
                    content.onclick = function (e) {
                        e.preventDefault();
                        doCopy();
                    };
                }
            } else {
                ctx.options.isDbClick && (content.ondblclick = null);
                !ctx.options.isDbClick && (content.onclick = null);
            }
            // 绑定关闭事件
            close.onclick = function (e) {
                e.preventDefault();
                ctx.close();
            };
            // 绑定监听拖拽事件
            if (ctx.options.useDrop) {
                this.fnOnDrop(ctx);
            }
            // 绑定esc按键
            document.onkeydown = function (e) {
                if (e.key === 'Escape' && ctx.options.useEscClose) {
                    ctx.close();
                }
            }
        },
        // 移除所有事件
        fnRemoveEvents(ctx) {
            const close = ctx.el.close,
                content = ctx.el.content,
                confirm = ctx.el.confirm,
                cancel = ctx.el.cancel,
                mask = ctx.el.mask;

            confirm && (confirm.onclick = null);
            cancel && (cancel.onclick = null);
            close && (close.onclick = null);
            content && (content.onclick = null);
            content && (content.ondblclick = null);
            mask && (mask.onclick = null);
        },

        /**
         * 锁定/解除锁定页面滚动
         * @param {boolean} isLock 
         */
        fnLockOrUnLockScroll(isLock = true) {
            if (isLock) {
                document.getElementsByTagName('body')[0].style.overflow = "hidden";
            } else {
                document.getElementsByTagName('body')[0].style.overflow = "visible";
            }
        }
    };

    const TzAlert = function (options) {
        if (!(this instanceof TzAlert)) { return new TzAlert(options); }
        this.options = Utils.fnDeepMerge({
            id: '',    // 标识多个弹窗实例化的时候请填写固定的参数值不可使用随机数
            position: 'top', //center=居中 left=左边 left-top=左上角 left-bottom=左下角 top=上边 top-right=右上角 right=右边 right-bottom=右下角 bottom=下边
            gap: 15,         // 间距，弹窗距离边缘的距离，（使用动画后默认为20） 
            animate: '',    //  动画效果
            animateSpeed: 'slow',   // 动画的速度 fast = 快速  slow=正常
            width: '400px', // 弹窗宽度
            top: '20px',    // 距离顶部位置
            radius: '6px',  // 圆角
            shadow: '0 2px 10px rgba(0,0,0,0.2)', // 阴影
            async: false,   // 异步关闭
            asyncTime: 1000,// 延迟关闭时间
            center: false,  // 内容居中
            useDrop: true,  // 拖拽
            useMaskClose: true,  // 点击遮罩层关闭
            useInitShow: false,  // 是否初始化完成后直接弹出
            useEscClose: false,  // 是否启用esc关闭弹窗
            useLockScroll: false, // 是否启用弹窗open的时候锁定页面的滚动条
            copy: {
                use: false,
                onlyText: true,    // 是否仅复制文本，否则会复制dom元素
                useTips: true,
                isDbClick: true // 双击
            },
            confirm: {
                use: true,
                text: '确认',
                textColor: '#fff',
                bgColor: '#ff80ab',
                radius: '6px',
                border: '1px solid #ff80ab',
                shadow: '0px 1px 10px rgba(255, 128, 171, .4)',
                padding: '6px 15px',
            },
            cancel: {
                use: true,
                text: '取消',
                textColor: '#333',
                bgColor: '#fff',
                border: '1px solid #dcdfe6',
                radius: '6px',
                shadow: '0px 1px 3px rgba(144, 147, 153, .2)',
                padding: '6px 15px',
            },
            mask: {
                use: true,
                background: 'rgba(0,0,0,.3)'
            },
            title: {
                html: '',
                color: '',
                fontSize: '',
                fontWeight: '',
            },
            content: {
                html: '',
                padding: ''
            },
            tips: {
                html: '',
                color: '',
                fontSize: '',
                fontWeight: '',
            },
            bottom: {
                isCover: false, // 是否覆盖原本的按钮（如果原来按钮显示的话）
                show: true,
                html: '',
            },
            onClose: null,
            onEvents: null, // 内部的事件回调监听，传入的是一个函数  onEvents:function(callback){},
            onMounted: function () { }
        }, options);

        this.init();
    };

    TzAlert.prototype = {
        status: {
            show: false // 当前是否正在显示
        },
        el: {
            mask: null,
            alert: null,
            title: null,
            close: null,
            content: null,
            tips: null,
            okTips: null,
            bottom: null,
            confirm: null,
            cancel: null,
        },
        // 获取dom元素
        fnGetDomElements() {
            this.el.mask = document.getElementById(`AlertMask${RandomHelper.renderIdKey}`);
            this.el.alert = document.getElementById(`Alert${RandomHelper.renderIdKey}`);
            this.el.title = document.getElementById(`AlertTitle${RandomHelper.renderIdKey}`);
            this.el.close = document.getElementById(`AlertClose${RandomHelper.renderIdKey}`);
            this.el.content = document.getElementById(`AlertContent${RandomHelper.renderIdKey}`);
            this.el.tips = document.getElementById(`AlertTips${RandomHelper.renderIdKey}`);
            this.el.okTips = document.getElementById(`AlertOkTips${RandomHelper.renderIdKey}`);
            this.el.bottom = document.getElementById(`AlertBottom${RandomHelper.renderIdKey}`);
            this.el.confirm = document.getElementById(`AlertConfirm${RandomHelper.renderIdKey}`);
            this.el.cancel = document.getElementById(`AlertCancel${RandomHelper.renderIdKey}`);
        },
        // 打开事件
        open(options, isInit = false) {
            const _this = this;
            const doOpen = function () {
                // 是否锁定滚动条
                EventHandler.fnLockOrUnLockScroll(_this.options.useLockScroll);
                const alert = _this.el.alert;
                let _animateSpeed = _this.options.animateSpeed == 'fast' ? ' alert-ani-fast ' : ' alert-ani-slow '; // 暂时支持快和慢
                let _animate = _this.options.animate ? ` alert-ani-show-${_this.options.animate}-${_this.options.position} ` : '';
                alert.classList = `alert-wrap is-visible ${_animate} ${_animateSpeed}`;
                _this.status.show = true;
            };
            if (options) {
                _this.options = Utils.fnDeepMerge(_this.options, options, ['']);
                _this.options.onEvents = options.onEvents || null;
                if (!_this.options.mask.use && _this.status.show) {
                    _this.close();
                } else {
                    HtmlHelper.diffRenderHtml(_this);
                    doOpen();
                }
            } else {
                if (_this.options.mask.use) {
                    HtmlHelper.fnCreateMask(_this);
                }
                if (!isInit) {
                    // 获取旧的配置 
                    _this.options = Utils.fnDeepClone(CacheManager[CacheManagerKeys.OldOptions + RandomHelper.renderIdKey]);
                    HtmlHelper.diffRenderHtml(_this);
                }
                doOpen();
            }
        },
        // 关闭事件
        close() {
            clearTimeout(Timeout.close);
            clearTimeout(Timeout.okTips);

            const _this = this;
            const alert = _this.el.alert,
                okTips = _this.el.okTips,
                mask = _this.el.mask;
            okTips.innerText = '';

            const doCloseAndCallback = function () {
                EventHandler.fnLockOrUnLockScroll(false); // 解除滚动条锁定
                EventHandler.fnRemoveEvents(_this); // 关闭前移除所有事件
                if (_this.options.animate) {
                    let _animateSpeed = _this.options.animateSpeed == 'fast' ? ' alert-ani-fast ' : ' alert-ani-slow '; // 暂时支持快和慢
                    let _animate = _this.options.animate ? `alert-ani-close-${_this.options.animate}-${_this.options.position} ` : '';
                    alert.classList = `alert-wrap ${_animateSpeed} ${_animate}`;
                    Timeout.doClose = setTimeout(function () {
                        alert.classList = `alert-wrap no-visible`;
                    }, _this.options.animateSpeed == 'fast' ? 100 : 500)

                } else {
                    alert.classList = `alert-wrap no-visible`;
                }

                _this.status.show = false;
                if (mask) {
                    mask.style.display = 'none';
                }
                if (_this.options.onClose && typeof _this.options.onClose === 'function') {
                    _this.options.onClose();
                }
            };

            if (_this.options.async) {
                Timeout.close = setTimeout(function () {
                    doCloseAndCallback();
                }, _this.options.asyncTime);
            } else {
                doCloseAndCallback();
            }
        },
        // 初始化
        init() {
            const _this = this;

            // 初始化获取当前实例的id随机值
            if (_this.options.id == '' || _this.options.id == null || _this.options.id == undefined) {
                RandomHelper.fnGenerateRandomId();
            } else {
                RandomHelper.fnSetUserCustomId(_this.options.id);
            }
            // 存储当前实例的默认配置 
            CacheManager[CacheManagerKeys.OldOptions + RandomHelper.renderIdKey] = Utils.fnDeepClone(_this.options);  // 使用缓存管理

            // 控制状态
            let showTitle = _this.options.title.html != '';
            let showContent = _this.options.content.html != '';
            let showTips = _this.options.tips.html != '';
            let showBottom = _this.options.bottom.html != '';
            if (!showBottom) {
                showBottom = _this.options.confirm.use || _this.options.cancel.use;
            }

            // 获取样式 
            let allStyles = HtmlHelper.fnGetStyles(_this);
            const alertStyle = allStyles.alertStyle,
                titleStyle = allStyles.titleStyle,
                contentStyle = allStyles.contentStyle,
                tipsStyle = allStyles.tipsStyle,
                okTipsStyle = allStyles.okTipsStyle,
                bottomStyle = allStyles.bottomStyle,
                confirmStyle = allStyles.confirmStyle,
                cancelStyle = allStyles.cancelStyle;

            // 创建遮罩层
            _this.options.useInitShow && HtmlHelper.fnCreateMask(_this);

            // 添加弹窗容器
            const $body = document.getElementsByTagName('body')[0];
            const elAlert = document.createElement('div');
            elAlert.className = 'alert-wrap  no-visible';
            elAlert.setAttribute('id', `Alert${RandomHelper.renderIdKey}`);
            elAlert.style = alertStyle;

            let _bottomHtml, alertConfirmBtn, alertCancelBtn;
            if (_this.options.confirm.use) {
                alertConfirmBtn = HtmlHelper.buttonHtml('confirm', confirmStyle, _this.options.confirm.text);
            }
            if (_this.options.cancel.use) {
                alertCancelBtn = HtmlHelper.buttonHtml('cancel', cancelStyle, _this.options.cancel.text);
            }
            if (_this.options.bottom.html && _this.options.bottom.show) {
                if (_this.options.bottom.isCover) {
                    _bottomHtml = _this.options.bottom.html;
                } else {
                    _bottomHtml = _this.options.bottom.html + alertCancelBtn + alertConfirmBtn;
                }
            } else {
                _bottomHtml = alertCancelBtn + alertConfirmBtn;
            }
            elAlert.innerHTML = `
                <span class="alert-close" id="AlertClose${RandomHelper.renderIdKey}" title="关闭">+</span>
                <h5 class="alert-title ${showTitle ? 'el-is-show-flex' : 'el-is-hide'}" style="${titleStyle}" id="AlertTitle${RandomHelper.renderIdKey}">${_this.options.title.html}</h5>
                <div class="alert-content ${showContent ? 'el-is-show-flex' : 'el-is-hide'}" style="${contentStyle}"  id="AlertContent${RandomHelper.renderIdKey}">${_this.options.content.html}</div>
                <div class="alert-tips ${showTips ? 'el-is-show-flex' : 'el-is-hide'}" style="${tipsStyle}" id="AlertTips${RandomHelper.renderIdKey}">${_this.options.tips.html}</div>
                <div class="alert-copy-ok-tips" id="AlertOkTips${RandomHelper.renderIdKey}" style="${okTipsStyle}" ></div>
                <div class="alert-bottom ${showBottom ? 'el-is-show-flex' : 'el-is-hide'}" style="${bottomStyle}" id="AlertBottom${RandomHelper.renderIdKey}">${_bottomHtml}</div>
            `;

            $body.appendChild(elAlert);

            // 初始化获取dom元素
            _this.fnGetDomElements();
            // 初始化事件监听
            EventHandler.fnBindEvents(_this);

            // 是否实例化的时候就弹出（不需要再次调用open()方法）
            if (_this.options.useInitShow) {
                _this.open(null, true);
            }
            // 传入自定义函数
            if (_this.options.onMounted && typeof _this.options.onMounted === 'function') {
                setTimeout(function () { _this.options.onMounted(); }, 0);
            }
        }
    };

    window.TzAlert = TzAlert;
}());