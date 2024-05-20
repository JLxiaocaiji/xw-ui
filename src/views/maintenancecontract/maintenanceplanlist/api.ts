import { defHttp } from "/@/utils/http/axios";

enum Api {
  list = "/GyyMaintenancePlan/list",
  edit = "/GyyMaintenancePlan/edit",
  add = "/GyyMaintenancePlan/add",
  del = "/GyyMaintenancePlan/delete",
  delList = "/GyyMaintenancePlan/deleteBatch",
}

/**
 * 分页列表查询
 * @param params:单位名称
 */
export const getPlanList = (params) => defHttp.get({ url: Api.list, params });

/**
 * 计划编辑
 * @param params
 */
export const editPlan = (params) => defHttp.put({ url: Api.edit, params });

/**
 * 计划新增
 * @param params
 */
export const addPlan = (params) => defHttp.post({ url: Api.add, params });

/**
 * 计划删除
 * @param params
 */
export const delPlan = (params) => defHttp.delete({ url: Api.del, params });

/**
 * 计划删除
 * @param params
 */
export const delPlanList = (params) => defHttp.delete({ url: Api.delList, params });
