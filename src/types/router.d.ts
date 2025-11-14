import 'vue-router';

import type { Component, DefineComponent, FunctionalComponent } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

export {};
declare module 'vue-router' {
  interface RouteMeta {
    title?: string | Record<string, string>;
    icon?: string | Component | FunctionalComponent | DefineComponent;
    expanded?: boolean;
    orderNo?: number;
    hidden?: boolean;
    hiddenBreadcrumb?: boolean;
    single?: boolean;
    keepAlive?: boolean;
    frameSrc?: string;
    frameBlank?: boolean;
    // roleCode?: string; // 前端 roles 控制菜单权限
  }
}
export interface Permission {
  whiteListRouters: string[];
  routers: RouteRecordRaw[];
  removeRoutes: RouteRecordRaw[];
  asyncRoutes: RouteRecordRaw[];
}
