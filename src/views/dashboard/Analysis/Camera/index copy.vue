<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="camera" ref="camera" id="camera"> </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted } from "vue";
  import PlayerManager from "./icc/PlayerManager";

  const playerManager = ref<null>();
  const camera = ref();
  defineExpose({ camera });

  onMounted(() => {
    console.log(camera);
    console.log(camera.value);

    initPlayer();
  });

  const initPlayer = () => {
    console.log(1111);
    if (playerManager.value.player) {
      return;
    }
    playerManager.value = new PlayerManager({
      el: "camera",
      type: "real",
      num: 1 /** 初始化，页面显示的路数 **/,
      showControl: true /** 是否显示工具栏，默认显示 **/,
      showIcons: {
        // 自定义按钮，需要的请配置true, 不需要的按钮请配置false，所有的按钮属性都要写上
        streamChangeSelect: true, // 主辅码流切换
        talkIcon: true, // 对讲功能按钮
        localRecordIcon: true, // 录制视频功能按钮
        audioIcon: true, // 开启关闭声音按钮
        snapshotIcon: true, // 抓图按钮
        closeIcon: true, // 关闭视频按钮
      },
      proxyServerIp: "10.50.7.22",
      receiveMessageFromWSPlayer, // 接收来自wsplayer的回调
    });
  };

  onUnmounted(() => {
    playerManager.value.player.setPlayerNum(1, false);
    playerManager.value.close();
  });

  const receiveMessageFromWSPlayer = (method, data, err) => {
    switch (method) {
      case "initializationCompleted": // 初始化播放器成功
        console.log("初始化播放器成功");
        break;
      case "realSuccess": // 实时预览成功
        console.log("实时预览成功");
        break;
      case "realError":
        console.log("实时预览失败", err);
        break;
      case "recordSuccess": // 录像回放成功
        console.log("录像回放成功");
        break;
      case "recordSuccess": // 录像回放失败
        console.log("录像回放失败", err);
        break;
      case "talkError": // 对讲失败
        console.log("对讲失败");
        break;
      case "selectWindowChanged": // 切换窗口回调
        console.log("切换窗口");
        break;
      case "windowNumChanged": // 显示窗口数量变化回调
        console.log("窗口数量变化");
        break;
      case "statusChanged": // 窗口视频状态变化回调
        console.log(data, "视频状态打印");
        break;
      case "closeVideo": // 关闭视频
        // 非视频切换而引起的视频关闭，需要通知
        console.log("关闭视频");
        break;
      case "errorInfo":
        console.error(data);
        break;
      default:
    }
  };
</script>

<style lang="less" scoped>
  .camera {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 300px;

    .player:first-child {
      height: calc(100% - 20px);
    }

    .bottom-menu {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 60px;
      flex-shrink: 0;

      > button {
        margin-right: 20px;
      }

      > i {
        font-size: 24px;
        margin-right: 20px;
      }

      .record-position {
        margin-right: 20px;
      }

      .wsIcon {
        font-size: 24px;
        margin-right: 16px;
      }

      .full-screen-icon {
        cursor: pointer;
      }
    }
  }
</style>
