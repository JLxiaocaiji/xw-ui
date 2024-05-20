import { BasicColumn } from "/@/components/Table";
import { FormSchema } from "@/components/Form/src/types/form";

export const columns: BasicColumn[] = [
  { title: "#", dataIndex: "id", width: 50 },
  { title: "所属单位", dataIndex: "unitId", width: 120, align: "center" },
  { title: "设备名称", dataIndex: "deviceName", width: 120, align: "center" },
  { title: "设备编号", dataIndex: "deviceCode", width: 120, align: "center" },
  { title: "设备分类", dataIndex: "deviceTypeName", width: 120, align: "center" },
  { title: "位置", dataIndex: "address", width: 120, align: "center" },
  { title: "设备状态", dataIndex: "deviceStatus", width: 120, align: "center" },
  {
    title: "操作",
    dataIndex: "action",
    width: 120,
    align: "center",
    fixed: "right",
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: "监测设备编号",
    field: "deviceCode",
    component: "JInput",
    //colProps: { span: 6 },
  },
  {
    label: "设备名称",
    field: "deviceName",
    component: "JInput",
  },
  {
    label: "区域位置",
    field: "address",
    component: "JDictSelectTag",
    componentProps: {
      dictCode: "sex",
      placeholder: "请选择性别",
      stringToNumber: true,
    },
    //colProps: { span: 6 },
  },
  {
    label: "设备状态",
    field: "phone",
    component: "Input",
  },
  {
    label: "设备类型",
    field: "status",
    component: "JDictSelectTag",
    componentProps: {
      dictCode: "user_status",
      placeholder: "请选择状态",
      stringToNumber: true,
    },
  },
];
