# json-server 作为 Express 中间件方案

## 背景

项目从纯 json-server 迁移到 Express，目的是实现 JWT 认证。但迁移后需要手动实现 json-server 的查询语法（`_expand`, `_sort`, `_order`, `_limit` 等），增加了代码量。

## 解决方案

将 json-server 作为 Express 中间件使用，保留其查询能力，同时支持自定义路由。

## 实现代码

```javascript
// server/index.cjs
const express = require('express')
const cors = require('cors')
const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs')

const authRoutes = require('./routes/auth.cjs')
const usersRoutes = require('./routes/users.cjs')

const app = express()
const PORT = 8000

app.use(cors())
app.use(express.json())

// 1. 自定义路由优先（JWT 认证等）
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)

// 2. 合并 db.json 和 news.json 到内存
const dbPath = path.join(__dirname, '../db/db.json')
const newsPath = path.join(__dirname, '../db/news.json')

const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf-8'))
const mergedData = {
  ...dbData,
  news: Array.isArray(newsData) ? newsData : newsData.news || []
}

// 3. json-server 中间件
const middlewares = jsonServer.defaults({ noCors: true })
app.use(middlewares)

const router = jsonServer.router(mergedData)

// 4. 自定义写入逻辑：分别保存到对应文件
router.db._.mixin({
  write: function() {
    const state = router.db.getState()
    const { news, ...rest } = state
    fs.writeFileSync(newsPath, JSON.stringify(news, null, 2))
    fs.writeFileSync(dbPath, JSON.stringify(rest, null, 2))
  }
})

app.use(router)
app.listen(PORT)
```

## 关键点

1. **路由优先级**：Express 按注册顺序匹配，自定义路由放在 json-server 之前
2. **数据合并**：db.json 和 news.json 在启动时合并到内存
3. **分离写入**：重写 lowdb 的 write 方法，将数据分别保存回原文件
4. **json-server 版本**：使用 v0.17.x，该版本支持模块 API（v1.0 已移除）

## 文件变更

- `server/index.cjs` - 重构为 json-server 中间件方案
- `server/routes/data.cjs` - 已删除（不再需要手动实现查询）
- `package.json` - 更新脚本命令

## 启动命令

```bash
npm start          # 前端 + 后端
npm run server     # 只启动后端
npm run server:watch  # 后端 (热重载)
```

## API 路由

| 路由 | 处理方 | 说明 |
|------|--------|------|
| `/api/auth/login` | Express | JWT 登录 |
| `/api/auth/register` | Express | 注册 |
| `/api/users` | Express | 用户管理 (需认证) |
| `/news` | json-server | 新闻 CRUD + 查询 |
| `/roles` | json-server | 角色 |
| `/rights` | json-server | 权限 |
| `/categories` | json-server | 分类 |
| `/regions` | json-server | 区域 |

## json-server 查询参数

| 参数 | 示例 |
|------|------|
| `_expand` | `/news?_expand=category` |
| `_sort` | `/news?_sort=view` |
| `_order` | `/news?_order=desc` |
| `_limit` | `/news?_limit=10` |
| `_page` | `/news?_page=2&_limit=10` |

## 参考资料

- json-server v0.17 文档: https://github.com/typicode/json-server/tree/v0
- 模块 API 在 v1.0 中已移除，当前项目使用 v0.17.4

---

_记录时间: 2025-12-24_
