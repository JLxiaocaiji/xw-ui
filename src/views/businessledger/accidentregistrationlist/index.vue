<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
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
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <AccidentModal @register="registerModal" @success="reload" :title="modalTitle" />
  </div>
</template>

<script lang="ts" setup>
  import { useListPage } from "/@/hooks/system/useListPage";
  import { columns, searchFormSchema } from "./data";
  import { ref } from "vue";
  import { useModal } from "/@/components/Modal";
  import { BasicTable, TableAction, ActionItem } from "/@/components/Table";
  import { getList, del } from "./api";
  import AccidentModal from "./AccidentModal.vue";

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: "accidentregistration-list",
    tableProps: {
      title: "火灾情况列表",
      api: getList,
      // table 列
      columns: columns,
      size: "small",
      formConfig: {
        // labelWidth: 200,
        schemas: searchFormSchema,
        // 超过指定列数默认折叠, 控制 form 筛选数
        autoAdvancedCol: 3,
        showActionButtonGroup: false,
      },
      actionColumn: {
        width: 120,
      },
      beforeFetch: (params) => {
        return Object.assign(params, { unitId: 37 });
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

  const [registerModal, { openModal: openModal }] = useModal();

  const modalTitle = ref<string>();
  /**
   * 新增操作
   */
  const handleAddModal = () => {
    modalTitle.value = "新增";
    openModal(true, {});
  };

  /**
   * 操作栏
   */
  const getTableAction = (record): ActionItem[] => {
    return [
      {
        label: "编辑",
        onClick: handleEdit.bind(null, record),
      },
    ];
  };

  /**
   * 下拉操作栏
   */
  const getDropDownAction = (record): ActionItem[] => {
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
  };

  /**
   * 详情
   */
  async function handleDetail(record: Recordable) {
    console.log(record);
  }

  /**
   * 编辑事件
   */
  async function handleEdit(record: Recordable) {
    console.log(record);
    modalTitle.value = "编辑";
    openModal(true, record);
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    console.log(record);
    await del({ id: record.id.toString() }, reload);
  }
</script>

<style lang="less" scoped></style>
