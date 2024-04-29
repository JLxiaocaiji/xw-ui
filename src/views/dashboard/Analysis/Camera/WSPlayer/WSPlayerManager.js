class WSPlayerManager {
    constructor() {
        this.wsPlayerList = [];
        // 端口与player绑定，即key - port，value - player
        this.portToPlayer = {};
        window.cPlusVisibleDecCallBack = this.cPlusVisibleDecCallBack.bind(this);
        window.cExtraDrawDataCallBack = this.cExtraDrawDataCallBack.bind(this);
        window.cExtraDrawDrawCallBack = this.cExtraDrawDrawCallBack.bind(this);
        window.cRecordDataCallBack = this.cRecordDataCallBack.bind(this);
		window.cRawDataCallBack = this.cRawDataCallBack.bind(this);
    }

    /**
     * 解码库都是异步解码播放，调用全局的cPlusVisibleDecCallBack来渲染播放
     * 因此使用此方法来控制不同的码流，使用相对应的播放器进行渲染播放，达到码流与播放器进行一一对应
     * @param nPort
     * @param pBufY
     * @param pBufU
     * @param pBufV
     * @param nSize
     * @param pFrameInfo
     */
    cPlusVisibleDecCallBack(nPort, pBufY, pBufU, pBufV, nSize, pFrameInfo) {
        this.portToPlayer[nPort] && this.portToPlayer[nPort].setFrameData(nPort, pBufY, pBufU, pBufV, nSize, pFrameInfo);
    }

    cExtraDrawDataCallBack(nPort, nDataType, pDrawData, nDataLen) {
        this.portToPlayer[nPort] && this.portToPlayer[nPort].setIVSData(nPort, nDataType, pDrawData, nDataLen);
    }

    cExtraDrawDrawCallBack(nPort) {
        this.portToPlayer[nPort] && this.portToPlayer[nPort].drawIVSData(nPort);
    }

    /**
     * 本地录像转码成MP4格式
     * @param nPort
     * @param pData
     * @param nDataLen
     * @param nOffset
     * @param pFrameInfo
     */
    cRecordDataCallBack(nPort, pData, nDataLen, nOffset, pFrameInfo) {
        this.portToPlayer[nPort] && this.portToPlayer[nPort].setRecordData(nPort, pData, nDataLen, nOffset, pFrameInfo);
    }
	
	cRawDataCallBack(nPort, pData, nDataLen)
	{
		//
	}

    bindPlayer(nPort, player) {
        if(!this.portToPlayer[nPort]) {
            this.portToPlayer[nPort] = player;
        }
    }

    unbindPlayer(nPort) {
        this.portToPlayer[nPort] = null;
    }

    addWSPlayer(wsPlayer) {
        this.wsPlayerList.push();
    }

    removeWSPlayer(wsPlayer) {
        this.wsPlayerList = this.wsPlayerList.filter(item => item === wsPlayer);
    }
}

export default WSPlayerManager

