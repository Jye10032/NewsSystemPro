# 面包屑导航优化

## 背景

用户反馈面包屑导航存在两个问题：
1. 点击面包屑无法跳转到对应页面
2. 父级路径（如"新闻管理"）没有实际页面，但仍可点击

## 修改内容

### 1. 路由路径简化

将权限管理下的三级路径改为二级路径：

| 修改前 | 修改后 |
|--------|--------|
| `/right-manage/role/list` | `/right-manage/rolelist` |
| `/right-manage/right/list` | `/right-manage/rightlist` |

涉及文件：
- `src/sandbox/NewsRouter.js` - 路由映射
- `src/sandbox/TopHead.tsx` - 面包屑映射
- `db/db.json` - 权限数据

### 2. 面包屑点击跳转

使用 React Router 的 `Link` 组件实现 SPA 内部跳转：

```tsx
import { Link } from 'react-router-dom'

// 面包屑项
{
    key: url,
    title: <Link to={url}>{breadcrumbNameMap[url]}</Link>,
}
```

### 3. 父级路径不可点击

添加 `clickablePaths` 集合，区分有页面和无页面的路径：

```tsx
// 有实际页面的路径（可点击）
const clickablePaths = new Set([
    '/home',
    '/user-manage/list',
    '/right-manage/rolelist',
    '/right-manage/rightlist',
    '/news-manage/add',
    '/news-manage/draft',
    '/news-manage/category',
    '/audit-manage/audit',
    '/audit-manage/list',
    '/publish-manage/unpublished',
    '/publish-manage/published',
    '/publish-manage/sunset',
])

// 渲染时判断
return {
    key: url,
    title: clickablePaths.has(url)
        ? <Link to={url}>{breadcrumbNameMap[url]}</Link>
        : <span>{breadcrumbNameMap[url]}</span>,
}
```

## 数据流

```
用户点击面包屑
    ↓
clickablePaths.has(url) 判断
    ↓
├── true  → <Link to={url}> → React Router 跳转
└── false → <span> → 纯文本，不可点击
```

## 测试

所有 103 个测试通过，包括：
- TopHead.test.js - 13 个测试
- Login.test.js - 5 个测试

---

_日期: 2025-12-18_
