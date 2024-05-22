import { FormSchema } from "/@/components/Table";
import { BasicColumn } from "/@/components/Table";

export const searchFormSchema: FormSchema[] = [];

export const columns: BasicColumn[] = [
  {
    title: "工程名称",
    dataIndex: "engineeringName",
    width: 120,
  },
  {
    title: "施工单位",
    dataIndex: "constructionUnit",
    width: 100,
  },
  {
    title: "申请动火单位",
    dataIndex: "hotWorkUnit",
    width: 120,
  },
  {
    title: "申请人姓名",
    dataIndex: "applicantName",
    width: 80,
  },
  {
    title: "电话",
    dataIndex: "phone",
    width: 100,
  },
  {
    title: "动火类别",
    dataIndex: "hotWorkCategory",
    width: 100,
  },
  {
    title: "现场监护人员",
    width: 150,
    dataIndex: "onSiteMonitoringPersonnel",
  },
  {
    title: "审批人",
    width: 150,
    dataIndex: "approver",
  },
  {
    title: "现场监护人签字",
    width: 150,
    dataIndex: "sceneSign",
  },
];

export const formPasswordSchema: FormSchema[] = [
  {
    label: "工程名称",
    field: "engineeringName",
    component: "Input",
    rules: [
      {
        required: true,
        message: "请输入合同编号",
      },
    ],
  },
  {
    label: "施工单位",
    field: "constructionUnit",
    component: "Input",
    rules: [
      {
        required: true,
        message: "请输入单位类型",
      },
    ],
  },
  {
    label: "申请动火单位",
    field: "hotWorkUnit",
    component: "Input",
    rules: [
      {
        required: true,
        message: "请输入公司名称",
      },
    ],
  },
  {
    label: "申请人姓名",
    field: "applicantName",
    component: "Input",
    rules: [
      {
        required: true,
      },
    ],
  },
  {
    label: "电话",
    field: "phone",
    component: "Input",
    rules: [{ required: false, pattern: /^1[3456789]\d{9}$/, message: "手机号码格式有误" }],
  },
  {
    label: "动火部位",
    field: "hotWorkArea",
    component: "Input",
    rules: [
      {
        required: true,
      },
    ],
  },
  {
    label: "动火类别",
    field: "hotWorkCategory",
    component: "Select",
    componentProps: {
      options: [
        { label: "气割", value: 0 },
        { label: "电焊", value: 1 },
        { label: "切割", value: 2 },
        { label: "用火", value: 3 },
        { label: "其他", value: 3 },
      ],
    },
  },
  {
    label: "动火作业起始时间 ",
    field: "beginTime",
    component: "DatePicker",
    rules: [{ required: true }],
  },
  {
    label: "动火作业截止时间",
    field: "endTime",
    component: "DatePicker",
  },
  {
    label: "动火原因",
    field: "causesOfHotWork",
    component: "Input",
  },
  {
    label: "安全防范措施",
    field: "safetyPrecautions",
    component: "Input",
  },
  {
    label: "现场监护人员",
    field: "onSiteMonitoringPersonnel",
    component: "Input",
  },
  {
    label: "审批意见",
    field: "approvalOpinions",
    component: "Input",
  },
  {
    label: "审批时间",
    field: "approvalTime",
    component: "DatePicker",
  },
  {
    label: "审批人",
    field: "approver",
    component: "Input",
  },
  {
    label: "清场记录",
    field: "clearingRecords",
    component: "Input",
  },
  {
    label: "现场监护人签字",
    field: "sceneSign",
    component: "Input",
  },
  {
    label: "图片",
    field: "picture",
    component: "Upload",
  },
];
