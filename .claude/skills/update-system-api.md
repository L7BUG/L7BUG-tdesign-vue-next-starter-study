---
name: update-system-api
description: 解析 System API 接口文档（Asciidoctor HTML），自动更新 src/api/system/ 下的 TypeScript API 代码和类型定义。
---

# 更新 System API 接口

本技能读取 System 后端的 Asciidoctor HTML 接口文档，自动生成/更新 `src/api/system/` 目录下的 TypeScript API 文件。

## 架构约定：请求链路与多服务规划

### 请求 URL 构成

前端代码中写的 `url` 字段是相对于 Vite 代理的路径。完整链路：

```
前端代码 url                  例: /system-service/auth/login
  ↓ Axios 加 urlPrefix (/api)
/api/system-service/auth/login
  ↓ Vite proxy → http://127.0.0.1:3000/  （开发环境）
http://127.0.0.1:3000/api/system-service/auth/login
  ↓ 网关路由
system-service 后端 /auth/login
```

### 多服务命名约定

| 元素 | 含义 | 示例 |
|------|------|------|
| 网关路由前缀 | 网关根据第一段路径路由到对应微服务 | `/system-service`、`/file-service` |
| 前端 `url` 路径 | 与网关路由前缀**保持一致**，确保不经过二次映射 | `/system-service/auth/login` |
| 前端目录 | `src/api/{service}/` 用简短名区分 | `src/api/system/`、`src/api/file/` |

**规则：前端 API 代码中的 `url` 前缀必须与网关服务路由一致**。即网关将 `/system-service/*` 路由到 system 服务，前端就写 `/system-service/auth/login`，而不是 `/system/auth/login`。

这样新增 `/file-service` 时：
1. 创建 `src/api/file/` 目录
2. 编写对应的 API 文件，url 前缀使用 `/file-service`
3. 不会与现有 system 的 `/system-service` 冲突

### 代理层说明

开发时 Vite 将 `/api` 转发到 `http://127.0.0.1:3000/`。端口 3000 上的服务（mock 或另一个代理）负责将 `/api/system-service/...` 转发到网关 `localhost:10086`。如果端口 3000 上的服务不做路径改写，那前端 url 前缀就是透传到网关的，所以**前端 url 前缀必须与网关路由匹配**。

## 可配置参数

可存放在 `.claude/settings.local.json` 的 `env` 中：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SYSTEM_API_DOCS_DIR` | `/mnt/d/code/system-parent/system-adapter/target/generated-docs` | 接口文档 HTML 所在目录 |
| `SYSTEM_API_PREFIX` | `/system-service` | 前端 url 前缀，**必须与网关到 system 服务的路由一致** |

> 不同电脑只需修改 `SYSTEM_API_DOCS_DIR`；同一个电脑上 `SYSTEM_API_PREFIX` 一般不变。如果要对接其他服务（如 file-service），创建新技能，使用对应服务的网关前缀（如 `/file-service`）。

## 执行步骤

### 第一步：读取文档

读取 `SYSTEM_API_DOCS_DIR/index.html`，解析 Asciidoctor 生成的 HTML 结构。

文档结构：
- `#header h1` → 文档标题
- `div.sect1 h2` → 接口大类（如"认证接口"、"菜单接口"）
- `div.sect2 h3` → 单个接口（如"登录"、"创建菜单"）
- `div.sect3 h4` → 接口详情（Curl 请求 / 请求字段 / 响应字段 / 路径参数 / 查询参数 / HTTP 响应）

### 第二步：提取接口信息

对每个 `div.sect2`（单个接口），提取：

1. **接口名称**：`h3` 文本内容
2. **HTTP 方法**：从 Curl 请求块中的 `-X POST|GET|PUT|DELETE` 提取
3. **URL 路径**：从 Curl 请求中的 URL 提取路径部分（如 `/auth/login`、`/menu/root`、`/user?username=admin`）
4. **路径参数**：从"路径参数"表格提取（如 `/menu/{id}` 中的 `id`）
5. **查询参数**：从"查询参数"表格提取
6. **请求体字段**：从"请求字段"表格提取（非路径参数、非查询参数的请求字段表）
7. **响应字段**：从"响应字段"表格提取 `Path`、`Type`、`Description`
8. **HTTP 响应示例**：从"HTTP 响应"代码块提取 JSON，用于推断实际类型

### 第三步：确定文件归属

根据接口大类（`div.sect1 h2`）确定写入哪个文件：

| 接口大类 | 目标文件 | 说明 |
|----------|----------|------|
| 认证接口 | `src/api/system/auth.ts` | 登录、登出、获取当前用户、获取菜单列表 |
| 菜单接口 | `src/api/system/menuApi.ts` | CRUD、排序 |
| 角色接口 | `src/api/system/roleApi.ts` | CRUD |
| 用户接口 | `src/api/system/userApi.ts` | 分页查询、CRUD |

对应的类型文件：
| 类型 | 目标文件 |
|------|----------|
| 认证相关 | `src/api/system/model/authModel.ts` |
| 菜单相关 | `src/api/system/model/menuModel.ts` |
| 角色相关 | `src/api/system/model/roleModel.ts` |
| 用户相关 | `src/api/system/model/userModel.ts` |

### 第四步：生成代码

遵循项目现有模式生成代码：

**API 文件模式**（以 `menuApi.ts` 为参考）：

```typescript
import type { XxxRequest, XxxResponse } from '@/api/system/model/xxxModel';
import { request } from '@/utils/request';

const api = {
  base: '/system-service/xxx',
  // 其他路径常量
};

class XxxApi {
  public async methodName(params: XxxRequest): Promise<XxxResponse> {
    return request.get<XxxResponse>({
      url: api.base,
      params,
    });
  }
}
const xxxApi = new XxxApi();
export { xxxApi };
```

**关键规范：**
- 所有 API URL 加上 `SYSTEM_API_PREFIX` 前缀（默认 `/system-service`），确保与网关路由一致
- 使用 class 模式，导出单例实例
- 路径常量放在 `api` 对象中，以 `base` 为主路径
- 请求体（POST/PUT）使用 `params` 字段传递（遵循项目现有 Axios 封装约定）
- 路径参数用模板字符串拼接：`` `${api.base}/${id}` ``
- import 类型从对应的 model 文件导入

**Model 文件模式：**

```typescript
export interface XxxRequest {
  name?: string;
}

export interface XxxResponse {
  id: string;
  name: string;
}
```

**类型映射规则：**
| HTML 文档类型 | TypeScript 类型 |
|---------------|-----------------|
| `String` | `string` |
| `Number` | `number` |
| `Boolean` | `boolean` |
| `Array` | `T[]`（根据 data path 推断元素类型） |
| `Null` | `string \| null` 或可选字段 |
| `Object` | 展开为具体 interface |
| `"SUCCESS"` | `string` |

**命名规则：**
- 接口名称 → 类型前缀（如"分页查询用户" → `SystemUser`）
- 请求体类型 → `{Prefix}Request` 或 `{Prefix}Update`
- 响应体类型 → `{Prefix}Response` 或 `{Prefix}Info`
- 列表查询响应中 `data` 为 `PageData<T>` 时，`T` 为列表元素类型

### 第五步：review 与输出

生成代码后：
1. 对比新旧文件，列出新增/修改/删除的接口
2. 确认 import 正确、类型引用存在
3. 确保 `SYSTEM_API_PREFIX` 前缀正确
4. 如果旧代码使用的前缀（如 `/system`）与新前缀（如 `/system-service`）不一致，统一使用新前缀

## 接口文档 HTML 解析指南

### 提取 Curl 中的 HTTP 方法和 URL

```html
<pre class="highlight"><code class="language-bash" data-lang="bash">$ curl 'http://localhost:8080/auth/login' -i -X POST \
    -H 'Content-Type: application/json' \
    -d '{"username":"admin","password":"123456"}'</code></pre>
```

- 方法：`-X POST` → `POST`（没有 `-X` 时默认 `GET`）
- URL 路径：`/auth/login`
- 请求体示例：`-d '{...}'` 部分

### 提取请求/响应字段表

表格结构：
- `Path` 列：字段路径（如 `data.id`、`username`、`data.data[].nickname`）
- `Type` 列：类型
- `Description` 列：中文描述

对于 `data.xxx` 前缀的响应字段，去掉 `data.` 前缀后映射到 TypeScript 类型。
对于嵌套列表 `data.data[]`，提取为页面数据类型 `PageData<T>`，`T` 为 `data.data[].xxx` 的字段。

### 区分子表的类型

- **路径参数表**：标题为"路径参数"，只有 Parameter/Description 两列
- **查询参数表**：标题为"查询参数"，同样只有 Parameter/Description 两列
- **请求字段表**：标题为"请求字段"，有 Path/Type/Description 三列 — 这些是请求体
- **响应字段表**：标题为"响应字段"，有 Path/Type/Description 三列 — 这些是响应体

注意：同一个 `div.sect3` 中的"请求字段"不会同时是路径参数或查询参数 — 路径参数和查询参数已经是 URL 的一部分，请求体是 `-d '{...}'` 中的 JSON。

### 特殊接口判断

- **获取当前用户信息**（`/user/current-user-info` → `GET`）：归属认证大类，但 URL 是 `/user/...`。目标文件仍是 `auth.ts`（因为它在认证接口章节下），但用 `SYSTEM_API_PREFIX + '/user/...'` 的方式拼接 URL。
- **获取菜单列表**（`/menu-list` → `GET`）：在认证接口章节下，但返回菜单数据。同样写入 `auth.ts` 对应的位置。

## 实现注意事项

1. **不要修改 `src/utils/request/`** 下的请求封装。
2. **保持与现有代码风格一致**：class + 单例模式。
3. **泛型分页类型 `PageData<T>`** 已在 `userModel.ts` 中定义，其他 model 文件如需使用分页，直接 import 即可。
4. **响应字段 `data` 为 null** 时，返回类型使用 `void` 或 `boolean`（根据实际语义判断）。
5. **文档路径使用绝对路径**，在 WSL 中可能是 `/mnt/d/...`，在 Linux 中直接是 `/home/...`。
6. 如果某些接口在当前代码中已存在且与文档一致，只更新变化的部分，不做无意义的格式重排。
7. **url 前缀**始终使用 `SYSTEM_API_PREFIX`，如果现有代码用不同前缀，一并更新。
