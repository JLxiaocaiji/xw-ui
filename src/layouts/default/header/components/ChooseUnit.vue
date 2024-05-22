<template>
  <a-dropdown>
    <a class="ant-dropdown-link" @click.prevent>
      当前账号： {{ value }}
      <DownOutlined />
    </a>
    <template #overlay>
      <a-menu @click="onClick">
        <a-menu-item key="单位1"> 单位1 </a-menu-item>
        <a-menu-item key="单位2"> 单位2 </a-menu-item>
        <a-menu-item key="单位3"> 单位3 </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>
<script lang="ts">
  import { defineComponent, computed, reactive, ref } from "vue";
  import type { MenuProps } from "ant-design-vue";
  import { DownOutlined } from "@ant-design/icons-vue";

  export default defineComponent({
    name: "ChooseUnit",
    components: { DownOutlined },

    setup() {
      const value = ref();

      const onClick = ({ key }) => {
        value.value = key;
        console.log(key);
      };

      return {
        onClick,
        value,
        DownOutlined,
      };
    },
  });
</script>
