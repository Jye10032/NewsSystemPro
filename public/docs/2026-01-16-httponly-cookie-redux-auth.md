# httpOnly Cookie + Redux 认证方案实现

## 背景

将 Token 存储从 localStorage 改为 httpOnly Cookie，提升安全性（防止 XSS 攻击）。同时使用 Redux 管理用户状态。

## 架构变更

### 之前
```
登录 → 服务端返回 JWT → 前端存 localStorage → 请求时手动添加 Authorization header
```

### 之后
```
登录 → 服务端设置 httpOnly Cookie → 浏览器自动携带 Cookie → Redux 存储用户信息
```

## 修改文件清单

### 后端

| 文件 | 修改内容 |
|------|----------|
| `api/index.cjs` | 添加 cookie-parser、CORS credentials、Cookie 设置/清除 |
| `server.js` | 本地开发服务器同步修改 |

### 前端

| 文件 | 修改内容 |
|------|----------|
| `src/utils/Request.ts` | 添加 `withCredentials: true`，移除 Authorization header |
| `src/modules/login/Login.tsx` | 移除 localStorage 存储 |
| `src/router/AuthRoute.tsx` | localStorage → Redux |
| `src/router/NewsRouter.tsx` | 添加 rights 从 Redux 获取 |
| `src/sandbox/SideMenu.tsx` | localStorage → Redux |
| `src/sandbox/NewsSandBox.tsx` | localStorage → Redux + dispatch |
| `src/sandbox/TopHead.tsx` | 登出调用 API |
| `src/sandbox/home/Home.tsx` | localStorage → Redux |
| `src/modules/news/pages/*.tsx` | localStorage → Redux |
| `src/sandbox/audit-manage/*.tsx` | localStorage → Redux |
| `src/sandbox/user-manage/*.tsx` | localStorage → Redux |
| `src/modules/publish/hooks/usePublish.tsx` | localStorage → Redux |

## 关键代码

### 后端 Cookie 设置

```javascript
// api/index.cjs
res.cookie('jwt', token, {
  httpOnly: true,
  secure: true,        // 生产环境需要 HTTPS
  sameSite: 'none',    // 跨域需要
  maxAge: 7 * 24 * 60 * 60 * 1000
})
```

### 前端 axios 配置

```typescript
// src/utils/Request.ts
axios.defaults.withCredentials = true
```

### Redux 获取用户

```typescript
// 所有组件统一使用
const user = useSelector((state: RootState) => state.user)
```

### 登出流程

```typescript
// src/sandbox/TopHead.tsx
async function logout() {
  await axios.post('/api/auth/logout')
  dispatch({ type: 'clear_user' })
  navigate('/login', { replace: true })
}
```

## 跨域配置

生产环境（Vercel）需要：
- `SameSite=None`
- `Secure=true`
- CORS `credentials: true`
- Origin 白名单

## 新增依赖

- `cookie-parser`: 解析 Cookie
- `redux-persist`: Redux 状态持久化

## 验证方式

1. 登录后检查 DevTools → Application → Cookies，确认有 httpOnly 的 jwt
2. 刷新页面保持登录状态
3. 登出后 Cookie 被清除
4. Network 请求无 Authorization header，有 Cookie

---

_实现日期: 2026-01-16_
