import { FormSchema } from "/@/components/Table";
import { BasicColumn } from "/@/components/Table";
import { rules } from "/@/utils/helper/validator";

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

  /**
  {
    label: "登录密码",
    field: "password",
    component: "StrengthMeter",
    componentProps: {
      placeholder: "请输入登录密码",
    },
    rules: [
      {
        required: true,
        message: "请输入登录密码",
      },
      {
        pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/,
        message: "密码由8位数字、大小写字母和特殊符号组成!",
      },
    ],
  },
  {
    label: "确认密码",
    field: "confirmPassword",
    component: "InputPassword",
    dynamicRules: ({ values }) => rules.confirmPassword(values, true),
  },
   */
];
