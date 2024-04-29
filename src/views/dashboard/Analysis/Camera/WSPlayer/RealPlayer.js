import PlayerItem from './PlayerItem'
import {Spinner} from './spin'
import CONSTANT from './CONSTANT'
const PlayerControl = window.PlayerControl;
// import PlayerControl from './module/playerControl';
/* ---------------- PlayerItem ---------------- */
class RealPlayerItem extends PlayerItem {
    /**
     * @param {*} opt.wrapperDomId 父级id
     * @param {*} opt.index 索引
     */
    constructor(opt) {
        super(opt)
        this.currentIndex = opt.index
        this.wrapperDomId = opt.wrapperDomId
        this.canvasId = `${this.domId}-livecanvas`
        this.ivsCanvasId = `${this.domId}-ivs-livecanvas`
        this.pztCanvasId = `${this.domId}-pzt-livecanvas`
        this.videoId = `${this.domId}-liveVideo`
        this.initDom()
        this.defaultStatus = $('.default-status', this.$el)
        this.error = $('.error', this.$el)
        this.controller = $('.player-control', this.$el)
        // 控制栏禁用双击事件。避免多次点击按钮导致切屏
        this.controller.dblclick(e => {
            e.stopPropagation();
        })
        this.initMouseEvent()
        /**
         * this.state 当前Player状态
         * created, ready, playing, pause, stop, closed, error
         */
        this.setStatus('created')
    }

    /**
     * 播放器模板
     */
    getTemplate() {
        let template = `
        <div id="${this.domId}" style="visibility: hidden; top: 150%; left: 0; width: 0; height: 0;" class="wsplayer-item wsplayer-item-${this.index} ${this.index === 0 ? 'selected' : 'unselected'}">
            <div class="ws-full-content ws-flex">
                <canvas id="${this.canvasId}" class="kind-stream-canvas" kind-channel-id="0" width="800" height="600"></canvas>
                <video id="${this.videoId}" class="kind-stream-canvas" kind-channel-id="0" muted style="display:none" width="800" height="600"></video>
                <canvas id="${this.ivsCanvasId}" class="kind-stream-canvas" style="position: absolute" kind-channel-id="0" width="800" height="600"></canvas>
                <canvas id="${this.pztCanvasId}" class="kind-stream-canvas" style="display: none; position: absolute" kind-channel-id="0" width="800" height="600"></canvas>
            </div>
            <div class="default-status">
                <img src="${this.wsPlayer.prefixUrl}/WSPlayer/icon/default.png" alt="">
            </div>
            <div class="player-control top-control-bar">
                <div class="stream">
                    <div class="select-container">
                        <div class="select-show select">
                            <div class="code-stream">主码流</div>
                            <!-- 下拉箭头 -->
                            <img src="${this.wsPlayer.prefixUrl}/WSPlayer/icon/spread.png" />
                        </div>
                        <div class="stream-type" style="display: none">
                            <ul class="select-ul">
                                <li optionValue="主码流" stream-type="1" class="stream-type-item">主码流</li>
                                <li optionValue="辅码流1" stream-type="2" class="stream-type-item">辅码流1</li>
                                <li optionValue="辅码流2" stream-type="3" class="stream-type-item">辅码流2</li>
                            </ul>
                        </div>
                    </div>
                    <span class="stream-info"></span>
                </div>
                <div class="opt-icons">
                    <div class="opt-icon talk-icon off" title="对讲"></div>
                    <div class="opt-icon record-icon" title="录像"></div>
                    <div class="opt-icon audio-icon off" title="声音"></div>
                    <div class="opt-icon capture-icon" title="抓图"></div>
                    <div class="opt-icon close-icon" title="关闭"></div>
                </div>
            </div>
            <div class="ws-talking">对讲中...</div>
            <div class="error">
                <div class="error-message"></div>
            </div>
        </div>
        `
        return template
    }

    /**
     * 事件监听
     */
    initMouseEvent() {
        super.initMouseEvent()
        let self = this;
        this.hideTimer = null
        this.$el.on('mouseenter mousemove', (evt) => {
            // 非创建和关闭状态，显示状态条，可关闭视频
            if(!["created", "closed"].includes(this.status)) {
                this.setDomVisible($('.player-control', $(`#${this.wrapperDomId}-${this.currentIndex}`)), true)
            }
            if(this.status === 'playing' || this.status === 'error') {
                this.hideTimer && clearTimeout(this.hideTimer)
            }
        })
        this.$el.on('mouseleave', (evt) => {
            this.hideTimer = setTimeout(() => {
                $(".stream-type", this.$el).hide();
                this.setDomVisible($('.player-control', $(`#${this.wrapperDomId}-${this.currentIndex}`)), false)
                this.streamSelectShow = false;
            }, 300)
        })
        // 点击切换码流
        this.streamSelectShow = false;
        $(".select", this.$el).click(e => {
            if(this.streamSelectShow) {
                $(".stream-type", this.$el).hide();
                this.streamSelectShow = false;
            } else {
                $(".stream-type", this.$el).show();
                this.streamSelectShow = true;
            }
        })
        $(".stream-type", this.$el).click(e => {
            let streamTypeValue = e.target.getAttribute("stream-type")
            // 码流发生了切换才进行码流切换操作
            if(self.streamType !== streamTypeValue && self.options) {
                // 通知业务层码流发生变化
                self.wsPlayer.changeStreamType(
                    self.options.channelData,
                    streamTypeValue,
                    self.index
                )
            }
        })
    }

    /**
     * 设置码流类型
     * @param streamType
     */
    setStreamType(streamType) {
        this.streamType = streamType;
        // 获取需要高亮的元素
        let target = $(".stream-type .select-ul", this.$el)[0].children[streamType - 1];
        $(".code-stream", this.$el).text($(target).attr("optionValue"))
        // 给选中的码流进行高亮显示，同时将其他两个码流取消高亮
        $(target).addClass("stream-type-select").siblings().removeClass("stream-type-select")
    }

    /**
     * 设置状态，同时控制组件显示
     * created, playing, pause, stop, closed, error
     */
    setStatus(status, msg) {
        // 状态改变时，向外发送状态变动情况
        this.wsPlayer.sendMessage("statusChanged", {status, windowIndex: this.index});
        this.status = status
        switch(this.status) {
            case 'created':
            case 'closed':
                this.setDomVisible(this.defaultStatus, true)
                this.setDomVisible(this.error, false)
                this.setDomVisible(this.controller, false)
                this.videoElem.src = ''
                $('.audio-icon', this.$el).removeClass('on').addClass('off')
                break;
            case 'ready':
            case 'playing':
            case 'pause':
                this.setDomVisible(this.defaultStatus, false)
                this.setDomVisible(this.error, false)
                break;
            case 'error':
                this.setDomVisible(this.defaultStatus, false)
                $('.error-message', this.$el).text(CONSTANT.errorVideoInfo[msg.errorCode] ? CONSTANT.errorVideoInfo[msg.errorCode] : CONSTANT.errorVideoInfo['defaultErrorMsg'])
                this.setDomVisible(this.error, true)
                break;
            default:
                break;
        }
    }

    /**
     * 初始化播放器
     * @param {*} options.rtspURL
     * @param {*} options.decodeMode 可选参数
     * @param {*} options.wsURL 可选参数
     * @param {*} options.streamType 码流类型
     * @param {*} options.channelId 通道id
     */
    init(options) {
        if(this.wsPlayer.config.isDynamicLoadLib && !window.m_nModuleInitialized) {
            let timer = setTimeout(() => {
                this.init(options)
                clearTimeout(timer)
            }, 100)
            // this.wsPlayer.sendErrorMessage("501");
            return;
        }
        // 是否切换码流，或者重复播放同一路视频
        let changeFrameData = (this.options || {}).channelId === options.channelId;
        this.options = options
        if(this.player) {
            if(this.isAudioPlay) {
                // 正在播放则关闭声音
                $('.audio-icon', this.$el).removeClass('on').addClass('off')
            }
            this.close(true, changeFrameData)
        }
        // 控制对讲按钮隐藏显示
        this.setTalkIconShow((options.channelData || {}).domainId);
        if(this.spinner) {
            this.spinner.stop()
        }
        this.spinner = new Spinner({
            color: '#ffffff'
        }).spin(this.$el[0])
        this.setStatus('ready')
        this.setStreamType(options.streamType);

        this.createPlayer(options)
    }

    startPlay(options, e) {
        let self = this
        if(e.decodeMode === 'video') {
            self.videoElem.style.display = '';
            self.canvasElem.style.display = 'none';
        } else {
            self.videoElem.style.display = 'none';
            self.canvasElem.style.display = '';
        }
        // 设置拉伸或者自适应
        self.updateAdapter(options.playerAdapter, e);
        this.width = e.width;
        this.height = e.height;
        // 若视频正在加载中，是没有宽高的
        $('.stream-info', $(`#${self.domId}`)).text(`${e.encodeMode ? `${e.encodeMode}, ` : ''}${e.width ? `${e.width}*` : ''}${e.height ? e.height : ''}`)
    }

    createPlayer(options) {
        let self = this
        this.player = new PlayerControl({
            wsURL: options.wsURL,
            rtspURL: options.rtspURL,
            config: this.wsPlayer.config,
            rtspResponseTimeout: this.wsPlayer.rtspResponseTimeout,
            events: {
                // 开始播放
                PlayStart: e => {
                    console.log("PlayStart", e);
                    self.spinner.stop()
                    self.setStatus('playing')
                },
                // 开始解码
                DecodeStart: e => {
                    console.log("DecodeStart", e);
                    self.startPlay(options, e);
                    self.wsPlayer.sendMessage('realSuccess', options) // 表示拉流成功
                },
                // 获取帧率
                GetFrameRate: e => {
                    console.log("GetFrameRate", e);
                    self.startPlay(options, e)
                },
                // 报错
                Error: e => {
                    // 由于error里有延迟任务，避免延迟任务触发期间切换视频导致延迟任务触发到新的视频里，加一个判断
                    // 每个视频的symbol都是唯一的
                    if(self.player && self.player.ws && e.symbol === self.player.ws.symbol) {
                        // 提示408 3s超时 409 默认8s超时，页面不显示超时
                        if(e.errorCode === "408" || e.errorCode === "409") {
                            // 如果短时间超时，则由辅码流自动切成主码流
                            if(String(self.streamType) === "2") {
                                self.wsPlayer.changeStreamType(self.options.channelData, "1", self.index)
                                return;
                            }
                            if(e.errorCode === "408") {
                                return;
                            }
                        }
                        self.spinner.stop()
                        console.log('Error: ' + JSON.stringify(e))
                        self.setStatus('error', e)
                        self.wsPlayer.sendMessage("realError", options, e)
                    }
                },
                // 录像文件播放结束
                FileOver: e => {
                    console.log('FileOver: ', e)
                },
                // 获取视频时间信息
                UpdatePlayingTime: e => {
                    // e - timeStamp
                }
            }
        });

        // 初始化播放器
        this.player.init(this.canvasElem, this.videoElem, this.ivsCanvasElem);
        // 开始连接websocket并开始播放
        this.player.connect();
        // 开启规则线
        // 设置规则线类型
        if(this.wsPlayer.config.openIvs) {
            this.player.openIVS();
        }
        window.wsPlayerManager.bindPlayer(this.player.nPlayPort, this.player);
    }

    /**
     * 开始对讲
     * @param options
     */
    startTalk(options) {
        if(this.wsPlayer.config.isDynamicLoadLib && !window.m_nModuleInitialized) {
            this.wsPlayer.sendErrorMessage("502");
            return;
        }
        // 设置正在对讲的标志位
        this.wsPlayer.isTalking = true;
        this.isTalking = true;
        // 开启对讲按钮
        $('.talk-icon', this.$el).removeClass('off').addClass('on')
        let self = this;
        this.wsPlayer.__getWSUrl(options.rtspURL, options.serverIp, options.wsList).then(wsUrl => {
            this.talkPlayer = new PlayerControl({
                rtspURL: options.rtspURL,
                wsURL: wsUrl,
                isTalkService: true,
                config: this.wsPlayer.config,
                events: {
                    // 报错
                    Error: e => {
                        // 对讲失败
                        if(e.errorCode === "504") {
                            self.stopTalk();
                            self.wsPlayer.sendMessage("talkError", e)
                        }
                    }
                }
            })
            this.talkPlayer.talk("on")
            window.wsPlayerManager.bindPlayer(this.talkPlayer.nPlayPort, this.talkPlayer);
            $('.ws-talking', this.$el).css({visibility: 'visible'})
            // 关闭所有视频的音频
            this.closeOtherAudio()
        })
    }

    /**
     * 根据url进行对讲
     */
    talkByUrl(options) {
        if(this.wsPlayer.config.isDynamicLoadLib && !window.m_nModuleInitialized) {
            this.wsPlayer.sendErrorMessage("502");
            return;
        }
        // 设置正在对讲的标志位
        this.wsPlayer.isTalking = true;
        this.isTalking = true;
        // 开启对讲按钮
        $('.talk-icon', this.$el).removeClass('off').addClass('on')
        let self = this;
        this.talkPlayer = new PlayerControl({
            rtspURL: options.rtspURL,
            wsURL: options.wsURL,
            isTalkService: true,
            config: this.wsPlayer.config,
            events: {
                // 报错
                Error: e => {
                    // 对讲失败
                    if(e.errorCode === "504") {
                        self.stopTalk();
                        self.wsPlayer.sendMessage("talkError", e)
                    }
                }
            }
        })
        this.talkPlayer.talk("on")
        window.wsPlayerManager.bindPlayer(this.talkPlayer.nPlayPort, this.talkPlayer);
        $('.ws-talking', this.$el).css({visibility: 'visible'})
        // 关闭所有视频的音频
        this.closeOtherAudio()
    }

    /**
     * 结束对讲
     */
    stopTalk() {
        this.talkPlayer && window.wsPlayerManager.unbindPlayer(this.talkPlayer.nPlayPort)
        // 设置结束对讲的标志位
        if(this.isTalking) {
            this.wsPlayer.isTalking = false;
            this.isTalking = false;
        }
        if(this.talkPlayer) {
            this.talkPlayer.talk("off")
            this.talkPlayer = null;
        }
        // 关闭对讲按钮
        $('.talk-icon', this.$el).removeClass('on').addClass('off')
        $('.ws-talking', this.$el).css({visibility: 'hidden'})
        // 流地址模式返回此数据
        if(this.options.playType === 'url') {
            this.wsPlayer.sendMessage('stopTalk', this.options)
        }
    }
}

export default RealPlayerItem
