import { defHttp } from "/@/utils/http/axios";

enum Api {
  deviceList = "/device/list",
  deviceType = "/deviceType/getTypeList",
  deviceStatus = "/deviceStatus/getDevideStatusList",
}

/**
 * @description: 获取设备列表
 */
export function getDeviceList(params) {
  return defHttp.get({ url: Api.deviceList, params });
}

/**
 * @description: 设备类型下拉列表
 */
export function getDeviceType() {
  return defHttp.get({ url: Api.deviceType });
}

/**
 * @description: 设备状态下拉列表
 */
export function getDeviceState() {
  return defHttp.get({ url: Api.deviceStatus });
}
