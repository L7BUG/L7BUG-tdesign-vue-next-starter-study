<template>
  <t-card theme="poster2" :bordered="false">
    <template #avatar>
      <t-avatar size="56px">
        <template #icon>
          <user-avatar-icon />
        </template>
      </t-avatar>
    </template>
    <template #status>
      <t-tag :theme="isEnable ? 'success' : 'default'" :disabled="!isEnable">
        {{ isEnable ? t('components.isSetup.on') : t('components.isSetup.off') }}
      </t-tag>
    </template>
    <template #content>
      <p class="list-card-item_detail--name">id:{{ userInfo.id }}</p>
      <p class="list-card-item_detail--desc">用户名:{{ userInfo.username }}<br />用户昵称:{{ userInfo.nickname }}</p>
    </template>
    <!--    <template #footer> -->
    <!--      <t-avatar-group cascading="left-up" :max="2"> -->
    <!--        <t-avatar>{{ props.info.nickname }}</t-avatar> -->
    <!--      </t-avatar-group> -->
    <!--    </template> -->
    <template #actions>
      <t-dropdown
        :disabled="!isEnable"
        trigger="click"
        :options="[
          {
            content: '管理',
            value: 'manage',
            // onClick: () => handleClickManage(props.product),
          },
          {
            content: '删除',
            value: 'delete',
            // onClick: () => handleClickDelete(props.product),
          },
        ]"
      >
        <t-button theme="default" :disabled="!isEnable" shape="square" variant="text">
          <more-icon />
        </t-button>
      </t-dropdown>
    </template>
  </t-card>
</template>
<script setup lang="ts">
import { MoreIcon, UserAvatarIcon } from 'tdesign-icons-vue-next';
import type { PropType } from 'vue';
import { computed, ref } from 'vue';

import type { SystemUserInfo } from '@/api/system/model/userModel';
import { t } from '@/locales';

const props = defineProps({
  info: {
    type: Object as PropType<SystemUserInfo>,
    default: undefined,
  },
});

const userInfo = ref(props.info);
const isEnable = computed<boolean>(() => userInfo.value.status === 1);

// const emit = defineEmits(['manage-product', 'delete-item']);

// const typeMap = ['A', 'B', 'C', 'D', 'E'];

// const handleClickManage = (product: SystemUserInfo) => {
//   emit('manage-product', product);
// };
//
// const handleClickDelete = (product: SystemUserInfo) => {
//   emit('delete-item', product);
// };
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
      color: var(--td-text-color-primary);
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
