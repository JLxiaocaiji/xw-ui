// 注意： 本文接口均为 ICC 接口， 接口需要三方后端转发使用，每个方法对请求进行改写，固定格式请看注释


// 跟平台相关的业务JS
const API = {
    /**
     * 请求实时视频流地址
     * @returns Promise<> 
     * @desc 只需改写 API.ajaxRequest 内容
     * 
     * 固定格式如下
     * return new Promise ((resolve, reject) => {
     *      ...
     *      resolve({     resolve 返回格式示例如下
     *          url: "",
     *          token: 1,
     *          ...
     *      })
     * })
    */
    getRealmonitor(realmonitorParam) {
        return new Promise((resolve,reject) => {
            API.ajaxRequest({
                url: '/evo-apigw/admin/API/MTS/Video/StartVideo',
                data: realmonitorParam,
            }).then(res => {
                resolve(res.data)
            }).catch(res => {
                reject(res)
            })
        })
    },
    /**
     * 获取对讲的rtsp
     * @returns Promise<> 
     * @desc 只需改写 API.ajaxRequest 内容
     * 
     * 固定格式如下
     * return new Promise ((resolve, reject) => {
     *      ...
     *      resolve({     resolve 返回格式示例如下
     *          url: "",
     *          token: 1,
     *          ...
     *      })
     * })
    */
    getTalkRtsp(talkPram) {
        return new Promise((resolve,reject) => {
            API.ajaxRequest({
                url: '/evo-apigw/admin/API/MTS/Audio/StartTalk',
                data: talkPram,
            }).then(res => {
                resolve(res.data)
            }).catch(res => {
                reject(res)
            })
        })
    },
    /**
     * 根据时间查询设备上的录像
     * @param recordByTimeParam.recordType 录像类型：1=一般录像，2=报警录像
     * @param recordByTimeParam.recordSource 录像来源：1=全部，2=设备，3=中心
     * @param recordByTimeParam.streamType 码流类型：1=主码流, 2=辅码流 使用辅码流 码率低更加流畅
     * @param recordByTimeParam.channelId 通道code
     * @param recordByTimeParam.startTime 开始时间
     * @param recordByTimeParam.endTime 结束时间
     
    * @returns Promise<> 
     * @desc 只需改写 API.ajaxRequest 内容
     * 
     * 固定格式如下
     * return new Promise ((resolve, reject) => {
     *      ...
     *      resolve({     resolve 返回格式示例如下
     *          url: "",
     *          token: 1,
     *          ...
     *      })
     * })
    */
    getRecordRtspByTime(recordByTimeParam) {
        return new Promise((resolve,reject) => {
            API.ajaxRequest({
                url: '/evo-apigw/admin/API/SS/Playback/StartPlaybackByTime',
                data: recordByTimeParam,
            }).then(res => {
                resolve(res.data)
            }).catch(res => {
                reject(res)
            })
        })
    },

    /**
     * 根据文件形式回放录像
     * @param recordByFileParam.recordType 录像类型：1=一般录像，2=报警录像
     * @param recordByFileParam.streamType 码流类型：1=主码流, 2=辅码流 使用辅码流 码率低更加流畅
     * @param recordByFileParam.recordSource 录像来源：1=全部，2=设备，3=中心
     * @param recordByFileParam.channelId 通道code
     * @param recordByFileParam.startTime 开始时间 timestamp到秒
     * @param recordByFileParam.endTime 结束时间 timestamp到秒
     
    * @returns Promise<> 
     * @desc 只需改写 API.ajaxRequest 内容
     * 
     * 固定格式如下
     * return new Promise ((resolve, reject) => {
     *      ...
     *      resolve({     resolve 返回格式示例如下
     *          url: "",
     *          token: 1,
     *          ...
     *      })
     * })
    */
    getRecordRtspByFile(recordByFileParam) {
        return new Promise((resolve, reject) => {
            API.ajaxRequest({
                url: '/evo-apigw/admin/API/SS/Playback/StartPlaybackByFile',
                data: recordByFileParam,
            }).then(res => {
                resolve(res.data)
            }).catch(res => {
                reject(res)
            })
        })
    },
    /**
     *  查询中心录像上的录像文件信息
     * @param recordsParam.recordType 录像类型：1=一般录像，2=报警录像
     * @param recordsParam.streamType 码流类型：1=主码流, 2=辅码流 使用辅码流 码率低更加流畅
     * @param recordsParam.recordSource 录像来源：1=全部，2=设备，3=中心
     * @param recordsParam.channelId 通道code
     * @param recordsParam.startTime 开始时间 timestamp到秒
     * @param recordsParam.endTime 结束时间 timestamp到秒
     * 
     * @returns Promise<> 
     * @desc 只需改写 API.ajaxRequest 内容
     * 
     * 固定格式如下
     * return new Promise ((resolve, reject) => {
     *      ...
     *      resolve({     resolve 返回格式示例如下
     *          url: "",
     *          token: 1,
     *          ...
     *      })
     * })
     */
    getRecords(recordsParam) {
        return new Promise((resolve,reject) => {
            API.ajaxRequest({
                url: '/evo-apigw/admin/API/SS/Record/QueryRecords',
                data: recordsParam,
            }).then(res => {
                resolve(res.data)
            }).catch(res => {
                reject(res)
            })
        })
    },
    /**
     * 云台方向控制
     * @param directionParam
     * @returns {Promise<unknown>}
     */
    setPtzDirection(directionParam) {
        return new Promise((resolve,reject) => {
            API.ajaxRequest({
                url: '/evo-apigw/admin/API/DMS/Ptz/OperateDirect',
                data: directionParam,
            }).then(res => {
                resolve(res.data)
            }).catch(res => {
                reject(res)
            })
        })
    },
    /**
     * 云台镜头控制
     * @param cameraParam
     * @returns {Promise<unknown>}
     * 
     * @returns Promise<> 
     * @desc 只需改写 API.ajaxRequest 内容
     * 
     * 固定格式如下
     * return new Promise ((resolve, reject) => {
     *      ...
     *      resolve({     resolve 返回格式示例如下
     *          url: "",
     *          token: 1,
     *          ...
     *      })
     * })
     */
    setPtzCamera(cameraParam) {
        return new Promise((resolve,reject) => {
            API.ajaxRequest({
                url: '/evo-apigw/admin/API/DMS/Ptz/OperateCamera',
                data: cameraParam,
            }).then(res => {
                resolve(res.data)
            }).catch(res => {
                reject(res)
            })
        })
    },
    /**
     * 云台三维定位接口
     * @param positionParam
     
     * @returns Promise<> 
     * @desc 只需改写 API.ajaxRequest 内容
     * 
     * 固定格式如下
     * return new Promise ((resolve, reject) => {
     *      ...
     *      resolve({     resolve 返回格式示例如下
     *          url: "",
     *          token: 1,
     *          ...
     *      })
     * })
    */
    controlSitPosition(positionParam) {
        return new Promise((resolve,reject) => {
            API.ajaxRequest({
                url: '/evo-apigw/admin/API/DMS/Ptz/SitPosition',
                data: positionParam,
            }).then(res => {
                resolve(res.data)
            }).catch(res => {
                reject(res)
            })
        })
    },
    /**
     * 请求
     * @param {*} opt
     * @param {*} opt.url 接口地址
     * @param {*} opt.data 参数
     
     * 集成后，该方法请删除
     */
    ajaxRequest(opt) {
        var accessToken = localStorage.getItem('accessToken')
        var userId = accessToken.split(':')[0]
        opt.headers = opt.headers ? opt.headers : {}
        return new Promise((resolve, reject) => {
            $.ajax({
                url: opt.url,
                type: opt.type ? opt.type : 'post',
                dataType: opt.dataType ? opt.dataType : 'json',
                data: JSON.stringify(opt.data),
                headers: Object.assign({
                    Authorization: "bearer " + accessToken,
                    'User-Id': userId,
                    'Content-Type': 'application/json',
                    proxyip: localStorage['proxyIp']
                }, opt.headers),
                contentType: 'application/json;charset=utf-8',
                crossDomain: true,
                success: function (res) {
                    if (res.code == 1000 || res.code == '0') {
                        resolve(res)
                    } else if (res.code == "27001007") {
                        // token过期，刷新token
                        API.refreshToken().then(() => {
                            // token刷新后，重新请求
                            API.ajaxRequest(opt).then(data => {
                                // 重新请求后，需要处理原始请求的resolve
                                resolve(data)
                            })
                        })
                    } else {
                        reject(res)
                    }
                }
            })
        })
    },
    // 刷新token
    // 集成后，该方法请删除
    refreshToken() {
        var refreshToken = localStorage.getItem('refreshToken')
        var clientId = localStorage.getItem('checked') ? 'web_client_remember' : 'web_client'
        var value = {
            'refresh_token': refreshToken,
            'grant_type': 'refresh_token',
            'client_id': clientId,
            "client_secret": 'web_client'
        }
        var param = ''
        for (var i in value) {
            param += '&' + i + "=" + value[i]
        }
        param = param.slice(1)
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/evo-apigw/evo-oauth/oauth/token',
                type: 'post',
                dataType: 'json',
                data: param,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    proxyip: localStorage['proxyIp']
                },
                success: function (res) {
                    console.log(res)
                    if (res.code === '0') {
                        localStorage.setItem("accessToken", res.data.access_token)
                        localStorage.setItem("refreshToken", res.data.refresh_token)
                        localStorage.setItem('expiresTime', new Date().getTime() + res.data.expires_in * 1000)
                        // 登录保活
                        API.ajaxRequest({
                            url: `/evo-apigw/evo-brm/1.2.0/user/keepalive`,
                            data: {
                                clientType: 1,
                                magicId: localStorage.magicId,
                                timeout: 10000
                            }
                        })
                        resolve()
                    } else {
                        console.error(`refreshToken 失效，请登录平台`)
                        window.open(location.origin)
                        reject()
                    }
                }
            })
        })
    },

}
export default API
