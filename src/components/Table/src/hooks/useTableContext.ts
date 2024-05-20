import type { Ref } from 'vue';
import type { BasicTableProps, TableActionType } from '../types/table';
import { provide, inject, ComputedRef } from 'vue';

const key = Symbol('basic-table');

type Instance = TableActionType & {
  wrapRef: Ref<Nullable<HTMLElement>>;
  getBindValues: ComputedRef<Recordable>;
};

// omit: 提取 Instance 中除 原本 getBindValues 外的其他属性
type RetInstance = Omit<Instance, 'getBindValues'> & {
  // 再添加一个新的 getBindValues 属性，其类型为 ...
  getBindValues: ComputedRef<BasicTableProps>;
};

// 为组件后代提供 key 为 'basic-table' 的 组件实例
export function createTableContext(instance: Instance) {
  provide(key, instance);
}

// 注入上层 'basic-table' 实例
export function useTableContext(): RetInstance {
  return inject(key) as RetInstance;
}
