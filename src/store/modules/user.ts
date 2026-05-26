import { defineStore } from 'pinia';
import { MessagePlugin } from 'tdesign-vue-next';

import { authApi } from '@/api/system/auth';
import type { CurrentUserInfo } from '@/api/system/model/userModel';
import { usePermissionStore } from '@/store';

const InitUserInfo: CurrentUserInfo = {
  id: 0,
  username: '',
  nickname: '',
  authorities: [],
};
const useUserStore = defineStore('user', {
  state: () => ({
    token: 'main_token', // 默认token不走权限
    userInfo: { ...InitUserInfo },
  }),
  getters: {
    authorities: (state) => {
      return state.userInfo?.authorities;
    },
    userId: (_state) => {},
  },
  actions: {
    async login(userInfo: { username: string; password: string }) {
      this.token = await authApi.login(userInfo);
    },
    async getUserInfo() {
      this.userInfo = await authApi.getCurrentUserInfo();
      return this.userInfo;
    },
    async logout() {
      if (this.token) {
        await authApi.logout();
        await MessagePlugin.success(`[${this.userInfo.nickname}]已退出登录`);
      }
      this.token = '';
      this.userInfo = <CurrentUserInfo>{
        id: 0,
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
export default useUserStore;
