const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs')

const authRoutes = require('./routes/auth.cjs')
const usersRoutes = require('./routes/users.cjs')
const { verifyToken } = require('./utils/jwt.cjs')

const app = express()
const PORT = 8000

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}))
app.use(cookieParser())
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

// ============ 权限校验工具函数 ============

// 从 Cookie 获取用户信息
function getUserFromToken(req) {
  const token = req.cookies?.jwt
  if (!token) {
    return null
  }
  return verifyToken(token)
}

// 页面权限 → API 权限映射
const PAGE_API_MAP = {
  '/user-manage/list': '/users',
  '/user-manage/role': '/roles',
  '/user-manage/menu': '/rights',
  '/system-manage/category': '/categories'
}

// 动态权限校验：根据用户角色的页面权限判断 API 操作权限
function hasPermission(req, apiPath) {
  const user = getUserFromToken(req)
  if (!user) return { allowed: false, reason: '未登录' }

  // 查询用户角色的权限列表
  const role = router.db.get('roles').find({ id: user.roleId }).value()
  if (!role) return { allowed: false, reason: '角色不存在' }

  // 检查是否有对应页面权限
  for (const [page, api] of Object.entries(PAGE_API_MAP)) {
    if (api === apiPath && role.rights.includes(page)) {
      return { allowed: true, user }
    }
  }

  return { allowed: false, reason: '权限不足' }
}

// ============ 权限校验中间件 ============

// 用户管理 - 需要 /user-manage/list 页面权限
app.use('/users/:id', (req, res, next) => {
  if (req.method === 'GET') return next()

  const { allowed, reason } = hasPermission(req, '/users')
  if (!allowed) {
    return res.status(403).json({ error: reason })
  }
  next()
})

// 角色权限管理 - 需要 /user-manage/role 页面权限
app.use('/roles/:id', (req, res, next) => {
  if (req.method === 'GET') return next()

  const { allowed, reason } = hasPermission(req, '/roles')
  if (!allowed) {
    return res.status(403).json({ error: reason })
  }
  next()
})

// 菜单权限管理 - 需要 /user-manage/menu 页面权限
app.use('/rights/:id', (req, res, next) => {
  if (req.method === 'GET') return next()

  const { allowed, reason } = hasPermission(req, '/rights')
  if (!allowed) {
    return res.status(403).json({ error: reason })
  }
  next()
})

// 新闻修改/删除 - 作者本人可操作
app.use('/news/:id', (req, res, next) => {
  if (req.method === 'GET') return next()

  const id = parseInt(req.params.id)
  const news = router.db.get('news').find({ id }).value()

  if (!news) {
    return res.status(404).json({ error: '新闻不存在' })
  }

  const user = getUserFromToken(req)
  if (!user) {
    return res.status(401).json({ error: '未登录' })
  }

  // 作者本人可操作
  if (user.username === news.author) {
    return next()
  }

  return res.status(403).json({ error: '无权操作此新闻' })
})

// 新闻详情访问校验（已发布可公开访问，未发布仅作者可见）
app.get('/news/:id', (req, res, next) => {
  const id = parseInt(req.params.id)
  const news = router.db.get('news').find({ id }).value()

  if (!news) {
    return res.status(404).json({ error: '新闻不存在' })
  }

  // 已发布的新闻，所有人可访问（兼容字符串类型）
  if (Number(news.publishState) === 2) {
    return next()
  }

  // 未发布的新闻，需要验证是否为作者本人
  const user = getUserFromToken(req)
  if (user && user.username === news.author) {
    return next()
  }

  return res.status(403).json({ error: '无权访问未发布内容' })
})

// 分类管理 - 需要 /system-manage/category 页面权限
app.use('/categories/:id', (req, res, next) => {
  if (req.method === 'GET') return next()

  const { allowed, reason } = hasPermission(req, '/categories')
  if (!allowed) {
    return res.status(403).json({ error: reason })
  }
  next()
})

// 新增分类 - 需要 /system-manage/category 页面权限
app.post('/categories', (req, res, next) => {
  const { allowed, reason } = hasPermission(req, '/categories')
  if (!allowed) {
    return res.status(403).json({ error: reason })
  }
  next()
})

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

// 仅在直接运行时启动服务器（非测试环境）
if (require.main === module) {
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
}

// 导出 app 供测试使用
module.exports = app
