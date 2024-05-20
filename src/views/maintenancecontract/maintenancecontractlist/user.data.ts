import { FormSchema } from "/@/components/Table";
import { BasicColumn } from "/@/components/Table";

export const searchFormSchema: FormSchema[] = [
  {
    label: "合同编号",
    field: "companyName",
    component: "Input",
  },
  {
    label: "合同名称",
    field: "companyName",
    component: "Input",
  },
];

export const columns: BasicColumn[] = [
  {
    title: "合同编号",
    dataIndex: "contractCode",
    width: 120,
  },
  {
    title: "名称",
    dataIndex: "contractName",
    width: 100,
  },
  {
    title: "维保公司名称",
    dataIndex: "companyName",
    width: 120,
  },
  {
    title: "签订时间",
    dataIndex: "signingDate",
    width: 80,
  },
  {
    title: "有效开始时间",
    dataIndex: "enabledDate",
    width: 100,
  },
  {
    title: "有效期截止时间",
    dataIndex: "disabledDate",
    width: 100,
  },
  {
    title: "状态",
    width: 150,
    dataIndex: "statusCode",
  },
];
