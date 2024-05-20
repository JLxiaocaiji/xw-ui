import { defHttp } from "/@/utils/http/axios";

enum Api {
  list = "/maintenanceCompany/list",
  edit = "/maintenanceCompany/edit",
  add = "/maintenanceCompany/add",
  del = "/maintenanceCompany/delete",
  delList = "/maintenanceCompany/deleteBatch",
}

/**
 * 分页列表查询
 * @param params:单位名称
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 单位编辑
 * @param params
 */
export const editPlan = (params) => defHttp.put({ url: Api.edit, params });

/**
 * 单位新增
 * @param params
 */
export const addPlan = (params) => defHttp.post({ url: Api.add, params });

/**
 * 单位删除
 * @param params
 */
export const delPlan = (params) => defHttp.delete({ url: Api.del, params });

/**
 * 单位删除
 * @param params
 */
export const delPlanList = (params) => defHttp.delete({ url: Api.delList, params });
