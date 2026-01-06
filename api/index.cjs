// Vercel Serverless API 入口 - Express + JWT + json-server
const express = require('express')
const cors = require('cors')
const jsonServer = require('json-server')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()

// ============ 配置 ============
const JWT_SECRET = process.env.JWT_SECRET || 'news-system-pro-secret-key'
const JWT_EXPIRES_IN = '7d'

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
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
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

  // 返回用户信息（不含密码）
  const { password: _, ...userWithoutPassword } = user
  res.json({
    token,
    user: {
      ...userWithoutPassword,
      role
    }
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

// ============ json-server 路由 ============
const middlewares = jsonServer.defaults({ noCors: true })
app.use(middlewares)

// 使用内存数据创建路由
const router = jsonServer.router(memoryDB)
app.use(router)

// ============ 导出给 Vercel ============
module.exports = app
