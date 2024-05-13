<template>
  <a-card>
    <span class="name">{{ data.name }}</span>
    <div class="des">
      <div class="detail">
        <span class="blue"></span> <span class="res">总数：{{ data.sum }}</span>
      </div>
      <div class="detail">
        <span class="org"></span><span class="res">异常：{{ data.abnormal }}</span>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  defineProps({
    data: { type: Object, default: () => {} },
  });
</script>

<style lang="less" scoped>
  .name:extend(.c) {
    margin-left: 5px;
  }

  .icon {
    display: inline-block;
    width: 10px;
    height: 12px;
    background-repeat: no-repeat;
    margin-right: 5px;
    border-radius: 10px;
  }

  .des {
    display: flex;

    .detail {
      align-items: center;
      width: 125px;

      .blue:extend(.icon) {
        background: rgb(93, 182, 255);
      }
      .org:extend(.icon) {
        background: rgb(252, 234, 33);
      }
    }
  }
</style>
