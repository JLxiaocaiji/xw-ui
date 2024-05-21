<template>
  <a :href="link" target="_blank">{{ link }}</a>
</template>

<script lang="ts">
  import { propTypes } from "/@/utils/propTypes";
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "JLink",
    props: {
      link: propTypes.string.def(""),
    },
  });
</script>

<style lang="less" scoped>
  a {
    color: #2d8cf0;
    background: transparent;
    text-decoration: none;
    outline: none;
    cursor: pointer;
    transition: color 0.2s ease;
  }
</style>
