<template>
  <BasicModal @register="registerModal" :title="title" @ok="handleSubmit" :width="600">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup name="AddUnitModal">
  import { BasicModal, useModalInner } from "/@/components/Modal";
  import { BasicForm, useForm } from "/@/components/Form/index";
  import { formPasswordSchema } from "./data";
  import { addUnit, editUnit } from "./api";
  import { ref } from "vue";

  const props = defineProps({
    title: { type: String, default: "" },
  });

  const id = ref();

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    id.value = data?.id;
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false });
    //表单赋值
    await setFieldsValue({ ...data });
  });

  // 声明Emits
  const emit = defineEmits(["success", "register"]);

  //表单提交事件
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      await (props.title == "新增" ? addUnit(values) : editUnit({ ...values, id: id.value }));
      //关闭弹窗
      closeModal();
      //刷新列表
      emit("success");
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    schemas: formPasswordSchema,
    showActionButtonGroup: false,
    labelWidth: 120,
  });
</script>

<style lang="" scoped></style>
