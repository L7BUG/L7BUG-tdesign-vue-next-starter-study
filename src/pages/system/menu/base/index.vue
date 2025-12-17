<template>
  <t-form
    :data="menuFormData"
    :label-width="100"
    :rules="FORM_RULES"
    class="base-form"
    label-align="top"
    @submit="onSubmit"
  >
    <div class="form-basic-container">
      <div class="form-basic-item">
        <div class="form-basic-container-title form-title-gap">菜单配置</div>

        <t-row :gutter="[32, 24]" class="row-gap">
          <t-col :span="12">
            <t-form-item label="父节点" name="fatherId">
              <t-input v-model="menuFormData.fatherId" :style="{ width: '100%' }" placeholder="请输入内容" />
            </t-form-item>
          </t-col>
          <t-col :span="12">
            <t-form-item label="组件" name="component">
              <t-input
                v-model="menuFormData.component"
                :style="{ width: '100%' }"
                placeholder="请输入内容:/system/menu/index"
              />
            </t-form-item>
          </t-col>
          <t-col :span="12">
            <t-form-item label="全路径id" name="fullId">
              <t-input v-model="menuFormData.fullId" :style="{ width: '100%' }" disabled />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="路径" name="path">
              <t-input v-model="menuFormData.path" :style="style" placeholder="请输入内容" />
            </t-form-item>
          </t-col>

          <t-col :span="6">
            <t-form-item label="名称" name="name">
              <t-input v-model="menuFormData.name" :style="style" placeholder="请输入内容" />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="类型" name="type">
              <t-select v-model="menuFormData.type" :style="style" class="demo-select-base" clearable>
                <t-option v-for="(item, index) in MENU_TYPE" :key="index" :value="item.value" :label="item.label">
                  {{ item.label }}
                </t-option>
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="启用状态" name="name">
              <t-switch v-model="menuFormData.enable" size="large">
                <template #label="slotProps">{{ slotProps.value ? '开' : '关' }}</template>
              </t-switch>
            </t-form-item>
          </t-col>
        </t-row>

        <div class="form-basic-container-title form-title-gap">菜单信息</div>
        <t-row :gutter="[32, 24]" class="row-gap">
          <t-col :span="6">
            <t-form-item label="菜单中文名" name="name">
              <t-input v-model="menuFormData.meta.title.zh_CN" :style="style" placeholder="请输入内容" />
            </t-form-item>
          </t-col>

          <t-col :span="6">
            <t-form-item label="菜单英文名" name="name">
              <t-input v-model="menuFormData.meta.title.en_US" :style="style" placeholder="请输入内容" />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="图标" name="name">
              <t-select v-model="menuFormData.meta.icon" placeholder="请选择" :style="style" :filter="filterMethod">
                <t-option v-for="item in iconOptions" :key="item.stem" :value="item.stem" class="overlay-options">
                  <div><t-icon :name="item.stem" />[{{ item.stem }}]</div>
                </t-option>
                <template #valueDisplay
                  ><t-icon :name="menuFormData.meta.icon" :style="{ marginRight: '8px' }" />{{
                    menuFormData.meta.icon
                  }}</template
                >
              </t-select>
            </t-form-item>
          </t-col>
        </t-row>
        <div class="form-submit-left" style="margin-top: 20px">
          <t-button class="form-submit-confirm" theme="primary" type="submit"> 保存 </t-button>
        </div>
      </div>
    </div>
  </t-form>
</template>
<script lang="ts" setup>
import { manifest } from 'tdesign-icons-vue-next';
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { ref, watch } from 'vue';

import { menuApi } from '@/api/system/menuApi';
import type { MenuNodeResponse } from '@/api/system/model/menuModel';

import { FORM_RULES, INITIAL_MENU_DATA, MENU_TYPE } from './constants';

defineOptions({
  name: 'FormBase',
});

const props = defineProps({
  formData: {
    type: Object as PropType<MenuNodeResponse>,
    default: () => ({ ...INITIAL_MENU_DATA }),
  },
});
const emit = defineEmits(['submit']);
const style = { width: '322px' };
const iconOptions = ref(manifest);
const menuFormData = ref<MenuNodeResponse>(props.formData);
watch(
  () => props.formData,
  (newVal) => {
    menuFormData.value = newVal;
  },
);
const onSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    if (menuFormData.value.id) {
      menuApi.updateMenu(menuFormData.value.id, menuFormData.value).then((response) => {
        if (response) {
          MessagePlugin.success('新建成功');
          emit('submit');
        }
      });
    } else {
      menuApi.createMenu(menuFormData.value).then((response) => {
        if (response) {
          MessagePlugin.success('新建成功');
          emit('submit');
        }
      });
    }
  }
};

const filterMethod = (search: string, option: any) => {
  return option.key.includes(search);
};
</script>
<style lang="less" scoped>
@import './index.less';
</style>
