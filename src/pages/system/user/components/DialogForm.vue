<template>
  <t-dialog v-model:visible="formVisible" header="用户" :width="680" :footer="false">
    <template #body>
      <t-form :data="formData" :rules="rules" :label-width="100" @submit="onSubmit">
        <t-form-item label="用户名" name="username">
          <t-input v-model="formData.username" :style="{ width: '480px' }" :disabled="!canEditUsername" />
        </t-form-item>
        <t-form-item label="用户昵称" name="nickname">
          <t-input v-model="formData.nickname" :style="{ width: '480px' }" />
        </t-form-item>
        <t-form-item label="密码" name="rawPassword">
          <t-input v-model="formData.rawPassword" :style="{ width: '480px' }" />
        </t-form-item>
        <t-form-item style="float: right">
          <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
          <t-button theme="primary" type="submit" :loading="submitLoading">确定</t-button>
        </t-form-item>
      </t-form>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
import type { FormRules } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { computed, ref, watch } from 'vue';

import type { SystemUserCreate, SystemUserUpdate } from '@/api/system/model/userModel';
import { userApi } from '@/api/system/userApi';

const props = defineProps({
  id: {
    type: [Number, String] as PropType<number | string>,
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

const formVisible = ref(false);
const formData = ref<SystemUserUpdate>({ ...props.data });
const submitLoading = ref(false);

const rules = computed<FormRules<SystemUserUpdate>>(() => ({
  username: [{ required: true, message: '请输入用户名', type: 'error' }],
  nickname: [{ required: true, message: '请输入用户昵称', type: 'error' }],
  rawPassword: props.id
    ? []
    : [
        { required: true, message: '请输入密码', type: 'error' },
        { min: 6, message: '密码长度不能少于6位', type: 'error' },
      ],
}));

const onSubmit = async () => {
  submitLoading.value = true;
  try {
    if (props.id) {
      await userApi.update(props.id, formData.value);
    } else {
      await userApi.create(formData.value as SystemUserCreate);
    }
    MessagePlugin.success('提交成功');
    formVisible.value = false;
  } finally {
    submitLoading.value = false;
  }
};

const onClickCloseBtn = () => {
  formVisible.value = false;
};

watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);
  },
);

watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
    if (val) {
      formData.value = { ...props.data };
    }
  },
);
</script>
