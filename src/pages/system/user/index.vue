<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-button v-if="hasPermission('system:user:create')" @click="openCreate">
            <template #icon><user-add-icon /></template>
            新增用户
          </t-button>
          <p v-if="selectedRowKeys.length > 0" class="selected-count">已选 {{ selectedRowKeys.length }} 项</p>
        </div>
        <div class="search-input">
          <t-input v-model="searchValue" placeholder="搜索用户名" clearable @clear="fetchData">
            <template #suffix-icon>
              <search-icon v-if="!searchValue" size="16px" />
            </template>
          </t-input>
        </div>
      </t-row>

      <t-table
        :data="userInfoList"
        :columns="COLUMNS"
        :row-key="rowKey"
        vertical-align="top"
        :hover="true"
        :pagination="pagination"
        :loading="dataLoading"
        :selected-row-keys="selectedRowKeys"
        @page-change="onPageChange"
        @select-change="onSelectChange"
      >
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'default'" @click="hasPermission('system:user:update') && toggleStatus(row)">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </t-tag>
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link v-if="hasPermission('system:user:update')" theme="primary" @click="openRoleAssign(row)">角色</t-link>
            <t-link v-if="hasPermission('system:user:update')" theme="primary" @click="openEdit(row)">编辑</t-link>
            <t-link v-if="hasPermission('system:user:delete')" theme="danger" @click="handleClickDelete(row)">删除</t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <dialog-form
      :id="editId"
      v-model:visible="formDialogVisible"
      :can-edit-username="canEditUsername"
      :data="createUser"
      @update:visible="fetchData"
    />

    <t-dialog v-model:visible="confirmVisible" header="确认删除" :body="confirmBody" @confirm="onConfirmDelete" />

    <role-assign-dialog :user-id="roleAssignUserId" v-model:visible="roleAssignVisible" />
  </div>
</template>
<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { SearchIcon, UserAddIcon } from 'tdesign-icons-vue-next';
import type { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref, watch } from 'vue';

import type { SystemUserInfo, SystemUserUpdate } from '@/api/system/model/userModel';
import { userApi } from '@/api/system/userApi';
import { usePermission } from '@/composables/usePermission';

import DialogForm from './components/DialogForm.vue';
import RoleAssignDialog from './components/RoleAssignDialog.vue';

defineOptions({
  name: 'SystemUser',
});

const { hasButtonPermission: hasPermission } = usePermission();

const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 50, fixed: 'left' },
  { title: '用户名', align: 'left', colKey: 'username', width: 160, ellipsis: true },
  { title: '用户昵称', colKey: 'nickname', width: 200, ellipsis: true },
  { title: '状态', colKey: 'status', width: 100 },
  { title: '创建时间', colKey: 'createTime', width: 180 },
  { title: '操作', align: 'left', fixed: 'right', width: 140, colKey: 'op' },
];

const INITIAL_USER_DATA: SystemUserUpdate = {
  username: '',
  nickname: '',
  rawPassword: '',
  status: 1,
};

const rowKey = 'id';
const userInfoList = ref<SystemUserInfo[]>([]);
const dataLoading = ref(false);
const searchValue = ref('');
const selectedRowKeys = ref<(string | number)[]>([]);
const pagination = ref({
  defaultCurrent: 1,
  defaultPageSize: 20,
  total: 0,
});
const pageQuery = ref({ pageNum: 1, pageSize: 20 });

const formDialogVisible = ref(false);
const editId = ref<number | string | null>(null);
const canEditUsername = ref(true);
const createUser = ref<SystemUserUpdate>({ ...INITIAL_USER_DATA });

const roleAssignVisible = ref(false);
const roleAssignUserId = ref<number | string | null>(null);

const confirmVisible = ref(false);
const deleteTarget = ref<SystemUserInfo | null>(null);
const confirmBody = computed(() => {
  if (deleteTarget.value) {
    return `确认删除用户「${deleteTarget.value.nickname}」吗？删除后数据将无法恢复。`;
  }
  return '';
});

const fetchData = async () => {
  dataLoading.value = true;
  try {
    const page = await userApi.page({
      pageNum: pageQuery.value.pageNum,
      pageSize: pageQuery.value.pageSize,
      username: searchValue.value || undefined,
    });
    userInfoList.value = page.data;
    pagination.value = {
      ...pagination.value,
      total: Number(page.total),
    };
  } finally {
    dataLoading.value = false;
  }
};

const debouncedSearch = useDebounceFn(() => {
  pageQuery.value.pageNum = 1;
  fetchData();
}, 300);

watch(searchValue, () => {
  debouncedSearch();
});

onMounted(() => {
  fetchData();
});

const onPageChange = ({ current, pageSize }: { current: number; pageSize: number }) => {
  pageQuery.value = { pageNum: current, pageSize };
  fetchData();
};

const onSelectChange = (value: (string | number)[]) => {
  selectedRowKeys.value = value;
};

const openCreate = () => {
  editId.value = null;
  canEditUsername.value = true;
  createUser.value = { ...INITIAL_USER_DATA };
  formDialogVisible.value = true;
};

const openEdit = (item: SystemUserInfo) => {
  editId.value = item.id;
  canEditUsername.value = false;
  createUser.value = {
    username: item.username,
    nickname: item.nickname,
    rawPassword: '',
  };
  formDialogVisible.value = true;
};

const openRoleAssign = (row: SystemUserInfo) => {
  roleAssignUserId.value = row.id;
  roleAssignVisible.value = true;
};

const handleClickDelete = (row: SystemUserInfo) => {
  deleteTarget.value = row;
  confirmVisible.value = true;
};

const onConfirmDelete = async () => {
  if (!deleteTarget.value) return;
  await userApi.deleteById(deleteTarget.value.id);
  MessagePlugin.success('删除成功');
  confirmVisible.value = false;
  deleteTarget.value = null;
  fetchData();
};

const toggleStatus = async (row: SystemUserInfo) => {
  const newStatus = row.status === 1 ? 0 : 1;
  await userApi.update(row.id, { username: row.username, nickname: row.nickname, status: newStatus });
  row.status = newStatus;
  MessagePlugin.success('修改成功');
};
</script>
<style lang="less" scoped>
.list-card-container {
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}

.left-operation-container {
  display: flex;
  align-items: center;
  margin-bottom: var(--td-comp-margin-xxl);

  .selected-count {
    display: inline-block;
    margin-left: var(--td-comp-margin-l);
    color: var(--td-text-color-secondary);
  }
}

.search-input {
  width: 360px;
}
</style>
