<template>
  <t-card :bordered="false" class="menu-form-card">
    <t-form :data="formData" :label-width="100" label-align="top" @submit="onSubmit">
      <div class="form-section-title">菜单配置</div>
      <t-row :gutter="[32, 24]">
        <t-col :span="6">
          <t-form-item label="父节点" name="fatherId">
            <t-input :value="fatherLabel" disabled />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item label="路径" name="path">
            <t-input v-model="formData.path" placeholder="请输入路径" />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item label="名称" name="name">
            <t-input v-model="formData.name" placeholder="请输入名称" />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item label="类型" name="type">
            <t-select v-model="formData.type" clearable placeholder="请选择类型">
              <t-option v-for="item in MENU_TYPE" :key="item.value" :value="item.value" :label="item.label" />
            </t-select>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item label="启用状态" name="enable">
            <t-switch v-model="formData.enable" size="large">
              <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
            </t-switch>
          </t-form-item>
        </t-col>
        <t-col :span="12">
          <t-form-item label="组件" name="component">
            <t-input v-model="formData.component" placeholder="请输入组件路径，如 /system/menu/index" />
          </t-form-item>
        </t-col>
      </t-row>

      <div class="form-section-title">菜单信息</div>
      <t-row :gutter="[32, 24]">
        <t-col :span="6">
          <t-form-item label="菜单中文名" name="meta.title.zh_CN">
            <t-input v-model="formData.meta.title.zh_CN" placeholder="请输入中文名" />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item label="菜单英文名" name="meta.title.en_US">
            <t-input v-model="formData.meta.title.en_US" placeholder="请输入英文名" />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item label="图标" name="meta.icon">
            <t-select v-model="formData.meta.icon" placeholder="请选择图标" :filter="filterIcon">
              <t-option v-for="item in iconOptions" :key="item.stem" :value="item.stem">
                <div class="icon-option">
                  <t-icon :name="item.stem" />
                  <span>[{{ item.stem }}]</span>
                </div>
              </t-option>
              <template #valueDisplay>
                <t-icon :name="formData.meta.icon" style="margin-right: 8px" />
                {{ formData.meta.icon }}
              </template>
            </t-select>
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
import { manifest } from 'tdesign-icons-vue-next';
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { computed, ref, watch } from 'vue';

import { menuApi } from '@/api/system/menuApi';
import type { MenuNodeResponse } from '@/api/system/model/menuModel';

defineOptions({
  name: 'MenuForm',
});

const props = defineProps({
  data: {
    type: Object as PropType<MenuNodeResponse>,
    default: () =>
      ({
        fatherId: -1,
        fullId: '',
        path: '',
        name: '',
        component: '',
        type: 'FOLDER',
        enable: true,
        sort: 0,
        meta: {
          title: { zh_CN: '', en_US: '' },
          icon: 'folder',
        },
      }) as MenuNodeResponse,
  },
});

const emit = defineEmits(['submit']);

const MENU_TYPE = [
  { label: '菜单', value: 'FOLDER' },
  { label: '页面', value: 'PAGE' },
  { label: '按钮', value: 'BUTTON' },
];

const INITIAL_DATA: MenuNodeResponse = {
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

const iconOptions = ref(manifest);
const formData = ref<MenuNodeResponse>({ ...INITIAL_DATA });
const submitLoading = ref(false);

const fatherLabel = computed(() => {
  if (formData.value.fatherId === -1 || formData.value.fatherId == null) {
    return '根节点';
  }
  return `父节点 ID: ${formData.value.fatherId}`;
});

watch(
  () => props.data,
  (val) => {
    formData.value = {
      ...INITIAL_DATA,
      ...val,
      meta: {
        title: { zh_CN: '', en_US: '' },
        icon: 'folder',
        ...val.meta,
        ...(val.meta?.title ? { title: { zh_CN: '', en_US: '', ...val.meta.title } } : {}),
      },
    };
  },
  { immediate: true, deep: true },
);

const filterIcon = (search: string, option: any) => {
  const key = option.key || option.stem || '';
  return key.includes(search);
};

const onSubmit = async ({ validateResult }: SubmitContext) => {
  if (validateResult !== true) return;

  submitLoading.value = true;
  try {
    if (formData.value.id != null) {
      await menuApi.updateMenu(formData.value.id, formData.value);
      MessagePlugin.success('更新成功');
    } else {
      await menuApi.createMenu(formData.value);
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
.menu-form-card {
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

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
