# Bug 修复与数据库用户更新

**日期**: 2026-01-15 ~ 2026-01-16
**类型**: Bug 修复、功能优化

---

## 修复内容概览

| 问题 | 文件 | 状态 |
|------|------|------|
| NewsUpdate 布局不一致 | `NewsUpdate.tsx` | ✅ 已修复 |
| 用户表单密码显示问题 | `UserForm.tsx`, `UserList.tsx` | ✅ 已修复 |
| 侧边栏权限过滤 | `SideMenu.tsx` | ✅ 已修复 |
| 请求失败时 loading 不重置 | `Request.ts` | ✅ 已修复 |
| 请求失败无用户提示 | `Request.ts` | ✅ 已修复 |
| Loading 转圈不停止 | `NewsSandBox.tsx` | ✅ 已修复 |
| TopHead 重复 key 警告 | `TopHead.tsx` | ✅ 已修复 |
| 数据库用户名更新 | `db.json`, `news.json` | ✅ 已完成 |

---

## 1. NewsUpdate 统一为单页面布局

**文件**: `src/modules/news/pages/NewsUpdate.tsx`

**问题**: 新闻编辑页面使用 3 步骤的 Steps 组件，与撰写新闻页面布局不一致。

**修复**: 重写为单页面布局，与 NewsAdd 保持一致。

```tsx
// 修改后的结构
<div className={style.editorPage}>
  <div className={style.toolbar}>
    <Select ... />  {/* 分类选择 */}
    <Space>
      <Button onClick={() => handleSave(0)}>保存草稿</Button>
      <Button onClick={() => handleSave(1)}>提交审核</Button>
    </Space>
  </div>
  <Input ... />  {/* 标题输入 */}
  <NewsEditor ... />  {/* 富文本编辑器 */}
</div>
```

**关键变更**:
- 使用 `axios.patch` 替代 `axios.post` 进行更新
- 添加 loading 状态处理数据加载

---

## 2. 用户表单密码改为重置逻辑

**文件**:
- `src/sandbox/user-manage/UserForm.tsx`
- `src/sandbox/user-manage/UserList.tsx`

**问题**: 编辑用户时显示密码字段（即使是哈希值），存在安全隐患。

**修复**:
- 新增用户：显示 `Input.Password` 字段
- 编辑用户：隐藏密码字段，显示"重置密码"按钮

```tsx
// UserForm.tsx 核心逻辑
{!props.isUpdate ? (
  <Form.Item name="password" label="密码" rules={[{ required: true }]}>
    <Input.Password placeholder="请输入密码" />
  </Form.Item>
) : (
  <Form.Item label="密码">
    <Button icon={<KeyOutlined />} onClick={() => setResetModalOpen(true)}>
      重置密码
    </Button>
  </Form.Item>
)}

{/* 重置密码弹窗 */}
<Modal title="重置密码" open={resetModalOpen} onOk={handleResetPassword}>
  <Input.Password value={newPassword} onChange={...} />
</Modal>
```

---

## 3. 侧边栏根据用户权限过滤

**文件**: `src/sandbox/SideMenu.tsx`

**问题**: 侧边栏只检查 `pagepermisson`，不检查用户角色权限。

**修复**: 双重过滤逻辑

```tsx
const checkPagePermission = (item: Right): boolean => {
  // 1. 菜单本身必须配置为显示
  if (item.pagepermisson !== 1) {
    return false
  }
  // 2. 用户必须有该菜单的权限
  const userData = JSON.parse(localStorage.getItem('token') || '{}')
  const userRights: string[] = userData.role?.rights || []
  return userRights.includes(item.key)
}
```

---

## 4. 请求失败时 loading 状态处理

**文件**: `src/utils/Request.ts`

**问题**: axios 响应拦截器的错误处理没有重置 loading 状态。

**修复**:

```tsx
axios.interceptors.response.use(
  function (config) { ... },
  function (error) {
    store.dispatch({ type: 'loading_end' })  // 重置 loading
    // 显示错误提示
    const msg = error.response?.data?.message
      || error.response?.data?.error
      || '请求失败'
    message.error(msg)
    return Promise.reject(error)
  }
)
```

---

## 5. Loading 转圈不停止 (NProgress 问题)

**文件**: `src/sandbox/NewsSandBox.tsx`

**问题**: `NProgress.start()` 在组件每次渲染时调用，但 `NProgress.done()` 只在 mount 时调用一次，导致进度条永远不会结束。

注：原有的 toggle 方式 LoadingReducer 并没有问题，远程仓库上一版本正常工作。

**解决方案**: 从 `NewsSandBox.tsx` 中移除 NProgress，因为已有 Spin 组件处理 loading 状态。

---

## 6. LoadingReducer 优化为计数器方式

虽然不是导致 bug 的原因，但为了更好地处理并发请求，将 LoadingReducer 从 toggle 改为计数器方式：

```typescript
// src/redux/reducers/LoadingReducer.ts
const initState = 0

export default function LoadingReducer(
  preState = initState,
  action: { type: string }
): number {
  switch (action.type) {
    case 'loading_start':
      return preState + 1
    case 'loading_end':
      return Math.max(0, preState - 1)
    default:
      return preState
  }
}
```

**计数器方式原理**:

```
请求1开始: 0 → 1 (显示loading)
请求2开始: 1 → 2
请求1结束: 2 → 1 (仍在loading)
请求2结束: 1 → 0 (隐藏loading)
```

---

## 7. TopHead.tsx 重复 key 警告

**文件**: `src/sandbox/TopHead.tsx`

```typescript
// 修改前
{ key: '/home', title: <Link to="/home"><HomeOutlined /></Link> }

// 修改后
{ key: 'home-icon', title: <Link to="/home"><HomeOutlined /></Link> }
```

---

## 8. 数据库用户更新

将 db.json 中的用户从中文名改为英文名，保留 6 个用户。

### 用户列表

| ID | 用户名 | 角色 | 分类权限 |
|----|--------|------|----------|
| 1 | admin | 超级管理员 (roleId=1) | 全部 (1-6) |
| 2 | tom | 分类管理员 (roleId=2) | 1, 2, 3 |
| 3 | jerry | 分类管理员 (roleId=2) | 4, 5, 6 |
| 4 | alice | 分类编辑 (roleId=3) | 1, 2 |
| 5 | bob | 分类编辑 (roleId=3) | 3, 4 |
| 6 | charlie | 分类编辑 (roleId=3) | 5, 6 |

### 新闻文章重新分配

| 新用户名 | 原用户名 | 文章数 |
|----------|----------|--------|
| admin | admin | 52 |
| tom | 铁锤 | 6 |
| jerry | 轩辕翠花 | 2 |
| alice | 司马海味 | 1 |
| bob | 西门吹灯 | 1 |
| charlie | aaabbb | 1 |

---

## 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `src/modules/news/pages/NewsUpdate.tsx` | 单页面布局 |
| `src/sandbox/user-manage/UserForm.tsx` | 密码重置逻辑 |
| `src/sandbox/user-manage/UserList.tsx` | 传递 userId |
| `src/sandbox/SideMenu.tsx` | 双重权限过滤 |
| `src/utils/Request.ts` | loading 重置 + 错误提示 |
| `src/sandbox/NewsSandBox.tsx` | 移除 NProgress |
| `src/sandbox/TopHead.tsx` | 修复重复 key |
| `src/redux/reducers/LoadingReducer.ts` | toggle → 计数器 |
| `src/router/NewsRouter.tsx` | isLoading 判断逻辑 |
| `src/types/index.ts` | isLoading 类型改为 number |
| `db/db.json` | 用户更新为英文名 |
| `db/news.json` | 文章作者重新分配 |

---

## 确认无需修改的项目

### 菜单管理路由逻辑

**文件**: `src/router/NewsRouter.tsx`

**当前逻辑**:

```tsx
function checkRoute(item: Right): boolean {
  return !!LocalRouterMap[item.key] && !!(item.pagepermisson || item.routepermisson)
}
```

**结论**: 当前行为正确
- `pagepermisson=0` 只隐藏菜单，URL 仍可访问（如果用户有权限）
- 这是预期行为，无需修改

### 配置按钮显示逻辑

**文件**: `src/sandbox/right-manage/RightList.tsx`

**结论**: 代码逻辑正确
- 只有 `routepermisson` 的菜单项（如新闻预览/更新）配置按钮被禁用

---

## 技术讨论记录

### Vercel Serverless 架构说明

- 项目后端使用 Vercel Serverless Functions 部署
- 数据存储在内存中 (json-server)
- 实例闲置后会被回收，数据重置
- 多实例间数据不共享

### 适用场景

- 适合: Demo、学习项目、原型
- 不适合: 生产环境 (需迁移到真实数据库)

### 面试回答要点

1. 技术选型理由: 快速搭建、零成本、专注前端
2. 知道局限性: 内存存储、无持久化、多实例不一致
3. 生产方案: PostgreSQL/MongoDB + Prisma ORM

---

## 后续建议

1. 考虑将权限数据存储到 Redux，避免频繁读取 localStorage
2. 角色权限变更后可以通过事件机制实时更新侧边栏
3. 可以添加权限变更的审计日志
