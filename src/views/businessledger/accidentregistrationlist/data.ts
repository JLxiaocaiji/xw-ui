import { FormSchema } from "/@/components/Table";
import { BasicColumn } from "/@/components/Table";

export const searchFormSchema: FormSchema[] = [];

export const columns: BasicColumn[] = [
  {
    title: "发生时间",
    dataIndex: "occurTime",
    width: 120,
  },
  {
    title: "发生地点",
    dataIndex: "placeOfOccurrence",
    width: 100,
  },
  {
    title: "报警人",
    dataIndex: "alarmPeople",
    width: 120,
  },
  {
    title: "接警人",
    dataIndex: "alarmResponse",
    width: 80,
  },
  {
    title: "事故原因",
    dataIndex: "causeOfAccident",
    width: 100,
  },
];

export const formPasswordSchema: FormSchema[] = [
  {
    label: "发生时间",
    field: "companyName",
    component: "DatePicker",
  },
  {
    label: "报警人",
    field: "companyType",
    component: "Input",
  },
  {
    label: "接警人",
    field: "companyArea",
    component: "Input",
  },
  {
    label: "接警时间",
    field: "responsiblePerson",
    component: "DatePicker",
  },
  {
    label: "发生地点",
    field: "companyAddress",
    component: "Input",
  },
  {
    label: "报警地点",
    field: "responsiblePersonPhone",
    component: "Input",
  },
  {
    label: "报警人电话",
    field: "password",
    component: "Input",
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
    label: "报警人职务",
    field: "positionOf_the_informant",
    component: "Input",
  },
  {
    label: "事故等级",
    field: "businessLicense",
    component: "Select",
    componentProps: {
      options: [
        { label: "公司级一般事故", value: 0 },
        { label: "公司级较大事故", value: 1 },
        { label: "公司级重大事故", value: 2 },
      ],
    },
  },
  {
    label: "事故类型",
    field: "businessLicense",
    component: "Input",
  },
  {
    label: "关键词",
    field: "businessLicense",
    component: "Input",
  },
  {
    label: "现场人员状况",
    field: "businessLicense",
    component: "Input",
  },
  {
    label: "环境及周边影响情况",
    field: "businessLicense",
    component: "Input",
  },
  {
    label: "现场天气状况",
    field: "businessLicense",
    component: "Input",
  },
  {
    label: "事故原因",
    field: "businessLicense",
    component: "InputTextArea",
    componentProps: {
      maxLength: 20,
      showCount: true,
    },
  },
];
