import { reactive } from "vue";
import { pollingResultType, deviceMSgType } from "./index.d";

export const pollingResult: pollingResultType[] = reactive([
  { num: 73, des: "近7天总任务数", color: "rgb(45, 183, 245)" },
  { num: 0, des: "近7天按期完成", color: "rgb(25, 190, 107)" },
  { num: 0, des: "近7天总任务数", color: "rgb(255, 153, 0)" },
  { num: 4, des: "近7天总任务数", color: "rgb(237, 64, 20)" },
]);

export const deviceMSgList: deviceMSgType[] = reactive([
  { deviceName: "主机下接未知设备(1_11_118)", address: "城建双创产业园双创综合服务中心双创综合楼1F", type: "1", time: "2024-04-28 16:01:59" },
  { deviceName: "主机下接未知设备(1_11_109)", address: "城建双创产业园双创综合服务中心双创综合楼1F", type: "2", time: "2024-04-28 14:45:14" },
  { deviceName: "主机下接未知设备(1_13_075)", address: "城建双创产业园双创综合服务中心双创综合楼1F", type: "3", time: "2024-04-28 10:49:21" },
]);
