<template>
  <t-card theme="poster2" :bordered="false">
    <template #avatar>
      <t-space>
        <t-avatar image="https://tdesign.gtimg.com/site/avatar.jpg" size="50px" />
      </t-space>
    </template>
    <template #status>
      <t-tag :theme="isEnable ? 'success' : 'default'" @click="setStatus">
        {{ isEnable ? t('components.isSetup.on') : t('components.isSetup.off') }}
      </t-tag>
    </template>
    <template #content>
      <p class="list-card-item_detail--name">{{ userInfo.nickname }}</p>
      <p class="list-card-item_detail--desc">用户名:{{ userInfo.username }}<br />id:{{ userInfo.id }}</p>
    </template>
    <!--    <template #footer> -->
    <!--      <t-avatar-group cascading="left-up" :max="2"> -->
    <!--        <t-avatar>{{ props.info.nickname }}</t-avatar> -->
    <!--      </t-avatar-group> -->
    <!--    </template> -->
    <template #actions>
      <t-dropdown
        :disabled="userInfo.id === '-1' ? true : !isEnable"
        trigger="click"
        :options="[
          {
            content: '管理',
            value: 'manage',
            onClick: () => emit('item-can-edit'),
          },
          {
            content: '删除',
            value: 'delete',
            onClick: () => deleteById(),
          },
        ]"
      >
        <t-button theme="default" :disabled="userInfo.id === '-1' ? true : !isEnable" shape="square" variant="text">
          <more-icon />
        </t-button>
      </t-dropdown>
    </template>
  </t-card>
</template>
<script setup lang="ts">
import { MoreIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { computed, ref } from 'vue';

import type { SystemUserInfo } from '@/api/system/model/userModel';
import { userApi } from '@/api/system/userApi';
import { t } from '@/locales';

const props = defineProps({
  info: {
    type: Object as PropType<SystemUserInfo>,
    default: undefined,
  },
});
const emit = defineEmits(['item-update', 'item-can-edit']);
const setStatus = () => {
  console.log('请求', isEnable.value);
  userApi
    .updateStatus(userInfo.value.id, !isEnable.value)
    .finally(() => emit('item-update', (userInfo.value.status + 1) % 2));
};
const userInfo = ref(props.info);
const isEnable = computed<boolean>(() => userInfo.value.status === 1);

const deleteById = () => {
  const deleteConfirm = DialogPlugin.confirm({
    header: '确认删除吗?',
    body: '请确认是否删除，删除后，数据将不存在',
    confirmBtn: {
      content: '删除',
      theme: 'primary',
      loading: false,
    },
    theme: 'warning',
    onConfirm: () => {
      console.log('confirm');
      userApi.deleteById(userInfo.value.id).finally(() => {
        deleteConfirm.hide();
        emit('item-update');
      });
    },
  });
};
</script>
<style lang="less" scoped>
.list-card-item {
  display: flex;
  flex-direction: column;
  cursor: pointer;

  &_detail {
    min-height: 140px;

    &--name {
      margin-bottom: var(--td-comp-margin-s);
      font: var(--td-font-title-medium);
      color: var(--td-text-color-brand);
    }

    &--desc {
      color: var(--td-text-color-secondary);
      font: var(--td-font-body-small);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}
</style>
