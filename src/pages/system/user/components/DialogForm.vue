<template>
  <t-dialog v-model:visible="formVisible" header="用户" :width="680" :footer="false">
    <template #body>
      <!-- 表单内容 -->
      <t-form :data="formData" :rules="rules" :label-width="100" @submit="onSubmit">
        <t-form-item label="用户名" name="username">
          <t-input v-model="formData.username" :style="{ width: '480px' }" :disabled="!canEditUsername" />
        </t-form-item>
        <!--        <t-form-item label="用户状态" name="status"> -->
        <!--          <t-radio-group v-model="formData.status"> -->
        <!--            <t-radio value="0">禁用</t-radio> -->
        <!--            <t-radio value="1">启用</t-radio> -->
        <!--          </t-radio-group> -->
        <!--        </t-form-item> -->
        <t-form-item label="用户昵称" name="nickname">
          <t-input v-model="formData.nickname" :style="{ width: '480px' }" />
        </t-form-item>
        <t-form-item label="密码" name="rawPassword">
          <t-input v-model="formData.rawPassword" :style="{ width: '480px' }" />
        </t-form-item>
        <t-form-item style="float: right">
          <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
          <t-button theme="primary" type="submit">确定</t-button>
        </t-form-item>
      </t-form>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
import type { FormRules } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { ref, watch } from 'vue';

import type { SystemUserUpdate } from '@/api/system/model/userModel';
import { userApi } from '@/api/system/userApi';

const { id, visible, data, canEditUsername } = defineProps({
  id: {
    type: String,
    default: null,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<SystemUserUpdate>,
    default: undefined,
  },
  canEditUsername: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['update:visible']);
console.log('idid:', id);
const formVisible = ref(false);
const formData = ref({ ...data });

const onSubmit = () => {
  userApi
    .saveUserInfo(formData.value, id)
    .then(() => {
      MessagePlugin.success(`提交成功`);
      formVisible.value = false;
    })
    .finally(() => emit('update:visible'));
};

const onClickCloseBtn = () => {
  formVisible.value = false;
  formData.value = {
    ...{
      username: '',
      rawPassword: '',
      nickname: '',
    },
  };
};
const initForm = () => {
  formData.value = {
    ...{
      username: '',
      rawPassword: '',
      nickname: '',
    },
  };
};
watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);
  },
);

watch(
  () => visible,
  (val) => {
    formVisible.value = val;
    initForm();
  },
);

watch(
  () => data,
  (val) => {
    formData.value = val;
  },
);

const rules: FormRules<SystemUserUpdate> = {
  username: [{ required: true, message: '请输入用户名', type: 'error' }],
  nickname: [{ required: true, message: '请输入用户昵称', type: 'error' }],
  rawPassword: [
    { required: !!id, message: '请输入密码', type: 'error' },
    { min: 6, required: !!id, message: '密码长度要大于6', type: 'error' },
  ],
};
</script>
