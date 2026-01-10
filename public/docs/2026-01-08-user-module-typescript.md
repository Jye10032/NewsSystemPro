# User 模块 TypeScript 迁移

## 背景

将 user-manage 模块从 JavaScript 迁移到 TypeScript，并将类型定义文件拆分为独立模块。

## 变更内容

### 类型文件拆分

原来所有类型定义在 `src/types/index.ts` 一个文件中，现拆分为：

```
src/types/
├── index.ts      # 统一导出 + RootState + AppAction
├── user.ts       # User, Role, UserAction
└── category.ts   # Category
```

### 新建文件

**src/types/user.ts**
```typescript
export interface Role {
  id: number
  roleName: string
  roleType: number
  rights: string[]
}

export interface User {
  id: number
  username: string
  password: string
  roleState: boolean
  default: boolean
  region: string
  roleId: number
  role?: Role
  allowedCategoryIds?: number[]
}

export type UserAction =
  | { type: 'set_user'; payload: User }
  | { type: 'clear_user' }
```

**src/types/category.ts**
```typescript
export interface Category {
  id: number
  title: string
  value: string
}
```

**src/types/index.ts**
```typescript
// 统一导出
export * from './user'
export * from './category'

import type { User } from './user'

export interface RootState {
  collapsible: boolean
  isLoading: boolean
  user: User | null
}

export type CollapsedAction = { type: 'change_collapsed' }
export type LoadingAction = { type: 'change_loading' }

import type { UserAction } from './user'
export type AppAction = UserAction | CollapsedAction | LoadingAction
```

### 迁移的组件

| 原文件 | 新文件 |
|--------|--------|
| UserForm.js | UserForm.tsx |
| UserList.js | UserList.tsx |

### 主要类型化改动

**UserForm.tsx**
```typescript
interface UserFormProps {
    isUpdate?: boolean
    isSelectDisabled?: boolean
    roleList?: Role[]
    categoryList?: Category[]
}

const UserForm = forwardRef<FormInstance, UserFormProps>((props, ref) => {
    // ...
})
```

**UserList.tsx**
```typescript
const [userList, setUserList] = useState<User[]>([])
const [categoryList, setCategoryList] = useState<Category[]>([])
const [roleList, setRoleList] = useState<Role[]>([])
```

## 数据流

```
后端 API (/users, /roles, /categories)
    ↓
axios.get() 获取数据
    ↓
useState<Type[]> 存储到组件状态
    ↓
Table/Form 组件渲染
```

## 使用方式

导入类型：
```typescript
import type { User, Role, Category } from '@/types'
```

## 验证

- 103 个测试全部通过
- 构建成功

---

日期: 2026-01-08
