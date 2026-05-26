<template>
  <t-card theme="poster2" :bordered="false">
    <template #avatar>
      <t-avatar shape="round" size="medium">{{ userInfo.nickname.substring(0, 1).toUpperCase() }}</t-avatar>
    </template>
    <template #status>
      <t-tag :theme="isEnable ? 'success' : 'default'" @click="setStatus">
        <t-loading v-if="statusLoading" size="small" />
        <template v-else>{{ isEnable ? t('components.isSetup.on') : t('components.isSetup.off') }}</template>
      </t-tag>
    </template>
    <template #content>
      <p class="list-card-item_detail--name">{{ userInfo.nickname }}</p>
      <p class="list-card-item_detail--desc">
        用户名:{{ userInfo.username }}<br />id:{{ userInfo.id }}<br />创建时间:{{ userInfo.createTime }}
      </p>
    </template>
    <template #footer>
      <t-tag theme="success">
        <template #icon>
          <t-icon name="usergroup-add" />
        </template>
        {{ userInfo.createTime }}
      </t-tag>
    </template>
    <template #actions>
      <t-dropdown
        :disabled="dropdownDisabled"
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
        <t-button theme="default" :disabled="dropdownDisabled" shape="square" variant="text">
          <more-icon />
        </t-button>
      </t-dropdown>
    </template>
  </t-card>
</template>
<script setup lang="ts">
import { MoreIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { computed, ref, watch } from 'vue';

import type { SystemUserInfo } from '@/api/system/model/userModel';
import { userApi } from '@/api/system/userApi';
import { t } from '@/locales';

const props = defineProps({
  info: {
    type: Object as PropType<SystemUserInfo>,
    required: true,
  },
});

const emit = defineEmits(['item-update', 'item-can-edit']);

const userInfo = ref(props.info);

watch(
  () => props.info,
  (val) => {
    userInfo.value = val;
  },
);

const isEnable = computed(() => userInfo.value.status === 1);
const dropdownDisabled = computed(() => userInfo.value.id === -1 || !isEnable.value);

const statusLoading = ref(false);
const setStatus = async () => {
  const newStatus = isEnable.value ? 0 : 1;
  statusLoading.value = true;
  try {
    await userApi.update(userInfo.value.id, { status: newStatus });
    userInfo.value.status = newStatus;
    MessagePlugin.success('修改成功');
  } finally {
    statusLoading.value = false;
  }
};

const deleteById = () => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除吗?',
    body: '请确认是否删除，删除后，数据将不存在',
    confirmBtn: {
      content: '删除',
      theme: 'primary',
      loading: false,
    },
    theme: 'warning',
    onConfirm: async () => {
      await userApi.deleteById(userInfo.value.id);
      dialog.hide();
      emit('item-update');
    },
  });
};
</script>
<style lang="less" scoped>
.list-card-item {
  display: flex;
  flex-direction: column;

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
