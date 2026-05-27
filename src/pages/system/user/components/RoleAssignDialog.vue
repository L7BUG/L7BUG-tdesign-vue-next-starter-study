<template>
  <t-dialog v-model:visible="dialogVisible" header="分配角色" :width="520" :confirm-btn="null" :cancel-btn="null">
    <div class="tree-wrapper">
      <t-input v-model="filterText" placeholder="搜索角色" clearable>
        <template #suffix-icon>
          <search-icon v-if="!filterText" size="16px" />
        </template>
      </t-input>
      <t-tree
        v-model:value="selectedRoleIds"
        :data="roleTree"
        hover
        checkable
        check-strictly
        expand-on-click-node
        :filter="filterByText"
        :loading="loading"
        :keys="{ label: 'name', value: 'id', children: 'children' }"
      />
    </div>
    <div class="dialog-footer">
      <t-button variant="outline" @click="onClose">取消</t-button>
      <t-button theme="primary" :loading="submitLoading" @click="onSubmit">确定</t-button>
    </div>
  </t-dialog>
</template>
<script setup lang="ts">
import { SearchIcon } from 'tdesign-icons-vue-next';
import type { TreeNodeModel } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { computed, ref, watch } from 'vue';

import type { RoleInfo } from '@/api/system/model/roleModel';
import { roleApi } from '@/api/system/roleApi';
import { userApi } from '@/api/system/userApi';

const props = defineProps({
  userId: {
    type: [Number, String] as PropType<number | string>,
    default: null,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible']);

const dialogVisible = ref(false);
const loading = ref(false);
const submitLoading = ref(false);
const roleTree = ref<RoleInfo[]>([]);
const selectedRoleIds = ref<(number | string)[]>([]);
const filterText = ref('');

const filterByText = computed(() => {
  if (!filterText.value) return undefined;
  return (node: TreeNodeModel) => node.label?.includes(filterText.value) ?? false;
});

async function loadData(userId: number | string) {
  loading.value = true;
  try {
    const [root, roleIds] = await Promise.all([
      roleApi.getRoot(),
      userApi.getRoleIdsByUserId(userId),
    ]);
    roleTree.value = root.children ?? [];
    selectedRoleIds.value = roleIds ?? [];
    filterText.value = '';
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
    if (val && props.userId) {
      loadData(props.userId);
    }
  },
);

watch(
  () => dialogVisible.value,
  (val) => {
    emit('update:visible', val);
  },
);

const onSubmit = async () => {
  if (!props.userId) return;
  submitLoading.value = true;
  try {
    await userApi.setRolesForUser(props.userId, selectedRoleIds.value);
    MessagePlugin.success('角色分配成功');
    dialogVisible.value = false;
  } finally {
    submitLoading.value = false;
  }
};

const onClose = () => {
  dialogVisible.value = false;
};
</script>
<style lang="less" scoped>
.tree-wrapper {
  :deep(.t-tree) {
    margin-top: 12px;
    max-height: 360px;
    overflow-y: auto;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
</style>
