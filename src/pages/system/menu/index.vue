<template>
  <t-row :gutter="12">
    <t-col :span="3" class="table-tree-container">
      <div class="list-tree-wrapper">
        <div class="list-tree-operator">
          <t-input v-model="filterText" :placeholder="t('pages.listTree.placeholder')" @change="onInput">
            <template #suffix-icon>
              <search-icon size="var(--td-comp-size-xxxs)" />
            </template>
          </t-input>
          <t-tree :data="menuTree" hover expand-on-click-node :filter="filterByText">
            <template #label="{ node }">
              <span :title="node.label">
                {{ showNodeName(node) }}
              </span>
            </template>
            <template #operations="{ node }">
              <t-button size="small" shape="square" variant="text" @click="deleteNode(node)">
                <template #icon> <add-icon /></template>
              </t-button>
              <t-button v-if="node.isLeaf()" size="small" shape="square" variant="text" @click="deleteNode(node)">
                <template #icon> <delete-icon /></template>
              </t-button>
            </template>
            <template #icon="{ node }">
              <icon :name="showNodeIcon(node)" />
            </template>
          </t-tree>
        </div>
      </div>
    </t-col>
    <t-col :span="9">
      <!--      <div class="list-tree-content"> -->
      <!--        <common-table /> -->
      <!--      </div> -->
      <base-from />
    </t-col>
  </t-row>
</template>
<script setup lang="ts">
import { AddIcon, DeleteIcon, Icon, SearchIcon } from 'tdesign-icons-vue-next';
import type { TreeNodeModel } from 'tdesign-vue-next';
import { ref } from 'vue';

import { menuApi } from '@/api/system/menuApi';
import type { MenuNodeResponse } from '@/api/system/model/menuModel';
import { t } from '@/locales';
import { useLocale } from '@/locales/useLocale';
import baseFrom from '@/pages/system/menu/base/index.vue';

defineOptions({
  name: 'SystemMenu',
});
const { locale } = useLocale();
console.log('tttt::', locale.value);
const filterByText = ref();
const filterText = ref();
const menuTree = ref<MenuNodeResponse[]>([]);

const onInput = () => {
  filterByText.value = (node: MenuNodeResponse) => {
    return node.label.includes(filterText.value);
  };
};
const getAllRootNodes = () => {
  menuApi.getRoot().then((response) => {
    menuTree.value = [response];
  });
};
getAllRootNodes();
const deleteNode = (node: TreeNodeModel) => {
  console.log(node);
  console.log(JSON.stringify(node.data.meta));
  console.log(node.data.meta.title);
  menuApi.deleteById(`${node.value}`).then((resp) => {
    if (resp) {
      getAllRootNodes();
    }
  });
};
const showNodeName = function (node: TreeNodeModel): string {
  console.log(node);
  if (node.data.meta) {
    const meta = JSON.parse(JSON.stringify(node.data.meta));
    if (meta.title.zh_CN) {
      if (meta.title[locale.value]) {
        return meta.title[locale.value];
      }
      return meta.title.zh_CN;
    }
  }
  return node.label;
};
const showNodeIcon = (node: TreeNodeModel): string => {
  console.log();
  if (node.data.meta) {
    switch (node.data.type) {
      case 'FOLDER':
        return 'folder';
      case 'PAGE':
        return 'template';
      case 'BUTTON':
        return 'button';
    }
  }
  return 'folder';
};
</script>
<style lang="less" scoped>
.table-tree-container {
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);

  .t-tree {
    margin-top: var(--td-comp-margin-xxl);
  }
}
.list-tree-wrapper {
  overflow-y: auto;
}
.list-tree-operator {
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);
  overflow: auto;
}
</style>
