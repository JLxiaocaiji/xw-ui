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

export const formPasswordSchema: FormSchema[] = [
  {
    label: "合同编号",
    field: "companyName",
    component: "Input",
    rules: [
      {
        required: true,
        message: "请输入合同编号",
      },
    ],
  },
  {
    label: "名称",
    field: "companyType",
    component: "Input",
    rules: [
      {
        required: true,
        message: "请输入单位类型",
      },
    ],
  },
  {
    label: "维保公司名称",
    field: "companyArea",
    component: "Input",
    rules: [
      {
        required: true,
        message: "请输入公司名称",
      },
    ],
  },
  {
    label: "签订时间",
    field: "responsiblePerson",
    component: "DatePicker",
    rules: [
      {
        required: true,
      },
    ],
  },
  {
    label: "有效开始时间",
    field: "companyAddress",
    component: "DatePicker",
    rules: [
      {
        required: true,
      },
    ],
  },
  {
    label: "有效期截止时间",
    field: "responsiblePersonPhone",
    component: "DatePicker",
    rules: [
      {
        required: true,
      },
    ],
  },
  {
    label: "状态 ",
    field: "password",
    component: "Select",
    componentProps: {
      options: [
        { label: "待签订", value: 0 },
        { label: "已签订", value: 1 },
        { label: "已作废", value: 2 },
        { label: "已过期", value: 3 },
      ],
    },
  },
  {
    label: "上传文件",
    field: "businessLicense",
    component: "Upload",
    componentProps: {
      api: () => {},
    },
  },
];
