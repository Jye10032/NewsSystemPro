# 菜单结构优化

## 背景

原菜单结构存在以下问题：

- "新闻分类" 放在 "新闻管理" 下，但它是系统配置，不是新闻内容
- "用户管理" 和 "权限管理" 分开，但功能相关
- 路由路径不一致：子菜单路径与父菜单不匹配

## 变更内容

### 菜单结构调整

| 旧结构 | 新结构 |
| ------ | ------ |
| 首页 | 首页 |
| 新闻管理 (含新闻分类) | 内容管理 (不含新闻分类) |
| 审核管理 | 审核管理 |
| 发布管理 | 发布管理 |
| 用户管理 | 系统设置 (含新闻分类) |
| 权限管理 | 用户与权限 (合并) |

### 路由路径修改

```text
/right-manage/rolelist  →  /user-manage/role
/right-manage/rightlist →  /user-manage/menu
/news-manage/category   →  /system-manage/category
```

### 修改的文件

- `db/db.json` - 菜单数据
- `src/router/NewsRouter.js` - 路由映射
- `src/sandbox/SideMenu.js` - 图标映射

### 新菜单结构

```text
首页
内容管理
  ├── 撰写新闻
  ├── 草稿箱
  ├── 新闻预览 (隐藏)
  └── 新闻更新 (隐藏)
审核管理
  ├── 审核新闻
  └── 审核列表
发布管理
  ├── 待发布
  ├── 已发布
  └── 已下线
系统设置
  └── 新闻分类
用户与权限
  ├── 用户列表
  ├── 角色管理
  └── 菜单管理
```

## 图标映射

```javascript
const iconList = {
    '/home': <HomeOutlined />,
    '/news-manage': <ContainerOutlined />,
    '/audit-manage': <AuditOutlined />,
    '/publish-manage': <ExceptionOutlined />,
    '/system-manage': <SettingOutlined />,
    '/user-manage': <UserOutlined />
}
```

---

日期: 2026-01-07
