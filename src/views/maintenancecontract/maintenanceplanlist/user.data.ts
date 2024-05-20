import { FormSchema } from "/@/components/Table";
import { BasicColumn } from "/@/components/Table";

export const searchFormSchema: FormSchema[] = [
  {
    label: "任务类型",
    field: "companyName",
    component: "Select",
    componentProps: {
      options: [
        { label: "日计划", value: 0 },
        { label: "周计划", value: 1 },
        { label: "月计划", value: 2 },
        { label: "季度计划", value: 3 },
        { label: "年计划", value: 4 },
        { label: "突发任务", value: 5 },
      ],
    },
  },
  {
    label: "任务状态",
    field: "companyName",
    component: "Select",
    componentProps: {
      options: [
        { label: "待派发", value: 0 },
        { label: "执行中", value: 1 },
        { label: "已完成", value: 2 },
      ],
    },
  },
  {
    label: "任务名称",
    field: "companyName",
    component: "Input",
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
