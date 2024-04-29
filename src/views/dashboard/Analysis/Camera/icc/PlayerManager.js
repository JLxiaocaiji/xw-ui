// WSPlayer 已经注册到window对象中，无需重复引用。或者根据实际情况引入
// 调试模式下使用源码时需要将下面的注释放开
import WSPlayer from "../WSPlayer/WSPlayer";
import API from "./api";

let WSPlayerConstructor = WSPlayer;
if (WSPlayer.WSPlayer) {
  WSPlayerConstructor = WSPlayer.WSPlayer;
}

/**
 * WSPlayer是核心组件
 * API 封装了接口
 */
class PlayerManager {
  constructor(opt) {
    // 播放器所在的容器ID
    this.el = opt.el;
    // 实时预览播放器
    this.realPlayer = null;
    // 录像回放播放器
    this.recordPlayer = null;
    this.player = null;
    // 实时预览还是录像回放播放器
    this.type = "real";
    // 窗口的数量
    this.playNum = 1;
    // 当前选中的窗口的索引
    this.playIndex = 0;
    // 当前选中窗口正在播放视频的通道
    this.currentChannelId = "";
    // 索引对应窗口，保存当日录像信息
    this.recordList = [];

    /**
     * 兼容老版本字段 【已废弃】
     * 在 ws/wss 直连模式下, serverIp 表示MTS流媒体服务 IP
     * 在 代理 模式下, serverIp 表示的是 代理服务器的IP 地址
     */
    this.serverIp = opt.serverIp;

    /**
     * V1.2.8 版本新增字段
     * 解码库资源文件前缀
     */
    this.prefixUrl = opt.prefixUrl;
    /**
     * V1.2.8 版本新增字段
     * 优先级最高，该方法传入后
     * 结构如下：
     * eg:
     * (rtspUrl) => {
     *     return "wss://{ip}:9102"
     * }
     * 配置后：protocol, isIntranet, proxyServerIp, streamServerIp
     */
    this.setWSUrl = opt.setWSUrl;
    /**
     * V1.2.8 版本新增字段
     * 协议，http支持wss协议拉流，因此增加protocol配置
     */
    this.protocol = opt.protocol;
    /**
     * V1.2.8 版本新增字段[组合使用]
     * @desc 注意事项： 用于有内外网场景和分布式场景
     * @param isIntranet 是否内网, 用于有内外网环境，多台大华服务器[分布式]拉流场景配置
     * @param intranetMap 映射关系，结构 { "内网ip": "外网ip", ... }
     *
     */
    this.isIntranet = opt.isIntranet;
    this.intranetMap = opt.intranetMap;
    /**
     * V1.2.7 版本新增字段
     * 用于只有内网
     * @desc 代理 模式下，代理服务器的IP 地址
     * 如果代理服务有端口则拼接端口
     *
     */
    this.proxyServerIp = opt.proxyServerIp;
    /**
     * V1.2.7 版本新增字段
     * 用于只有内网
     * @desc 流媒体服务 IP 地址
     * 如果拉流的 9100 9320 端口发生修改，则需要后面拼接修改后的端口
     */
    this.streamServerIp = opt.streamServerIp;
    /**
     * V1.2.7 版本新增字段
     * @desc 模式类型 是直连模式/代理模式
     */
    this.useNginxProxy = typeof opt.useNginxProxy === "boolean" ? opt.useNginxProxy : false;

    // 内部wiki打包时使用, 三方不考虑
    // if(this.iccBuild(opt)) return

    // 初始化播放器
    switch (opt.type) {
      case "real":
        this.initRealPlayer(opt);
        break;
      case "record":
        this.initRecordPlayer(opt);
        break;
    }
  }

  // iccBuild(opt) {
  //     if (process.env.NODE_ENV === 'development' || import.meta.env.VITE_NODE_ENV === "wiki") {
  //         // this.prefixUrl = 'wsplayer/static'
  //         this.useNginxProxy = true
  //         this.proxyServerIp = localStorage['proxyIp']
  //         // wiki模式下, http 代理模式默认端口为 83
  //         if(window.location.protocol === "http:") {
  //             // this.proxyServerIp = this.proxyServerIp && this.proxyServerIp.split(':')[0]
  //             this.useNginxProxy = false
  //         }
  //         // 初始化播放器
  //         switch(opt.type) {
  //             case "real":
  //                 this.initRealPlayer(opt);
  //                 break;
  //             case "record":
  //                 this.initRecordPlayer(opt);
  //                 break
  //         }
  //         return true
  //     }
  //     return false
  // }

  /**
   * 初始化实时预览播放器
   */
  initRealPlayer(opt) {
    this.playNum = opt.num;
    this.type = "real";
    this.realPlayer = new WSPlayerConstructor({
      el: this.el,
      type: "real",
      serverIp: this.serverIp, // V1.2.7 版本已废弃[兼容老版本]
      prefixUrl: this.prefixUrl, // 解码库资源前缀
      protocol: this.protocol, // 协议 ws  wss
      isIntranet: this.isIntranet, // 传入当前是 内网还是外网, true-内网 false-外网. 内外网 + 分布式下, 使用该模式
      intranetMap: this.intranetMap, // 传入当前的内外网关系映射 {"内网ip": "外网ip"}.  内外网 + 分布式下, 使用该模式
      proxyServerIp: this.proxyServerIp, // V1.2.7 版本新增该配置 代理服务器的ip 【ws/wss直连时不传】
      streamServerIp: this.streamServerIp, // V1.2.7 版本新增该配置 流媒体服务器的ip
      setWSUrl: this.setWSUrl, // 开放式的 传入函数， return websocket 连接地址，第三方自行处理
      rtspResponseTimeout: opt.rtspResponseTimeout, // rtsp 流媒体不返回的超时时长
      config: {
        num: opt.num,
        maxNum: opt.maxNum,
        showControl: opt.showControl, // 默认是否显示工具栏
        useNginxProxy: this.useNginxProxy, // V1.2.7 版本新增该配置 直连时需要改为 false, 代理模式为 true
        showIcons: opt.showIcons || {
          streamChangeSelect: true, // 主辅码流切换
          talkIcon: true, // 对讲功能按钮
          localRecordIcon: true, // 本地录像功能按钮
          audioIcon: true, // 开启关闭声音按钮
          snapshotIcon: true, // 抓图按钮
          closeIcon: true, // 关闭视频按钮
        }, // V1.2.8 新增配置 顶部按钮自定义
        openIvs: typeof opt.openIvs === "boolean" ? opt.openIvs : true, //
      },
      receiveMessageFromWSPlayer: opt.receiveMessageFromWSPlayer || this.__receiveMessageFromWSPlayer.bind(this),
      getRealRtsp: API.getRealmonitor, // 获取实时预览rtsp接口 (不要做任何改动, 只传入方法, API.getRealmonitor() 是错误的， 会报错)
      getTalkRtsp: API.getTalkRtsp, // 获取对讲rtsp接口  (不要做任何改动, 只传入方法, API.getTalkRtsp() 是错误的， 会报错)
    });
    this.player = this.realPlayer;
    // 初始化云台控制组件
    if (opt.pztEl) {
      this.realPlayer.initPanTilt({
        // 云台控制容器的id
        el: opt.pztEl,
        // 云台区域控制接口
        setPtzDirection: API.setPtzDirection,
        // 云台镜头控制接口
        setPtzCamera: API.setPtzCamera,
        // 云台三维定位接口
        controlSitPosition: API.controlSitPosition,
      });
    }
  }

  /**
   * 初始化录像回放播放器
   */
  initRecordPlayer(opt) {
    this.playNum = opt.num;
    this.type = "record";
    this.recordPlayer = new WSPlayerConstructor({
      el: this.el,
      type: "record",
      serverIp: this.serverIp, // V1.2.7 版本已废弃[兼容老版本]
      prefixUrl: this.prefixUrl, // 解码库资源前缀
      protocol: this.protocol, // 协议 ws  wss
      isIntranet: this.isIntranet, // 传入当前是 内网还是外网, true-内网 false-外网. 内外网 + 分布式下, 使用该模式
      intranetMap: this.intranetMap, // 传入当前的内外网关系映射 {"内网ip": "外网ip"}.  内外网 + 分布式下, 使用该模式
      proxyServerIp: this.proxyServerIp, // V1.2.7 版本新增该配置 代理服务器的ip 【ws/wss直连时不传】
      streamServerIp: this.streamServerIp, // V1.2.7 版本新增该配置 流媒体服务器的ip
      setWSUrl: this.setWSUrl, // 开放式的 传入函数， return websocket 连接地址，第三方自行处理
      rtspResponseTimeout: opt.rtspResponseTimeout, // rtsp 流媒体不返回的超时时长
      config: {
        num: opt.num,
        maxNum: opt.maxNum,
        showControl: opt.showControl, // 默认是否显示工具栏
        useNginxProxy: this.useNginxProxy, // V1.2.7 版本新增该配置 直连时需要改为 false, 【代理模式可不传】
        showIcons: opt.showIcons || {
          streamChangeSelect: true, // 主辅码流切换
          talkIcon: true, // 对讲功能按钮
          localRecordIcon: true, // 本地录像功能按钮
          audioIcon: true, // 开启关闭声音按钮
          snapshotIcon: true, // 抓图按钮
          closeIcon: true, // 关闭视频按钮
        }, // V1.2.8 新增配置 顶部按钮自定义
        showRecordProgressBar: typeof opt.showRecordProgressBar === "boolean" ? opt.showRecordProgressBar : true, // V1.2.8 新增配置 是否显示回放进度条
      },
      receiveMessageFromWSPlayer: opt.receiveMessageFromWSPlayer || this.__receiveMessageFromWSPlayer.bind(this),
      getRecords: API.getRecords, // 获取录像列表接口  (不要做任何改动, 只传入方法, API.getRecords() 是错误的， 会报错)
      getRecordRtspByTime: API.getRecordRtspByTime, // 根据时间形式获取录像rtsp接口 (不要做任何改动, 只传入方法, API.getRecordRtspByTime() 是错误的， 会报错)
      getRecordRtspByFile: API.getRecordRtspByFile, // 根据文件形式获取录像rtsp接口 (不要做任何改动, 只传入方法, API.getRecordRtspByFile() 是错误的， 会报错)
    });
    this.player = this.recordPlayer;
  }

  /**
   * 播放实时预览视频
   * @param opt.channelList: {Array<Object>} 必填，通道列表
   * @param opt.streamType: {Number|String} 选填，码流类型，不填默认播放辅码流1，若不存在辅码流1，则自动切换到主码流  1-主码流 2-辅码流1 3-辅码流2
   * @param opt.windowIndex: {Number} 选填，指定从哪个窗口开始播放。不填默认从选中的窗口开始播放
   */
  // channelList: [{
  //     id: channelCode, // {String} 通道编码 -- 用于预览，必填
  //     isOnline: true, // {Boolean} 是否在线，非在线无法播放 -- 用于预览，必填
  //     deviceCode: deviceCode, // {String} 设备编码 -- 用于对讲，对讲必填，无对讲功能可不填
  //     deviceType: deviceType, // {String} 设备类型 -- 用于对讲，对讲必填，无对讲功能可不填
  //     channelSeq: channelSeq, // {String|Number} 通道序号 -- 用于对讲，对讲必填，无对讲功能可不填
  //     cameraType: cameraType, // {String|Number} 摄像头类型 -- 用于云台，云台必填，无云台功能可不填
  //     capability: capability, // {String} 能力集 -- 用于云台，选填
  // }]
  playRealVideo(opt) {
    this.realPlayer && this.realPlayer.playRealVideo(opt.channelList, opt.streamType, opt.windowIndex);
  }

  /**
   * 传入 wsUri 和 wsUrl 播放预览视频
   * @param { String } rtspURL 必传 rtsp流地址
   * @param { String } wsURL 必传 建立的websocket连接地址
   * @param { String } channelId 必传 通道id
   * @param { String } streamServerIp 选传 流媒体服务ip
   * @param { String } playerAdapter 选传 是否拉伸窗口 selfAdaption 自适应 | stretching 拉伸
   * @param { Number } selectIndex 必传 窗口号 从0开始
   * @param { Object } channelData 选传 通道信息
   */
  realByUrl(opt) {
    this.realPlayer &&
      this.realPlayer.playReal({
        playType: "url",
        rtspURL: opt.rtspURL, // 必传
        wsURL: opt.wsURL, // 必传
        channelId: opt.channelId, // 必传
        streamServerIp: opt.streamServerIp, // 选传
        playerAdapter: opt.playerAdapter, // 选传
        selectIndex: opt.selectIndex, // 必传
        channelData: opt.channelData || {}, // 选传
      });
  }

  // 音量设置
  /**
   * 开启声音
   */
  openVolume(windowIndex) {
    this.player.openVolume(windowIndex);
  }

  /**
   * 关闭声音
   */
  closeVolume(windowIndex) {
    this.player.closeVolume(windowIndex);
  }

  /**
   * 设置声音
   * @param volume 声音大小 传 0-1 小数点一位的小数
   */
  setVolume(windowIndex, volume) {
    this.player.setVolume(windowIndex, volume);
  }

  /**
   * 播放录像回放
   * @param opt.channelList {Array<Object>} 通道集合 必填
   * @param opt.startTime {String|Number} 开始时间  必选  timestamp到秒
   * @param opt.endTime {String|Number} 结束时间  必选  timestamp到秒
   * @param opt.recordSource {String|Number} 录像来源  必选 2表示设备录像  3表示中心录像
   * @param opt.streamType {String|Number} 码流类型 可选
   * @param opt.recordType {String|Number} 录像类型 可选
   */
  // channelList: [{
  //     id: channelCode, // {String} 通道编码 -- 用于回放，必填
  // }]
  playRecordVideo(opt) {
    this.recordPlayer && this.recordPlayer.getRecordList(opt);
  }

  /**
   * 传入 wsUri 和 wsUrl 播放回放视频
   * @param {Object} opt
   * @param {String} wsURL 必传 建立的websocket连接
   * @param {String} rtspURL 必传 rtsp地址
   * @param {String} channelId 必传 通道id
   * @param {String} startTime 必传 开始时间 到秒的时间戳
   * @param {String} endTime 必传 结束时间 到秒的时间戳
   * @param {String} playerAdapter 选传 是否拉伸窗口 selfAdaption 自适应 | stretching 拉伸
   * @param {Number} selectIndex 选传 窗口号
   * @param {Object} channelData 选传 通道信息
   * @param {Array} records 录像文件信息 [数组格式，用于渲染进度条]
   */
  recordByUrl(opt) {
    this.recordPlayer &&
      this.recordPlayer.playRecord({
        playType: "url",
        wsURL: opt.wsURL,
        rtspURL: opt.rtspURL,
        records: opt.records || [],
        channelId: opt.channelId,
        startTime: opt.startTime,
        endTime: opt.endTime,
        playerAdapter: opt.playerAdapter, // 选传
        selectIndex: opt.selectIndex, // 必传
        channelData: opt.channelData || {}, // 选传
      });
  }

  /**
   * 录像暂停
   * 只有正在播放的录像调用才有效
   * @param { number } index 窗口号
   */
  pause(index) {
    this.recordPlayer && this.recordPlayer.pause(index);
  }

  /**
   * 录像暂停后播放
   * 只有暂停后的录像调用才有效
   * @param { number } index 窗口号
   */
  play(index) {
    this.recordPlayer && this.recordPlayer.play(index);
  }

  /**
   * 倍速播放
   * @param { number } speed 速率 0.125 0.25 0.5 1 1.25 1.5 2 4 8 共7种速率
   * @param { number } index 窗口号
   */
  playSpeed(speed, index) {
    this.recordPlayer && this.recordPlayer.playSpeed(speed, index);
  }

  /**
   * 关闭播放器
   * @param {number} index 可选，关闭指定索引的窗口的播放器，不传则表示关闭所有播放器
   */
  close(index) {
    this.player && this.player.close(index);
  }

  /**
   * 设置全屏
   */
  setFullScreen() {
    this.player.setFullScreen();
  }

  /**
   * 设置窗口自适应还是拉伸
   * @param {string} playerAdapter selfAdaption 自适应 | stretching 拉伸
   */
  setPlayerAdapter(playerAdapter) {
    this.player.setPlayerAdapter(playerAdapter);
  }

  /**
   * 控制视频播放器显示的路数: 1 4 9 16 25，不会超过最大显示路数
   * @param {number} number
   */
  setPlayerNum(number) {
    this.player.setPlayerNum(number);
  }

  /**
   * 设置选中的播放器的索引
   * @param {number} index
   */
  setSelectIndex(index) {
    this.player.setSelectIndex(index);
  }

  /**
   * 录像跳转播放
   * @param {string} time HH:mm:ss格式
   */
  jumpPlayByTime(time) {
    this.player.jumpPlayByTime(time);
  }

  /**
   * 开始本地录像下载
   * @param {*} selectIndex 窗口序号(从0开始)
   * @param {*} size
   */
  startLocalRecord(selectIndex, size) {
    this.player.startLocalRecord(selectIndex, size);
  }
  /**
   * 停止本地录像下载
   * @param {*} selectIndex 窗口序号(从0开始)
   */
  stopLocalRecord(selectIndex) {
    this.player.stopLocalRecord(selectIndex);
  }

  /**
   * setIvs 设置智能帧开关
   * @param {Boolean} showIvs 是否显示智能帧
   * @param {Number} index
   */
  setIvs(showIvs, index) {
    this.player.setIvs(showIvs, index);
  }

  /**
   * picCap 抓图
   * @param {Number} selectIndex
   */
  picCap(selectIndex) {
    this.player.picCap(selectIndex);
  }

  /**
   * destroy 销毁播放器
   * @param {*} method
   * @param {*} data
   */
  destroy() {
    this.player.destroy();
  }

  // ----------------- 播放器事件 ------------------------
  __receiveMessageFromWSPlayer(method, data) {
    switch (method) {
      // ------------- 公共事件 ---------------------
      case "initializationCompleted":
        // 初始化完成，可调用播放方法（适用于动态加载解码库）
        break;
      case "realSuccess": // 实时预览成功
        console.log("实时预览成功");
        break;
      case "realError": // 实时预览失败
        console.log("实时预览失败", err);
        break;
      case "talkError": // 对讲失败
        console.log("对讲失败");
        break;
      case "recordSuccess": // 录像回放成功
        console.log("录像回放成功");
        break;
      case "recordSuccess": // 录像回放失败
        console.log("录像回放失败", err);
        break;
      case "recordFinish":
        console.log("当前录像播放完成", data);
        break;
      case "selectWindowChanged": // 选中的窗口发生改变
        this.currentChannelId = data.channelId;
        this.playIndex = data.playIndex;
        break;
      case "windowNumChanged": // 播放器显示的路数发生改变
        this.playNum = data;
        break;
      case "closeVideo": // 视频关闭
        // 点击关闭按钮引发的视频关闭进行提示
        // 切换视频引发的视频关闭不进行提示
        if (!data.changeVideoFlag) {
          console.log(`窗口${data.selectIndex}的视频已关闭`);
        }
        break;
      case "statusChanged": // 视频状态发生改变
        break;
      case "errorInfo": // 错误信息提示
        console.log(data, "可打印查看错误消息");
        // data = {
        //     errorCode: xxx,
        //     errorMsg: "",
        //     errorData: {
        //         channelList: [],
        //         apiErrorInfo: {},
        //         method: "",
        //         arguments: [],
        //     },
        // }
        console.error(data);
        break;
    }
  }
}

export default PlayerManager;
