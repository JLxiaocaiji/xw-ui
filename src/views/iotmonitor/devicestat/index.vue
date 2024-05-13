<template>
  <a-card>
    <span class="title"></span>
    <a-row>
      <a-col
        v-for="item in stat"
        :key="item.name"
        :xs="{ span: 12, offset: 2 }"
        :lg="{ span: 8, offset: 2 }"
        :md="{ span: 8, offset: 2 }"
        :xl="{ span: 4, offset: 2 }"
        style="margin-bottom: 10px"
      >
        <Card :data="item" />
      </a-col>
    </a-row>
  </a-card>
</template>

<script lang="ts" setup>
  import Card from "./components/card.vue";

  import { ref, onBeforeMount } from "vue";

  import { getDeviceStat } from "@/api/iotmonitor/devicestat";

  const stat = ref<Record<string, any>[]>([]);
  onBeforeMount(async () => {
    stat.value = await getDeviceStat({ unitId: "37" });
    console.log(111);
    console.log(stat);
  });
</script>

<style lang="less" scoped>
  .c {
    font-size: 16px;
    font-weight: 700;
  }

  .title:extend(.c) {
    margin: 10px 0px;
  }
</style>
