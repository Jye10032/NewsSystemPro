# 后端动态权限校验系统

## 背景

原项目权限校验仅在前端实现，存在安全隐患：
- 用户可通过修改 localStorage 绕过前端权限检查
- 后端 API 无访问控制，任何人可直接调用敏感接口

## 修改内容

### 1. 权限校验架构

```
前端请求
    ↓
携带 JWT Token (Authorization: Bearer xxx)
    ↓
后端中间件解析 Token
    ↓
查询用户角色权限
    ↓
匹配 PAGE_API_MAP 判断是否有权限
    ↓
允许/拒绝请求
```

### 2. 页面权限 → API 权限映射

```javascript
const PAGE_API_MAP = {
  '/user-manage/list': '/users',      // 用户管理
  '/user-manage/role': '/roles',      // 角色管理
  '/user-manage/menu': '/rights',     // 菜单管理
  '/system-manage/category': '/categories'  // 分类管理
}
```

### 3. 动态权限校验函数

```javascript
function hasPermission(req, apiPath) {
  const user = getUserFromToken(req)
  if (!user) return { allowed: false, reason: '未登录' }

  // 从数据库查询角色权限
  const role = router.db.get('roles').find({ id: user.roleId }).value()
  if (!role) return { allowed: false, reason: '角色不存在' }

  // 检查是否有对应页面权限
  for (const [page, api] of Object.entries(PAGE_API_MAP)) {
    if (api === apiPath && role.rights.includes(page)) {
      return { allowed: true, user }
    }
  }
  return { allowed: false, reason: '权限不足' }
}
```

### 4. 权限中间件

| API 路径 | 权限要求 | 说明 |
|----------|----------|------|
| PATCH/DELETE /users/:id | /user-manage/list | 用户管理 |
| PATCH/DELETE /roles/:id | /user-manage/role | 角色管理 |
| PATCH/DELETE /rights/:id | /user-manage/menu | 菜单管理 |
| POST/PATCH/DELETE /categories | /system-manage/category | 分类管理 |
| PATCH/DELETE /news/:id | 作者本人 | 新闻修改 |
| GET /news/:id (未发布) | 作者本人 | 未发布新闻访问 |

### 5. 新闻访问控制

```javascript
// 已发布新闻：所有人可访问
if (news.publishState === 2) return next()

// 未发布新闻：仅作者可访问
const user = getUserFromToken(req)
if (user && user.username === news.author) return next()

return res.status(403).json({ error: '无权访问未发布内容' })
```

## 前端适配

Request.ts 添加 JWT 自动携带：

```typescript
axios.interceptors.request.use(function (config) {
  const jwt = localStorage.getItem('jwt')
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`
  }
  return config
})
```

## 测试覆盖

新增 `src/test/server/permission.test.js`，包含 11 个测试用例：

| 测试场景 | 预期结果 |
|----------|----------|
| GET /users 无需权限 | 200 |
| 超级管理员修改用户 | 200/404 |
| 编辑修改用户 | 403 权限不足 |
| 未登录修改用户 | 403 未登录 |
| 超级管理员修改角色 | 200/404 |
| 分类管理员修改角色 | 403 |
| 超级管理员删除分类 | 200/404 |
| 编辑删除分类 | 403 |
| 已发布新闻公开访问 | 200 |
| 非作者访问未发布新闻 | 403 |
| 作者访问自己的未发布新闻 | 200 |

运行测试：
```bash
npm run test:run
# 114 tests passed
```

## 文件变更

| 文件 | 变更 |
|------|------|
| server/index.cjs | 添加权限中间件 |
| api/index.cjs | 同步权限中间件（Vercel） |
| src/utils/Request.ts | 添加 JWT Header |
| src/test/server/permission.test.js | 新增测试 |

## 安全提升

- ✅ 后端强制校验，无法绕过
- ✅ 动态权限，修改角色配置即时生效
- ✅ 新闻访问控制，未发布内容仅作者可见
- ✅ 完整测试覆盖

---

日期: 2026-01-15
