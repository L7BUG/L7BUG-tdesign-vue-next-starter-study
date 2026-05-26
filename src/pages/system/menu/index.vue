<template>
  <t-row :gutter="12">
    <t-col :span="4">
      <t-card :bordered="false" class="tree-card">
        <t-input v-model="filterText" placeholder="搜索菜单" clearable>
          <template #suffix-icon>
            <search-icon size="16px" />
          </template>
        </t-input>
        <t-tree :data="menuTree" hover expand-on-click-node :filter="filterByText" :loading="treeLoading">
          <template #label="{ node }">
            <span>{{ nodeLabel(node) }}</span>
          </template>
          <template #operations="{ node }">
            <t-button v-if="isNotRoot(node)" size="small" shape="square" variant="text" @click="addChild(node)">
              <template #icon><add-icon /></template>
            </t-button>
            <t-button v-if="isNotRoot(node)" size="small" shape="square" variant="text" @click="editNode(node)">
              <template #icon><edit-icon /></template>
            </t-button>
            <t-button v-if="isNotRoot(node)" size="small" shape="square" variant="text" @click="handleDelete(node)">
              <template #icon><delete-icon /></template>
            </t-button>
            <t-button v-if="isNotRoot(node)" size="small" shape="square" variant="text" @click="moveUp(node)">
              <template #icon><align-top-icon /></template>
            </t-button>
            <t-button v-if="isNotRoot(node)" size="small" shape="square" variant="text" @click="moveDown(node)">
              <template #icon><align-bottom-icon /></template>
            </t-button>
          </template>
          <template #icon="{ node }">
            <t-icon :name="node.data.meta?.icon || 'folder'" />
          </template>
        </t-tree>
      </t-card>
    </t-col>
    <t-col :span="8">
      <menu-form :data="selectedMenu" @submit="refreshTree" />
    </t-col>
  </t-row>

  <t-dialog v-model:visible="deleteVisible" header="确认删除" :body="deleteBody" @confirm="onConfirmDelete" />
</template>
<script setup lang="ts">
import { AddIcon, AlignBottomIcon, AlignTopIcon, DeleteIcon, EditIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { TreeNodeModel } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';

import { menuApi } from '@/api/system/menuApi';
import type { MenuNodeResponse } from '@/api/system/model/menuModel';
import { useLocale } from '@/locales/useLocale';

import MenuForm from './components/MenuForm.vue';

defineOptions({
  name: 'SystemMenu',
});

const INITIAL_MENU_DATA: MenuNodeResponse = {
  fatherId: -1,
  fullId: '',
  path: '',
  name: '',
  component: '',
  type: 'FOLDER',
  enable: true,
  sort: 0,
  meta: {
    title: {
      zh_CN: '',
      en_US: '',
    },
    icon: 'folder',
  },
};

const { locale } = useLocale();

const filterText = ref('');
const menuTree = ref<MenuNodeResponse[]>([]);
const treeLoading = ref(false);
const selectedMenu = ref<MenuNodeResponse>({ ...INITIAL_MENU_DATA });

const deleteVisible = ref(false);
const deleteTarget = ref<TreeNodeModel | null>(null);
const deleteBody = computed(() => {
  if (deleteTarget.value) {
    const label = getNodeLabel(deleteTarget.value);
    return `确认删除菜单「${label}」吗？删除后数据将无法恢复。`;
  }
  return '';
});

const filterByText = computed(() => {
  if (!filterText.value) return undefined;
  return (node: any) => node.data?.label?.includes(filterText.value) ?? false;
});

const refreshTree = async () => {
  treeLoading.value = true;
  try {
    const root = await menuApi.getRoot();
    menuTree.value = [root];
  } finally {
    treeLoading.value = false;
  }
};

refreshTree();

const isNotRoot = (node: TreeNodeModel) => node.data.id !== '-1';

const getNodeLabel = (node: TreeNodeModel): string => {
  const meta = node.data.meta;
  if (meta?.title) {
    if (meta.title[locale.value]) {
      return meta.title[locale.value];
    }
    if (meta.title.zh_CN) {
      return meta.title.zh_CN;
    }
  }
  return node.label || '';
};

const nodeLabel = (node: TreeNodeModel): string => getNodeLabel(node);

const addChild = (node: TreeNodeModel) => {
  selectedMenu.value = {
    ...INITIAL_MENU_DATA,
    fatherId: node.data.id,
  };
  MessagePlugin.info(`正在往「${getNodeLabel(node)}」节点下新增子节点`);
};

const editNode = async (node: TreeNodeModel) => {
  const resp = await menuApi.getById(node.value);
  if (resp) {
    selectedMenu.value = resp;
  }
};

const handleDelete = (node: TreeNodeModel) => {
  deleteTarget.value = node;
  deleteVisible.value = true;
};

const onConfirmDelete = async () => {
  if (!deleteTarget.value) return;
  await menuApi.deleteById(deleteTarget.value.value);
  MessagePlugin.success('删除成功');
  deleteVisible.value = false;
  deleteTarget.value = null;
  refreshTree();
};

const moveUp = async (node: TreeNodeModel) => {
  await menuApi.addMenuSortVal(node.value, -3);
  refreshTree();
};

const moveDown = async (node: TreeNodeModel) => {
  await menuApi.addMenuSortVal(node.value, 3);
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
