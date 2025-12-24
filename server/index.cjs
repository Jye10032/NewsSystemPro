const express = require('express')
const cors = require('cors')
const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs')

const authRoutes = require('./routes/auth.cjs')
const usersRoutes = require('./routes/users.cjs')

const app = express()
const PORT = 8000

// 中间件
app.use(cors())
app.use(express.json())

// ============ 1. 自定义路由优先（JWT 认证等）============
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)

// ============ 2. json-server 处理数据路由 ============
const dbPath = path.join(__dirname, '../db/db.json')
const newsPath = path.join(__dirname, '../db/news.json')

// 合并 db.json 和 news.json 到内存中
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf-8'))
const mergedData = {
  ...dbData,
  news: Array.isArray(newsData) ? newsData : newsData.news || []
}

// json-server 默认中间件
const middlewares = jsonServer.defaults({ noCors: true })
app.use(middlewares)

// 创建 json-server 路由（使用合并后的数据）
const router = jsonServer.router(mergedData)

// 自定义写入逻辑：分别保存到对应文件
router.db._.mixin({
  write: function() {
    const state = router.db.getState()
    const { news, ...rest } = state

    // 保存 news 到 news.json
    fs.writeFileSync(newsPath, JSON.stringify(news, null, 2))

    // 保存其他数据到 db.json
    fs.writeFileSync(dbPath, JSON.stringify(rest, null, 2))
  }
})

// 挂载 json-server 路由
app.use(router)

app.listen(PORT, () => {
  console.log(`Express + json-server running on http://localhost:${PORT}`)
  console.log(``)
  console.log(`自定义路由:`)
  console.log(`  POST /api/auth/login     - JWT 登录`)
  console.log(`  POST /api/auth/register  - 注册`)
  console.log(`  GET  /api/users          - 用户列表 (需认证)`)
  console.log(``)
  console.log(`json-server 路由 (支持 _expand, _sort, _order, _limit, _page 等):`)
  console.log(`  /news, /roles, /rights, /categories, /regions, /children`)
})
