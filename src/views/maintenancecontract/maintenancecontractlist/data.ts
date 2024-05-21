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
    label: "单位名称",
    field: "companyName",
    component: "Input",
    rules: [
      {
        required: true,
        message: "请输入名称",
      },
    ],
  },
  {
    label: "单位类型",
    field: "companyType",
    component: "Select",
    rules: [
      {
        required: true,
        message: "请选择单位类型",
      },
    ],
    componentProps: {
      options: [
        { label: "检测维保", value: 0 },
        { label: "项目施工", value: 1 },
        { label: "项目运维", value: 2 },
      ],
    },
  },
  {
    label: "所属区域",
    field: "companyArea",
    component: "Input",
  },
  {
    label: "负责人",
    field: "responsiblePerson",
    component: "Input",
    rules: [
      {
        required: true,
        message: "请输入负责人",
      },
    ],
  },
  {
    label: "维保单位地址",
    field: "companyAddress",
    component: "Input",
  },
  {
    label: "电话(帐户)",
    field: "responsiblePersonPhone",
    component: "Input",
    rules: [
      {
        required: true,
        message: "请输入负责人电话",
      },
      {
        pattern: /^1[3456789]\d{9}$/,
        message: "请输入正确11位手机号码",
      },
    ],
  },
  {
    label: "密码",
    field: "password",
    component: "Input",
    rules: [
      {
        required: true,
        message: "请输入密码",
      },
    ],
  },
  {
    label: "营业执照上传",
    field: "businessLicense",
    component: "Upload",
    componentProps: {
      api: () => {},
    },
  },
  {
    label: "合同类型",
    field: "contractType",
    component: "Select",
    componentProps: {
      options: [
        { label: "从合同", value: 0 },
        { label: "主合同", value: 1 },
      ],
    },
  },
  {
    label: "维保端登录地址",
    field: "1",
    component: "JLink",
    componentProps: {
      link: "http://220.180.110.56:9122/maintenance",
    },
  },
];
