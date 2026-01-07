# 菜单数据结构重构：扁平化 → 嵌套结构

## 背景

原数据库使用两张表存储菜单数据：
- `rights` 表：一级菜单
- `children` 表：二级菜单，通过 `rightId` 关联父级，通过 `grade` 标识层级

这种设计存在以下问题：
1. 需要额外的 `grade` 字段判断层级
2. 需要 `rightId` 外键关联
3. 查询时需要 `?_embed=children` 合并数据
4. 更新子菜单需要操作单独的 `/children` 端点

## 变更内容

### 1. 数据库结构 (db.json)

**旧结构**：
```json
{
  "rights": [
    { "id": 1, "title": "首页", "key": "/home", "grade": 1 }
  ],
  "children": [
    { "id": 1, "title": "用户列表", "rightId": 6, "key": "/user-manage/list", "grade": 2 }
  ]
}
```

**新结构**：
```json
{
  "rights": [
    { "id": 1, "title": "首页", "key": "/home", "pagepermisson": 1 },
    {
      "id": 6,
      "title": "用户与权限",
      "key": "/user-manage",
      "pagepermisson": 1,
      "children": [
        { "id": 1, "title": "用户列表", "key": "/user-manage/list", "pagepermisson": 1 }
      ]
    }
  ]
}
```

**移除的字段**：
- `grade` - 不再需要，通过路径层级判断
- `rightId` - 不再需要，children 直接嵌入父级

### 2. RightList.js

通过路径层级判断菜单级别：

```javascript
// 一级菜单只有一层路径：/home, /news-manage
// 二级菜单有两层路径：/news-manage/add, /user-manage/list
const isTopLevel = item.key.split('/').filter(Boolean).length === 1

// 更新操作
if (isTopLevel) {
    axios.patch(`/rights/${item.id}`, { pagepermisson: item.pagepermisson })
} else {
    // 找到父级，更新整个 children 数组
    const parentKey = '/' + item.key.split('/').filter(Boolean)[0]
    const parent = dataSource.find(d => d.key === parentKey)
    axios.patch(`/rights/${parent.id}`, { children: parent.children })
}
```

### 3. NewsRouter.js

展平嵌套结构获取路由列表：

```javascript
axios.get('/rights').then((res) => {
    const flatList = res.data.reduce((acc, item) => {
        acc.push(item)
        if (item.children && item.children.length > 0) {
            acc.push(...item.children)
        }
        return acc
    }, [])
    setBackRouteList(flatList)
})
```

### 4. SideMenu.js

移除 `_embed` 参数：

```javascript
// 旧
axios.get("/rights?_embed=children")

// 新
axios.get("/rights")
```

## 数据流

```
┌─────────────────────────────────────────────────────────────┐
│                        GET /rights                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  [                                                          │
│    { id: 1, title: "首页", key: "/home" },                  │
│    {                                                        │
│      id: 2,                                                 │
│      title: "内容管理",                                      │
│      key: "/news-manage",                                   │
│      children: [                                            │
│        { id: 1, title: "撰写新闻", key: "/news-manage/add" }│
│      ]                                                      │
│    }                                                        │
│  ]                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│      SideMenu.js        │     │       NewsRouter.js         │
│   直接渲染嵌套菜单       │     │   展平后匹配路由组件         │
└─────────────────────────┘     └─────────────────────────────┘
```

## 修改的文件

| 文件 | 修改内容 |
|------|----------|
| `db/db.json` | 删除 children 表，嵌入到 rights |
| `src/sandbox/right-manage/RightList.js` | 用路径判断层级 |
| `src/router/NewsRouter.js` | 展平嵌套数据 |
| `src/sandbox/SideMenu.js` | 移除 _embed 参数 |
| `src/test/components/SideMenu.test.js` | 更新 API 断言 |

## 测试验证

```bash
npm run test:run
# 103 passed
```

---

_日期: 2026-01-07_
