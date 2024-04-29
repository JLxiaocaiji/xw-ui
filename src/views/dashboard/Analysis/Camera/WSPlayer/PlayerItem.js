import utils from "./utils";

/**
 * PlayerItem
 */
class PlayerItem {
    /**
     * @param {*} opt.wrapperDomId 父级id
     * @param {*} opt.index 索引
     */
    constructor(opt) {
        // dom
        this.$el = null
        // 播放用元素
        this.canvasElem = null
        this.videoElem = null
        this.wrapperDomId = opt.wrapperDomId
        // 每个组件的dom唯一 id
        this.domId = opt.wrapperDomId + '-' + opt.index
        // 所属的wsplayer
        this.wsPlayer = opt.wsPlayer
        // index序号
        this.index = opt.index
        // 第一帧事件
        this.firstTime = 0
        // audioOn
        this.isAudioPlay = false
        // 倍速播放
        this.speed = 1;
    }

    /**
     * @param {*} domId 此播放器的id
     */
    initDom() {
        let template = this.getTemplate()
        let player = $(template)
        this.wsPlayer.$wrapper.append(player[0])
        this.$el = $('#' + this.domId)
        this.canvasElem = document.getElementById(this.canvasId) || {}
        this.ivsCanvasElem = document.getElementById(this.ivsCanvasId) || {}
        this.pztCanvasElem = document.getElementById(this.pztCanvasId) || {}
        this.videoElem = document.getElementById(this.videoId)
        // 隐藏bar上的按钮
        let showIcons = this.wsPlayer.config.showIcons || {};
        if(!showIcons.streamChangeSelect) {
            $(".select-container", this.$el).css({display: "none"})
        }
        this.setTalkIconShow()
        if(!showIcons.audioIcon) {
            $(".audio-icon", this.$el).css({display: "none"})
        }
        if(!showIcons.snapshotIcon) {
            $(".capture-icon", this.$el).css({display: "none"})
        }
        if(!showIcons.localRecordIcon) {
            $(".record-icon", this.$el).css({display: "none"})
        }
        if(!showIcons.closeIcon) {
            $(".close-icon", this.$el).css({display: "none"})
        }
    }

    /**
     * 控制对讲按钮是否显示
     * @param domainId 下级域id
     */
    setTalkIconShow(domainId) {
        let {talkIcon} = this.wsPlayer.config.showIcons || {};
        let protocol = location.protocol;
        // 不显示对讲按钮场景：
        // 1、手动隐藏显示 - talkIcon
        // 2、http无法使用对讲功能（浏览器处于安全考虑，禁用http协议下调用媒体api，无法收集音频）
        // 3、存在下级域id，表示是级联通道，级联不支持对讲
        // 4、录像回放模式不支持对讲
        if(talkIcon && protocol === "https:" && this.wsPlayer.type === "real") {
            $(".talk-icon", this.$el).css({display: "block"})
        } else {
            $(".talk-icon", this.$el).css({display: "none"})
        }
    }

    // 添加监听
    initMouseEvent() {
        this.$el.click((evt) => {
            this.wsPlayer.setSelectIndex(this.index)
            this.$el.siblings().removeClass('selected').addClass('unselected')
            this.$el.removeClass('unselected').addClass('selected')
        })
        // 双击播放器
        this.$el.dblclick((evt) => {
            // 如果最大窗口为1，则双击不切换四分屏
            if(this.wsPlayer.options.config.maxNum === 1) {
                return;
            }
            // 表示当前非全屏
            if(this.wsPlayer.showNum !== 1) {
                // 全屏
                this.wsPlayer.beforeShowNum = this.wsPlayer.showNum
                let allScreen = $(`#${this.wrapperDomId} .wsplayer-item`)
                this.wsPlayer.resetPlayerScreen(allScreen, this.wsPlayer.options.config.maxNum)
                $(`#${this.wrapperDomId}-${this.index}`).css({
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    visibility: 'visible',
                })
                this.wsPlayer.showNum = 1
             } else {
                // 退出全屏
                this.wsPlayer.setPlayerNum(this.wsPlayer.beforeShowNum, true)
            }
            this.wsPlayer.setSelectIndex(this.index)
            this.$el.siblings().removeClass('selected').addClass('unselected')
            this.$el.removeClass('unselected').addClass('selected')
            setTimeout(() => {
                this.wsPlayer.__updatePlayerWindow();
            }, 200)

        })
        // 音频
        $('.audio-icon', this.$el).click((evt) => {
            // 对讲的时候，无法开启音频
            if(this.wsPlayer.isTalking) {
                this.wsPlayer.sendErrorMessage(this.isTalking ? "301" : "302")
                return;
            }
            if (this.isAudioPlay) {
                // 正在播放，关闭声音
                this.player.setAudioVolume(0);
                $(evt.target).removeClass('on').addClass('off')
            } else {
                // 录像回放支持 0.25 ~ 4 倍速播放声音，8倍速需要关闭声音
                if(this.player.isPlayback && this.speed === 8) {
                    this.wsPlayer.sendErrorMessage("204", {insert: [this.speed]})
                    return;
                }
                // 关闭其他视频的音频，否则会串音
                this.closeOtherAudio();
                // 未播放，打开声音
                this.player.setAudioVolume(1);
                this.resumeAudio();
                $(evt.target).removeClass('off').addClass('on')
            }
            this.isAudioPlay = !this.isAudioPlay
        })
        const audioEvent = (evt) => {
            if(location.protocol === 'http:') {
                // http协议不支持对讲
                this.wsPlayer.sendErrorMessage("305")
                return;
            }
            // 其他窗口有对讲时进行提示
            if (this.wsPlayer.isTalking && !this.isTalking) {
                // 其他设备对讲中，无法开启对讲
                this.wsPlayer.sendErrorMessage("303")
            } else if(this.isTalking) {
                // 本窗口在进行对讲，则关闭对讲
                this.stopTalk();
            } else {
                // 如果是流地址
                if(this.options.playType === 'url') {
                    this.wsPlayer.sendMessage('notifyTalk', this.options)
                }
                this.resumeAudio();
                // 权限控制
                this.setAuthority({
                    channelCode: this.options.channelData ? this.options.channelData.channelCode : this.options.channelId,
                    function: "3"
                }, () => {
                    // 如果都没有在对讲，则通知业务层获取对讲rtsp
                    this.wsPlayer.talkIndex = this.index;
                    this.wsPlayer.__startTalk(this.options.channelData);
                }, err => {
                    if (err.code === 1103) {
                        this.wsPlayer.sendErrorMessage(401, { type: 'talk' });
                    }
                })
            }
        }
        // 对讲
        $('.talk-icon', this.$el).click(utils.throttle(audioEvent, 2000))
        // 抓图
        $('.capture-icon', this.$el).click((evt) => {
            let channelName = (this.options.channelData || {}).name || "抓图";
            // 权限控制
            this.setAuthority({
                channelCode: this.options.channelData ? this.options.channelData.channelCode : this.options.channelId,
                function: "4"
            }, () => {
                // 可传第二个智能帧DOM的参数，在抓图中显示智能线
                // this.player.capture(`抓图_${channelName}_${utils.getDateFormatByUnderline()}`, this.ivsCanvasElem);
                this.player.capture(`抓图_${channelName}_${utils.getDateFormatByUnderline()}`);
            }, err => {
                if (err.code === 1103) {
                    this.wsPlayer.sendErrorMessage(401, { type: 'capture' });
                }
            })
        })
        // 关闭视频
        $('.close-icon', this.$el).click((evt) => {
            this.close();
        })
        // 本地录像
        $('.record-icon', this.$el).click((evt) => {
            let channelName = (this.options.channelData || {}).name || "录像";
            if (this.isRecording) {
                // 结束录像
                this.isRecording = false
                this.player.stopLocalRecord()
                $(evt.target).removeClass('recording')
            } else if(this.status === "playing") {
                // 权限控制
                this.setAuthority({
                    channelCode: this.options.channelData ? this.options.channelData.channelCode : this.options.channelId,
                    function: "8"
                }, () => {
                    // 正在播放的时候才能开始录像
                    // 开始录像
                    this.isRecording = true
                    // 开始录像，参数是每个录像文件的大小，单位兆
                    this.player.startLocalRecord(`视频_${channelName}_${utils.getDateFormatByUnderline()}`);
                    $(evt.target).addClass('recording')
                }, err => {
                    if (err.code === 1103) {
                        this.wsPlayer.sendErrorMessage(401, { type: 'record' });
                    }
                })
            }
        })
    }

    // 关闭其他视频的音频
    closeOtherAudio() {
        this.wsPlayer.playerList.forEach(playerItem => {
            // 若开启音频，则关闭
            if(playerItem.isAudioPlay) {
                playerItem.isAudioPlay = false;
                playerItem.player.setAudioVolume(0);
                $('.audio-icon', playerItem.$el).removeClass('on').addClass('off')
            }
        })
    }

    // 权限控制
    setAuthority(params, callback, errorCallBack) {
        if (this.wsPlayer.fetchChannelAuthority) {
            this.wsPlayer.fetchChannelAuthority(params).then(res => {
                if (res.data.result) {
                    callback();
                }
            }).catch(err => {
                errorCallBack(err);
            })
        } else {
            callback();
        }
    }

    // 开启音频
    // 苹果手机播放音频需要在点击事件中手动开启
    resumeAudio() {
        if(!window.wsAudioPlayer) {
            let intervalId = setInterval(() => {
                if(window.wsAudioPlayer) {
                    window.wsAudioPlayer.manualResume('fromTalk')
                    clearInterval(intervalId);
                }
            }, 100)
        } else {
            window.wsAudioPlayer.manualResume('fromTalk')
        }
    }

    // 设置状态
    setStatus() {}
    /**
     * 播放视频
     */
    play() {
        this.player.playSpeed(this.speed)
        this.setStatus('playing')
        $(".ws-record-play", this.wsPlayer.$el).css({display: "none"});
        $(".ws-record-pause", this.wsPlayer.$el).css({display: "block"});
    }
    /**
     * 暂停视频
     */
    pause() {
        this.player.pause()
        this.setStatus('pause')
        $(".ws-record-pause", this.wsPlayer.$el).css({display: "none"});
        $(".ws-record-play", this.wsPlayer.$el).css({display: "block"});
    }

    /**
     * 关闭视频
     * @param changeVideoFlag 是否因切换其他视频关闭现在视频
     * @param changeFrameData 是否正在切换码流
     */
    close(changeVideoFlag = false, changeFrameData = false) {
        this.wsPlayer.videoClosed(this.index, changeVideoFlag, {...(this.options && this.options.channelData || {})});
        // 关闭视频的时候，也要关闭播放按钮
        this.setDomVisible($('.play-pause-wrapper', this.$el), false)
        // 关闭视频后也需要隐藏播放器
        this.videoElem.style.display = 'none';
        this.canvasElem.style.display = 'none';
        // 关闭对讲（切换码流或者重复播放一路视频时，不关闭对讲）
        if(this.isTalking && !changeFrameData) {
            this.stopTalk();
        }
        // 重置倍速
        this.speed = 1;
        // 当选择的窗口关闭回放的时候也需要清空时间轴
        if(this.index === this.wsPlayer.selectIndex) {
            if(this.wsPlayer.type === "real") {
                // 切换视频时，由设置通道函数去设置云台启动，此时不手动禁用云台
                // 非切换视频而关闭视频时，直接设置云台通道为空，禁用云台
                !changeVideoFlag && this.wsPlayer.setPtzChannel()
            } else {
                // 当选择的窗口关闭回放的时候也需要清空时间轴
                this.wsPlayer.setTimeLine([]);
                this.wsPlayer.__setPlaySpeed();
                $(".ws-record-play", this.wsPlayer.$el).css({display: "block"});
                $(".ws-record-pause", this.wsPlayer.$el).css({display: "none"});
            }
        }
        if(this.isRecording) {
            // 结束录像
            this.isRecording = false
            this.player.stopLocalRecord()
            $('.record-icon', this.$el).removeClass('recording')
        }
        // 关闭规则线
        if(this.wsPlayer.config.openIvs && this.player) {
            this.player.closeIVS();
        }
        // 销毁“加载中”样式
        this.spinner && this.spinner.stop()
        this.player && this.player.stop()
        this.player && this.player.close()
        this.player && window.wsPlayerManager.unbindPlayer(this.player.nPlayPort)
        // 关闭视频后清空一些数据
        if(!changeVideoFlag) {
            this.player = null;
            this.options = null;
        }
        this.setStatus('closed')
    }

    // 设置元素是否可见
    setDomVisible(dom, visible) {
        dom && dom.css({
            visibility: visible ? 'visible' : 'hidden'
        })
    }

    /**
     * 更新播放器是自适应还是拉伸
     */
    updateAdapter(playerAdapter, e = {}) {
        // 视频流分辨率长宽比
        let ratio = e.width / e.height;
        // el：播放器节点
        let el = (e.decodeMode || this.decodeMode) === "video" ? this.videoElem : this.canvasElem;
        // 播放器父节点，根据父节点大小来进行缩放
        let elParent = el.parentNode;
        if(e.decodeMode) {
            this.decodeMode = e.decodeMode;
            // 将分辨率存储起来
            this.width = e.width;
            this.height = e.height;
        } else {
            ratio = this.width / this.height;
        }
        let width = "100%";
        let height = "100%";
        if(playerAdapter === "selfAdaption") {
            // 自适应
            let elParentHeight = elParent.offsetHeight;
            let elParentWidth = elParent.offsetWidth;
            let elRatio = elParentWidth / elParentHeight;
            if(ratio > elRatio) {
                height = `${elParentWidth / ratio}px`;
            } else if(ratio < elRatio) {
                width = `${elParentHeight * ratio}px`;
            }
            $(el).css({width, height, "object-fit": "contain"})
            $(this.ivsCanvasElem).css({width, height, "object-fit": "contain"})
            $(this.pztCanvasElem).css({width, height, "object-fit": "contain"})
        } else {
            // 拉伸
            $(el).css({width, height, "object-fit": "fill"})
            $(this.ivsCanvasElem).css({width, height, "object-fit": "fill"})
            $(this.pztCanvasElem).css({width, height, "object-fit": "fill"})
        }
        if(this.player) {
            this.ivsCanvasElem.width = el.offsetWidth;
            this.ivsCanvasElem.height = el.offsetHeight;
            this.player.setIVSCanvasSize(el.offsetWidth, el.offsetHeight);
            this.pztCanvasElem.width = el.offsetWidth;
            this.pztCanvasElem.height = el.offsetHeight;
        }
    }
}
export default PlayerItem
