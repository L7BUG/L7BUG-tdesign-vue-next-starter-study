# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
# 开发（使用 .env.development，/api 代理到 localhost:10086）
npm run dev
# 使用本地 mock 数据开发（无需后端）
npm run dev:mock
# Linux 下开发（不自动打开浏览器）
npm run dev:linux

# 构建（类型检查 + release 构建）
npm run build
# 测试环境构建
npm run build:test
# 官方演示站点构建
npm run build:site

# Lint 与修复
npm run lint
npm run lint:fix
npm run stylelint
npm run stylelint:fix

# 暂无测试，当前为占位符
npm run test
```

包管理器为 **pnpm**（仓库中存在 pnpm-workspace.yaml 和 pnpm-lock.yaml）。

## 架构概述

TDesign Vue Next Starter — 腾讯出品的 Vue 3 后台管理系统模板。技术栈：Vue 3.5 + Vite 7 + Pinia 3 + TypeScript 5.9 + TDesign Vue Next 1.17。

### 路由系统

**固定路由**存放在 `src/router/modules/`，通过 `import.meta.glob` 自动导入。文件名 `homepage.ts` 被视为首页模块，其余为固定路由模块。这些路由在 `src/router/index.ts` 中与 `defaultRouterList`（login、`/` 重定向）合并。

**动态（异步）路由**在登录时从后端 API（`getMenuList`）获取，由 `src/utils/route/index.ts` 中的 `transformObjectToRoute()` 将 `RouteItem[]` 对象转换为 Vue Router 路由。API 返回的组件字符串（如 `"/list/base/index"`）通过 `import.meta.glob('../../pages/**/*.vue')` 解析为实际组件。

API 返回的 **布局类型**（component 字段）：
- `LAYOUT` → 标准侧边栏 + 顶栏布局
- `BLANK` → 空白布局（无外壳）
- `IFRAME` → 内嵌外部 URL

### 权限与认证

`src/permission.ts` 为路由守卫（`beforeEach`）。流程：
1. 检查 `userStore.token` — 若没有 token 且路由不在 `whiteListRouters` 中，重定向到 `/login`
2. 若有 token，请求用户信息，然后从 permission store 构建异步路由
3. 通过 `router.addRoute()` 动态添加异步路由
4. 进入 `/login` 时清空用户状态并恢复路由

Token 通过 `pinia-plugin-persistedstate` 持久化（key: `user`，pick: `['token']`）。Axios 拦截器将 token 注入 `L7-BUG-TOKEN-GUB_7L` 请求头。默认 token 在 `src/store/modules/user.ts` 中硬编码为 `'main_token'`。

### Store 模块（Pinia）

- `user` — 登录/登出、token、用户信息（`getUserInfo` 调用 `userApi.currentUserInfo()`）
- `permission` — `buildAsyncRoutes()` 获取菜单列表，`initRoutes()` 合并到 `routers`，`restoreRoutes()` 移除所有异步路由
- `setting` — 布局配置（side/top 模式、暗色/亮色主题、品牌色、紧凑侧边栏、面包屑、标签路由等）
- `tabs-router` — 管理打开的标签页状态
- `notification` — 通知项

### API 层（`src/utils/request/`）

自定义 Axios 封装（`VAxios` 类）。关键行为：
- **自动前缀**：自动为所有 URL 拼接 `VITE_API_URL_PREFIX`（/api）
- **Host 解析**：`mock` 模式或 `VITE_IS_REQUEST_PROXY` 不为 `'true'` 时不设置 host（请求走 Vite 代理或 mock），否则使用 `VITE_API_URL`
- **响应转换**：`success` 或 `code === '0'` 时返回 `data.data`，否则通过 `MessagePlugin.error` 提示错误
- **重试**：3 次重试，间隔 1 秒
- **Token 注入**：添加 `L7-BUG-TOKEN-GUB_7L` 请求头（可通过 `withToken: false` 关闭）

API 模块在 `src/api/` 下：
- `system/` — 认证（登录/登出）、用户、菜单 API
- `coupon/` — 优惠券模板 API（最近新增的功能）
- `list.ts`、`detail.ts`、`permission.ts` — 遗留/演示 API
- `model/` — 各 API 业务域的 TypeScript 类型定义

### 布局

`src/layouts/index.vue` 根据 setting store 在 `side` 与 `top` 布局间切换。组件位于 `src/layouts/components/`：`LayoutSideNav`、`LayoutHeader`、`LayoutContent`、`MenuContent`、`SideNav`、`Breadcrumb`、`Notice`、`Search`、`Footer`、`FrameContent`、`FrameBlank`。

### 页面目录

| 目录 | 页面 |
|------|------|
| `dashboard/` | 基础仪表盘（图表、统计）、详情仪表盘 |
| `list/` | 基础列表、卡片列表、筛选列表、树状列表 |
| `form/` | 基础表单、分步表单 |
| `detail/` | 基础详情、多卡片详情、数据详情、二级详情 |
| `result/` | 403、404、500、成功、失败、网络错误、维护、浏览器不兼容 |
| `login/` | 登录/注册页 |
| `system/user/` | 用户管理 CRUD |
| `system/menu/` | 菜单管理 |
| `coupon/template-list/` | 优惠券模板列表（最近新增） |

### 国际化（i18n）

使用 `vue-i18n`，从 `src/locales/lang/{zh_CN,en_US}/index.ts` 动态加载语言包。语言偏好持久化到 `localStorage`（key: `tdesign-starter-locale`）。默认语言为 `zh_CN`。

### 样式

使用 Less 和 TDesign 主题系统。通过 `tvision-color` 生成 CSS 变量。品牌色可通过 `settingStore.brandTheme` 配置（默认 `#0052D9`）。支持暗色模式 — `src/config/color.ts` 中定义了 `DARK_CHART_COLORS` 和 `LIGHT_CHART_COLORS`。

### 关键约定

- 路径别名 `@/` → `src/`
- Vue SFC 块顺序强制：`<template>` → `<script>` → `<style>`
- 使用 `<script setup lang="ts">`，模板中组件名为 kebab-case
- import 排序使用 `simple-import-sort`
- 以 `_` 前缀的变量被 `no-unused-vars` 忽略
- 使用 `pnpm` 管理依赖；Node >= 18.18.0

## 项目技能

此项目定义了以下技能（位于 `.claude/skills/`）：

| 技能 | 用途 |
|------|------|
| `update-system-api` | 从 System 后端接口文档（Asciidoctor HTML）自动更新 `src/api/system/` 下的 API 代码 |

### 更新 System API 接口

说"更新 system 接口"即可触发。技能会读取可配置的文档路径（见 `.claude/settings.local.json` 或环境变量）：

- **`SYSTEM_API_DOCS_DIR`**：接口文档目录，默认 `/mnt/d/code/system-parent/system-adapter/target/generated-docs`
- **`SYSTEM_API_PREFIX`**：前端 API url 前缀，**必须与网关到 system 服务的路由一致**，默认 `/system-service`

在不同电脑上使用时，只需在 `.claude/settings.local.json` 中配置 `env.SYSTEM_API_DOCS_DIR` 为实际的文档路径即可。

### 多服务架构约定

- 前端 `url` 前缀与网关服务路由保持一致（如网关将 `/system-service/*` 路由到 system 服务，前端就写 `/system-service/...`）
- 新增服务（如 file-service）时，创建 `src/api/file/` 目录，url 前缀使用 `/file-service`
- 前端目录用简短名（`system`），url 前缀用完整网关路由（`/system-service`），两者可以不同
