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

    <!-- 新增维保单位 modal -->
    <UnitModal @register="registerAddUnitModal" @success="reload" :title="modalTitle" :id="id" />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable, TableAction, ActionItem } from "/@/components/Table";
  import { useListPage } from "/@/hooks/system/useListPage";
  import { columns, searchFormSchema } from "./data";
  import { list, delUnit, delUnitList } from "./api";
  import { useMessage } from "/@/hooks/web/useMessage";
  import { useModal } from "/@/components/Modal";
  import UnitModal from "./UnitModal.vue";
  import { ref, unref } from "vue";

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: "maintenanceunitlist-list",
    tableProps: {
      title: "用户列表",
      api: list,
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
        popConfirm: {
          title: "是否确认删除",
          confirm: handleDelete.bind(null, record),
        },
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
    modalTitle.value = "编辑";
    id.value = record.id;
    openModal(true, record);
  }

  /**
   * 详情
   */
  async function handleDetail(record: Recordable) {
    console.log(record);
    modalTitle.value = "详情";
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

    await delUnit({ id: record.id.toString() }, reload);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    let hasAdmin = unref(selectedRows).filter((item) => item.username == "admin");
    if (unref(hasAdmin).length > 0) {
      createMessage.warning("管理员账号不允许此操作！");
      return;
    }
    await delUnitList({ ids: selectedRowKeys.value }, () => {
      selectedRowKeys.value = [];
      reload();
    });
  }

  const { createMessage, createConfirm } = useMessage();

  // modal
  const [registerAddUnitModal, { openModal: openModal }] = useModal();
  // modal title
  const modalTitle = ref<string>();
  const id = ref<string>();

  /**
   * 新增操作
   */
  const handleAddModal = () => {
    modalTitle.value = "新增";
    openModal(true, {});
  };
</script>

<style lang="" scoped></style>
