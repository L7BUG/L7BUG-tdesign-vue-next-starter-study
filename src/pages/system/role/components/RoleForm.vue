<template>
  <t-card :bordered="false" class="role-form-card">
    <t-form :data="formData" :label-width="100" label-align="top" @submit="onSubmit">
      <div class="form-section-title">角色配置</div>
      <t-row :gutter="[32, 24]">
        <t-col :span="6">
          <t-form-item label="父节点" name="fatherId">
            <t-tree-select
              v-model="formData.fatherId"
              :data="treeData"
              :keys="{ value: 'id', label: 'label', children: 'children' }"
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
          <t-form-item label="排序" name="sort">
            <t-input-number v-model="formData.sort" :min="0" placeholder="请输入排序值" />
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
</template>
<script setup lang="ts">
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { ref, watch } from 'vue';

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
</script>
<style lang="less" scoped>
.role-form-card {
  :deep(.t-card__body) {
    padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);
  }
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
