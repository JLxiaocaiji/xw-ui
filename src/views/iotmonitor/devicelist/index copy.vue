<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" :disabled="isDisabledAuth('system:user:export')">
        导出</a-button
      >
      <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
      <a-button type="primary" @click="openModal(true, {})" preIcon="ant-design:hdd-outlined"> 回收站</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="batchHandleDelete">
              <Icon icon="ant-design:delete-outlined"></Icon>
              删除
            </a-menu-item>
            <a-menu-item key="2" @click="batchFrozen(2)">
              <Icon icon="ant-design:lock-outlined"></Icon>
              冻结
            </a-menu-item>
            <a-menu-item key="3" @click="batchFrozen(1)">
              <Icon icon="ant-design:unlock-outlined"></Icon>
              解冻
            </a-menu-item>
          </a-menu>
        </template>
        <a-button
          >批量操作
          <Icon icon="mdi:chevron-down"></Icon>
        </a-button>
      </a-dropdown>
    </template>
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
    </template>
  </BasicTable>
</template>

<script lang="ts" setup>
  import { useListPage } from "/@/hooks/system/useListPage";

  import { getDeviceList } from "@/api/iotmonitor/devicelist";
  import { columns } from "./index.ts";

  //注册table数据
  const [registerTable, { reload, updateTableDataRecord }, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;

// 列表页面公共参数、方法
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    designScope: "device-list",
    tableProps: {
      title: "设备列表",
      api: getDeviceList,
      // table 列
      columns: columns,
      size: "small",
      formConfig: {
        // labelWidth: 200,
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 120,
      },
      beforeFetch: (params) => {
        return Object.assign({ column: "createTime", order: "desc" }, params);
      },
    },
    exportConfig: {
      name: "用户列表",
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
    },
  });
</script>

<style lang="" scoped></style>
