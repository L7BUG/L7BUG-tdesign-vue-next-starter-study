import { defineStore } from 'pinia';
import { MessagePlugin } from 'tdesign-vue-next';

import { loginByPassword, logout } from '@/api/system/auth';
import type { LoginRequest } from '@/api/system/model/authModel';
import type { UserInfo } from '@/api/system/model/userModel';
import { currentUserInfo } from '@/api/system/userApi';
import { usePermissionStore } from '@/store';

const InitUserInfo: UserInfo = {
  id: '',
  username: '',
  nickname: '',
  authorities: [],
};
export const useUserStore = defineStore('user', {
  state: () => ({
    token: 'main_token', // 默认token不走权限
    userInfo: { ...InitUserInfo },
  }),
  getters: {
    authorities: (state) => {
      return state.userInfo?.authorities;
    },
  },
  actions: {
    async login(userInfo: LoginRequest) {
      this.token = await loginByPassword(userInfo.username, userInfo.password);
    },
    async getUserInfo() {
      this.userInfo = await currentUserInfo();
      return this.userInfo;
    },
    async logout() {
      if (this.token) {
        await logout();
        await MessagePlugin.success(`[${this.userInfo.nickname}]已退出登录`);
      }
      this.token = '';
      this.userInfo = <UserInfo>{
        id: '',
        username: '',
        nickname: '',
        authorities: [],
      };
    },
  },
  persist: {
    afterHydrate: () => {
      console.log('==========================afterHydrateafterHydrateafterHydrateafterHydrate=======================');
      const permissionStore = usePermissionStore();
      permissionStore.initRoutes().finally();
    },
    key: 'user',
    pick: ['token'],
  },
});
