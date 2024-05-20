<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :indexColumnProps="indexColumnProps">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增</a-button>
        <a-button type="primary" preIcon="ant-design:download-outlined" @click="handleCreate">导出维保任务</a-button>

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
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable, TableAction, ActionItem } from "/@/components/Table";
  import { useListPage } from "/@/hooks/system/useListPage";
  import { columns, searchFormSchema } from "./user.data";
  import { getPlanList } from "./api";
  import { useMessage } from "/@/hooks/web/useMessage";

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: "maintenanceplanlist-list",
    tableProps: {
      title: "用户列表",
      api: getPlanList,
      // table 列
      columns: columns,
      size: "small",
      formConfig: {
        // labelWidth: 200,
        schemas: searchFormSchema,
        // 超过指定列数默认折叠, 控制 form 筛选数
        autoAdvancedCol: 3,
      },
      actionColumn: {
        width: 120,
      },
      beforeFetch: (params) => {
        return Object.assign({ column: "createTime", order: "desc" }, params);
      },
    },
  });

  //注册table数据
  /**
   * @param registerTable: table 操作方法
   * @param reload: 重载
   * @param rowSelection: columnWidth, onChange, selectedRowKeys, selectedRows, type
   * @param selectedRows: 选中行
   * @param selectedRowKeys: 选中行的 keys
   * */
  const [registerTable, { reload, updateTableDataRecord }, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;

  /**
   * 序号列配置
   */
  const indexColumnProps = {
    dataIndex: "index",
    width: "15px",
  };

  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: "编辑",
        onClick: handleEdit.bind(null, record),
      },
      {
        label: "删除",
        onClick: handleDelete.bind(null, record),
      },
      {
        label: "详情",
        onClick: handleDetail.bind(null, record),
      },
    ];
  }

  /**
   * 编辑事件
   */
  async function handleEdit(record: Recordable) {
    console.log(record);
  }
  /**
   * 详情
   */
  async function handleDetail(record: Recordable) {
    console.log(record);
  }
  /**
   * 删除事件
   */
  async function handleDelete(record) {
    console.log(record);
    // if ("admin" == record.username) {
    //   createMessage.warning("管理员账号不允许此操作！");
    //   return;
    // }
    // await deleteUser({ id: record.id }, reload);
  }

  const { createMessage, createConfirm } = useMessage();
</script>

<style lang="" scoped></style>
