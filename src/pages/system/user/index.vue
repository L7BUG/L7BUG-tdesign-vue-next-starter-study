<template>
  <div>
    <div class="list-card-operation">
      <t-button @click="openCreate">
        <template #icon><user-add-icon /></template>

        新增用户
      </t-button>
      <div class="search-input">
        <t-input v-model="searchValue" :placeholder="t('pages.listCard.placeholder')" :on-enter="fetchData" clearable>
          <template #suffix-icon>
            <search-icon v-if="searchValue === ''" size="var(--td-comp-size-xxxs)" />
          </template>
        </t-input>
      </div>
    </div>

    <dialog-form
      :id="id"
      v-model:visible="formDialogVisible"
      :can-edit-username="canEditUsername"
      :data="createUser"
      @update:visible="fetchData"
    />

    <template v-if="pagination.total > 0 && !dataLoading">
      <div class="list-card-items">
        <t-row :gutter="[16, 16]">
          <t-col v-for="item in userInfoList" :key="item.id" :lg="4" :xs="6" :xl="3">
            <user-card
              class="list-card-item"
              :info="item"
              @item-update="(args) => fetchData()"
              @item-can-edit="() => openEdit(item)"
              @delete-item="handleDeleteItem"
            />
          </t-col>
        </t-row>
      </div>
      <div class="list-card-pagination">
        <t-pagination
          v-model="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-size-options="[8, 12, 16, 20, 24]"
          @page-size-change="onPageSizeChange"
          @current-change="onCurrentChange"
        />
      </div>
    </template>

    <div v-else-if="dataLoading" class="list-card-loading">
      <t-loading size="large" text="加载数据中..." />
    </div>

    <t-dialog
      v-model:visible="confirmVisible"
      header="确认删除所选产品？"
      :body="confirmBody"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
<script setup lang="ts">
import { SearchIcon, UserAddIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import type { SystemUserInfo, SystemUserUpdate } from '@/api/system/model/userModel';
import { userApi } from '@/api/system/userApi';
import type { CardProductType } from '@/components/product-card/index.vue';
import UserCard from '@/components/user-card/index.vue';
import { t } from '@/locales';

import DialogForm from './components/DialogForm.vue';

defineOptions({
  name: 'SystemUser',
});
const INITIAL_USER_DATA: SystemUserUpdate = {
  username: '',
  nickname: '',
  rawPassword: '',
  status: 1,
};
const id = ref<string>(null);
const pagination = ref({ current: 1, pageSize: 8, total: 0 });
const deleteProduct = ref(undefined);
const canEditUsername = ref(true);
const userInfoList = ref<SystemUserInfo[]>([]);
const dataLoading = ref(true);
const fetchData = () => {
  userInfoList.value = [];
  userApi
    .page({
      asc: false,
      column: 'id',
      current: pagination.value.current,
      size: pagination.value.pageSize,
      username: searchValue.value,
    })
    .then((page) => {
      userInfoList.value = page.data;
      pagination.value = {
        ...pagination.value,
        total: page.total << 0,
      };
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      dataLoading.value = false;
    });
};

const confirmBody = computed(() =>
  deleteProduct.value ? `确认删除后${deleteProduct.value.name}的所有产品信息将被清空, 且无法恢复` : '',
);

onMounted(() => {
  console.log('onMounted');
  fetchData();
});

const formDialogVisible = ref(false);
const searchValue = ref('');
const confirmVisible = ref(false);
const createUser = ref<SystemUserUpdate>({ ...INITIAL_USER_DATA });
const onPageSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.current = 1;
  fetchData();
  console.log('onPageSizeChange');
};
const onCurrentChange = (current: number) => {
  pagination.value.current = current;
  fetchData();
  console.log('onCurrentChange');
};
const handleDeleteItem = (product: CardProductType) => {
  confirmVisible.value = true;
  deleteProduct.value = product;
};
const onConfirmDelete = () => {
  const { index } = deleteProduct.value;
  userInfoList.value.splice(index - 1, 1);
  confirmVisible.value = false;
  MessagePlugin.success('删除成功');
};
const openEdit = (item: SystemUserInfo) => {
  formDialogVisible.value = true;
  canEditUsername.value = false;
  id.value = item.id;
  createUser.value = {
    username: item.username,
    nickname: item.nickname,
    rawPassword: '',
  };
};
const openCreate = () => {
  formDialogVisible.value = true;
  canEditUsername.value = true;
  id.value = null;
  createUser.value = { ...INITIAL_USER_DATA };
};
</script>
<style lang="less" scoped>
.list-card {
  height: 100%;

  &-operation {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--td-comp-margin-xxl);

    .search-input {
      width: 360px;
    }
  }

  &-item {
    padding: var(--td-comp-paddingTB-xl) var(--td-comp-paddingTB-xl);

    :deep(.t-card__header) {
      padding: 0;
    }

    :deep(.t-card__body) {
      padding: 0;
      margin-top: var(--td-comp-margin-xxl);
      margin-bottom: var(--td-comp-margin-xxl);
    }

    :deep(.t-card__footer) {
      padding: 0;
    }
  }

  &-pagination {
    padding: var(--td-comp-paddingTB-xl) var(--td-comp-paddingTB-xl);
  }

  &-loading {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
