<template>
  <a-form ref="formRef" name="form" :model="form" :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }">
    <a-row>
      <a-col :span="8">
        <a-form-item label="监测设备编号">
          <a-input v-model:value="form.deviceCode" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item label="设备名称">
          <a-input v-model:value="form.deviceCode" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item label="区域位置">
          <a-select v-model:value="form.installAddress" :options="options1" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item label="设备状态">
          <a-select v-model:value="form.deviceState" :options="options2" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item label="设备类型">
          <a-select v-model:value="form.deviceType" :options="options3" />
        </a-form-item>
      </a-col>

      <a-col :span="8" style="text-align: right">
        <a-button :icon="h(SearchOutlined)" type="primary" style="margin-right: 0.5rem" @click="search">查询</a-button>
        <a-button :icon="h(UndoOutlined)" type="primary" style="margin-right: 0.5rem">重置</a-button>
      </a-col>
    </a-row>
  </a-form>

  <a-table :columns="columns" :data-source="table.data" :row-selection="rowSelection">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'action'">
        <span>
          <a @click="handleDetail(record.key)">详情</a>
          <a @click="handleDetail(record.key)">设备落点</a>
        </span>
      </template>
    </template>
  </a-table>

  <div>
    <a-pagination v-model:current="form.pageNo" :total="total1" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, h, onBeforeMount } from "vue";
  import type { SelectProps } from "ant-design-vue";
  import { SearchOutlined, UndoOutlined } from "@ant-design/icons-vue";

  import { columns } from "./index";
  import { BasicColumn } from "/@/components/Table";

  import { getDeviceType, getDeviceState, getDeviceList } from "@/api/iotmonitor/devicelist";

  const form = reactive<Record<string, string | number>>({
    deviceCode: "",
    deviceName: "",
    installAddress: "",
    deviceState: "",
    deviceType: "",
    pageNo: "1",
    pageSize: "5",
  });

  const total1 = ref(0);

  const options1 = ref<SelectProps["options"]>([]);
  const options2 = ref<SelectProps["options"]>([]);
  const options3 = ref<SelectProps["options"]>([]);

  const table = reactive({
    data: [],
  });

  onBeforeMount(async () => {
    options2.value = (await getDeviceState()).map((item) => {
      return { label: item.name, value: item.id };
    });
    options3.value = (await getDeviceType()).map((item) => {
      return { label: item.deviceTypeName, value: item.deviceTypeCode };
    });

    table.data = await search();
  });

  const search = async () => {
    let { total, records } = await getDeviceList({ ...form, unitId: "37" });
    total1.value = total;
    return records;
  };

  const rowSelection = ref({
    onChange: (selectedRowKeys: (string | number)[], selectedRows: BasicColumn[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
    },
    onSelect: (record: BasicColumn, selected: boolean, selectedRows: BasicColumn[]) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected: boolean, selectedRows: BasicColumn[], changeRows: BasicColumn[]) => {
      console.log(selected, selectedRows, changeRows);
    },
  });

  const handleDetail = (i) => {
    console.log(i);
  };
</script>

<style lang="less" scoped>
  .ant-form {
    background-color: #ffffff;
    padding: 12px 10px 6px 10px;
    margin-bottom: 8px;
    border-radius: 2px;
  }
  .ant-form-item {
    &-label label::after {
      margin: 0 6px 0 2px;
    }

    &-with-help {
      margin-bottom: 0;
    }

    &:not(.ant-form-item-with-help) {
      margin-bottom: 20px;
    }

    &.suffix-item {
      .ant-form-item-children {
        display: flex;
      }

      .ant-form-item-control {
        margin-top: 4px;
      }

      .suffix {
        display: inline-flex;
        padding-left: 6px;
        margin-top: 1px;
        line-height: 1;
        align-items: center;
      }
    }
  }
  /*【美化表单】form的字体改小一号*/
  .ant-form-item-label > label {
    font-size: 13px;
  }
  .ant-form-item .ant-select {
    font-size: 13px;
  }
  .ant-select-item-option-selected {
    font-size: 13px;
  }
  .ant-select-item-option-content {
    font-size: 13px;
  }
  .ant-input {
    font-size: 13px;
  }
  /*【美化表单】form的字体改小一号*/

  .ant-form-explain {
    font-size: 14px;
  }

  &--compact {
    .ant-form-item {
      margin-bottom: 8px !important;
    }
  }
  // update-begin--author:liaozhiyang---date:20231017---for：【QQYUN-6566】BasicForm支持一行显示(inline)
  &.ant-form-inline {
    & > .ant-row {
      .ant-col {
        width: auto !important;
      }
    }
  }
</style>
