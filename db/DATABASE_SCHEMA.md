# 数据库结构文档 (Database Schema Documentation)

## 概述

本文档详细描述了 NewsSystemPro 项目中使用的数据库结构和数据格式。

---

## 数据库文件

- **主数据库**: `db/db.json`
- **新闻数据**: `db/news.json`

---

## 后端架构

### Express + json-server 中间件方案

后端使用 Express 作为主框架，将 json-server 作为中间件集成，实现：
- 自定义路由（JWT 认证）优先处理
- json-server 处理数据 CRUD 和查询语法

### 服务器入口

```javascript
// server/index.cjs
const express = require('express')
const jsonServer = require('json-server')

const app = express()

// 1. 自定义路由优先
app.use('/api/auth', authRoutes)    // JWT 登录/注册
app.use('/api/users', usersRoutes)  // 用户管理 (需认证)

// 2. json-server 中间件
const router = jsonServer.router(mergedData)
app.use(router)
```

### 数据合并与分离写入

启动时将 `db.json` 和 `news.json` 合并到内存，写入时自动分离保存：

```javascript
// 合并数据
const mergedData = { ...dbData, news: newsData }

// 自定义写入逻辑
router.db._.mixin({
  write: function() {
    const { news, ...rest } = router.db.getState()
    fs.writeFileSync(newsPath, JSON.stringify(news, null, 2))
    fs.writeFileSync(dbPath, JSON.stringify(rest, null, 2))
  }
})
```

### API 路由分配

| 路由 | 处理方 | 说明 |
|------|--------|------|
| `POST /api/auth/login` | Express | JWT 登录 |
| `POST /api/auth/register` | Express | 用户注册 |
| `GET /api/users` | Express | 用户列表 (需认证) |
| `/news` | json-server | 新闻 CRUD + 查询 |
| `/roles` | json-server | 角色管理 |
| `/rights` | json-server | 权限管理 |
| `/categories` | json-server | 分类管理 |
| `/regions` | json-server | 地区管理 |
| `/children` | json-server | 子权限管理 |

### 启动命令

```bash
npm start          # 前端 + 后端
npm run server     # 只启动后端
npm run server:watch  # 后端 (热重载)
```

---

## 数据表结构

### 1. users（用户表）

用户账户信息表，存储系统用户的基本信息和权限配置。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | Number | ✅ | 用户唯一标识 | `1` |
| `username` | String | ✅ | 用户名（登录名） | `"admin"` |
| `password` | String | ✅ | 密码（bcrypt 加密） | `"$2a$10$..."` |
| `roleState` | Boolean | ✅ | 角色状态（是否启用） | `true` |
| `default` | Boolean | ✅ | 是否为默认用户 | `true` |
| `roleId` | Number | ✅ | 关联角色ID（外键） | `1` |
| `allowedCategoryIds` | Array&lt;Number&gt; | ✅ | 允许管理的分类ID列表 | `[1, 2, 3, 4, 5, 6]` |

#### 数据示例

```json
{
  "id": 1,
  "username": "admin",
  "password": "$2a$10$hashedPasswordExample",
  "roleState": true,
  "default": true,
  "roleId": 1,
  "allowedCategoryIds": [1, 2, 3, 4, 5, 6]
}
```

#### 关系说明

- `roleId` → `roles.id`（多对一）
- `allowedCategoryIds` → `categories.id`（多对多）

---

### 2. roles（角色表）

角色权限配置表，定义不同角色的权限范围。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | Number | ✅ | 角色唯一标识 | `1` |
| `roleName` | String | ✅ | 角色名称 | `"超级管理员"` |
| `roleType` | Number | ✅ | 角色类型（1=超管，2=分类管理员，3=编辑） | `1` |
| `rights` | Array&lt;String&gt; | ✅ | 权限路由列表 | `["/home", "/user-manage", ...]` |

#### 数据示例

```json
{
  "id": 1,
  "roleName": "超级管理员",
  "roleType": 1,
  "rights": [
    "/user-manage/add",
    "/user-manage/delete",
    "/user-manage/update",
    "/user-manage/list",
    "/right-manage",
    "/home"
  ]
}
```

#### 角色类型说明

| roleType | 角色名称 | 权限范围 |
|----------|---------|---------|
| `1` | 超级管理员 | 全部权限 |
| `2` | 分类管理员 | 用户管理、新闻管理、审核管理、发布管理 |
| `3` | 分类编辑 | 新闻管理、审核列表、发布管理 |

---

### 3. children（子权限表）

详细的子权限配置，定义具体操作权限。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | Number | ✅ | 权限唯一标识 | `3` |
| `title` | String | ✅ | 权限名称 | `"添加用户"` |
| `rightId` | Number | ✅ | 父级权限ID | `2` |
| `key` | String | ✅ | 权限路由 | `"/user-manage/add"` |
| `grade` | Number | ✅ | 权限等级（2=子权限） | `2` |
| `pagepermisson` | Number | ❌ | 页面权限标识 | `1` |
| `routepermisson` | Number | ❌ | 路由权限标识 | `1` |

#### 数据示例

```json
{
  "id": 3,
  "title": "添加用户",
  "rightId": 2,
  "key": "/user-manage/add",
  "grade": 2
}
```

#### 权限类型说明

- `pagepermisson: 1` - 页面级权限（需要在侧边栏显示）
- `routepermisson: 1` - 路由级权限（动态路由，不在侧边栏显示）

---

### 4. rights（父权限表）

一级权限（菜单）配置。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | Number | ✅ | 权限唯一标识 | `1` |
| `title` | String | ✅ | 权限名称 | `"首页"` |
| `key` | String | ✅ | 权限路由 | `"/home"` |
| `pagepermisson` | Number | ✅ | 页面权限标识 | `1` |
| `grade` | Number | ✅ | 权限等级（1=父权限） | `1` |

#### 数据示例

```json
{
  "id": 1,
  "title": "首页",
  "key": "/home",
  "pagepermisson": 1,
  "grade": 1
}
```

---

### 5. categories（新闻分类表）

新闻分类配置表。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | Number | ✅ | 分类唯一标识 | `1` |
| `title` | String | ✅ | 分类名称（显示用） | `"时事新闻"` |
| `value` | String | ✅ | 分类值（存储用） | `"时事新闻"` |

#### 数据示例

```json
{
  "id": 1,
  "title": "时事新闻",
  "value": "时事新闻"
}
```

#### 现有分类

1. 时事新闻
2. 政治
3. 社会
4. 军事
5. 外交
6. 奇文
7. 图文

---

### 6. regions（地区表）

地区分类配置表。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | Number | ✅ | 地区唯一标识 | `1` |
| `title` | String | ✅ | 地区名称（显示用） | `"亚洲"` |
| `value` | String | ✅ | 地区值（存储用） | `"亚洲"` |

#### 数据示例

```json
{
  "id": 1,
  "title": "亚洲",
  "value": "亚洲"
}
```

#### 现有地区

1. 亚洲
2. 欧洲
3. 北美洲
4. 南美洲
5. 非洲
6. 大洋洲
7. 南极洲

---

### 7. news（新闻表，位于 `db/news.json`）

新闻内容主表，存储所有新闻文章数据。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | Number | ✅ | 新闻唯一标识 | `1` |
| `title` | String | ✅ | 新闻标题 | `"每日新闻"` |
| `categoryId` | Number | ✅ | 分类ID（外键） | `3` |
| `content` | String | ✅ | 新闻内容（HTML格式） | `"<p>新闻内容</p>"` |
| `author` | String | ✅ | 作者用户名 | `"admin"` |
| `roleId` | Number | ✅ | 作者角色ID | `1` |
| `auditState` | Number | ✅ | 审核状态 | `2` |
| `publishState` | Number | ✅ | 发布状态 | `2` |
| `createTime` | Number | ✅ | 创建时间（时间戳） | `1615777743864` |
| `star` | Number | ✅ | 点赞数 | `1038` |
| `view` | Number | ✅ | 浏览量 | `2064` |
| `publishTime` | Number | ❌ | 发布时间（时间戳） | `1615778496314` |

#### 数据示例

```json
{
  "id": 1,
  "title": "每日新闻",
  "categoryId": 3,
  "content": "<p>新闻内容...</p>",
  "author": "admin",
  "roleId": 1,
  "auditState": 2,
  "publishState": 2,
  "createTime": 1615777743864,
  "star": 1038,
  "view": 2064,
  "publishTime": 1615778496314
}
```

#### 状态码说明

**审核状态 (auditState)**

| 值 | 状态 | 说明 |
|----|------|------|
| `0` | 未审核 | 草稿状态，等待提交审核 |
| `1` | 审核中 | 已提交，等待审核 |
| `2` | 已通过 | 审核通过 |
| `3` | 未通过 | 审核驳回 |

**发布状态 (publishState)**

| 值 | 状态 | 说明 |
|----|------|------|
| `0` | 未发布 | 未发布或草稿 |
| `1` | 待发布 | 审核通过，等待发布 |
| `2` | 已发布 | 已发布上线 |
| `3` | 已下线 | 已撤回/下线 |

---

## 数据关系图

```
users (用户)
  ├─ roleId → roles.id (角色)
  └─ allowedCategoryIds → categories.id (分类)

roles (角色)
  └─ rights → rights.key & children.key (权限)

children (子权限)
  └─ rightId → rights.id (父权限)

news (新闻)
  ├─ categoryId → categories.id (分类)
  ├─ author → users.username (作者)
  └─ roleId → roles.id (角色)
```

---

## 数据统计

### 数据库总览 (db.json)

| 表名 | 记录数 | 说明 |
|------|--------|------|
| users | 10 | 用户账户 |
| roles | 3 | 系统角色 |
| children | 23 | 子权限 |
| rights | 6 | 父权限 |
| categories | 7 | 新闻分类 |
| regions | 7 | 地区分类 |

### 新闻数据 (news.json)

- **总新闻数**: 66 篇
- **新闻状态分布**:
  - 已发布 (publishState=2): 约 15 篇
  - 已下线 (publishState=3): 约 5 篇
  - 未发布 (publishState=0): 约 46 篇

---

## API 查询示例

### 1. 用户登录查询

```http
GET /users?_expand=role&username=admin&password=123456&roleState=true
```

**说明**:
- `_expand=role` - 自动展开 `roleId` 外键，返回完整角色信息
- `roleState=true` - 只查询已启用的用户

**返回示例**:

```json
[
  {
    "id": 1,
    "username": "admin",
    "password": 123456,
    "roleState": true,
    "roleId": 1,
    "role": {
      "id": 1,
      "roleName": "超级管理员",
      "roleType": 1,
      "rights": ["/home", "/user-manage", ...]
    }
  }
]
```

### 2. 查询用户的新闻

```http
GET /news?author=admin&_sort=createTime&_order=desc
```

### 3. 查询指定分类的新闻

```http
GET /news?categoryId=1&publishState=2
```

---

## json-server 查询语法

| 参数 | 说明 | 示例 |
|------|------|------|
| `_expand` | 展开外键（单个） | `_expand=role` |
| `_embed` | 嵌入子项（多个） | `_embed=posts` |
| `_sort` | 排序字段 | `_sort=createTime` |
| `_order` | 排序顺序 | `_order=desc` |
| `_limit` | 限制返回数量 | `_limit=10` |
| `_page` | 分页页码 | `_page=1` |
| `_start` | 起始索引 | `_start=0` |
| `_end` | 结束索引 | `_end=10` |
| `q` | 全文搜索 | `q=搜索关键词` |

---

## 注意事项

### 1. 数据类型统一 ✅

- ✅ `password` 字段：已统一为 String 类型
- ✅ `categoryId` 字段：已统一为 Number 类型

### 2. 安全机制

- ✅ JWT 认证已实现（`/api/auth/login` 返回 token）
- ✅ 密码使用 bcryptjs 加密存储
- ⚠️ 缺少请求频率限制
- ⚠️ 部分旧数据密码仍为明文（可运行 `npm run hash-passwords` 迁移）

### 3. 数据完整性

- 部分新闻的 `content` 字段为空字符串
- 部分新闻的 `publishTime` 字段缺失
- `allowedCategoryIds` 可能包含不存在的分类ID

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|---------|
| 2025-12-24 | 1.2.0 | 后端重构为 Express + json-server 中间件方案，添加 JWT 认证 |
| 2025-11-25 | 1.1.0 | 统一数据类型：password → String, categoryId → Number |
| 2025-11-25 | 1.0.0 | 初始版本，完整记录数据库结构 |

---

**文档生成时间**: 2025-12-24
**项目**: NewsSystemPro
**作者**: Claude Code
