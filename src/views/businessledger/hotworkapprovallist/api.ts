import { defHttp } from "/@/utils/http/axios";

enum Api {
  list = "/GyyFireWorkRecord/gyyFireWorkRecord/list",
  edit = "/GyyFireWorkRecord/gyyFireWorkRecord/edit",
  add = "/GyyFireWorkRecord/gyyFireWorkRecord/add",
  del = "/GyyFireWorkRecord/gyyFireWorkRecord/delete",
  delList = "/GyyFireWorkRecord/gyyFireWorkRecord/deleteBatch",
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
export const delList = (params) => defHttp.delete({ url: Api.delList, params });
