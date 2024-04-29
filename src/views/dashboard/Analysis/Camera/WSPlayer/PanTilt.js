/**
 * 云台功能
 */
class PanTilt{
    constructor(options = {}, wsPlayer) {
        // 云台节点
        this.el = options.el;
        // wsPlayer播放组件
        this.wsPlayer = wsPlayer;
        // 静态资源前缀
        this.prefixUrl = options.prefixUrl || "./static"
        // 云台元素
        this.$el = $('#' + this.el)
        if(this.$el && !this.$el.children().length) {
            this.__createPanTilt();
        }
        // 选中的窗口的正在播放的通道
        this.channel = null;
        // 记录每个窗口开启的三维定位的通道
        this.channelCodeForPositionList = [];
        // 相关的请求接口方法
        // 云台方向控制接口
        this.setPtzDirection = options.setPtzDirection;
        // 云台镜头控制接口
        this.setPtzCamera = options.setPtzCamera;
        // 云台三维定位接口
        this.controlSitPosition = options.controlSitPosition;
        // 三维定位canvas的事件
        this.mousedownCanvasEvent = this.__mousedownCanvasEvent.bind(this);
        this.mousemoveCanvasEvent = this.__mousemoveCanvasEvent.bind(this);
        this.mouseupCanvasEvent = this.__mouseupCanvasEvent.bind(this);
        this.clickDirectFlag = false
    }

    /**
     * 设置通道
     * @param channel
     */
    setChannel(channel) {
        this.channel = channel;
        let selectIndex = this.wsPlayer.selectIndex;
        // 某窗口开启三维定位并未关闭的channelCode
        let channelCodeForPosition = this.channelCodeForPositionList[selectIndex];
        if(!channel) {
            // 通道不存在，则禁用云台
            $('.ws-pan-tilt-mask', this.$el).css({display: "block"})
            $('.ws-pan-tilt-mask-position', this.$el).css({display: "none"})
            this.__removeCanvasEvent();
            return;
        } else if(channelCodeForPosition) {
            if(channelCodeForPosition !== channel.id) {
                this.channelCodeForPositionList[selectIndex] = null;
                this.__removeCanvasEvent();
            } else {
                // 开启三维定位
                this.__openSitPosition(true);
            }
        } else if(this.openSitPositionFlag) {
            // 切换通道之后，需要关闭三维定位
            this.__removeCanvasEvent();
        }
        let capability = channel.capability;
        switch(channel.cameraType + "") {
            case "1": // 枪机通道
                // 枪机通道能力集有电动聚焦或者云台控制时，开放变倍、变焦
                if(parseInt(capability, 2) & parseInt("100", 2)
                    || parseInt(capability, 2) & parseInt("10000000000000000", 2)
                ) {
                    $('.ws-pan-tilt-mask-zoom', this.$el).css({display: "none"})
                } else {
                    $('.ws-pan-tilt-mask-zoom', this.$el).css({display: "block"})
                }

                // 枪机通道能力集有云台控制时，开放方向控制
                if(parseInt(capability, 2) & parseInt("10000000000000000", 2)) {
                    $('.ws-pan-tilt-mask-direction', this.$el).css({display: "none"})
                    $('.ws-pan-tilt-mask-position', this.$el).css({display: "block"})
                    this.__removeCanvasEvent();
                } else {
                    $('.ws-pan-tilt-mask-direction', this.$el).css({display: "block"})
                    $('.ws-pan-tilt-mask-position', this.$el).css({display: "none"})
                }

                $('.ws-pan-tilt-mask-aperture', this.$el).css({display: "block"})
                break;
            case "2": // 球机通道
                // 球机通道，可以使用云台所有功能
                $('.ws-pan-tilt-mask', this.$el).css({display: "none"});
                $('.ws-pan-tilt-mask-position', this.$el).css({display: "none"})
                break;
            default:
                // 默认禁用云台
                $('.ws-pan-tilt-mask', this.$el).css({display: "block"});
                $('.ws-pan-tilt-mask-position', this.$el).css({display: "none"})
                this.__removeCanvasEvent();
        }
    }

    __createPanTilt() {
        this.$el.append(`
            <div class="ws-pan-tilt-control">
                <div class="ws-pan-tilt-circle-wrapper">
                    <!--云台方向控制-->
                    <div class="ws-pan-tilt-circle-rotate">
                        <div class="ws-pan-tilt-circle">
                            <div class="ws-pan-tilt-direction-item"><img src="${this.prefixUrl}/WSPlayer/icon/arrow-t.svg" title="上" direct="1"/></div>
                            <div class="ws-pan-tilt-direction-item"><img src="${this.prefixUrl}/WSPlayer/icon/arrow-rt.svg" title="右上" direct="7"/></div>
                            <div class="ws-pan-tilt-direction-item"><img src="${this.prefixUrl}/WSPlayer/icon/arrow-r.svg" title="右" direct="4"/></div>
                            <div class="ws-pan-tilt-direction-item"><img src="${this.prefixUrl}/WSPlayer/icon/arrow-rb.svg" title="右下" direct="8"/></div>
                            <div class="ws-pan-tilt-direction-item"><img src="${this.prefixUrl}/WSPlayer/icon/arrow-b.svg" title="下" direct="2"/></div>
                            <div class="ws-pan-tilt-direction-item"><img src="${this.prefixUrl}/WSPlayer/icon/arrow-lb.svg" title="左下" direct="6"/></div>
                            <div class="ws-pan-tilt-direction-item"><img src="${this.prefixUrl}/WSPlayer/icon/arrow-l.svg" title="左" direct="3"/></div>
                            <div class="ws-pan-tilt-direction-item"><img src="${this.prefixUrl}/WSPlayer/icon/arrow-lt.svg" title="左上" direct="5"/></div>
                            <div class="ws-pan-tilt-inner-circle">
                                <img
                                    class="ws-pan-tilt-pzt-select"
                                    src="${this.prefixUrl}/WSPlayer/icon/ptz-select.svg"
                                    title="三维定位"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <!--云台变倍、聚焦、光圈控制-->
                <div class="ws-cloud-control-wrapper">
                    <div class="ws-pan-tilt-control-item"><img src="${this.prefixUrl}/WSPlayer/icon/ptz-icon1.svg" title="变倍-" operateType="1" direct="2"/></div>
                    <div class="ws-pan-tilt-control-item"><img src="${this.prefixUrl}/WSPlayer/icon/ptz-icon2.svg" title="变倍+" operateType="1" direct="1"/></div>
                    <div class="cloud-control-separate"></div>
                    <div class="ws-pan-tilt-control-item"><img src="${this.prefixUrl}/WSPlayer/icon/ptz-icon3.svg" title="聚焦-" operateType="2" direct="2"/></div>
                    <div class="ws-pan-tilt-control-item"><img src="${this.prefixUrl}/WSPlayer/icon/ptz-icon4.svg" title="聚焦+" operateType="2" direct="1"/></div>
                    <div class="cloud-control-separate"></div>
                    <div class="ws-pan-tilt-control-item"><img src="${this.prefixUrl}/WSPlayer/icon/ptz-icon5.svg" title="光圈-" operateType="3" direct="2"/></div>
                    <div class="ws-pan-tilt-control-item"><img src="${this.prefixUrl}/WSPlayer/icon/ptz-icon6.svg" title="光圈+" operateType="3" direct="1"/></div>
                </div>
                
                <!--遮罩，当通道没有云台功能时，使用遮罩遮住云台按钮-->
                <!--方向按钮遮罩-->
                <div class="ws-pan-tilt-mask ws-pan-tilt-mask-direction"></div>
                <!--三维定位遮罩-->
                <div class="ws-pan-tilt-mask ws-pan-tilt-mask-position"></div>
                <!--变倍、聚焦遮罩-->
                <div class="ws-pan-tilt-mask ws-pan-tilt-mask-zoom"></div>
                <!--光圈遮罩-->
                <div class="ws-pan-tilt-mask ws-pan-tilt-mask-aperture"></div>
            </div>
        `)
        $('.ws-pan-tilt-circle', this.$el).mouseup(e => {
            if(this.clickDirectFlag) {
                this.clickDirectFlag = false
                let direct = this.__getDirect(e.target);
                direct && this.__setPtzDirection(direct, "0")
            }
        })
        $('.ws-pan-tilt-circle', this.$el).mouseout(e => {
            if(this.clickDirectFlag) {
                this.clickDirectFlag = false
                let direct = this.__getDirect(e.target);
                direct && this.__setPtzDirection(direct, "0")
            }
        })
        $('.ws-pan-tilt-circle', this.$el).mousedown(this._throttle(e => {
            if(!this.clickDirectFlag) {
                let direct = this.__getDirect(e.target);
                if(direct) {
                    this.clickDirectFlag = true
                    this.__setPtzDirection(direct, "1")
                }
            }
        }, 1000))
        $('.ws-pan-tilt-control-item img', this.$el).mouseup(e => {
            this.__setPtzCamera(e.target.getAttribute("operateType"), e.target.getAttribute("direct"), "0")
        })
        $('.ws-pan-tilt-control-item img', this.$el).mouseout(e => {
            this.__setPtzCamera(e.target.getAttribute("operateType"), e.target.getAttribute("direct"), "0")
        })
        $('.ws-pan-tilt-control-item img', this.$el).mousedown(this._throttle(e => {
            this.__setPtzCamera(e.target.getAttribute("operateType"), e.target.getAttribute("direct"), "1")
        }, 1000))
        // 开启三维定位
        $('.ws-pan-tilt-pzt-select', this.$el).click(e => {
            this.__openSitPosition(!this.openSitPositionFlag);
        })
    }

    __getDirect(target) {
        let direct = target.getAttribute("direct");
        if(!direct) {
            let childNode = target.childNodes[0];
            if(childNode && childNode.getAttribute) {
                direct = childNode.getAttribute("direct");
            }
        }
        return direct;
    }

    __setPtzDirection(direct, command) {
        // 方向：1=上，2=下，3=左，4=右，5=左上，6=左下，7=右上，8=右下
        const params = {
            project: 'PSDK',
            method: 'DMS.Ptz.OperateDirect',
            data: {
                direct,
                command,
                stepX: '4',
                stepY: '4',
                channelId: this.channel.id
            }
        };
        this.setPtzDirection && this.setPtzDirection(params).then(res => {
            let data = res.data || res;
            // 开启做提示，结束不做提示
            if(command === "1" && data.result && data.result === "0") {
                this.wsPlayer.sendErrorMessage(701, {
                    insert: [res.data.lockUser.userName],
                    apiErrorInfo: res,
                });
            }
        }).catch(err => {
            let data = err.data || err;
            let insert = [""];
            if(data.code === 1103) {
                insert = ["：您无权限进行此操作"]
            }
            // 开启做提示，结束不做提示
            command === "1" && this.wsPlayer.sendErrorMessage(704, {
                apiErrorInfo: err,
                insert
            });
        })
    }

    __setPtzCamera(operateType, direct, command) {
        // operateType 操作类型：1=变倍，2=变焦，3=光圈
        // direct 	方向：1=增加，2=减小
        // command 	命令：0=停止，1=开启
        const params = {
            project: 'PSDK',
            method: 'DMS.Ptz.OperateCamera',
            data: {
                operateType,
                direct,
                command,
                step: '4',
                channelId: this.channel.id
            }
        };
        this.setPtzCamera && this.setPtzCamera(params).then(res => {
            let data = res.data || res;
            // 开启做提示，结束不做提示
            if(command === "1" && data.result && data.result === "0") {
                this.wsPlayer.sendErrorMessage(701, {
                    insert: [res.data.lockUser.userName],
                    apiErrorInfo: res,
                });
            }
        }).catch(err => {
            let type = ['', '变倍', '变焦', '光圈'];
            let direct = ['', '+', '-'];
            let data = err.data || err;
            let insert = ["", "", ""];
            if(data.code === 1103) {
                insert = [type[params.data.operateType], direct[params.data.direct], "：您无权限进行此操作"]
            }
            // 开启做提示，结束不做提示
            command === "1" && this.wsPlayer.sendErrorMessage(703, {
                apiErrorInfo: err,
                insert
            });
        })
    }

    // 开启三维定位
    __openSitPosition(openSitPositionFlag) {
        this.openSitPositionFlag = openSitPositionFlag;
        // 获取三维定位的canvas节点
        let playerList = this.wsPlayer.playerList;
        let selectIndex = this.wsPlayer.selectIndex;
        this.canvasElem = playerList[selectIndex].pztCanvasElem;
        // 添加事件
        this.canvasElem.addEventListener("mousedown", this.mousedownCanvasEvent)
        this.canvasElem.addEventListener("mousemove", this.mousemoveCanvasEvent)
        this.canvasElem.addEventListener("mouseup", this.mouseupCanvasEvent)
        this.canvasContext = this.canvasElem.getContext("2d");
        this.canvasContext.lineWidth = 2;
        this.canvasContext.strokeStyle = "#009cff";
        if(this.openSitPositionFlag) {
            this.channelCodeForPositionList[selectIndex] = this.channel.id;
            $(this.canvasElem).css({display: "block"})
            $('.ws-pan-tilt-pzt-select', this.$el).attr({src: `${this.prefixUrl}/WSPlayer/icon/ptz-select-hover.svg`})
        } else {
            this.channelCodeForPositionList[selectIndex] = null;
            $(this.canvasElem).css({display: "none"})
            $('.ws-pan-tilt-pzt-select', this.$el).attr({src: `${this.prefixUrl}/WSPlayer/icon/ptz-select.svg`})
        }
    }

    __mousedownCanvasEvent(e) {
        if(e.target !== this.canvasElem) {
            return;
        }
        if(e.offsetX || e.layerX) {
            // 确定起始点及绘制状态
            this.pointX = e.offsetX || e.layerX;
            this.pointY = e.offsetY || e.layerY;
            this.startDraw = true;
        }
    }

    __mousemoveCanvasEvent(e) {
        if(e.target !== this.canvasElem) {
            return;
        }
        if (this.startDraw && (e.offsetX || e.layerX)) {
            const pointX = e.offsetX || e.layerX;
            const pointY = e.offsetY || e.layerY;
            const reactW = (pointX - this.pointX);
            const reactH = (pointY - this.pointY);
            // 清空画布
            this.canvasContext.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);
            // 开始绘制
            this.canvasContext.beginPath();
            this.canvasContext.strokeRect(this.pointX, this.pointY, reactW, reactH);
        }
    }

    __mouseupCanvasEvent(e) {
        if(e.target !== this.canvasElem) {
            return;
        }
        if (e.offsetX || e.layerX) {
            this.startDraw = false;
            // 结束点坐标
            const pointX = e.offsetX || e.layerX;
            const pointY = e.offsetY || e.layerY;
            // 定义换算后的坐标
            let dPointX = '';
            let dPointY = '';
            let dPointZ = '';
            // 矩形框中心点
            const canvasCenterX = (pointX + this.pointX) / 2;
            const canvasCenterY = (pointY + this.pointY) / 2;
            // 视频画面中心点
            const videoCenterX = this.canvasElem.width / 2;
            const videoCenterY = this.canvasElem.height / 2;
            // 矩形宽高
            const reactW = Math.abs(pointX - this.pointX);
            const reactH = Math.abs(pointY - this.pointY);
            const bReverse = pointX < this.pointX;
            // x, y换算
            dPointX = (canvasCenterX - videoCenterX) * 8192 * 2 / this.canvasElem.width;
            dPointY = (canvasCenterY - videoCenterY) * 8192 * 2 / this.canvasElem.height;
            // z值换算
            if (pointX === this.pointX || pointY === this.pointY)
            {
                dPointZ = 0;
            } else {
                // 面积比
                dPointZ = (this.canvasElem.width * this.canvasElem.height) / (reactW * reactH);
                if (bReverse) {
                    // 反向框选z为负值
                    dPointZ = -dPointZ;
                }
            }
            // 清空画布
            this.canvasContext.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);
            this.__controlSitPosition(dPointX, dPointY, dPointZ);
        }
    }

    // 给三维定位的canvas去除事件
    __removeCanvasEvent() {
        if(this.canvasElem) {
            this.canvasElem.removeEventListener("mousedown", this.mousedownCanvasEvent)
            this.canvasElem.removeEventListener("mousemove", this.mousemoveCanvasEvent)
            this.canvasElem.removeEventListener("mouseup", this.mouseupCanvasEvent)
            $(this.canvasElem).css({display: "none"})
            this.canvasElem = null;
            this.canvasContext = null;
            this.openSitPositionFlag = false;
            $('.ws-pan-tilt-pzt-select', this.$el).attr({src: `${this.prefixUrl}/WSPlayer/icon/ptz-select.svg`})
        }
    }

    // 给后台发送三维定位数据
    __controlSitPosition(dPointX, dPointY, dPointZ) {
        const params = {
            project: 'PSDK',
            method: 'DMS.Ptz.SitPosition',
            data: {
                magicId: localStorage.getItem('magicId') || '',
                pointX: String(Math.round(dPointX)),
                pointY: String(Math.round(dPointY)),
                pointZ: String(Math.round(dPointZ)),
                extend: '1',
                channelId: this.channel.id
            }
        };
        this.controlSitPosition && this.controlSitPosition(params).then(res => {
            let data = res.data || res;
            if(data.result && data.result === "0") {
                this.wsPlayer.sendErrorMessage(701, {
                    insert: [res.data.lockUser.userName],
                    apiErrorInfo: res,
                });
            }
        }).catch(err => {
            let data = err.data || err;
            let insert = [""];
            if(data.code === 1103) {
                insert[0] = "：您无权限进行此操作"
            }
            this.wsPlayer.sendErrorMessage(702, {
                apiErrorInfo: err,
                insert
            });
        })
    }

    _throttle(func, delay) {  
        let lastCall = 0;  
        return function(...args) {  
          const now = new Date().getTime();  
          if (now - lastCall < delay) {  
            return;  
          }  
          lastCall = now;  
          return func.apply(this, args);  
        }  
      }
}

export default PanTilt
