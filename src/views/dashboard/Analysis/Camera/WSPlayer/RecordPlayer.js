import PlayerItem from './PlayerItem'
import {Spinner} from './spin'
import CONSTANT from './CONSTANT'

const PlayerControl = window.PlayerControl;


/* ---------------- RecordPlayerItem ---------------- */
class RecordPlayerItem extends PlayerItem {
    /**
     * @param {*} opt.wrapperDomId 父级id
     * @param {*} opt.index 索引
     */
    constructor(opt) {
        super(opt)
        this.currentIndex = opt.index
        this.wrapperDomId = opt.wrapperDomId
        // 倍速
        this.speed = 1;
        this.canvasId = `${this.domId}-recordcanvas`
        this.ivsCanvasId = `${this.domId}-ivs-livecanvas`
        this.videoId = `${this.domId}-recordVideo`
        this.curTimestamp = 0
        this.initDom()
        this.defaultStatus = $('.default-status', this.$el)
        this.error = $('.error', this.$el)
        this.controller = $('.player-control', this.$el)
        this.timeInfo = $('.time-info', this.$el)
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
            <canvas id="${this.canvasId}" class="kind-stream-canvas" kind-channel-id="0" width="800" height="600"></canvas>
            <video id="${this.videoId}" class="kind-stream-canvas" kind-channel-id="0" muted style="display:none" width="800" height="600"></video>
            <canvas id="${this.ivsCanvasId}" class="kind-stream-canvas" style="position: absolute" kind-channel-id="0" width="800" height="600"></canvas>
            <div class="default-status">
                <img src="${this.wsPlayer.prefixUrl}/WSPlayer/icon/default.png" alt="">
            </div>
            <div class="player-control top-control-bar">
                <span class="stream-info"></span>
                <div class="opt-icons">
                    <div class="opt-icon record-icon" title="录像"></div>
                    <div class="opt-icon audio-icon off" title="声音"></div>
                    <div class="opt-icon capture-icon" title="抓图"></div>
                    <div class="opt-icon close-icon" title="关闭"></div>
                </div>
            </div>
            <div class="player-control record-control-bar">
                <div class="wsplayer-progress-bar">
                    <div class="progress-bar_background"></div>
                    <div class="progress-bar_hover_light"></div>
                    <div class="progress-bar_light"></div>
                </div>
                <div class="record-control-left">
                    <div class="opt-icon play-ctrl-btn play-icon play"></div>
                    <div class="time-info"></div>/<div class="time-long"></div>
                </div>
                <div class="record-control-right">
                    <div class="opt-icon close-icon"></div>
                </div>
            </div>
            <div class="error">
                <div class="error-message"></div>
            </div>
            <div class="play-pause-wrapper">
                <div class="play-ctrl-btn center-play-icon"></div>
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
        this.hideTimer = null
        this.$el.on('mouseenter mousemove', (evt) => {
            // 非创建和关闭状态，显示状态条，可关闭视频
            if(!["created", "closed"].includes(this.status)) {
                this.setDomVisible($('.player-control', $(`#${this.wrapperDomId}-${this.currentIndex}`)), true)
            }
            if (this.status === 'playing') {
                this.hideTimer && clearTimeout(this.hideTimer)
            } else if (this.status === 'ready') {
                this.setDomVisible(this.progressBar, true)
            }
        })
        this.$el.on('mouseleave', (evt) => {
            if (this.status === 'pause') {
                return
            }
            this.hideTimer = setTimeout(() => {
                this.setDomVisible($('.player-control', $(`#${this.wrapperDomId}-${this.currentIndex}`)), false)
            }, 300)
        })
        $('.wsplayer-progress-bar', this.$el).on('mousemove', (evt) => {
            $('.progress-bar_hover_light', this.$el).css({
                width: evt.offsetX + 'px'
            })
        })
        $('.wsplayer-progress-bar', this.$el).on('mouseleave', (evt) => {
            $('.progress-bar_hover_light', this.$el).css({
                width: 0
            })
        })
        $('.play-ctrl-btn', this.$el).click((evt) => {
            if (this.status === 'playing') {
                // 正在播放，暂停播放
                this.pause()
                $('.play-icon', this.$el).removeClass('play').addClass('pause')
            } else {
                // 暂停播放状态，打开
                this.play()
                $('.play-icon', this.$el).removeClass('pause').addClass('play')
            }
        })
    }
    /**
     * 设置状态，同时控制组件显示
     * created, ready, playing, pause, stop, closed, error
     */
    setStatus(status, msg) {
        // 状态改变时，向外发送状态变动情况
        this.wsPlayer.sendMessage("statusChanged", {status, windowIndex: this.index});
        this.status = status
        switch (this.status) {
            case 'created':
            case 'closed':
                this.setDomVisible(this.defaultStatus, true)
                this.setDomVisible(this.error, false)
                this.setDomVisible(this.controller, false)
                $('.audio-icon', this.$el).removeClass('on').addClass('off')
                break;
            case 'ready':
                this.setDomVisible(this.defaultStatus, false)
                this.setDomVisible(this.error, false)
                break;
            case 'playing':
                if(this.wsPlayer.selectIndex === this.index) {
                    $("#ws-record-time-box").css({visibility: "visible"});
                }
                this.setDomVisible(this.defaultStatus, false)
                this.setDomVisible(this.error, false)
                this.setDomVisible($('.play-pause-wrapper', this.$el), false)
                break;
            case 'pause':
                this.setDomVisible(this.defaultStatus, false)
                this.setDomVisible(this.error, false)
                this.setDomVisible(this.controller, false)
                this.setDomVisible($('.play-pause-wrapper', this.$el), true)
                break;
            case 'streamError':
                // 录像播放完成回调
                this.wsPlayer.sendMessage("recordFinish", this.options)
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
     * 播放录像
     * @param {String} options.decodeMode 可选参数 video | canvas
     * @param {String} options.wsURL 可选参数
     * @param {Function} options.recordSource 2=设备，3=中心
     * recordSource == 2 设备录像，按照时间方式播放
     * @param {String} options.rtspURL String
     * @param {Number | String} options.startTime 开始时间 时间戳或者'2021-09-18 15:40:00'格式的时间字符串
     * @param {Number | String} options.endTime 结束时间 时间戳或者'2021-09-18 15:40:00'格式的时间字符串
     * @param {Function} options.reload 重新拉流的回调函数，用于时间回放，返回promise
     * reload(newStarTime, endTime).then(newRtspUrl => { play continue})
     * recordSource == 3 中心录像，按照文件方式播放
     * @param {Function} options.RecordFiles 文件列表
     * @param {Function} options.getRtsp 文件列表
     * getRtsp(file).then(newRtspUrl => { play continue})
     */
    init(options) {
        if(this.wsPlayer.config.isDynamicLoadLib && !window.m_nModuleInitialized) {
            // 轮询判断，直到解码库初始化完成
            let timer = setTimeout(() => {
                this.init(options)
                clearTimeout(timer)
            }, 100)
            this.wsPlayer.sendErrorMessage("501");
            return;
        }
        this.options = options
        if (this.player) {
            if(this.isAudioPlay) {
                // 正在播放则关闭声音
                $('.audio-icon', this.$el).removeClass('on').addClass('off')
            }
            this.close(true)
        }
        if (this.spinner) {
            this.spinner.stop()
        }
        this.spinner = new Spinner({
            color: '#ffffff'
        }).spin(this.$el[0])
        this.createPlayer(options);
    }
    createPlayer(options) {
        let self = this
        this.player = new PlayerControl({
            wsURL: options.wsURL,
            rtspURL: options.rtspURL,
            isPlayback: options.isPlayback,
            config: this.wsPlayer.config,
            rtspResponseTimeout: this.wsPlayer.rtspResponseTimeout,
            events: {
                // 开始播放
                PlayStart: e => {
                    // 录像回放获取到第一帧的时候进行暂停播放
                    // self.pause();
                    console.log("PlayStart")
                    self.setStatus('playing')
                    // 开始播放后设置播放暂停按钮状态
                    if(self.wsPlayer.selectIndex === self.index) {
                        $(".ws-record-play", self.wsPlayer.$el).css({display: "none"});
                        $(".ws-record-pause", self.wsPlayer.$el).css({display: "block"});
                    }
                },
                // 开始解码
                DecodeStart: e => {
                    console.log('DecodeStart', e)
                    // 同一个设备两个不同服务器录像跳转播放时，需要解码时手动做个跳转
                    if(self.DecodeStart && self.wsPlayer.config.playCenterRecordByTime) {
                        self.DecodeStart();
                        self.DecodeStart = null;
                    }
                    self.spinner.stop()
                    if (e.decodeMode === 'video') {
                        self.videoElem.style.display = '';
                        self.canvasElem.style.display = 'none';
                    } else {
                        self.videoElem.style.display = 'none';
                        self.canvasElem.style.display = '';
                    }
                    // 设置拉伸或者自适应
                    self.updateAdapter(options.playerAdapter, e);
                    // 若视频正在加载中，是没有宽高的
                    $('.stream-info', $(`#${self.domId}`)).text(e.width ? `${e.encodeMode}, ${e.width}*${e.height}` : e.encodeMode);
                    self.wsPlayer.sendMessage('recordSuccess', options) // 表示拉流成功
                },
                // 获取帧率
                GetFrameRate: e => {
                    console.log('GetFrameRate: ', e)
                },
                // 录像回放获取当前录像时长
                GetRtspRange: range => {
                    console.log('GetRtspRange: ', range)
                    // 如果是流地址，需要设置时间轴
                    if(options.playType === 'url') {
                        self.wsPlayer.setTimeLine(options.records)
                    }
                },
                // 报错
                Error: e => {
                    // 由于error里有延迟任务，避免延迟任务触发期间切换视频导致延迟任务触发到新的视频里，加一个判断
                    // 每个视频的symbol都是唯一的
                    if(self.player && e.symbol === self.player.ws.symbol) {
                        // 提示408 3s超时，页面不显示超时
                        if(e.errorCode === "408") {
                            return;
                        }
                        self.spinner.stop()
                        console.log('Error: ' + JSON.stringify(e))
                        self.setStatus('error', e)
                        self.wsPlayer.sendMessage("recordError", options, err)
                    }
                },
                // 文件播放结束
                FileOver: e => {
                    console.log('回放播放完成')
                    // 如果是流地址模式, 则
                    if(options.playType === 'url') {
                        self.wsPlayer.sendMessage('recordFinish', options)
                        return
                    }
                    let nextSSID = "";
                    let ssId = self.options.ssId;
                    let ssIdList = self.options.ssIdList || []
                    if(ssId) {
                        nextSSID = ssIdList[ssIdList.indexOf(ssId) + 1];
                    }
                    // 按文件播放，可播放下一段录像
                    // 按时间播放，存在下一个ssid时，才播放下一段录像
                    if(!self.options.playRecordByTime || nextSSID) {
                        self.close()
                        self.wsPlayer.playNextRecord(self.index, nextSSID)
                    } else {
                        self.close()
                        self.setStatus('streamError', {
                            errorCode: '411',
                            description: "Record Finished"
                        })
                    }
                },
                // 获取视频时间信息
                UpdatePlayingTime: (year, month, day, hour, minute, second) => {
                    self.status === "playing" && self.wsPlayer.__setPlayingTime(self.index, year, month, day, hour, minute, second);
                }
            }
        })
        this.timeLong = options.endTime - options.startTime
        let seconds = this.timeLong % 60
        let minutes = (parseInt(this.timeLong / 60)) % 60
        let hours = (parseInt(this.timeLong / 3600))  % 60
        this.timeLongStr = `${hours > 0 ? hours + ':' : ''}${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
        $('.time-long', this.$el).text(this.timeLongStr)
        this.setStatus('ready')

        this.player.init(this.canvasElem, this.videoElem, this.ivsCanvasElem);
        this.player.connect();
        // 开启规则线
        // 设置规则线类型
        if(this.wsPlayer.config.openIvs) {
            this.player.openIVS();
        }
        window.wsPlayerManager.bindPlayer(this.player.nPlayPort, this.player);
    }
    /**
     * 倍速播放
     * @param {Number} speed 倍速
     */
    playSpeed(speed) {
        this.speed = speed;
        // 倍速无法播放音频
        if(speed !== 1) {
            this.player.setAudioVolume(0);
            $(".audio-icon", this.$el).removeClass('on').addClass('off')
            this.isAudioPlay = false;
        }
        this.player && this.player.playSpeed(speed)
    }
}

export default RecordPlayerItem
