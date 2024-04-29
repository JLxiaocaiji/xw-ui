import utils from './utils'

const realMonitorParam = {
    clientType: "WINPC",
    clientMac: "30:9c:23:79:40:08",
    clientPushId: "",
    project: "PSDK",
    method: "MTS.Video.StartVideo",
    data: {
        optional: "/admin/API/MTS/Video/StartVideo",
        dataType: "3", // 视频类型：1=视频, 2=音频, 3=音视频
        streamType: "2", //码流类型：1=主码流, 2=辅码流 使用辅码流 码率低更加流畅
        channelId: "",
        trackId: ""
    }
}

const talkPram = {
    clientType: "WINPC",
    clientMac: "30:9c:23:79:40:08",
    clientPushId: "",
    project: "PSDK",
    method: "MTS.Audio.StartTalk",
    data: {
        optional: "/admin/API/MTS/Audio/StartTalk?token=ff93dabe5d754ea8acb0a95dbe6c4a0f",
        source: "",
        deviceCode: "",
        talkType: "1", // 设备对讲
        target: "",
        audioBit: 16, // 音频位数
        audioType: 2, // 音频类型，2表示G711a，目前只支持G711a对讲
        broadcastChannels: "",
        sampleRate: 8000, // 采样率
        talkmode: "",
        channelSeq: "0"
    }
}

const recordsParam = {
    "clientType": "WINPC",
    "clientMac": "30:9c:23:79:40:08",
    "clientPushId": "",
    "project": "PSDK",
    "method": "SS.Record.QueryRecords",
    "data": {
        "cardNo": "",
        "optional": "/admin/API/SS/Record/QueryRecords",
        "diskPath": "",
        "startIndex": "",
        "streamType": "0", // 码流类型：0=全部码流 1=主码流, 2=辅码流
        "recordType": "0", // 录像类型：0=全部，1=手动录像，2=报警录像，3=动态监测，4=视频丢失，5=视频遮挡，6=定时录像，7=全天候录像，8=文件录像转换
        "recordSource": "3", // 录像来源：1=自动，2=设备，3=中心
        "endIndex": "",
        "startTime": "",
        "endTime": "",
        "channelId": ""
    }
}

const recordByTimeParam = {
    "clientType": "WINPC",
    "clientMac": "30:9c:23:79:40:08",
    "clientPushId": "",
    "project": "PSDK",
    "method": "SS.Playback.StartPlaybackByTime",
    "data": {
        "nvrId": "",
        "optional": "/admin/API/SS/Playback/StartPlaybackByTime",
        "recordType": "0",	// 录像类型：1=一般录像，2=报警录像
        "recordSource": "1", // 录像来源：1=自动，2=设备，3=中心
        "streamType": "1", // 码流类型：1=主码流， 2=辅码流
        "channelId": "",
        "startTime": "",
        "endTime": "",
    }
}

const recordByFileParam = {
    "clientType": "WINPC",
    "clientMac": "30:9c:23:79:40:08",
    "clientPushId": "",
    "project": "PSDK",
    "method": "SS.Playback.StartPlaybackByFile",
    "data": {
        "ssId": "",
        "optional": "/evo-apigw/admin/API/SS/Playback/StartPlaybackByFile",
        "startTime": "",
        "endTime": "",
        "fileName": "",
        "diskId": "",
        "nvrId": "",
        "recordSource": "",
        "channelId": "",
        "playbackMode": "0",
        "streamId": ""
    }
}

/**
 * 封装一些常用的流程
 * 比如实时预览、录像回放、对讲等请求接口再进行播放等
 */
class Procedure {
    constructor(options) {
        // 实时预览播放器
        this.realPlayer = null;
        // 录像回放播放器
        this.recordPlayer = null;
        // 是否按时间播放中心录像
        this.playCenterRecordByTime = options.playCenterRecordByTime;
        if(options.type === "real") {
            this.realPlayer = options.player;
        } else {
            this.recordPlayer = options.player;
        }
        // 选中的窗口的index
        this.playIndex = 0;
        // 录像回放接口
        this.recordList = [];
        // 相关的请求接口方法
        this.getRealRtsp = options.getRealRtsp
        this.getRecords = options.getRecords
        this.getRecordRtspByTime = options.getRecordRtspByTime
        this.getRecordRtspByFile = options.getRecordRtspByFile
        this.getTalkRtsp = options.getTalkRtsp
    }

    // 内外网环境下，会返回多个由|连接的rtsp
    getCurrentRtsp(url) {
        // 云环境下会返回localhost或者127.0.0.1的rtsp，需要过滤掉
        // 同时过滤掉IPV6的地址
        let urls = url.split('|').filter(item => !item.includes("localhost") && !item.includes("127.0.0.1") && !item.startsWith("rtsp://["))
        // if (process.env.NODE_ENV === 'development') {
        //     return urls.find(item => {return item.indexOf(config.serverIp.split(':')[0])>-1}) || urls[0]
        // }
        return urls.find(item => {
            return item.includes(window.location.hostname)
        }) || urls[0]
    }

    // 获取rtsp 的 ip数组 域名数组
    getWSUrl(url) {
        return url.split('|').map(item => {
            let ip_reg = /(www\.)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.\w+(:\d+)?/
            return item.match(ip_reg)[0]
        })
    }

    /**
     * 最大路数进行扩容
     * 若播放的通道数量大于当前显示的路数，则需要增大显示的路数（扩容）
     * @param videoLength 需要播放的路数
     */
    openSomeWindow(videoLength) {
        let wsPlayer = this.realPlayer || this.recordPlayer;
        // 播放的路数大于显示的最大路数
        if(videoLength > wsPlayer.showNum) {
            if(videoLength < wsPlayer.maxWindow) {
                if(videoLength > 16) {
                    this.playNum = 25;
                } else if(videoLength > 9) {
                    this.playNum = 16;
                } else if(videoLength > 4) {
                    this.playNum = 9
                } else {
                    this.playNum = 4;
                }
            } else {
                this.playNum = wsPlayer.maxWindow
            }
            wsPlayer.setPlayerNum(this.playNum);
        }
    }

    /**
     * 播放实时预览视频
     * @param channelList 通道集合
     * @param streamType 码流类型，默认先播放辅码流
     * @param windowIndex 播放视频的窗口
     * @param showError 是否显示错误信息
     * @private
     */
    playRealVideo(channelList, streamType = "2", windowIndex, showError = false) {
        // 先判断通道是否在离线
        let onlineChannelList = [],
            offlineChannelList = [];
        channelList.forEach(channel => {
            if(!channel.isOnline) {
                offlineChannelList.push(channel)
            } else {
                onlineChannelList.push(channel)
            }
        })
        if(offlineChannelList.length) {
            this.realPlayer.sendErrorMessage(101, {channelList: offlineChannelList});
        }
        // 没有在线的通道，则不进行播放
        if(!onlineChannelList.length) {
            return;
        }
        if(!utils.validFunction(this.getRealRtsp)) {
            this.realPlayer.sendErrorMessage(608, {insert: ["请求实时预览接口", "getRealRtsp"]})
            return;
        }
        this.openSomeWindow(onlineChannelList.length);
        onlineChannelList.map((channel, channelIndex) => {
            // 默认从选中的窗口开始播放
            let playIndex = windowIndex > -1 ? windowIndex : this.playIndex
            // 多个通道同时播放，则默认都是辅码流，从第一个窗口开始播放
            if(onlineChannelList.length > 1) {
                playIndex = playIndex + channelIndex;
            }
            realMonitorParam.data.streamType = streamType;
            realMonitorParam.data.channelId = channel.id;
            this.getRealRtsp(JSON.parse(JSON.stringify(realMonitorParam))).then(res => {
                if(typeof res === "string") {
                    return this.realPlayer.sendMessage("realError", channel, "在传入的 getRealRtsp 方法上，resolve 返回的值应该为一个icc返回的标准对象")
                }
                // 获取正确的rtsp，并拼接token
                res.rtspURL = this.getCurrentRtsp(res.url) + '?token=' + res.token
                this.realPlayer.playReal({
                    selectIndex: playIndex,
                    streamServerIp: res.innerIp,
                    rtspURL: res.rtspURL,
                    channelId: channel.id,
                    channelData: channel, // 把通道信息传进去，用于对讲功能
                    streamType,
                    wsList: this.getWSUrl(res.url)
                })
            }, rej => {
                // 视频默认使用辅码流1打开，若没有辅码流1不进行报错提示，自动切换成主码流
                // 如果手动从主码流切到辅码流，此时没有辅码流需要报错提示
                if(rej.code === '27001007') {
                    this.realPlayer.sendErrorMessage(102, {channelList: [channel], apiErrorInfo: rej})
                } else if(showError) {
                    this.realPlayer.sendErrorMessage(103, {channelList: [channel], apiErrorInfo: rej})
                } else {
                    this.playRealVideo([channel], "1", playIndex, true);
                }
            })
        });
    }

    /**
     * 开始对讲
     * @param channel
     */
    startTalk(channel) {
        if(!utils.validFunction(this.getTalkRtsp)) {
            this.realPlayer.sendErrorMessage(608, {insert: ["请求对讲接口", "getTalkRtsp"]})
            return;
        }
        talkPram.data.deviceCode = channel.deviceCode;
        talkPram.data.audioBit = channel.audioBit || 16;
        talkPram.data.sampleRate = channel.sampleRate || 8000;
        // 默认使用设备对讲
        // 如果设备类型为dvr、nvr、evs、ivss等设备，则需要使用通道对讲
        if([1, 6, 10, 43].includes(channel.deviceType)) {
            talkPram.data.talkType = "2"
            talkPram.data.channelSeq = channel.channelSeq
        } else {
            talkPram.data.talkType = "1"
            talkPram.data.channelSeq = "0"
        }
        this.getTalkRtsp(JSON.parse(JSON.stringify(talkPram))).then(res => {
            if(typeof res === "string") {
                return this.realPlayer.sendMessage("realError", channel, "在传入的 getTalkRtsp 方法上，resolve 返回的值应该为一个icc返回的标准对象")
            }
            let rtspURL = this.getCurrentRtsp(res.url) + '?token=' + res.token
            let player = this.realPlayer.playerList[this.realPlayer.talkIndex]
            player.startTalk({
                rtspURL,
                serverIp: res.innerIp,
                wsList: this.getWSUrl(res.url)
            })
        }).catch(err => {
            this.realPlayer.sendErrorMessage(401, {type:'talk'}, err);
            this.realPlayer.sendErrorMessage(304, {channelList: [channel], apiErrorInfo: err});
        })
    }

    /**
     * 获取录像列表
     * @param opt.channelList 通道集合  必选
     * @param opt.startTime 开始时间  必选
     * @param opt.endTime 结束时间  必选
     * @param opt.recordSource 录像来源  必选
     * @param opt.streamType 码流类型
     * @param opt.recordType 录像类型
     * @param opt.isJumpPlay 是否跳转播放
     * @param opt.windowIndex 表示播放的窗口号
     * @param playCallback 播放成功回调
     */
    getRecordList(opt, playCallback) {
        if(!utils.validFunction(this.getRecords)) {
            this.recordPlayer.sendErrorMessage(608, {insert: ["请求录像接口", "getRecords"]})
            return;
        }
        recordsParam.data.streamType = opt.streamType || "0";
        recordsParam.data.recordType = opt.recordType || "0";
        recordsParam.data.recordSource = opt.recordSource;
        recordsParam.data.startTime = opt.startTime;
        recordsParam.data.endTime = opt.endTime;
        // 如果播放的通道数量大于1，则从第一个窗口开始播放，否则从指定的窗口播放
        let playIndex = typeof opt.windowIndex === 'number' ? opt.windowIndex : opt.channelList.length > 1 ? 0 : this.playIndex;
        opt.channelList.forEach(channel => {
            recordsParam.data.channelId = channel.id;
            this.getRecords(JSON.parse(JSON.stringify(recordsParam))).then(res => {
                let recordList = (res.records || []).sort((a, b) => a.startTime - b.startTime);
                if(!recordList.length) {
                    this.recordPlayer.sendErrorMessage(201, {channelList: [channel]});
                    return;
                }
                // 批量播放可能需要扩容路数
                if(opt.channelList.length > 1) {
                    this.openSomeWindow(playIndex + 1)
                }
                this.getRecordRtsp(
                    {...opt, channel},
                    recordList.map(item => {
                        // 设置报警录像
                        item.isImportant = item.recordType === "2"
                        return item
                    }),
                    !opt.isUpdateRecords,
                    playIndex,
                    playCallback
                );
                playIndex++;
            }, rej => {
                this.recordPlayer.sendErrorMessage(202, {channelList: [channel], apiErrorInfo: rej});
            })
        })
    }

    getRecordRtsp(opt, recordList, isUpdateRecords = true, playIndex, playCallback) {
        let queryPromise = null;
        let recordSource = recordList[0].recordSource || opt.recordSource;
        let ssId = opt.ssId;
        let ssIdList = [];
        let recordByTime = false;
        if(Number(recordSource) === 2 || this.playCenterRecordByTime) {
            if(!utils.validFunction(this.getRecordRtspByTime)) {
                this.recordPlayer.sendErrorMessage(608, {insert: ["请求录像接口", "getRecordRtspByTime"]})
                return;
            }
            recordByTime = true
            recordByTimeParam.data.streamType = recordList[0].streamType || opt.streamType || "0";
            recordByTimeParam.data.recordType = "1";
            recordByTimeParam.data.recordSource = recordSource;
            recordByTimeParam.data.startTime = opt.startTime;
            recordByTimeParam.data.endTime = opt.endTime;
            recordByTimeParam.data.channelId = opt.channel.id;
            recordByTimeParam.data.streamId = recordList[0].streamId || "";
            // if(this.playCenterRecordByTime) {
                ssId = ssId || recordList[0].ssId;
                ssIdList = Array.from(new Set(recordList.map(item => item.ssId)));
                recordByTimeParam.data.ssId = ssId;
            // }
            // 存储在设备录像，根据时间播放
            queryPromise = this.getRecordRtspByTime(JSON.parse(JSON.stringify(recordByTimeParam)))
        } else if(Number(recordSource) === 3) {
            if(!utils.validFunction(this.getRecordRtspByFile)) {
                this.recordPlayer.sendErrorMessage(608, {insert: ["请求录像接口", "getRecordRtspByFile"]})
                return;
            }
            let file = recordList[0];
            recordByFileParam.data = {
                "ssId": file.ssId,
                "optional": "/evo-apigw/admin/API/SS/Playback/StartPlaybackByFile",
                "startTime": file.startTime,
                "endTime": file.endTime,
                "fileName": file.recordName,
                "diskId": file.diskId,
                "nvrId": "",
                "recordSource": file.recordSource ? file.recordSource : "3",
                "channelId": opt.channel.id,
                "playbackMode": "0",
                "streamId": file.streamId
            }
            // 存储在中心服务器的录像，根据文件方式播放
            queryPromise = this.getRecordRtspByFile(JSON.parse(JSON.stringify(recordByFileParam)))
        }
        if(queryPromise) {
            queryPromise.then((data) => {
                if(typeof data === "string") {
                    return this.realPlayer.sendMessage("realError", channel, "在传入的 getRecordRtspByTime/getRecordRtspByFile 方法上，resolve 返回的值应该为一个icc返回的标准对象")
                }
                data.channelId = opt.channel.id
                // 内外网环境下，会返回多个由|连接的rtsp
                // 获取正确的rtsp，并拼接token
                data.rtspURL = this.getCurrentRtsp(data.url) + '?token=' + data.token
                data.wsList = this.getWSUrl(data.url)
                if(!data.rtspURL) {
                    this.recordPlayer.sendErrorMessage(201, {channelList: [opt.channel]});
                    console.warn("所选通道未查询到录像文件")
                    return
                }
                data.channelData = opt.channel;
                // 查询到录像之后立即初始化播放器
                this.recordPlay(data, playIndex, ssId, ssIdList, opt.isJumpPlay, playCallback, recordByTime).then(() => {
                    let recordItem = this.recordList[playIndex]
                    if(isUpdateRecords) {
                        // 将录像信息存储起来，跳转使用
                        this.recordList[playIndex] = {...opt, recordList, recordIndex: 0, isPlaying: true};
                    } else {
                        let recordName = recordList[0].recordName;
                        recordItem.recordIndex = recordItem.recordList.findIndex(item => item.recordName === recordName);
                        recordItem.isPlaying = true;
                    }
                    // 设置录像回放的时间轴
                    if(this.playIndex === playIndex) {
                        if(!isUpdateRecords) {
                            recordList = recordItem.recordList
                            recordItem.isPlaying = true;
                        }
                        this.setTimeLine(recordList)
                    }
                })
                
            }, rej => {
                this.recordPlayer.sendErrorMessage(203, {channelList: [opt.channel], apiErrorInfo: rej});
            })
        }
    }

    // 开始录像回放
    recordPlay(data, playIndex, ssId, ssIdList, isJumpPlay, playCallback, recordByTime) {
        return new Promise((resovle) => {
            this.recordPlayer.playRecord({
                ...data,
                streamServerIp: data.innerIp,
                selectIndex: playIndex,
                ssId,
                ssIdList,
                isJumpPlay,
                playRecordByTime: recordByTime || this.recordPlayer.config.playCenterRecordByTime && !!ssId,
            }, playCallback).then(() => resovle())
        })
    }

    // 设置回放的时间轴
    setTimeLine(recordList) {
        this.recordPlayer.setTimeLine(recordList);
    }

    // 点击时间轴跳转播放
    clickRecordTimeLine(timeStamp, ssId) {
        let record = this.recordList[this.playIndex];
        let startTime = record.startTime;
        startTime = new Date(startTime * 1000).setHours(0);
        startTime = new Date(startTime).setMinutes(0);
        startTime = new Date(startTime).setSeconds(0) / 1000;
        if(!this.playCenterRecordByTime) {
            startTime += timeStamp;
        }
        let param = {
            channelList: [record.channel],
            startTime,
            endTime: record.endTime,
            recordSource: record.recordSource,
            isUpdateRecords: true,
            ssId,
            isJumpPlay: true
        }
        this.getRecordList(param, {
            DecodeStart() {
                this.player.playByTime(timeStamp)
            }
        });
    }

    // 一段录像播放结束，自动播放下一段录像
    playNextRecord(selectIndex, ssId) {
        // 按文件播放
        if(ssId) {
            if(!utils.validFunction(this.getRecordRtspByTime)) {
                this.recordPlayer.sendErrorMessage(608, {insert: ["请求录像接口", "getRecordRtspByTime"]})
                return;
            }
            let record = this.recordList[selectIndex];
            let file = record.recordList.find(item => item.ssId === ssId);
            recordByTimeParam.data.streamType = file.streamType || "0";
            recordByTimeParam.data.recordType = "1";
            recordByTimeParam.data.recordSource = file.recordSource;
            recordByTimeParam.data.startTime = new Date(file.startTime * 1000).setHours(0, 0, 0) / 1000
            recordByTimeParam.data.endTime = new Date(file.endTime * 1000).setHours(23, 59, 59) / 1000;
            recordByTimeParam.data.channelId = file.channelId;
            recordByTimeParam.data.ssId = ssId;
            recordByTimeParam.data.streamId = file.streamId || "";
            let ssIdList = Array.from(new Set(record.recordList.map(item => item.ssId)));
            this.getRecordRtspByTime(JSON.parse(JSON.stringify(recordByTimeParam))).then(data => {
                data.channelId = file.channelId
                // 内外网环境下，会返回多个由|连接的rtsp
                // 获取正确的rtsp，并拼接token
                data.rtspURL = this.getCurrentRtsp(data.url) + '?token=' + data.token
                data.wsList = this.getWSUrl(data.url)
                // 查询到录像之后立即初始化播放器
                this.recordPlay(data, selectIndex, ssId, ssIdList, true).then(() => {
                    // 设置录像回放的时间轴
                    this.setTimeLine(record.recordList)
                })
            })
            return
        }
        if(!utils.validFunction(this.getRecordRtspByFile)) {
            this.recordPlayer.sendErrorMessage(608, {insert: ["请求录像接口", "getRecordRtspByFile"]})
            return;
        }
        let record = this.recordList[selectIndex];
        // 播放文件索引加1
        record.recordIndex++;
        // 设置此录像是否在播放
        record.isPlaying = true;
        // 若存在下一个播放文件，则进行播放
        let file = record.recordList[record.recordIndex]
        if(file) {
            recordByFileParam.data = {
                "ssId": file.ssId,
                "optional": "/evo-apigw/admin/API/SS/Playback/StartPlaybackByFile",
                "startTime": file.startTime,
                "endTime": file.endTime,
                "fileName": file.recordName,
                "diskId": file.diskId,
                "nvrId": "",
                "recordSource": file.recordSource,
                "channelId": file.channelId,
                "playbackMode": "0",
                "streamId": file.streamId
            }
            this.getRecordRtspByFile(JSON.parse(JSON.stringify(recordByFileParam))).then(res => {
                // 内外网环境下，会返回多个由|连接的rtsp
                // 获取正确的rtsp，并拼接token
                res.rtspURL = this.getCurrentRtsp(res.url) + '?token=' + res.token;
                res.wsList = this.getWSUrl(res.url)
                if(!res.rtspURL) {
                    this.recordPlayer.sendErrorMessage(201, {channelList: [record.channel]});
                    return
                }
                // 查询到录像之后立即初始化播放器
                this.recordPlay(res, selectIndex, "", [], true).then(() => {
                    // 设置录像回放的时间轴
                    this.setTimeLine(record.recordList)  
                })
            }, rej => {
                this.recordPlayer.sendErrorMessage(203, {channelList: [record.channel], apiErrorInfo: rej});
            })
        }
    }

    /**
     * 切换窗口时更新进度条
     * @param playIndex
     */
    changeTimeLine(playIndex) {
        let record = this.recordList[playIndex];
        if(record && record.isPlaying) {
            this.setTimeLine(record.recordList)
        }
    }

    /**
     * 某个窗口的视频被关闭
     * @param selectIndex 视频关闭窗口的索引
     * @param changeVideoFlag 是否因切换其他视频而关闭现在视频
     */
    videoClosed(selectIndex, changeVideoFlag, channelData) {
        this.recordList[selectIndex] && (this.recordList[selectIndex].isPlaying = false);
    }

    /**
     * 设置选中的窗口
     * @param playIndex
     */
    setPlayIndex(playIndex) {
        this.playIndex = playIndex;
    }
}

export default Procedure
