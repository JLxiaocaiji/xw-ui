import { defHttp } from "/@/utils/http/axios";

enum Api {
  list = "/gyyFireRegister/list",
  edit = "/gyyFireRegister/edit",
  add = "/gyyFireRegister/add",
  del = "/gyyFireRegister/delete",
  delList = "/gyyFireRegister/deleteBatch",
}

/**
 * 分页列表查询
 * @param params:单位名称
 */
export const getList = (params) => defHttp.get({ url: Api.list, params });

/**
 * 合同编辑
 * @param params
 */
export const edit = (params) => defHttp.put({ url: Api.edit, params });

/**
 * 合同新增
 * @param params
 */
export const add = (params) => defHttp.post({ url: Api.add, params });

/**
 * 合同删除
 * @param params
 */
export const del = (params, fn) => {
  defHttp.delete({ url: Api.del, params }, { joinParamsToUrl: true }).then(() => {
    fn();
  });
};
/**
 * 合同删除
 * @param params
 */
export const delList = (params, fn) =>
  defHttp.delete({ url: Api.delList, params }).then(() => {
    fn();
  });
