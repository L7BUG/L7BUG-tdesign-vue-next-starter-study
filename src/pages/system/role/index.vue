<template>
  <div>
    <t-row :gutter="12">
      <t-col :span="4">
        <t-card v-if="hasPermission('system:role:query')" :bordered="false" class="tree-card">
          <t-input v-model="filterText" placeholder="搜索角色" clearable>
            <template #suffix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
          <t-tree
            :data="roleTree"
            hover
            expand-on-click-node
            :filter="filterByText"
            :loading="treeLoading"
            :keys="{ label: 'name', value: 'id', children: 'children' }"
          >
            <template #label="{ node }">
              <span>{{ node.label }}</span>
            </template>
            <template #operations="{ node }">
              <t-button v-if="hasPermission('system:role:create')" size="small" shape="square" variant="text" @click="addChild(node)">
                <template #icon><add-icon /></template>
              </t-button>
              <t-button v-if="isNotRoot(node) && hasPermission('system:role:update')" size="small" shape="square" variant="text" @click="editNode(node)">
                <template #icon><edit-icon /></template>
              </t-button>
              <t-button v-if="isNotRoot(node) && hasPermission('system:role:delete')" size="small" shape="square" variant="text" @click="handleDelete(node)">
                <template #icon><delete-icon /></template>
              </t-button>
              <t-button v-if="isNotRoot(node) && hasPermission('system:role:update')" size="small" shape="square" variant="text" @click="moveUp(node)">
                <template #icon><align-top-icon /></template>
              </t-button>
              <t-button v-if="isNotRoot(node) && hasPermission('system:role:update')" size="small" shape="square" variant="text" @click="moveDown(node)">
                <template #icon><align-bottom-icon /></template>
              </t-button>
            </template>
          </t-tree>
        </t-card>
      </t-col>
      <t-col v-if="hasPermission('system:role:query')" :span="8">
        <role-form :data="selectedRole" :tree-data="roleTree" @submit="refreshTree" />
      </t-col>
    </t-row>

    <t-dialog v-model:visible="deleteVisible" header="确认删除" :body="deleteBody" @confirm="onConfirmDelete" />
  </div>
</template>
<script setup lang="ts">
import { AddIcon, AlignBottomIcon, AlignTopIcon, DeleteIcon, EditIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { TreeNodeModel } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';

import type { RoleInfo } from '@/api/system/model/roleModel';
import { roleApi } from '@/api/system/roleApi';
import { usePermission } from '@/composables/usePermission';

import RoleForm from './components/RoleForm.vue';

defineOptions({
  name: 'SystemRole',
});

const { hasButtonPermission: hasPermission } = usePermission();

const INITIAL_ROLE_DATA: RoleInfo = {
  id: '',
  name: '',
  fatherId: null,
  fullId: '',
  status: '',
  sort: 0,
  remark: '',
  children: [],
};

const filterText = ref('');
const roleTree = ref<RoleInfo[]>([]);
const treeLoading = ref(false);
const selectedRole = ref<RoleInfo>({ ...INITIAL_ROLE_DATA });

const deleteVisible = ref(false);
const deleteTarget = ref<TreeNodeModel | null>(null);
const deleteBody = computed(() => {
  if (deleteTarget.value) {
    return `确认删除角色「${deleteTarget.value.label}」吗？删除后数据将无法恢复。`;
  }
  return '';
});

const filterByText = computed(() => {
  if (!filterText.value) return undefined;
  return (node: any) => node.label?.includes(filterText.value) ?? false;
});

const refreshTree = async () => {
  treeLoading.value = true;
  try {
    const root = await roleApi.getRoot();
    roleTree.value = [root];
  } finally {
    treeLoading.value = false;
  }
};

refreshTree();

const isNotRoot = (node: TreeNodeModel) => node.data.id !== '-1';

const addChild = (node: TreeNodeModel) => {
  selectedRole.value = {
    ...INITIAL_ROLE_DATA,
    fatherId: node.data.id,
  };
  MessagePlugin.info(`正在往「${node.label}」节点下新增子角色`);
};

const editNode = async (node: TreeNodeModel) => {
  const resp = await roleApi.getById(node.value);
  if (resp) {
    selectedRole.value = resp;
  }
};

const handleDelete = (node: TreeNodeModel) => {
  deleteTarget.value = node;
  deleteVisible.value = true;
};

const onConfirmDelete = async () => {
  if (!deleteTarget.value) return;
  await roleApi.deleteById(deleteTarget.value.value);
  MessagePlugin.success('删除成功');
  deleteVisible.value = false;
  deleteTarget.value = null;
  refreshTree();
};

const moveUp = async (node: TreeNodeModel) => {
  await roleApi.addSortVal(node.value, -3);
  refreshTree();
};

const moveDown = async (node: TreeNodeModel) => {
  await roleApi.addSortVal(node.value, 3);
  refreshTree();
};
</script>
<style lang="less" scoped>
.tree-card {
  height: 100%;

  :deep(.t-card__body) {
    padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);
  }

  :deep(.t-tree) {
    margin-top: var(--td-comp-margin-xxl);
  }
}
</style>
