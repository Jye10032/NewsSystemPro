// Vercel Serverless API 入口 - Express + JWT + json-server
const express = require('express')
const cors = require('cors')
const jsonServer = require('json-server')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const app = express()

// ============ 配置 ============
const JWT_SECRET = process.env.JWT_SECRET || 'news-system-pro-secret-key'
const JWT_EXPIRES_IN = '7d'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7天

// 允许的前端域名
const ALLOWED_ORIGINS = [
  'https://jye10032.github.io',
  'http://localhost:5173',
  'http://localhost:3000'
]

// ============ 加载数据（内存模式，刷新后重置）============
const dbData = require('../db/db.json')
const newsData = require('../db/news.json')

// 合并数据到内存
const memoryDB = {
  ...dbData,
  news: Array.isArray(newsData) ? newsData : newsData.news || []
}

// ============ 中间件 ============
app.use(cors({
  origin: function(origin, callback) {
    // 允许无 origin 的请求（如 Postman）或在白名单中的域名
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(cookieParser())
app.use(express.json())

// ============ JWT 工具函数 ============
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

// ============ 认证路由 ============

// 登录
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' })
  }

  const user = memoryDB.users.find(u => u.username === username)

  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' })
  }

  // 验证密码（支持明文和哈希两种格式）
  const isValidPassword = user.password.startsWith('$2')
    ? bcrypt.compareSync(password, user.password)
    : password === user.password

  if (!isValidPassword) {
    return res.status(401).json({ message: '用户名或密码错误' })
  }

  if (!user.roleState) {
    return res.status(403).json({ message: '账号已被禁用' })
  }

  // 获取角色信息
  const role = memoryDB.roles.find(r => r.id === user.roleId)

  // 生成 JWT
  const token = generateToken({
    userId: user.id,
    username: user.username,
    roleId: user.roleId
  })

  // 设置 httpOnly Cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: COOKIE_MAX_AGE
  })

  // 返回用户信息（不含密码，不返回 token）
  const { password: _, ...userWithoutPassword } = user
  res.json({
    user: {
      ...userWithoutPassword,
      role
    }
  })
})

// 获取当前登录用户信息
app.get('/api/users/me', (req, res) => {
  const user = getUserFromToken(req)
  if (!user) {
    return res.status(401).json({ message: '未登录' })
  }

  const userData = memoryDB.users.find(u => u.id === user.userId)
  if (!userData) {
    return res.status(404).json({ message: '用户不存在' })
  }

  const { password, ...userWithoutPassword } = userData
  const role = memoryDB.roles.find(r => r.id === userData.roleId)

  res.json({
    ...userWithoutPassword,
    role
  })
})

// 注册（内存模式，刷新后重置）
app.post('/api/auth/register', (req, res) => {
  const { username, password, roleId = 3 } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' })
  }

  // 检查用户名是否已存在
  if (memoryDB.users.find(u => u.username === username)) {
    return res.status(400).json({ message: '用户名已存在' })
  }

  // 哈希密码
  const hashedPassword = bcrypt.hashSync(password, 12)

  // 创建新用户（仅在内存中）
  const newUser = {
    id: Math.max(...memoryDB.users.map(u => u.id)) + 1,
    username,
    password: hashedPassword,
    roleState: true,
    default: false,
    roleId,
    allowedCategoryIds: [2, 3]
  }

  memoryDB.users.push(newUser)

  const { password: _, ...userWithoutPassword } = newUser
  res.status(201).json({ user: userWithoutPassword })
})

// 登出
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  })
  res.json({ message: 'Logged out' })
})

// ============ json-server 路由 ============
const middlewares = jsonServer.defaults({ noCors: true })
app.use(middlewares)

// 使用内存数据创建路由
const router = jsonServer.router(memoryDB)

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

app.use(router)

// ============ 导出给 Vercel ============
module.exports = app
