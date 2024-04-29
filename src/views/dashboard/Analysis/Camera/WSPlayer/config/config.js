export default {
    // 创建播放器时显示视频路数
    num: 1,
    // 创建最大的视频路数
    maxNum: 25,
    // 是否显示工具栏，默认显示
    showControl: true,
    // 是否显示录像回放进度条，默认显示
    showRecordProgressBar: true,
    // 是否动态加载解码库 默认动态加载
    // 当动态加载出现一系列问题时，可以改成静态加载
    isDynamicLoadLib: true,
    // 是否只加载单线程解码库
    onlyLoadSingleLib: true,
    // 是否直连 (默认需要代理转发)
    useNginxProxy: false,
    // 是否启用规则线，默认启用
    openIvs: true,
    ivsTypeArr: [1, 2], // 传入数组，支持显示的情况, 空表示没有智能信息，1-智能规则线 2-智能目标框
    // H264是否使用硬解，默认使用硬解
    useH264MSE: true,
    // H265是否使用硬解，默认使用硬解
    useH265MSE: true,
    // 控制视频上面bar栏按钮是否显示
    showIcons: {
        streamChangeSelect: true, // 主辅码流切换
        talkIcon: true, // 对讲功能按钮
        localRecordIcon: true, // 本地录像功能按钮
        audioIcon: true, // 开启关闭声音按钮
        snapshotIcon: true, // 抓图按钮
        closeIcon: true, // 关闭视频按钮
    },
    // 本地录像是否下载MP4格式，默认下载MP4格式，否则下载dav格式
    downloadMp4Record: true,
    // 本地录像每个文件的大小，单位兆（M）
    // 由于下载前，文件内容存放在内存中，因此不建议设置太大，几百M即可。
    localRecordSize: 100,
    // 是否按时间播放中心录像
    // 分布式环境下按时间播放中心录像会有问题，同一个设备切换了所属服务器，那只能查询播放当前服务器的录像，无法播放存放在其他服务器的录像
    // 分布式环境下的问题在视频V1.1.4版本优化，低于V1.1.4版本的视频子系统，按实际情况设置为false
    playCenterRecordByTime: false,
}