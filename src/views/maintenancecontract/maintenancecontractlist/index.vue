<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :indexColumnProps="indexColumnProps">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAddModal">新增</a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined" />
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >批量操作
            <Icon icon="mdi:chevron-down" />
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>

    <!-- 新增维保合同 modal -->
    <ContractModal @register="registerContractModal" @success="reload" :title="modalTitle" />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable, TableAction, ActionItem } from "/@/components/Table";
  import { useListPage } from "/@/hooks/system/useListPage";
  import { columns, searchFormSchema } from "./data";
  import { getContractList, delContract } from "./api";
  import { useMessage } from "/@/hooks/web/useMessage";
  import { ref, unref } from "vue";
  import { useModal } from "/@/components/Modal";
  import ContractModal from "./ContractModal.vue";

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: "maintenancecontractlist-list",
    tableProps: {
      title: "用户列表",
      api: getContractList,
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
        label: "详情",
        onClick: handleDetail.bind(null, record),
      },
      {
        label: "删除",
        popConfirm: {
          title: "是否确认删除",
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
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
    await delContract({ id: record.id.toString() }, reload);
  }

  const [registerContractModal, { openModal: openModal }] = useModal();

  const modalTitle = ref<string>();

  /**
   * 新增操作
   */
  const handleAddModal = () => {
    modalTitle.value = "新增";
    openModal(true, {});
  };
</script>

<style lang="" scoped></style>
