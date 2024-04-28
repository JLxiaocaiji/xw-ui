<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="video-card">
    <div>video</div>

    <a-form class="form" ref="formRef" name="form" :model="form" colon:false :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
      <a-form-item name="monitor" label="监控列表" :rules="[{ required: true }]">
        <a-select
          v-model:value="form.monitor"
          :options="[
            { label: '双创产业园消控室', value: '1' },
            { label: '双创产业园消控室1', value: '2' },
            { label: '双创产业园消控室2', value: '3' },
          ]"
        />
      </a-form-item>
    </a-form>
  </div>

  <a-card title="值班信息" class="card">
    <template #extra><a href="#">人工报警</a></template>
    <div></div>
  </a-card>

  <a-card title="巡查巡检" class="card">
    <template #extra><a-button type="link">查看更多</a-button></template>
    <a-row>
      <a-col v-for="item in pollingResult" :span="6" :key="item.des" class="polling-style">
        <div class="num" :style="{ color: item.color }">{{ item.num }}</div>
        <div class="des">{{ item.des }}</div>
      </a-col>
    </a-row>
  </a-card>

  <a-card :active-tab-key="key" :tab-list="tabList" @tab-change="(key) => onTabChange(key)">
    <!-- <div v-if="key === 'tab1'">
      <div v-for="item in deviceMSgList" :key="item.deviceName" class="tab1">
        <span class="name">{{ item.deviceName }}</span>
        <span>{{ item.address }}</span>
        <span :class="[item.type == '1' ? 'green' : item.type == '2' ? 'yellow' : item.type == '3' ? 'red' : null]">
          {{ item.type == "1" ? "正常" : item.type == "2" ? "异常" : item.type == "3" ? "告警" : "" }}
        </span>
        <span>{{ item.time }}</span>
      </div>
    </div>
    <div v-else-if="key === 'tab2'"> </div>
    <div else>333</div> -->
    <template #tabBarExtraContent><a-button type="link">查看更多</a-button></template>
  </a-card>
</template>

<script lang="ts" setup>
  import { reactive, watch, ref } from "vue";
  import { pollingResult } from "./index";
  import { deviceMSgList } from "./index";

  /*
    视频信息
  */
  const formRef = ref();
  const form = reactive<Record<string, string | number>>({
    monitor: "1",
  });

  watch(
    () => form.monitor,
    (val) => {
      console.log(val);
    }
  );

  /*
    监测信息
  */
  const key = ref("tab1");

  const tabList = reactive([
    {
      key: "tab1",
      tab: "tab1",
    },
    {
      key: "tab2",
      tab: "tab2",
    },
  ]);

  const onTabChange = (value: string) => {
    console.log(value);
    key.value = value;
  };
</script>

<style lang="less" scoped>
  .ant-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 1px 1px 5px #ccc;
    padding: 1px;
    margin-top: 15px;

    :deep(.ant-card-head-title) {
      font-weight: 500;
      font-size: 14px;
    }

    .polling-style {
      text-align: center;
      &:not(:last-child) {
        border-right: 1px solid #e8eaec;
      }
      .num {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 5px;
      }
    }

    .tab1 {
      font-size: 16px;
      margin-bottom: 15px;

      .name {
        padding-right: 10px;
        border-right: 1px solid rgb(232, 234, 236);
      }

      .warn: {
        background: #fae600;
        color: #fff;
        padding: 0 10px;
      }
    }
  }

  .video-card {
    &:extend(.ant-card);
    margin-top: 0px;
  }
</style>
