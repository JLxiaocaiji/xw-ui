import { defHttp } from "/@/utils/http/axios";

enum Api {
  list = "/GyyMaintenanceContract/list",
  edit = "/GyyMaintenanceContract/edit",
  add = "/GyyMaintenanceContract/add",
  del = "/GyyMaintenanceContract/delete",
  delList = "/GyyMaintenanceContract/deleteBatch",
}

/**
 * 分页列表查询
 * @param params:单位名称
 */
export const getContractList = (params) => defHttp.get({ url: Api.list, params });

/**
 * 合同编辑
 * @param params
 */
export const editContract = (params) => defHttp.put({ url: Api.edit, params });

/**
 * 合同新增
 * @param params
 */
export const addContract = (params) => defHttp.post({ url: Api.add, params });

/**
 * 合同删除
 * @param params
 */
export const delContract = (params, fn) => {
  defHttp.delete({ url: Api.del, params }).then(() => {
    fn();
  });
};
/**
 * 合同删除
 * @param params
 */
export const delContractList = (params) => defHttp.delete({ url: Api.delList, params });
