import CONSTANT from './CONSTANT'
import RealPlayerItem from './RealPlayer'
import RecordPlayerItem from './RecordPlayer'
import WSPlayerManager from './WSPlayerManager'
import utils from './utils'
import Procedure from './Procedure'
import PanTilt from './PanTilt'
import config from "./config/config";
import { initWindowDivision } from './customDivision/window.division'

const wsAdaption = {
    selfAdaption: "自适应",
    stretching: "拉伸"
}

/* ---------------- WSPlayer ---------------- */
class WSPlayer {
    static version = "1.2.9"
    /**
     * 构造函数
     * @param {String} options.type  必传 类型 real | record
     * @param {String} options.serverIp 必传 服务器IP (V1.2.7废弃)
     * @param { Function } options.setWSUrl 方法，返回websocket链接 [最高优先级，传什么展示什么]
     * @param { Boolean } options.protocol 是否是 wss连接
     * @param { Number } options.WS_TIMEOUT ws自动判断链接超时时长配置
     * @param { Boolean } options.isIntranet 是否是内网
     * @param { Object } options.intranetMap 内外网映射关系
     * @param { Object } options.prefixUrl 解码库静态资源前缀
     * @param {String} options.proxyServerIp 必传 代理服务器IP (V1.2.7新增)
     * @param {String} options.streamServerIp 必传 流媒体服务器IP (V1.2.7新增)
     * @param {boolean} options.el 必传 播放器所在的容器id
     */
    constructor(options) {
        if (!options.type) {
            console.error(`type 为必传参数，请校验入参`)
            return false
        }
        this.options = options;
        this.type = options.type;
        this.config = utils.mergeObject(config, options.config);
        // 传入方法来处理 【Callback】
        this.setWSUrl = options.setWSUrl
        // 自动匹配url，超时时长配置
        this.WS_TIMEOUT = options.WS_TIMEOUT || 1
        // 协议 [ws, wss]
        this.protocol = options.protocol
        // 是否是内网
        this.isIntranet = options.isIntranet
        // 映射关系
        /**
         * eg: {
         *      内网地址: 外网地址,
         *      "内网ip": "外网ip"
         * }
         */
        this.intranetMap = options.intranetMap
        // 全局配置，服务器IP，nginx所在的服务器ip
        this.proxyServerIp = options.proxyServerIp || options.serverIp
        // 全局配置，流媒体服务IP
        this.streamServerIp = options.streamServerIp || options.serverIp
        // 解码库前缀
        this.prefixUrl = options.prefixUrl || "./static"
        // rtsp流媒体不返回时的超时时长
        this.rtspResponseTimeout = options.rtspResponseTimeout
        // 处理播放流程
        this.procedure = new Procedure({
            type: this.type,
            player: this,
            playCenterRecordByTime: this.config.playCenterRecordByTime,
            getRealRtsp: options.getRealRtsp,
            getRecords: options.getRecords,
            getRecordRtspByTime: options.getRecordRtspByTime,
            getRecordRtspByFile: options.getRecordRtspByFile,
            getTalkRtsp: options.getTalkRtsp
        });
        /**
         * method、data: 方法名、数据以及作用如下：
         * selectWindowChanged：切换窗口回调    data：index选择的窗口索引
         * windowNumChanged：显示的路数变化回调    data：num显示的路数
         * statusChanged：视频状态改变回调    data：{status：视频状态，windowIndex：状态变化的窗口索引}
         */
        this.sendMessage = options.receiveMessageFromWSPlayer || function(method, data, err) {}; // 给项目发送数据
        this.el = options.el;
        // 权限控制
        this.fetchChannelAuthority = options.getChannelAuthority
        this.$el = $('#' + this.el)
        // 先清空一次dom的内容
        this.$el.empty()
        if(!this.$el.length) {
            this.sendErrorMessage(503);
            return;
        }
        this.width = this.$el.attr('width')
        this.height = this.$el.attr('height')
        this.$el.height(`${this.height}px`)
        this.$el.width(`${this.width}px`)
        this.$el.addClass(`ws-player`)
        // 添加player-wrapper
        this.$el.append(`<div class="player-wrapper"></div>`)
        this.$wrapper = $('.player-wrapper', this.$el)
        this.playerList = []
        this.playerAdapter = "selfAdaption"; // selfAdaption 自适应  stretching 拉伸
        this.canvas = {};
        this.ctx = {};
        this.showNum = 1; // 正在显示的路数
        this.maxWindow = 1; // 可显示的最大路数
        $(this.$el).attr('inited', true)
        let {isVersionCompliance, browserType, errorCode} = utils.checkBrowser();
        // 判断协议
        let isHttps = location.protocol === 'https:';
        // 设置动态加载，则进行动态加载解码库
        // 根据环境的实际情况加载不同的解码库
        this.config.isDynamicLoadLib && this.loadLibPlay(isHttps, isVersionCompliance);
        // 设置最大可显示的路数
        this.setMaxWindow();
        // 双击切换窗口时，需要记录之前显示的窗口
        this.beforeShowNum = 1;
        switch (this.type) {
            case 'real':
                this.createRealPlayer(options);
                break;
            case 'record':
                this.createRecordPlayer(options);
                break;
            default:
                break;
        }
        this.setSelectIndex(0)
        // 设置窗口数量 division <-- number 默认 string 自定义 -->
        // 兼容 num 字段
        this.setPlayerNum(this.config.division || this.config.num)
        this.setCanvasGetContext()
        this.bindUpdatePlayerWindow = this.__updatePlayerWindow.bind(this);
        // 浏览器窗口事件：改变分辨率
        window.addEventListener( 'resize', this.bindUpdatePlayerWindow)
        if(!window.wsPlayerManager) {
            window.wsPlayerManager = new WSPlayerManager();
        }
    }

    setCanvasGetContext() {
        // 设置canvas属性，用于正常抓图，不设置会导致抓图失败
        if(!window.wsCanvasGetContextSet) {
            window.wsCanvasGetContextSet = true;
            HTMLCanvasElement.prototype.getContext = function(origFn) {
                return function(type, attributes) {
                    if(type === "webgl") {
                        attributes = Object.assign({}, attributes, {
                            preserveDrawingBuffer: true
                        })
                    }
                    return origFn.call(this, type, attributes)
                }
            }(HTMLCanvasElement.prototype.getContext)
        }
    }

    // 设置最大可显示的路数
    setMaxWindow() {
        let _maxNum = parseInt(this.config.maxNum, 10)
        if(_maxNum > 16) {
            this.maxWindow = 25;
        } else if(_maxNum > 9) {
            this.maxWindow = 16;
        } else if(_maxNum > 4) {
            this.maxWindow = 9;
        } else if(_maxNum > 1) {
            this.maxWindow = 4;
        } else {
            this.maxWindow = 1;
        }
    }

    createRealPlayer() {
        if (this.config.showControl) {
            this.__addRealControl()
        } else {
            this.$wrapper.addClass('nocontrol')
        }
        Array(this.maxWindow).fill(1).forEach((item, index) => {
            let realPlayerItem = new RealPlayerItem({
                wrapperDomId: this.el,
                index,
                wsPlayer: this
            });
            this.playerList.push(realPlayerItem);
        })
    }

    createRecordPlayer() {
        this.config.showRecordProgressBar && this.__addRecordControl()
        this.config.showControl && this.__addRealControl()
        !this.config.showRecordProgressBar && !this.config.showControl && this.$wrapper.addClass('nocontrol')
        Array(this.maxWindow).fill(1).forEach((item, index) => {
            let recordPlayerItem = new RecordPlayerItem({
                wrapperDomId: this.el,
                index,
                wsPlayer: this
            });
            this.playerList.push(recordPlayerItem)
        })
    }

    // 加载script标签
    loadScript(src) {
        let dom = document.createElement("script");
        dom.src = src;
        document.head.appendChild(dom)
    }

    /**
     * 加载无插件播放静态文件，包括解码库
     * @param isHttps 是否支持https
     * @param isVersionCompliance 浏览器版本或位数是否符合要求
     */
    loadLibPlay(isHttps, isVersionCompliance) {
        // 解码库只能加载一次
        if(window.loadLibPlayerFlag) {
            setTimeout(() => {
                this.sendMessage("initializationCompleted");
            }, 300)
            return;
        }
        window.loadLibPlayerFlag = true;
        window.m_nModuleInitialized = false;
        if(!window.Module) {
            window.Module = {};
        }
        //C++层wasm模块加载初始化完毕回调
        Module.onRuntimeInitialized = function() {
            window.m_nModuleInitialized = true;
        }
        // 动态加载解码库初始化完成事件
        // 静态加载无法增加此事件
        let initWsPlayerInterval = setInterval(() => {
            if(window.m_nModuleInitialized) {
                this.sendMessage("initializationCompleted");
                clearInterval(initWsPlayerInterval);
            }
        }, 100)
        // 默认加载多线程解码库，性能好，但是不支持http以及对浏览器版本要求高
        // 91版本以上64位chrome才能用多线程解码库，32位chrome需要用单线程解码库
        let libPath = `${this.prefixUrl}/WSPlayer/multiThread/libplay.js`;
        // 判断环境是否支持SharedArrayBuffer，不支持则使用单线程解码库（多线程需要使用SharedArrayBuffer）
        try {
            new SharedArrayBuffer(1)
        } catch(e) {
            libPath = `${this.prefixUrl}/WSPlayer/singleThread/libplay.js`;
        }
        // http或者低版本浏览器加载单线程解码库
        if(!isHttps || !isVersionCompliance || this.config.onlyLoadSingleLib) {
            libPath = `${this.prefixUrl}/WSPlayer/singleThread/libplay.js`;
        }
        this.loadScript(libPath)
    }

    /**
     * 播放实时视频
     * @param {*} opt.rtspURL String
     * @param {*} opt.wsURL 可选参数
     * @param {*} opt.channelId 用来标记当前播放的视频通道
     * @param {*} opt.streamServerIp icc平台的内网ip | paas的内网ip 用于nginx转发的目标地址
     * @param {*} opt.playerAdapter 拉伸 | 自适应
     * @param {*} opt.selectIndex 在第几个视频窗口上播放
     * @param {*} opt.channelData 此视频所关联的通道对象
     * @param {Array} opt.wsList 返回的rtsp地址对应的ip数组
     * @param {String} opt.playType 如果是流地址模式，会传入该字段。url-流地址模式
     */
    playReal(opt) {
        if (!opt.rtspURL) {
            console.error("播放实时视频需要传入rtspURL")
            return
        }
        this.__getWSUrl(opt.rtspURL, opt.streamServerIp, opt.wsList, opt.playType).then(wsURL => {
            opt.wsURL = opt.wsURL || wsURL
            opt.playerAdapter = opt.playerAdapter || this.playerAdapter;
            let player = this.playerList[opt.selectIndex]
            player.playType = opt.playType // 会用于对讲判断
            // 播放一个窗口后，选中的窗口自动跳转到下一个窗口上
            if(opt.selectIndex + 1 < this.showNum) {
                this.setSelectIndex(opt.selectIndex + 1)
            } else if(this.selectIndex === opt.selectIndex && player) {
                // 如果刚好是最后一个窗口，则无需跳转
                // 设置云台的通道
                this.setPtzChannel(opt.channelData);
            }
            player && player.init(opt)
        })
    }
    /**
     * 播放录像
     * @param {String} options.wsURL 可选参数
     * @param {Function} options.recordSource 2=设备，3=中心
     * recordSource == 2 设备录像，按照时间方式播放
     * @param {String} options.rtspURL String
     * @param {Number | String} options.startTime 开始时间 时间戳或者'2021-09-18 15:40:00'格式的时间字符串
     * @param {Number | String} options.endTime 结束时间 时间戳或者'2021-09-18 15:40:00'格式的时间字符串
     * @param {Function} options.RecordFiles 文件列表
     * @param {Function} options.getRtsp 文件列表
     * getRtsp(file).then(newRtspUrl => { play continue})
     */
    playRecord(opt, playCallback = {}) {
        return new Promise((resolve) => {
            let player = this.playerList[opt.selectIndex]
            player.playType = opt.playType // 用于点击跳转播放判断和录像播放完成判断
            this.__getWSUrl(opt.rtspURL, opt.streamServerIp, opt.wsList, opt.playType).then(wsURL => {
                opt.wsURL = opt.wsURL || wsURL
                opt.playerAdapter = opt.playerAdapter || this.playerAdapter;
                opt.isPlayback = true;
                // 播放一个窗口后，选中的窗口自动跳转到下一个窗口上
                // 如果是跳转播放或者连续播放，则窗口不进行切换
                if(opt.selectIndex + 1 < this.showNum && !opt.isJumpPlay) {
                    this.setSelectIndex(opt.selectIndex + 1)
                } else {
                    $(".ws-record-play", this.$el).css({display: "none"});
                    $(".ws-record-pause", this.$el).css({display: "block"});
                }
                for(let callbackName in playCallback) {
                    player[callbackName] = playCallback[callbackName]
                }
                player && player.init(opt)
                resolve()
            })
        })
    }

   // 音量设置
    /**
     * 开启声音
     */
    openVolume(index) {
        let player = this.playerList[index === undefined ? this.selectIndex: index]
        !player.isAudioPlay && $('.audio-icon', player.$el).click();
    }

    /**
     * 关闭声音
     */
    closeVolume(index) {
        let player = this.playerList[index === undefined ? this.selectIndex: index]
        player.isAudioPlay && $('.audio-icon', player.$el).click();
    }

    /**
     * 设置声音
     * @param volume 声音大小 传 0-1 小数点一位的小数
     */
    setVolume(index, volume) {
        let player = this.playerList[index === undefined ? this.selectIndex: index]
        !player.isAudioPlay && $('.audio-icon', player.$el).click();
        this.player.setAudioVolume(volume)
    }

    /**
     * 抓图
     * @param index 抓图的窗口
     */
    picCap(index) {
        let player = this.playerList[index === undefined ? this.selectIndex: index]
        $('.capture-icon', player.$el).click()
    }

    /**
     * 播放
     */
    play(index) {
        let player = this.playerList[index === undefined ? this.selectIndex : index]
        if(!player) {
            this.sendErrorMessage(601, {method: "play", arguments: { index }});
            return;
        }
        player.status === "pause" && player.play()
    }
    /**
     * 暂停播放
     */
    pause(index) {
        let player = this.playerList[index === undefined ? this.selectIndex : index]
        if(!player) {
            this.sendErrorMessage(601, {method: "pause", arguments: { index }});
            return;
        }
        player.status === "playing" && player.pause()
    }
    /**
     * 倍速播放
     * @param {Number} speed 倍速
     * @param {Number} index 窗口索引
     */
    playSpeed(speed, index) {
        if (this.type === 'real') {
            this.sendErrorMessage(607, {method: "playSpeed", arguments: { speed, index }});
            return
        }
        let player = this.playerList[index === undefined ? this.selectIndex : index]
        if(!player) {
            this.sendErrorMessage(601, {method: "playSpeed", arguments: { speed, index }});
            return;
        }
        player.playSpeed(speed - 0)
    }
    /**
     * 设置选中的播放器
     * @param {*} index
     */
    setSelectIndex(index) {
        if (this.selectIndex === index || index === undefined) {
            return
        }
        let player = this.playerList[index]
        if(!player) {
            this.sendErrorMessage(601, {method: "setSelectIndex", arguments: { index }});
            return;
        }
        // 业务层同步播放窗口索引
        this.procedure && this.procedure.setPlayIndex(index)
        if(this.type === 'record') {
            let status = player.status;
            // 更新暂停播放按钮
            if(status === "playing") {
                $(".ws-record-play", this.$el).css({display: "none"});
                $(".ws-record-pause", this.$el).css({display: "block"});
            }
            // 如果选中的窗口没有在播放或者暂停，则需要清空时间轴，以及隐藏时间
            if(["playing", "pause"].includes(status)) {
                this.procedure && this.procedure.changeTimeLine(index);
            } else {
                this.setTimeLine([]);
                $(".ws-record-pause", this.$el).css({display: "none"});
                $(".ws-record-play", this.$el).css({display: "block"});
            }
            // 更新倍速
            this.__setPlaySpeed("", index);
        }
        // 通知上层业务，选中的窗口索引发生了变化
        this.sendMessage("selectWindowChanged", {
            channelId: (player.options || {}).channelId,
            playIndex: index
        });
        this.selectIndex = index
        // 设置云台的通道
        this.setPtzChannel((player.options || {}).channelData);
        this.playerList.forEach((item, i) => {
            if (i === index) {
                item.$el.removeClass('unselected').addClass('selected')
            } else {
                item.$el.removeClass('selected').addClass('unselected')
            }
            // 更新播放声音的窗口，未选择的窗口停止播放音频
            this.__updateVoice(item, i === index);
        })
    }

    // 创建自定义弹窗页面
    createCustomDialog() {
        let container = `<div id="${this.el}-custom-container" class="custom-division-container"></div>`
        this.$el.append(container)
        initWindowDivision({
            division: localStorage.customDivision || '',
            windowId: `${this.el}-custom-container`,
            callback: {
                onError: (errMsg) => {
                    alert(errMsg)
                },
                onConfirm: (customDivision) => {
                    localStorage.customDivision = customDivision
                    $(`#${this.el}-custom-container`).remove()
                    this.setCustomPlayer(customDivision)
                },
                onCancel: () => {
                    $(`#${this.el}-custom-container`).remove()
                }
            }
        })
    }

    // 将数字转变为字符串形式传给播放器
    numberToList(num) {
        let d = 100 / num
        let arr = []
        for(var i = 0; i < num; i++) {
            for(var j = 0; j < num; j++) {
                arr.push({
                    lStep: j * d,
                    tStep: i * d,
                    wStep: d,
                    hStep: d
                })
            }
        }
        return arr
    }

    // 渲染播放器窗口数量
    // 要和拖拽做关联，所以在逻辑上要匹配对应的窗口id值。否则会导致拖拽问题的产生
    renderPlayerNum(allScreen, num) {
        let divisionRule = []
        if(typeof num === "number") {
            divisionRule = this.numberToList(num)
        } else {
            divisionRule = num
        }
        for(var i = 0; i < allScreen.length; i++) {
            let cId = allScreen[i].getAttribute('id')
            let arr = cId.split('-');
            let cIndex = Number(arr[arr.length - 1])
            if(divisionRule[cIndex]) {
                $(`#${cId}`).css({
                    top: `${divisionRule[cIndex].tStep}%`,
                    left: `${divisionRule[cIndex].lStep}%`,
                    width: `${divisionRule[cIndex].wStep}%`,
                    height: `${divisionRule[cIndex].hStep}%`,
                    visibility: "visible",
                    "z-index": 10
                })
                let imgScale = Math.max(divisionRule[cIndex].wStep, divisionRule[cIndex].hStep) / 50
                $(`#${cId} .default-status`).css({
                    transform: `scale(${imgScale > 1 ? 1 : imgScale })`
                })
            } else {
                $(`#${cId}`).css({
                    top: '150%',
                    left: 0,
                    width: 0,
                    height: 0,
                    visibility: "hidden",
                })
            }
        }
    }

    // 重置播放器
    resetPlayerScreen(allScreen, maxNum) {
        for(let i = 0; i < maxNum; i++) {
            allScreen[i] && $(`#${allScreen[i].getAttribute('id')}`).css({
                top: `150%`,
                left: 0,
                width: 0,
                height: 0,
                visibility: "hidden",
            })
        }
    }

    /**
     * 控制视频播放器显示的路数
     * @param {String|Number} division
     * @param {String|Number} dbChange 是否双击改变
     */
    setPlayerNum(division, dbChange) {
        let type = typeof division
        switch(type) {
            case 'number':
                this.setDefaultPlayer(division, dbChange)
                break;
            case 'string':
                this.setCustomPlayer(division, dbChange)
                break;
            default:
                
        }
    }

    // 设置默认的窗口数量
    setDefaultPlayer(division, dbChange) {
        let allScreen = $(`#${this.el} .wsplayer-item`)
        // 重置播放器
        this.resetPlayerScreen(allScreen, this.config.maxNum)
        let _division = parseInt(division) || 1;
        // 只能设置 1、4、9、16、25分屏，设置其他数量则自适应分配
        switch(_division) {
            case 1:
                // 单屏
                _division = 1;
                this.renderPlayerNum(allScreen, 1);
                break;
            case 2:
                // 2分屏
                _division = 2;
                this.renderPlayerNum(allScreen, [
                    {lStep:0,tStep:0,wStep:50,hStep:100},
                    {lStep:50,tStep:0,wStep:50,hStep:100}
                ])
                break;
            case 3:
                // 3分屏
                _division = JSON.stringify(CONSTANT.windowDefaultCustomDivision[3]);
                this.renderPlayerNum(allScreen, CONSTANT.windowDefaultCustomDivision[3])
                break;
            case 4:
                // 4分屏
                _division = 4;
                this.renderPlayerNum(allScreen, 2)
                break;
            case 5:
            case 6:
                // 6分屏
                _division = JSON.stringify(CONSTANT.windowDefaultCustomDivision[6]);
                this.renderPlayerNum(allScreen, (CONSTANT.windowDefaultCustomDivision[6]))
                break;
            case 7:
            case 8:
                // 8分屏
                _division = JSON.stringify(CONSTANT.windowDefaultCustomDivision[8]);
                this.renderPlayerNum(allScreen, (CONSTANT.windowDefaultCustomDivision[8]))
                break;
            case 9:
                // 9分屏
                _division = 9;
                this.renderPlayerNum(allScreen, 3)
                break;
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
                // 16分屏
                _division = 16;
                this.renderPlayerNum(allScreen, 4)
                break;
            case 17:
            case 18:
            case 19:
            case 20:
            case 21:
            case 22:
            case 23:
            case 24:
            case 25:
                // 25分屏
                _division = 25;
                this.renderPlayerNum(allScreen, 5)
                break;
            default:
                break;
        }
        // 进行参数校验，若大于最大显示路数，则置为最大显示路数
        if(_division > this.maxWindow) {
            _division = this.maxWindow;
        }
        // 参数校验后若显示路数没有发生改变，则不做处理
        if (this.showNum === _division) {
            return
        }
        this.showNum = _division;
        // 通知上层业务，显示的播放器路数发生了改变
        !dbChange && this.sendMessage("windowNumChanged", this.showNum)
        setTimeout(() => {
            this.__updatePlayerWindow();
        }, 200)
    }

    // 设置自定义窗口布局
    setCustomPlayer(division, dbChange) {
        let allScreen = $(`#${this.el} .wsplayer-item`)
        // 重置窗口
        this.resetPlayerScreen(allScreen, this.config.maxNum)
        // 渲染自定义窗口
        this.renderPlayerNum(allScreen, JSON.parse(division))
        this.showNum = division;
        // 通知上层业务，显示的播放器路数发生了改变
        // 如果是双击还原操作则不触发
        !dbChange && this.sendMessage("windowNumChanged", this.showNum)
        setTimeout(() => {
            this.__updatePlayerWindow();
        }, 200)
    }

    /**
     * 控制播放器是否自适应
     * @param playerAdapter
     */
    setPlayerAdapter(playerAdapter) {
        if(this.playerAdapter === playerAdapter) {
            return;
        }
        if(!["selfAdaption", "stretching"].includes(playerAdapter)) {
            this.sendErrorMessage(606, {method: "setPlayerAdapter", arguments: { playerAdapter }});
            return;
        }
        this.playerAdapter = playerAdapter
        // 更新控制栏显示
        $(`.ws-select-show-option`, this.$el).text(wsAdaption[playerAdapter])
        // 更新播放器自适应拉伸
        this.__updatePlayerWindow();
    }

    /**
     * 录像回放中的时间轴
     * @param timeList: [{startTime: 1650067200, endTime: 1650070800, isImportant: false}, {startTime: 1650085200, endTime: 1650093971, isImportant: true}]
     * 开始时间、结束时间、是否重要
     */
    setTimeLine(timeList = []) {
        // this.timeList = JSON.parse('[{"startTime":"1650556800","endTime":"1650556860","isImportant":false},{"startTime":"1650556800","endTime":"1650556801","isImportant":false},{"startTime":"1650556800","endTime":"1650556832","isImportant":false},{"startTime":"1650556800","endTime":"1650556983","isImportant":false},{"startTime":"1650556800","endTime":"1650558101","isImportant":false},{"startTime":"1650556801","endTime":"1650557637","isImportant":false},{"startTime":"1650556860","endTime":"1650556867","isImportant":false},{"startTime":"1650558107","endTime":"1650560310","isImportant":false},{"startTime":"1650560368","endTime":"1650561340","isImportant":false},{"startTime":"1650561346","endTime":"1650562507","isImportant":false},{"startTime":"1650562529","endTime":"1650564579","isImportant":false},{"startTime":"1650564585","endTime":"1650567600","isImportant":false},{"startTime":"1650567600","endTime":"1650567819","isImportant":false},{"startTime":"1650567825","endTime":"1650571058","isImportant":false},{"startTime":"1650571065","endTime":"1650574298","isImportant":false},{"startTime":"1650574304","endTime":"1650577537","isImportant":false},{"startTime":"1650577543","endTime":"1650580777","isImportant":false},{"startTime":"1650580783","endTime":"1650584016","isImportant":false},{"startTime":"1650584023","endTime":"1650587255","isImportant":false},{"startTime":"1650587263","endTime":"1650589200","isImportant":false},{"startTime":"1650589200","endTime":"1650590285","isImportant":false},{"startTime":"1650590285","endTime":"1650590320","isImportant":false},{"startTime":"1650590308","endTime":"1650590495","isImportant":false},{"startTime":"1650590502","endTime":"1650592122","isImportant":false},{"startTime":"1650592109","endTime":"1650593440","isImportant":false},{"startTime":"1650593428","endTime":"1650593735","isImportant":false},{"startTime":"1650593741","endTime":"1650594881","isImportant":false},{"startTime":"1650594868","endTime":"1650596974","isImportant":false},{"startTime":"1650596981","endTime":"1650600000","isImportant":false},{"startTime":"1650600000","endTime":"1650600214","isImportant":false},{"startTime":"1650600221","endTime":"1650603453","isImportant":false},{"startTime":"1650603460","endTime":"1650606692","isImportant":false},{"startTime":"1650606699","endTime":"1650609931","isImportant":false},{"startTime":"1650609938","endTime":"1650611187","isImportant":false}]')
        this.timeList = timeList;
        // 根据是否显示时间轴，来控制时间点显示
        if(this.timeList.length) {
            $("#ws-record-time-box", this.$el).css({visibility: "visible"});
        } else {
            $("#ws-record-time-box", this.$el).css({visibility: "hidden"});
        }
        this.__setTimeRecordArea(timeList);
    }

    // 设置全屏
    setFullScreen() {
        let target = this.$el[0].children[0]
        if (target.requestFullscreen) {
            target.requestFullscreen();
        } else if (target.webkitRequestFullscreen) {
            target.webkitRequestFullscreen();
        } else if (target.mozRequestFullScreen) {
            target.mozRequestFullScreen();
        } else if (target.msRequestFullscreen) {
            target.msRequestFullscreen();
        }
        this.__updatePlayerWindow()
    }

    /**
     * 关闭播放器
     * @param index 关闭指定窗口的播放器，若无此参数，则关闭所有播放器
     */
    close(index) {
        let _index = Number(index);
        // 全部关闭
        if(isNaN(_index)) {
            this.playerList.forEach((item, index) => {
                item && this.close(index)
            })
            return
        }
        
        // 关闭单个
        let playerItem = this.playerList[_index];
        if(playerItem) {
            playerItem.close();
            // 关闭选中的录像，需要清空时间轴
            if(this.selectIndex === _index) {
                this.setTimeLine([])
            }
        }
    }

    /**
     * @desc 销毁播放器
     */
    destroy() {
        // 关闭所有播放器并关闭进度条
        this.setTimeLine([])
        this.playerList.forEach(item => {
            item.close()
        })
        // 取消浏览器窗口事件监听
        window.removeEventListener("resize", this.bindUpdatePlayerWindow);
    }

    /* ----------------------- 内部方法 -----------------------*/
    /**
     * 添加实时播放控制栏
     */
    __addRealControl() {
        this.$el.append(`
            <div class="ws-control">
                <div class="ws-flex ws-control-record ws-flex-left">
                    <div class="ws-ctrl-record-icon ws-record-play" style="display: none" title="播放"></div>
                    <div class="ws-ctrl-record-icon ws-record-pause" title="暂停"></div>
                    <div class="ws-ctrl-record-icon ws-record-speed-sub" title="倍速-"></div>
                    <div class="ws-ctrl-record-icon ws-record-speed-txt">1x</div>
                    <div class="ws-ctrl-record-icon ws-record-speed-add" title="倍速+"></div>
                </div>
                <div class="ws-flex ws-flex-end">
                    <div class="ws-select-self-adaption">
                        <div class="ws-select-show select">
                            <div class="ws-select-show-option">自适应</div>
                            <!-- 下拉箭头 -->
                            <img src="${this.prefixUrl}/WSPlayer/icon/spread.png" />
                        </div>
                        <div class="ws-self-adaption-type" style="display: none">
                            <ul class="ws-select-ul">
                                <li optionValue="自适应" value="selfAdaption" class="ws-select-type-item">自适应</li>
                                <li optionValue="拉伸" value="stretching" class="ws-select-type-item">拉伸</li>
                            </ul>
                        </div>
                    </div>
                    <span class="ws-ctrl-btn-spread"></span>
                    <div class="ws-ctrl-icon close-all-video" title="一键关闭"></div>
                    <span class="ws-ctrl-btn-spread"></span>
                    <div class="ws-ctrl-icon one-screen-icon" title="单屏"></div>
                    <div class="ws-ctrl-icon four-screen-icon" title="4分屏"></div>
                    <div class="ws-ctrl-icon nine-screen-icon" title="9分屏"></div>
                    <div class="ws-ctrl-icon sixteen-screen-icon" title="16分屏"></div>
                    <div class="ws-ctrl-icon twenty-five-screen-icon" title="25分屏"></div>
                    <div class="ws-ctrl-icon custom-screen-icon" title="自定义分屏"></div>
                    <span class="ws-ctrl-btn-spread"></span>
                    <div class="ws-ctrl-icon full-screen-icon" title="全屏"></div>
                </div>
            </div>
        `)
        if(this.maxWindow <= 16) {
            $(".twenty-five-screen-icon", this.$el).css({display: "none"})
        }
        if(this.maxWindow <= 9) {
            $(".sixteen-screen-icon", this.$el).css({display: "none"})
        }
        if(this.maxWindow <= 4) {
            $(".nine-screen-icon", this.$el).css({display: "none"})
        }
        if(this.maxWindow === 1) {
            $(".four-screen-icon", this.$el).css({display: "none"})
            $(".one-screen-icon", this.$el).css({display: "none"})
        }

        $('.full-screen-icon', this.$el).click(() => {
            this.setFullScreen();
        })
        $('.one-screen-icon', this.$el).click(() => {
            this.setPlayerNum(1)
        })
        $('.four-screen-icon', this.$el).click(() => {
            this.setPlayerNum(4)
        })
        $('.nine-screen-icon', this.$el).click(() => {
            this.setPlayerNum(9)
        })
        $('.sixteen-screen-icon', this.$el).click(() => {
            this.setPlayerNum(16)
        })
        $('.twenty-five-screen-icon', this.$el).click(() => {
            this.setPlayerNum(25)
        })
        $('.close-all-video', this.$el).click(() => {
            this.close()
        })
        $('.custom-screen-icon', this.$el).click(() => {
            this.createCustomDialog()
        })
        // 点击切换自适应/拉伸
        this.selfAdaptionSelectShow = false;
        $(".ws-select-self-adaption", this.$el).click(e => {
            if(this.selfAdaptionSelectShow) {
                $(".ws-self-adaption-type", this.$el).hide();
                this.selfAdaptionSelectShow = false;
            } else {
                $(".ws-self-adaption-type", this.$el).show();
                this.selfAdaptionSelectShow = true;
                // 获取需要高亮的元素
                $(`.ws-select-ul .ws-select-type-item`, this.$el).css({background: "none"})
                $(`.ws-select-ul [value=${this.playerAdapter}]`, this.$el).css({background: "#1A78EA"})
            }
        })
        $(".ws-self-adaption-type", this.$el).click(e => {
            let streamTypeValue = e.target.getAttribute("value")
            this.setPlayerAdapter(streamTypeValue)
            // 数据回显
            $(`.ws-select-show-option`, this.$el).text(wsAdaption[streamTypeValue])
        })
        if(this.type !== 'record') {
            $(".ws-control-record", this.$el).css({display: "none"})
        }
        // 暂停播放
        $(".ws-record-pause", this.$el).click(e => {
            this.pause();
        })
        // 继续播放
        $(".ws-record-play", this.$el).click(e => {
            this.play();
        })
        // 倍速播放，倍速-
        $(".ws-record-speed-sub", this.$el).click(e => {
            let player = this.playerList[this.selectIndex]
            player.status === "playing" && this.__setPlaySpeed("PREV");
        })
        // 倍速播放，倍速+
        $(".ws-record-speed-add", this.$el).click(e => {
            let player = this.playerList[this.selectIndex]
            player.status === "playing" && this.__setPlaySpeed("NEXT");
        })
    }

    // 设置倍速
    __setPlaySpeed(option, windowIndex) {
        let speedList = [
            {value: 0.125, label: "0.125x"},
            {value: 0.25, label: "0.25x"},
            {value: 0.5, label: "0.5x"},
            {value: 1, label: "1x"},
            {value: 1.25, label: "1.25x"},
            {value: 1.5, label: "1.5x"},
            {value: 2, label: "2x"},
            {value: 4, label: "4x"},
            {value: 8, label: "8x"},
        ];
        let player = this.playerList[windowIndex === undefined ? this.selectIndex : windowIndex]
        let setSpeedItem, setSpeedIndex;
        speedList.some((item, index) => {
            if(item.value === player.speed) {
                if(option === "PREV") {
                    setSpeedIndex = index - 1;
                } else if(option === "NEXT") {
                    setSpeedIndex = index + 1;
                } else {
                    setSpeedIndex = index;
                }
                setSpeedItem = speedList[setSpeedIndex];
                if(!setSpeedItem) {
                    return true;
                }
                // 设置鼠标手势
                if(!setSpeedIndex) {
                    $(".ws-record-speed-sub", this.$el).css({cursor: "not-allowed"})
                } else if(setSpeedIndex === speedList.length - 1) {
                    $(".ws-record-speed-add", this.$el).css({cursor: "not-allowed"})
                } else {
                    $(".ws-record-speed-sub", this.$el).css({cursor: "pointer"})
                    $(".ws-record-speed-add", this.$el).css({cursor: "pointer"})
                }
                // 倍速回显
                $(".ws-record-speed-txt", this.$el).text(setSpeedItem.label);
                // 设置倍速
                player.status === "playing" && this.playSpeed(setSpeedItem.value, windowIndex);
                return true;
            }
        })
    }

    /**
     * 添加录像回放控制栏
     */
    __addRecordControl() {
        this.$el.append(`
            <div class="ws-control ws-record-control">
                <div class="ws-timeline">
                    <div class="ws-timeline-group"></div>
                    <div class="ws-timeline-group"></div>
                </div>
                <!--当前播放的时间点-->
                <div id="ws-record-time-box">
                    <div class='ws-record-time'>
                        <span></span>
                    </div>
                </div>
                <canvas height="60" id="ws-record-canvas" class="ws-record-area"/>
            </div>
        `)
        this.canvas = document.getElementById("ws-record-canvas")
        this.ctx = this.canvas.getContext("2d");
        let wsTimeGroup1 = $(this.$el[0].getElementsByClassName("ws-timeline-group")[0], this.$el);
        let wsTimeGroup2 = $(this.$el[0].getElementsByClassName("ws-timeline-group")[1], this.$el);
        // 添加时间间隔
        new Array(49).fill(1).forEach((item, index) => {
            let className = `ws-time-space ${index % 4 ? "" : "ws-time-space-long"}`
            wsTimeGroup1.append(`<span class="${className}"></span>`)
        })
        // 添加时间点
        new Array(13).fill(1).forEach((item, index) => {
            wsTimeGroup2.append(`<span class="ws-time-point">${`${index * 2}:00`.padStart(5, "0")}</span>`)
        })
        $(".ws-record-control", this.$el).mouseenter(e => {
            $(".ws-record-control").append("<div id='ws-cursor'><div class='ws-cursor-time'><span></span></div></div>")
        })
        // 添加鼠标移入事件
        $(".ws-record-control", this.$el).mousemove(e => {
            let width = $(".ws-record-control", this.$el).width();
            let layerX = e.clientX - $(".ws-record-control", this.$el)[0].getBoundingClientRect().left
            let date = new Date((layerX / width * 24 * 60 * 60 - 8 * 60 * 60) * 1000);
            let hours = `${date.getHours()}`.padStart(2, "0")
            let minutes = `${date.getMinutes()}`.padStart(2, "0")
            let seconds = `${date.getSeconds()}`.padStart(2, "0")
            let time = `${hours}:${minutes}:${seconds}`;
            $("#ws-cursor", this.$el).css("left", layerX);
            $("#ws-cursor span", this.$el).text(time);
        })
        $(".ws-record-control", this.$el).mouseleave(e => {
            $("#ws-cursor", this.$el).remove();
        })
        // 点击某个时间点进行播放
        $(".ws-record-control", this.$el).click(e => {
            // 只有选中的播放器在播放或者暂停状态，才能根据时间轴选择播放
            if(["playing", "pause"].includes((this.playerList[this.selectIndex] || {}).status)) {
                let width = $(".ws-record-control", this.$el).width();
                let layerX = e.clientX - $(".ws-record-control", this.$el)[0].getBoundingClientRect().left
                let timeStamp = parseInt(layerX / width * 24 * 60 * 60, 10);
                this.clickRecordTimeLine(timeStamp);
            }
        })
    }

    /**
     * 设置有录像的区域
     * @param timeList: [{startTime: xxx, endTime: xxx, isImportant: false}]
     * startTime 和 endTime 都是秒级时间戳
     * @private
     */
    __setTimeRecordArea(timeList = []) {
        if(timeList.length) {
            // 设置canvas的宽度
            let boxWidth = $(".ws-record-control", this.$el).width();
            this.canvas.width = boxWidth;

            // 将有录像的区域进行分类，先绘制普通录像，再绘制报警录像，避免普通录像覆盖报警录像
            let recordList = [];
            let alarmRecordList = [];

            // 普通录像渐变色
            let recordGradient = this.ctx.createLinearGradient(0,0,0,60);
            recordGradient.addColorStop(0,"rgba(77, 201, 233, 0.1)");
            recordGradient.addColorStop(1,"#1c79f4");

            // 报警录像渐变色
            let alarmRecordGradient = this.ctx.createLinearGradient(0,0,0,60);
            alarmRecordGradient.addColorStop(0,"rgba(251, 121, 101, 0.1)");
            alarmRecordGradient.addColorStop(1,"#b52c2c");

            timeList.forEach(timeItem => {
                // 录像区域长度
                timeItem.width = (timeItem.endTime - timeItem.startTime) * boxWidth / (24 * 60 * 60);
                let date = new Date(timeItem.startTime * 1000);
                let hours = date.getHours();
                let minutes = date.getMinutes();
                let seconds = date.getSeconds();
                timeItem.left = (hours * 3600 + minutes * 60 + seconds) / (24 * 3600) * boxWidth;
                if(timeItem.isImportant) {
                    alarmRecordList.push(timeItem);
                } else {
                    recordList.push(timeItem)
                }
            })

            // 绘制普通录像
            recordList.forEach(timeItem => {
                this.ctx.clearRect(timeItem.left, 0, timeItem.width, 60);
                this.ctx.fillStyle = recordGradient;
                this.ctx.fillRect(timeItem.left, 0, timeItem.width, 60);
            })

            // 绘制报警录像
            alarmRecordList.forEach(timeItem => {
                this.ctx.clearRect(timeItem.left, 0, timeItem.width, 60);
                this.ctx.fillStyle = alarmRecordGradient;
                this.ctx.fillRect(timeItem.left, 0, timeItem.width, 60);
            })
        } else {
            this.canvas.width = 0;
        }
    }

    /**
     * 进度条显示当前播放的时间
     * @param windowIndex 当前播放的窗口
     * @param year
     * @param month
     * @param day
     * @param hour
     * @param minute
     * @param second
     * @private
     */
    __setPlayingTime(windowIndex, year, month, day, hour, minute, second) {
        if(this.selectIndex === windowIndex) {
            let boxWidth = $(".ws-record-control").width();
            let left = (hour * 3600 + minute * 60 + second) / (24 * 3600) * boxWidth;
            let time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
            $("#ws-record-time-box", this.$el).css("left", left);
            $("#ws-record-time-box span", this.$el).text(time);
        }
    }

    // 自动获取wsUrl
    autoSetWSUrl(wsList, protocol) {
        return new Promise((resolve, reject) => {
            // 如果是 wss 下走代理模式，则不做自动判断
            if(protocol === "wss" && this.config.useNginxProxy) {
                reject({
                    code: -106,
                    message: "代理模式, 此模式不做自动处理"
                })
                return
            }
            wsList = wsList.map(item => {
                if(protocol === "wss") {
                    let ip = item.split(':')[0]
                    if(this.type === "real") {
                        return protocol + '://' + ip + ':9102'
                    }
                    return protocol + '://' + ip + ":9322"
                }
                if(protocol === "ws") {
                    return protocol + '://' + item
                }
            })
            let count = 0;
            let testWS = url => {
                let ws = new WebSocket(url)
                let timer
                let isConnect = false
                ws.onopen = () => {
                    isConnect = true
                    clearTimeout(timer); // 成功就终止延时
                    ws.close(); // 关闭websocket连接
                    resolve(wsList[count - 1])
                }
                ws.onerror = () => {
                    clearTimeout(timer); // 成功就终止延时
                    isConnect = false
                    if(count === wsList.length) {
                        reject({
                            code: -105,
                            message: "自动识别失败，存在端口为非默认端口，开始通过参数判断，请注意传参！"
                        })
                    } else {
                        testWS(wsList[count++])
                    }
                }
                timer = setTimeout(() => {
                    !isConnect && ws.close()
                }, this.WS_TIMEOUT * 1000)
            }
            testWS(wsList[count++])
        })
    }

    /**
     * 根据RTSP地址获取wsUrl
     * @param {String} rtspUrl
     * @param {String} streamServerIp: icc平台内网IP | paas内网ip
     */
    __getWSUrl(rtspUrl, streamServerIp, wsList, playType) {
        return new Promise((resolve, reject) => {
            // 如果外部只传入这个参数，不管代理还是非代理，按照外部传入的规则
            if(playType === 'url') {
                resolve()
                return
            }
            if(this.setWSUrl) {
                // 把rtsp 和内网的 innerIp 都传出去 (此方案不考虑直连/代理，外面传什么就是什么)
                // 留入口, 防止后续有特殊情况，没法处理。
                resolve(this.setWSUrl(wsList))
                return
            }
            // 判断协议
            let isHttps = location.protocol === 'https:';
            let ip = rtspUrl.match(/\d{1,3}(\.\d{1,3}){3}/g)[0]
            if (!ip) {
                ip = rtspUrl.split('//')[1].split(':')[0]
            }
            let protocol = this.protocol || (isHttps ? "wss" : "ws");

            // 自动判断 [需保证内网和外网对外的端口是 9100 9320 9102 9322 的]
            this.autoSetWSUrl(wsList, protocol).then(wsUrl => {
                resolve(wsUrl)
            }).catch(err => {
                // 自动判断失败，走手动判断
                console.warn(err.message)
                // 内外网+分布式，传入映射关系
                if(this.intranetMap) {
                    // 内网则直接使用内网地址，外网则使用外网地址
                    // 该模式则不能改变端口
                    for(var i in this.intranetMap) {
                        if(i.includes(streamServerIp)) {
                            streamServerIp = i // 重新赋值 streamServerIp
                        }
                    }
                    this.streamServerIp = this.isIntranet ? streamServerIp : this.intranetMap[streamServerIp]
                }

                // nginx的代理模式 (后续将不推荐使用，保留)
                if(this.config.useNginxProxy) {
                    // https需要nginx转发，绕过https证书认证问题
                    // 如果获取不到相关的内网ip，则从rtsp地址上截取ip
                    // http也可以通过nginx代理转发
                    // 外部传入streamServerIp, 否则使用视频接口返回的 innerIp, 否则使用 rtsp 上的ip
                    let wssPort = this.type === "real"
                        ? CONSTANT.websocketPorts.realmonitor
                        : CONSTANT.websocketPorts.playback;
                        // 代理的 websocket 连接外部传入，不传入则传入proxyServerIp, 按照nginx方案处理。
                    if(!this.proxyServerIp) {
                        console.warn("确认您当前使用了代理模式，请传入proxyServerIp字段")
                        console.warn("此方式为没有购买证书的备选方案，不推荐使用。")
                        console.warn("在线文档地址 https://open-icc.dahuatech.com/wsplayer/")
                        console.warn(`如您确认需要使用此模式，请访问该连接下载文档查看 ${window.location.origin}/wsplayer/doc/代理模式.md`)
                    }
                    resolve(`${protocol}://${this.proxyServerIp}/${wssPort}?serverIp=${this.streamServerIp || streamServerIp || ip}`)
                    return
                }
                // 直连环境下 外部传入的 流媒体服务端 ip 有端口，则说明拉流端口被更改，按照外部传入的拉流方式处理。
                if(!this.streamServerIp) {
                    console.warn("请根据不同大华平台场景进行传参播放视频画面！！详情可查阅文档-快速入门")
                    console.warn("在线文档地址 https://open-icc.dahuatech.com/wsplayer/")
                    reject()
                    return
                }
                if(this.streamServerIp.includes(':')) {
                    resolve(`${protocol}://${this.streamServerIp}`)
                    return
                }
                // https下可进行wss直连，http下进行ws直连
                let wsPort = ""
                
                if(protocol === 'wss') {
                    // https协议就用wss协议直连流媒体服务
                    wsPort = this.type === "real"
                    ? CONSTANT.websocketPorts.realmonitor_wss
                    : CONSTANT.websocketPorts.playback_wss
                } else {
                    // http协议就用ws协议直连流媒体服务
                    wsPort = this.type === "real"
                    ? CONSTANT.websocketPorts.realmonitor_ws
                    : CONSTANT.websocketPorts.playback_ws
                }
                 resolve(`${protocol}://${this.streamServerIp}:${wsPort}`)
            })
        })
    }
    /**
     * 更新播放器窗口
     * @desc 延迟渲染，防止F12页面全屏下，窗口再次全屏导致的画面未实时渲染。
     */
    __updatePlayerWindow() {
        setTimeout(() => {
            this.playerList.forEach(item => {
                item.updateAdapter(this.playerAdapter);
            })
            this.setTimeLine(this.timeList);
        }, 24)
    }

    /**
     * 控制声音播放
     * @param playerWrapper
     * @param chooseFlag：当前的窗口是否被选中
     * @private
     */
    __updateVoice(playerWrapper, chooseFlag) {
        if(!chooseFlag) {
            // 关闭未被选中的窗口的声音，但是播放声音的图标保留显示
            playerWrapper.player && playerWrapper.player.setAudioVolume(0);
        } else if($('.audio-icon', playerWrapper.$el).hasClass("on")) {
            // 若窗口被选中，且声音被开启，就播放声音
            playerWrapper.player.setAudioVolume(1);
        }
    }

    /**
     * 开始对讲
     * @param channel
     * @private
     */
    __startTalk(channel) {
        this.procedure && this.procedure.startTalk(channel)
    }
    /**
     * 通过流地址方式进行对讲
     * @param playTalk 流地址方式
     * @param rtspURL rtsp的地址
     * @param wsURL websocket地址
     * @param selectIndex 窗口号
     */
    talkByUrl(opt) {
        let player = this.playerList[opt.selectIndex]
        player.talkByUrl(opt)
    }

    /* ----------------- 对外方法 -------------------- */
    /**
     * 实时预览
     * @param channelList
     * @param streamType
     * @param windowIndex
     */
    playRealVideo(channelList, streamType = "2", windowIndex) {
        this.procedure && this.procedure.playRealVideo(channelList, streamType, windowIndex);
    }

    /**
     * 切换码流
     * @param channel 通道对象
     * @param streamType 码流类型
     * @param selectIndex 需要切换码流的窗口索引
     */
    changeStreamType(channel, streamType, selectIndex) {
        this.procedure && this.procedure.playRealVideo([channel], streamType, selectIndex);
    }

    /**
     * 获取录像列表
     * @param opt.channelList 通道id  必选
     * @param opt.startTime 开始时间  必选
     * @param opt.endTime 结束时间  必选
     * @param opt.recordSource 录像来源  必选
     * @param opt.streamType 码流类型
     * @param opt.recordType 录像类型
     */
    getRecordList(opt) {
        this.procedure && this.procedure.getRecordList(opt);
    }

    /**
     * 点击时间轴跳转播放
     * @param timeStamp
     */
    clickRecordTimeLine(timeStamp) {
        // 计算所选时间点是否有录像，如果有则直接跳转播放
        let time = new Date(this.timeList[0].startTime * 1000).setHours(0, 0, 0) / 1000 + timeStamp;
        if(!this.timeList.some(timeItem => {
            if(time >= timeItem.startTime && time < timeItem.endTime) {
                let player = this.playerList[this.selectIndex];
                // 如果按时间播放，且与当前播放的ssId相同时，直接跳转
                if(player.options.playRecordByTime && player.options.ssId === timeItem.ssId) {
                    // 基于开始播放时间的偏移量
                    player.player.playByTime(timeStamp);
                } else {
                    // 如果是url，则回调出去
                    if(player.playType === 'url') {
                        this.sendMessage('switchStartTime', player.options.channelData)
                        return
                    }
                    // 请求新的rtsp进行播放
                    this.procedure && this.procedure.clickRecordTimeLine(timeStamp, timeItem.ssId);
                }
                return true
            }
        })) {
            console.warn("所选时间点无录像")
        }
    }

    /**
     * 根据时间跳转播放
     * @param time 当天时间：HH:mm:ss
     */
    jumpPlayByTime(time) {
        let timeList = time.split(":");
        // 计算timeStamp
        let timeStamp = (timeList[0] || 0) * 60 * 60 + (timeList[1] || 0) * 60 + (timeList[2] || 0) * 1;
        if(timeList.length !== 3 || !timeStamp || timeStamp >= 86400) {
            this.sendErrorMessage(605, {method: "jumpPlayByTime", arguments: { time }});
            return
        }
        this.clickRecordTimeLine(timeStamp);
    }

    /**
     * 自动播放下一段录像
     * @param selectIndex
     * @param ssId
     */
    playNextRecord(selectIndex, ssId) {
        this.procedure && this.procedure.playNextRecord(selectIndex, ssId);
    }

    /**
     * 某个窗口的视频被关闭
     * @param selectIndex 视频关闭窗口的索引
     * @param changeVideoFlag 是否因切换其他视频而关闭现在视频
     */
    videoClosed(selectIndex, changeVideoFlag, channelData) {
        this.sendMessage("closeVideo", {
            selectIndex,
            changeVideoFlag,
            channelData
        });
        this.procedure && this.procedure.videoClosed(selectIndex, changeVideoFlag, channelData);
    }

    /**
     * 发送错误信息
     * @param errorCode 错误码
     * @param errorData 相关的错误信息
     * @param errorData.channelList 相关通道列表
     * @param errorData.apiErrorInfo 接口报错信息（报错与接口相关，则有此数据）
     * @param errorData.method 报错所在方法
     * @param errorData.arguments 报错所在方法的传参
     * @param errorData.insert 报错的值需要与错误信息结合
     */
    sendErrorMessage(errorCode, errorData = {}) {
        let errorInfo = CONSTANT.errorInfo[errorCode];
        if(errorData.insert) {
            errorData.insert.forEach((item, index) => {
                errorInfo = errorInfo.replace(`$${index}`, item)
            })
            delete errorData.insert;
        }
        this.sendMessage("errorInfo", {
            errorCode,
            errorInfo,
            errorData
        })
    }

    /**
     * 开始本地录像
     * @param selectIndex 选择本地录像下载的窗口索引 必填
     * @param name 录像名称 必填
     * @param size 单个录像文件大小（单位M） 可选，默认值为 ./config/config.js 中 localRecordSize
     * @param downloadMp4Record 可选，默认值为 true。 true - 以MP4格式下载录像，false - 以dav格式下载录像
     */
    startLocalRecord(selectIndex, size, downloadMp4Record = true) {
        let player = this.playerList[selectIndex]
        if(!player) {
            this.sendErrorMessage(601, {method: "startLocalRecord", arguments: {selectIndex, name, size, downloadMp4Record}});
            return;
        }
        if(player.status !== "playing" || player.status !== "pause") {
            this.sendErrorMessage(603, {method: "startLocalRecord", arguments: {selectIndex, name, size, downloadMp4Record}});
            return;
        }
        if(player.isRecording) {
            this.sendErrorMessage(602, {method: "startLocalRecord", arguments: {selectIndex, name, size, downloadMp4Record}});
            return;
        }
        player.isRecording = true
        player.player.startLocalRecord(name, size, downloadMp4Record)
        $('.record-icon', player.$el).addClass('recording')
    }

    /**
     * 关闭本地录像
     * @param selectIndex 选择关闭本地录像下载的窗口索引
     */
    stopLocalRecord(selectIndex) {
        let player = this.playerList[selectIndex]
        if(!player) {
            this.sendErrorMessage(601, {method: "stopLocalRecord", arguments: { selectIndex }});
            return;
        }
        if(!player.isRecording) {
            this.sendErrorMessage(604, {method: "stopLocalRecord", arguments: { selectIndex }});
            return;
        }
        player.isRecording = false
        player.player.stopLocalRecord()
        $('.record-icon', player.$el).removeClass('recording')
    }

    /**
     * 设置规则线
     * @param {Boolean} showIvs true-显示，隐藏
     * @param {Array} ivsType [1] - 智能规则线 [2] - 智能目标框 [1, 2] - 以上 [暂不使用]
     */
    setIvs(showIvs, index, ivsType) {
        let player = this.playerList[index]
        if(showIvs) {
            player.openIVS()
        } else {
            player.closeIVS()
        }
    }

    // ------------- 云台相关功能 ----------------- //
    /**
     * 初始化云台
     * @param options
     */
    initPanTilt(options) {
        this.panTilt = new PanTilt({...options, prefixUrl: this.prefixUrl}, this);
    }

    setPtzChannel(channel) {
        this.panTilt && this.panTilt.setChannel(channel);
    }
}

export {
    WSPlayer
}

export default WSPlayer
