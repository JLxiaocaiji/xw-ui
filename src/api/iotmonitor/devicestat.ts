import { defHttp } from "/@/utils/http/axios";

enum Api {
  deviceCount = "/device/deviceCount",
}

/**
 * @description: 获取设备统计
 */
export function getDeviceStat(params) {
  return defHttp.get({ url: Api.deviceCount, params });
}
