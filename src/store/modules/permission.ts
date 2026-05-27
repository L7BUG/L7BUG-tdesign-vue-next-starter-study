import cloneDeep from 'lodash/cloneDeep';
import { defineStore } from 'pinia';

import type { RouteItem } from '@/api/model/permissionModel';
import { getMenuList } from '@/api/permission';
import router, { fixedRouterList, homepageRouterList } from '@/router';
import { store } from '@/store';
import type { Permission } from '@/types/router';
import { transformObjectToRoute } from '@/utils/route';

function stripButtonNodes(routes: RouteItem[]) {
  function walk(nodes: RouteItem[]) {
    if (!nodes) return;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (node.type?.toUpperCase() === 'BUTTON') {
        nodes.splice(i, 1);
      } else if (node.children) {
        walk(node.children);
        if (node.children.length === 0) {
          delete node.children;
        }
      }
    }
  }

  walk(routes);
}

export const usePermissionStore = defineStore('permission', {
  state: () =>
    <Permission>{
      whiteListRouters: ['/login'],
      routers: [],
      removeRoutes: [],
      asyncRoutes: [],
    },
  actions: {
    async initRoutes() {
      const accessedRouters = this.asyncRoutes;

      // 在菜单展示全部路由
      this.routers = cloneDeep([...homepageRouterList, ...accessedRouters, ...fixedRouterList]);
      // 在菜单只展示动态路由和首页
      // this.routers = [...homepageRouterList, ...accessedRouters];
      // 在菜单只展示动态路由
      // this.routers = [...accessedRouters];
    },
    async buildAsyncRoutes() {
      try {
        // 发起菜单权限请求 获取菜单列表
        const asyncRoutes: Array<RouteItem> = await getMenuList();
        stripButtonNodes(asyncRoutes);
        this.asyncRoutes = transformObjectToRoute(asyncRoutes);
        await this.initRoutes();
        return this.asyncRoutes;
      } catch (error) {
        throw new Error("Can't build routes", error);
      }
    },
    async restoreRoutes() {
      // 不需要在此额外调用initRoutes更新侧边导肮内容，在登录后asyncRoutes为空会调用
      this.asyncRoutes.forEach((item) => {
        if (item.name) {
          router.removeRoute(item.name);
        }
      });
      this.asyncRoutes = [];
    },
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}
