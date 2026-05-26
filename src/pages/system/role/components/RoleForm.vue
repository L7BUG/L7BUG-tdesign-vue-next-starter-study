<template>
  <div>
    <t-card :bordered="false" class="role-form-card">
      <t-form :data="formData" :label-width="100" label-align="top" @submit="onSubmit">
        <div class="form-section-title">角色配置</div>
        <t-row :gutter="[32, 24]">
          <t-col :span="6">
            <t-form-item label="父节点" name="fatherId">
              <t-tree-select
                v-model="formData.fatherId"
                :data="treeData"
                :keys="{ value: 'id', label: 'name', children: 'children' }"
                placeholder="请选择父节点"
                filterable
                clearable
              />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="全路径ID" name="fullId">
              <t-input :value="formData.fullId" disabled />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="角色名称" name="name">
              <t-input v-model="formData.name" placeholder="请输入角色名称" />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="状态" name="status">
              <t-select v-model="formData.status" placeholder="请选择状态" clearable>
                <t-option v-for="item in ROLE_STATUS" :key="item.value" :value="item.value" :label="item.label" />
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :span="12">
            <t-form-item label="备注" name="remark">
              <t-input v-model="formData.remark" placeholder="请输入备注" />
            </t-form-item>
          </t-col>
        </t-row>

        <t-form-item style="margin-top: 24px">
          <t-button theme="primary" type="submit" :loading="submitLoading">保存</t-button>
          <t-button variant="outline" style="margin-left: 12px" @click="resetForm">重置</t-button>
        </t-form-item>
      </t-form>
    </t-card>

    <t-card v-if="formData.id" :bordered="false" class="permission-card">
      <div class="form-section-title">菜单权限</div>
      <t-tree
        v-model:value="checkedKeys"
        :data="menuTree"
        hover
        expand-on-click-node
        checkable
        :loading="permissionLoading"
        :keys="{ label: 'name', value: 'id', children: 'children' }"
      />
      <t-button theme="primary" :loading="permissionSaving" style="margin-top: 24px" @click="savePermissions">
        保存权限
      </t-button>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { ref, watch } from 'vue';

import { menuApi } from '@/api/system/menuApi';
import type { MenuNodeResponse } from '@/api/system/model/menuModel';
import type { RoleInfo } from '@/api/system/model/roleModel';
import { roleApi } from '@/api/system/roleApi';

defineOptions({
  name: 'RoleForm',
});

const props = defineProps({
  data: {
    type: Object as PropType<RoleInfo>,
    default: (): RoleInfo => ({
      id: '',
      name: '',
      fatherId: null,
      fullId: '',
      status: '',
      sort: 0,
      remark: '',
      children: [],
    }),
  },
  treeData: {
    type: Array as PropType<RoleInfo[]>,
    default: (): RoleInfo[] => [],
  },
});

const emit = defineEmits(['submit']);

const ROLE_STATUS = [
  { label: '启用', value: 'ENABLED' },
  { label: '禁用', value: 'DISABLED' },
];

const INITIAL_DATA: RoleInfo = {
  id: '',
  name: '',
  fatherId: null,
  fullId: '',
  status: '',
  sort: 0,
  remark: '',
  children: [],
};

const formData = ref<RoleInfo>({ ...INITIAL_DATA });
const submitLoading = ref(false);

watch(
  () => props.data,
  (val) => {
    formData.value = { ...INITIAL_DATA, ...val };
  },
  { immediate: true, deep: true },
);

const onSubmit = async ({ validateResult }: SubmitContext) => {
  if (validateResult !== true) return;

  submitLoading.value = true;
  try {
    if (formData.value.id) {
      await roleApi.update(formData.value.id, formData.value);
      MessagePlugin.success('更新成功');
    } else {
      await roleApi.create(formData.value);
      MessagePlugin.success('新建成功');
    }
    emit('submit');
  } finally {
    submitLoading.value = false;
  }
};

const resetForm = () => {
  formData.value = { ...INITIAL_DATA };
};

const menuTree = ref<MenuNodeResponse[]>([]);
const checkedKeys = ref<(number | string)[]>([]);
const initialCheckedKeys = ref<(number | string)[]>([]);
const permissionLoading = ref(false);
const permissionSaving = ref(false);

watch(
  () => formData.value.id,
  async (id) => {
    if (!id) {
      menuTree.value = [];
      checkedKeys.value = [];
      return;
    }
    permissionLoading.value = true;
    try {
      const [tree, menuIds] = await Promise.all([loadMenuTree(), roleApi.getMenuIdsByRoleId(id)]);
      menuTree.value = [tree];
      checkedKeys.value = menuIds;
      initialCheckedKeys.value = [...menuIds];
    } finally {
      permissionLoading.value = false;
    }
  },
);

const loadMenuTree = async (): Promise<MenuNodeResponse> => {
  if (formData.value.fatherId === -1 || formData.value.fatherId === '-1') {
    return menuApi.getRoot();
  }
  return roleApi.getMenuTreeByRoleId(formData.value.id);
};

const savePermissions = async () => {
  permissionSaving.value = true;
  try {
    const roleId = formData.value.id;
    const added = checkedKeys.value.filter((k) => !initialCheckedKeys.value.includes(k));
    const removed = initialCheckedKeys.value.filter((k) => !checkedKeys.value.includes(k));

    await Promise.all([
      ...added.map((menuId) => roleApi.addMenu(roleId, menuId)),
      ...removed.map((menuId) => roleApi.removeMenu(roleId, menuId)),
    ]);

    initialCheckedKeys.value = [...checkedKeys.value];
    MessagePlugin.success('权限更新成功');
  } finally {
    permissionSaving.value = false;
  }
};
</script>
<style lang="less" scoped>
.role-form-card,
.permission-card {
  :deep(.t-card__body) {
    padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);
  }
}

.permission-card {
  margin-top: 12px;
}

.form-section-title {
  font: var(--td-font-title-large);
  font-weight: 400;
  color: var(--td-text-color-primary);
  margin: var(--td-comp-margin-xxl) 0 var(--td-comp-margin-xl) 0;

  &:first-child {
    margin-top: 0;
  }
}
</style>
