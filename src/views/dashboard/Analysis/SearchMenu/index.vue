<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <a-button type="primary" @click="toggleCollapsed">
      <MenuUnfoldOutlined v-if="state.collapsed" />
      <MenuFoldOutlined v-else />
    </a-button>
    <a-menu
      v-model:openKeys="state.openKeys"
      v-model:selectedKeys="state.selectedKeys"
      mode="inline"
      theme="light"
      :inline-collapsed="state.collapsed"
      :inlineIndent="10"
      :items="items"
    />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, watch, h } from "vue";
  import { MenuItemType } from "./index.d";
  import { renderIcon, items } from "./index";

  import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons-vue";

  const state = reactive({
    collapsed: false,
    selectedKeys: ["1"],
    openKeys: ["sub1"],
    preOpenKeys: ["sub1"],
  });

  // const items: MenuItemType[] = reactive([
  //   {
  //     key: "1",
  //     icon: () => renderIcon(PieChartOutlined),
  //     label: "Option 1",
  //     title: "Option 2",
  //   },
  //   {
  //     key: "2",
  //     icon: () => renderIcon(DesktopOutlined),
  //     label: "Option 2",
  //     title: "Option 2",
  //   },
  //   {
  //     key: "3",
  //     icon: () => renderIcon(InboxOutlined),
  //     label: "Option 3",
  //     title: "Option 3",
  //   },
  //   {
  //     key: "sub1",
  //     icon: () => renderIcon(MailOutlined),
  //     label: "Navigation One",
  //     title: "Navigation One",
  //   },
  //   {
  //     key: "sub2",
  //     icon: () => renderIcon(AppstoreOutlined),
  //     label: "Navigation Two",
  //     title: "Navigation Two",
  //   },
  // ]);

  watch(
    () => state.openKeys,
    (_val, oldVal) => {
      state.preOpenKeys = oldVal;
    }
  );
  const toggleCollapsed = () => {
    state.collapsed = !state.collapsed;
    state.openKeys = state.collapsed ? [] : state.preOpenKeys;
  };
</script>

<style lang="less" scoped>
  @height: 20px;

  .icon-img {
    width: 40px;
    height: 40px;
    vertical-align: middle;
    margin-right: 8px;
  }

  .status {
    width: 20px;
    height: 20px;
    position: absolute;
    right: 0px;
  }

  .ant-menu {
    box-shadow: 1px 1px 5px #ccc;
    border-radius: 8px;
    :deep(.ant-menu-item) {
      height: 50px;

      .label-label,
      .label-num {
        line-height: 20px;
      }

      .label-pic {
        width: 20px;
        height: 20px;
        position: absolute;
        right: 0px;
        top: 0px;
      }
    }
  }
</style>
