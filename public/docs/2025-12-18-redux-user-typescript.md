# Redux 用户状态管理 + TypeScript 迁移

日期：2025-12-18

## 背景

原项目使用 `localStorage.getItem('token')` 在各组件中读取用户信息，存在以下问题：
1. 每次读取都需要 `JSON.parse()`，重复且低效
2. 用户状态变化时组件无法自动更新
3. 代码分散在 20+ 个文件中，难以维护

## 改动目标

1. 使用 Redux 统一管理用户状态
2. 利用 redux-persist 自动持久化（项目已有）
3. 核心文件迁移到 TypeScript

## 新增文件

### 1. tsconfig.json
TypeScript 配置文件，启用 `allowJs: true` 支持 JS/TS 混合开发。

### 2. tsconfig.node.json
Vite 配置文件的 TypeScript 支持。

### 3. src/types/index.ts
类型定义文件：

```typescript
// 用户角色
export interface Role {
  id: number
  roleName: string
  roleType: number
  rights: string[]
}

// 用户信息
export interface User {
  id: number
  username: string
  password: string
  roleState: boolean
  default: boolean
  region: string
  roleId: number
  role: Role
  allowedCategoryIds?: number[]
}

// Redux State
export interface RootState {
  collapsible: boolean
  isLoading: boolean
  user: User | null
}

// Action Types
export type UserAction =
  | { type: 'set_user'; payload: User }
  | { type: 'clear_user' }
```

### 4. src/redux/reducers/UserReducer.ts

```typescript
import { User, UserAction } from '../../types'

const initState: User | null = null

export default function UserReducer(
  preState: User | null = initState,
  action: UserAction
): User | null {
  switch (action.type) {
    case 'set_user':
      return action.payload
    case 'clear_user':
      return null
    default:
      return preState
  }
}
```

## 修改文件

### 1. src/redux/store.js

注册 UserReducer：

```javascript
import user from './reducers/UserReducer'

const AllReducers = combineReducers({
  collapsible,
  isLoading,
  user  // 新增
})
```

### 2. src/login/Login.js → Login.tsx

登录成功后使用 dispatch 存储用户信息：

```typescript
import { useDispatch } from 'react-redux'

const dispatch = useDispatch()

// 登录成功后
dispatch({ type: 'set_user', payload: userData })
// 保留 localStorage 兼容旧代码
localStorage.setItem('token', JSON.stringify(userData))
```

### 3. src/sandbox/TopHead.js → TopHead.tsx

使用 useSelector 读取用户信息，退出时 dispatch 清除：

```typescript
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../types'

const user = useSelector((state: RootState) => state.user)
const dispatch = useDispatch()

// 退出登录
function logout() {
  dispatch({ type: 'clear_user' })
  localStorage.removeItem('token')
  navigate('/login', { replace: true })
}
```

### 4. vite.config.js

更新 esbuild 配置支持 TypeScript：

```javascript
esbuild: {
  loader: 'tsx',
  include: /src\/.*\.[jt]sx?$/,
},
optimizeDeps: {
  esbuildOptions: {
    loader: {
      '.js': 'jsx',
      '.ts': 'tsx',
      '.tsx': 'tsx',
    },
  },
},
```

## 数据流

```
登录流程：
  用户输入 → axios 请求 → dispatch({ type: 'set_user', payload: userData })
                              ↓
                        Redux 存储 → redux-persist 自动持久化

页面刷新：
  redux-persist 从 localStorage 读取 → 恢复到 Redux → 组件通过 useSelector 获取

退出登录：
  dispatch({ type: 'clear_user' }) → Redux 清空 → redux-persist 清空 localStorage
```

## 安装的依赖

```bash
npm install -D typescript @types/react @types/react-dom @types/node
```

## 后续工作

其他组件仍在使用 `localStorage.getItem('token')`，可逐步迁移为 `useSelector`：

- src/sandbox/NewsRouter.js
- src/sandbox/Home.js
- src/sandbox/audit-mange/Audit.js
- src/publish-manage/usePublish.js
- 等 10+ 文件

迁移方式：
```typescript
// 旧代码
const { username, roleId } = JSON.parse(localStorage.getItem('token'))

// 新代码
import { useSelector } from 'react-redux'
import { RootState } from '../types'

const user = useSelector((state: RootState) => state.user)
const { username, roleId } = user || {}
```
