<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <a-row :gutter="0">
      <a-col :span="6">
        <a-card :bordered="false" :loading="loading" class="top">
          <a-row>
            <a-col class="top-left" :span="12"><Image :src="summary.icon" /></a-col>
            <a-col class="top-right" :span="12">
              <div>{{ summary.title }}</div>
              <div>
                <span class="warn">{{ summary.time1 }}</span>
                监测到
                <span class="warn">{{ summary.total1 }}</span>
                起设备报警事件!
              </div>
              <div>
                <span class="warn">{{ summary.time2 }}</span>
                系统 监测到
                <span class="warn">{{ summary.total2 }}</span>
                项问题,请及时处理
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :span="6" v-for="item in profileList" :key="item.title">
        <a-card class="top">
          <a-row>
            <a-col :span="12" class="top-left"><Image :src="item.icon" /></a-col>
            <a-col :span="12" class="top-right1">
              <div>
                <span>{{ item.title }}</span>
                <div class="msg">{{ item.des }}</div>
              </div></a-col
            >
          </a-row>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { Card, Image } from "ant-design-vue";
import { profileList, summary } from "./index.js";

defineProps({
  loading: {
    type: Boolean,
  },
});
</script>

<style lang="less" scoped>
@fontsize: 10px;

.top {
  display: flex;
  height: 125px;
  //   margin-bottom: 15px;
  align-items: center;
  font-size: @fontsize;

  .top-left {
    width: 130px;
  }

  .top-right1 {
    font-size: @fontsize;
    align-items: center;
    justify-content: center;
  }

  .top-right {
    font-size: @fontsize;
    margin: auto;
    display: block;

    .warn {
      color: red;
    }
  }
  .top-right1 {
    font-size: @fontsize;
    align-items: center;
    justify-content: center;
    display: flex;
    .msg {
      font-size: 20px;
      font-weight: 600;
    }
  }
}
</style>
