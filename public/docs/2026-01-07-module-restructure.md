# 项目模块化重构

## 背景

原项目结构将所有页面组件平铺在 `src/sandbox/` 目录下，对于新闻管理的相关功能，在 `src/` 和 `sandbox` 文件夹中均有出现，且主题文件、路由文件的分类不够清晰，在多处均有出现，需要把他们整合到同一位置以便更好的维护，随着功能增加，目录变得臃肿且难以维护。本次重构将业务功能按模块组织，提升代码可维护性。

## 重构前结构

```text
src/
├── sandbox/
│   ├── news-mange/
│   │   ├── NewsAdd.js
│   │   ├── NewsAdd.module.scss
│   │   ├── NewsDraft.js
│   │   ├── NewsUpdate.js
│   │   ├── NewsCategory.js
│   │   ├── NewsPreivew.js
│   │   ├── NewsEditor.js
│   │   └── NewsEditor.css
│   ├── publish-mange/
│   │   ├── Published.js
│   │   ├── Unpublished.js
│   │   ├── Sunset.js
│   │   ├── NewsPublish.js
│   │   └── usePublish.js
│   └── ...其他页面
└── ...
```

## 重构后结构

```text
src/
├── modules/                    # [新增] 业务功能模块目录
│   ├── news/                   # [从 sandbox/news-mange 迁移]
│   │   ├── components/         # [新增] 组件子目录
│   │   │   ├── NewsEditor.js   # [迁移] 富文本编辑器组件
│   │   │   └── NewsEditor.css
│   │   └── pages/              # [新增] 页面子目录
│   │       ├── NewsAdd.js      # [迁移] 新建新闻页
│   │       ├── NewsAdd.module.scss
│   │       ├── NewsDraft.js    # [迁移] 草稿箱页
│   │       ├── NewsUpdate.js   # [迁移] 编辑新闻页
│   │       ├── NewsCategory.js # [迁移] 分类管理页
│   │       └── NewsPreivew.js  # [迁移] 新闻预览页
│   └── publish/                # [从 sandbox/publish-mange 迁移]
│       ├── components/         # [新增] 组件子目录
│       │   └── NewsPublish.js  # [迁移] 发布列表组件
│       ├── hooks/              # [新增] Hook 子目录
│       │   └── usePublish.js   # [迁移] 发布状态 Hook
│       └── pages/              # [新增] 页面子目录
│           ├── Published.js    # [迁移] 已发布页
│           ├── Unpublished.js  # [迁移] 待发布页
│           └── Sunset.js       # [迁移] 已下线页
├── router/                     # [新增] 路由配置目录
│   ├── IndexRouter.js          # [保留] 根路由
│   ├── NewsRouter.js           # [从 sandbox 迁移] 后台路由
│   └── AuthRoute.js            # [保留] 认证守卫
├── sandbox/                    # [保留] 应用框架
│   ├── home/                   # [保留] 首页
│   ├── right-manage/           # [保留] 权限管理
│   ├── user-manage/            # [保留] 用户管理
│   ├── audit-mange/            # [保留] 审核管理
│   ├── SideMenu.js             # [保留] 侧边栏
│   └── TopHead.js              # [保留] 顶部栏
└── ...
```

### 主要变更说明

| 变更类型 | 原路径                     | 新路径                                  | 说明             |
| -------- | -------------------------- | --------------------------------------- | ---------------- |
| 目录迁移 | `sandbox/news-mange/`    | `modules/news/`                       | 新闻管理模块独立 |
| 目录迁移 | `sandbox/publish-mange/` | `modules/publish/`                    | 发布管理模块独立 |
| 文件迁移 | `sandbox/NewsRouter.js`  | `router/NewsRouter.js`                | 路由配置集中管理 |
| 结构优化 | 文件平铺                   | `components/`、`pages/`、`hooks/` | 按职责分类组织   |

### 重构收益

1. **模块化**：业务功能按模块组织，边界清晰
2. **可维护性**：每个模块内部按 `components/`、`pages/`、`hooks/` 分类
3. **可扩展性**：新增模块只需在 `modules/` 下创建目录
4. **路由集中**：所有路由配置统一放在 `router/` 目录

## 目录职责划分

| 目录                 | 职责                                           |
| -------------------- | ---------------------------------------------- |
| `modules/`         | 独立业务功能模块                               |
| `modules/news/`    | 新闻管理（添加、编辑、草稿、分类、预览）       |
| `modules/publish/` | 发布管理（待发布、已发布、已下线）             |
| `router/`          | 路由配置（IndexRouter、NewsRouter、AuthRoute） |
| `sandbox/`         | 应用框架、通用页面、权限管理                   |

## 代码修改

### 1. 路由配置更新

`src/router/NewsRouter.js` 更新 import 路径：

```javascript
// 修改前
import NewAdd from './news-mange/NewsAdd'
import Published from './publish-mange/Published'

// 修改后
import NewAdd from '../modules/news/pages/NewsAdd'
import Published from '../modules/publish/pages/Published'
```

### 2. React Router v6 迁移

修复了 `NewsDraft.js` 和 `NewsUpdate.js` 中的导航问题：

```javascript
// 修改前 (React Router v5 语法)
props.history.push('/audit-manage/list')

// 修改后 (React Router v6 语法)
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/audit-manage/list')
```

### 3. 样式文件路径更新

模块内组件的样式引用路径调整：

```javascript
// modules/news/pages/NewsDraft.js
import '../../../styles/TableStyles.css'

// modules/publish/components/NewsPublish.js
import '../../../styles/TableStyles.css'
```

### 4. 测试文件更新

`src/test/` 下的测试文件 import 路径同步更新：

```javascript
// 修改前
import NewsDraft from '../../sandbox/news-mange/NewsDraft'
import usePublish from '../../publish-manage/usePublish'

// 修改后
import NewsDraft from '../../modules/news/pages/NewsDraft'
import usePublish from '../../modules/publish/hooks/usePublish'
```

## 测试验证

重构后运行测试，103 个测试全部通过：

```bash
npm run test:run
# ✓ 103 tests passed
```

## 后续建议

1. **认证模块**：考虑将 `src/login/` 移至 `src/modules/auth/`
2. **审核模块**：可将 `sandbox/audit-mange/` 移至 `src/modules/audit/`
3. **权限模块**：可将 `sandbox/right-manage/` 和 `sandbox/user-manage/` 合并至 `src/modules/permission/`

---

## 项目结构清理（追加）

基于上述后续建议，对项目进行了进一步清理和优化。

### 1. 删除废弃文件

项目中存在两个废弃文件，它们是早期开发遗留的，已不再被任何代码引用：

**删除 `src/IndexRouter.js`**

该文件是废弃的路由配置，存在以下问题：

- import 路径指向不存在的文件
- 与 `src/router/IndexRouter.js` 功能重复
- 未被 `App.jsx` 或其他文件引用

**删除 `src/store.js`**

该文件是废弃的 Redux store 配置，存在以下问题：

- 缺少 `user` reducer，无法支持用户状态管理
- 与 `src/redux/store.js` 功能重复
- 未被任何文件引用

### 2. 修复拼写错误

项目中存在两处拼写错误，影响代码可读性和一致性。

**目录重命名 `audit-mange` → `audit-manage`**

```bash
# 执行重命名
mv src/sandbox/audit-mange src/sandbox/audit-manage
```

同步更新 `src/router/NewsRouter.js` 中的 import 路径：

```javascript
// 修改前
import Audit from '../sandbox/audit-mange/Audit'
import AuditList from '../sandbox/audit-mange/AuditList'

// 修改后
import Audit from '../sandbox/audit-manage/Audit'
import AuditList from '../sandbox/audit-manage/AuditList'
```

**变量重命名 `isLoding` → `isLoading`**

这是一个贯穿多个文件的拼写错误，涉及 Redux state 命名。

修改 `src/redux/store.js`：

```javascript
// 修改前
import isLoding from './reducers/LoadingReducer'

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['isLoding']
}

const AllReducers = combineReducers({
  collapsible,
  isLoding,
  user
})

// 修改后
import isLoading from './reducers/LoadingReducer'

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['isLoading']
}

const AllReducers = combineReducers({
  collapsible,
  isLoading,
  user
})
```

修改 `src/router/NewsRouter.js`：

```javascript
// 修改前
<Spin spinning={props.isLoding}>

export default connect((state) => ({
    isLoding: state.isLoding
}))(NewsRouter)

// 修改后
<Spin spinning={props.isLoading}>

export default connect((state) => ({
    isLoading: state.isLoading
}))(NewsRouter)
```

修改 `src/types/index.ts`：

```typescript
// 修改前
export interface RootState {
  collapsible: boolean
  isLoding: boolean
  user: User | null
}

// 修改后
export interface RootState {
  collapsible: boolean
  isLoading: boolean
  user: User | null
}
```

同步更新测试文件中的 mock store：

| 文件                                        | 修改内容                               |
| ------------------------------------------- | -------------------------------------- |
| `src/test/components/Login.test.js`       | `isLoding` → `isLoading` in store |
| `src/test/components/TopHead.test.js`     | `isLoding` → `isLoading` in store |
| `doc/2025-12-18-redux-user-typescript.md` | 文档示例代码同步修正                   |

### 3. 合并 theme 到 styles

`src/config/theme.js` 是 Ant Design 的主题配置文件，虽然是 JavaScript 对象而非 CSS，但本质上属于样式配置，应归入 `styles/` 目录。

```bash
# 移动文件
mv src/config/theme.js src/styles/antd.theme.js

# 删除空目录
rmdir src/config
```

更新 `src/App.jsx` 中的引用：

```javascript
// 修改前
import { antdTheme } from './config/theme'

// 修改后
import { antdTheme } from './styles/antd.theme'
```

#### 文件内容说明

`antd.theme.js` 包含 Ant Design 5.x 的主题 token 配置：

```javascript
export const antdTheme = {
  token: {
    colorPrimary: '#1677ff',      // 主色调：科技蓝
    borderRadius: 6,               // 全局圆角
    colorBgLayout: '#f5f7fa',      // 布局背景色
  },
  components: {
    Layout: { bodyBg: '#f5f7fa' },
    Menu: {
      itemSelectedBg: '#e6f4ff',
      itemSelectedColor: '#1677ff',
    },
    Table: { headerBg: '#fafafa' },
    Card: { borderRadiusLG: 8 },
  },
}
```

### 4. 移动公开页面到 modules/visitor

`src/sandbox/news/` 目录下的 `News.js` 和 `Detail.js` 是面向访客的公开页面（无需登录即可访问），不属于后台管理功能，应独立为 `visitor` 模块。

```bash
# 创建目录
mkdir -p src/modules/visitor/pages

# 移动文件
mv src/sandbox/news/News.js src/modules/visitor/pages/News.js
mv src/sandbox/news/Detail.js src/modules/visitor/pages/Detail.js

# 删除空目录
rmdir src/sandbox/news
```

更新 `src/router/IndexRouter.js` 中的引用：

```javascript
// 修改前
import Detail from '../sandbox/news/Detail'
import News from '../sandbox/news/News'

// 修改后
import Detail from '../modules/visitor/pages/Detail'
import News from '../modules/visitor/pages/News'
```

#### 页面功能说明

| 页面          | 路由            | 功能                                   |
| ------------- | --------------- | -------------------------------------- |
| `News.js`   | `/news`       | 新闻列表页，按分类展示已发布的新闻     |
| `Detail.js` | `/detail/:id` | 新闻详情页，展示新闻内容、浏览量、点赞 |

### 5. 移动 login 到 modules/login

登录功能是独立的业务模块，应从根目录移至 `modules/` 下统一管理。

```bash
# 创建目录
mkdir -p src/modules/login

# 移动文件
mv src/login/Login.tsx src/modules/login/Login.tsx
mv src/login/Login.css src/modules/login/Login.css

# 删除空目录
rmdir src/login
```

更新 `src/router/IndexRouter.js` 中的引用：

```javascript
// 修改前
import Login from '../login/Login'

// 修改后
import Login from '../modules/login/Login'
```

更新 `src/test/components/Login.test.js` 中的引用：

```javascript
// 修改前
import Login from '../../login/Login'

// 修改后
import Login from '../../modules/login/Login'
```

同时更新 `Login.tsx` 内部的类型引用路径：

```typescript
// 修改前
import { User } from '../types'

// 修改后
import { User } from '../../types'
```

#### 登录模块功能说明

| 文件          | 功能                                           |
| ------------- | ---------------------------------------------- |
| `Login.tsx` | 登录页面组件，包含表单验证、JWT 认证、粒子背景 |
| `Login.css` | 登录页样式，毛玻璃效果、渐变背景、动画         |

### 清理后的完整项目结构

```text
src/
├── modules/                    # 业务功能模块
│   ├── login/                  # 登录模块
│   │   ├── Login.tsx           # 登录页面（TypeScript）
│   │   └── Login.css           # 登录页样式
│   ├── news/                   # 新闻管理模块
│   │   ├── components/         # 新闻相关组件
│   │   │   ├── NewsEditor.js   # 富文本编辑器
│   │   │   └── NewsEditor.css
│   │   └── pages/              # 新闻管理页面
│   │       ├── NewsAdd.js      # 新建新闻
│   │       ├── NewsDraft.js    # 草稿箱
│   │       ├── NewsUpdate.js   # 编辑新闻
│   │       ├── NewsCategory.js # 分类管理
│   │       └── NewsPreivew.js  # 新闻预览
│   ├── publish/                # 发布管理模块
│   │   ├── components/
│   │   │   └── NewsPublish.js  # 发布列表组件
│   │   ├── hooks/
│   │   │   └── usePublish.js   # 发布状态 Hook
│   │   └── pages/
│   │       ├── Published.js    # 已发布
│   │       ├── Unpublished.js  # 待发布
│   │       └── Sunset.js       # 已下线
│   └── visitor/                # 访客公开页面
│       └── pages/
│           ├── News.js         # 新闻列表（公开）
│           └── Detail.js       # 新闻详情（公开）
├── router/                     # 路由配置
│   ├── IndexRouter.js          # 根路由
│   ├── NewsRouter.js           # 后台路由
│   └── AuthRoute.js            # 认证守卫
├── redux/                      # Redux 状态管理
│   ├── store.js                # Store 配置
│   └── reducers/
│       ├── CollapsedReducer.js
│       ├── LoadingReducer.js
│       └── UserReducer.ts
├── sandbox/                    # 应用框架和通用页面
│   ├── audit-manage/           # 审核管理（修正拼写）
│   ├── home/                   # 首页
│   ├── right-manage/           # 权限管理
│   ├── user-manage/            # 用户管理
│   ├── nopermission/           # 无权限页面
│   ├── NewsSandBox.js          # 后台布局容器
│   ├── SideMenu.js             # 侧边栏
│   └── TopHead.tsx             # 顶部栏
├── styles/                     # 样式文件
│   ├── antd.theme.js           # Ant Design 主题配置
│   ├── index.css               # 全局样式
│   └── TableStyles.css         # 表格公共样式
├── types/                      # TypeScript 类型定义
│   └── index.ts
├── utils/                      # 工具函数
│   └── Request.js              # Axios 封装
├── test/                       # 测试文件
│   ├── components/
│   ├── hooks/
│   ├── redux/
│   ├── router/
│   └── utils/
├── App.jsx                     # 应用入口
└── main.jsx                    # 渲染入口
```

### 清理后测试验证

清理后运行测试，75 个测试全部通过：

```bash
npm run test:run
# ✓ 75 tests passed
```

测试覆盖范围：

| 测试类型   | 数量 | 说明                             |
| ---------- | ---- | -------------------------------- |
| 组件测试   | 45   | Login、TopHead、SideMenu 等      |
| Hook 测试  | 11   | usePublish                       |
| Redux 测试 | 10   | CollapsedReducer、LoadingReducer |
| 路由测试   | 5    | AuthRoute                        |
| 工具测试   | 9    | Request                          |

---

更新日期: 2026-01-07
