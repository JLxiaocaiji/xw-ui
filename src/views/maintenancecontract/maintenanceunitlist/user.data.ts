import { FormSchema } from "/@/components/Table";
import { BasicColumn } from "/@/components/Table";

export const searchFormSchema: FormSchema[] = [
  {
    label: "单位名称",
    field: "companyName",
    component: "Input",
    // colProps: { placeholder: "请输入单位名称(最大15字符)" },
  },
];

export const columns: BasicColumn[] = [
  {
    title: "单位名称",
    dataIndex: "companyName",
    width: 120,
  },
  {
    title: "类型",
    dataIndex: "companyType",
    width: 100,
  },
  {
    title: "行政区域",
    dataIndex: "companyArea",
    width: 120,
  },
  {
    title: "负责人",
    dataIndex: "responsiblePerson",
    width: 80,
    // sorter: true,
  },
  {
    title: "负责人电话(账户)",
    dataIndex: "responsiblePersonPhone",
    width: 100,
  },
  {
    title: "维保单位地址",
    dataIndex: "companyAddress",
    width: 100,
  },
  {
    title: "来源企业",
    width: 150,
    dataIndex: "sourceCompany",
  },
  {
    title: "状态",
    width: 150,
    dataIndex: "status",
  },
];
