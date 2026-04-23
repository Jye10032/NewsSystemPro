const express = require('express')
const bcrypt = require('bcryptjs')
const { readDB, writeDB } = require('../utils/db.cjs')
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../utils/jwt.cjs')

const router = express.Router()

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7天
const REFRESH_COOKIE_NAME = 'refresh_token'

function buildTokenPayload(user) {
  return {
    userId: user.id,
    username: user.username,
    roleId: user.roleId
  }
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax'
  })
}

function clearAuthCookies(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { httpOnly: true, sameSite: 'lax' })
  res.clearCookie('jwt', { httpOnly: true })
}

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' })
  }

  const db = readDB()
  const user = db.users.find(u => u.username === username)

  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' })
  }

  // 验证密码（支持明文和哈希两种格式，便于迁移）
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
  const role = db.roles.find(r => r.id === user.roleId)

  const tokenPayload = buildTokenPayload(user)
  const accessToken = generateAccessToken(tokenPayload)
  const refreshToken = generateRefreshToken(tokenPayload)
  setRefreshCookie(res, refreshToken)

  const { password: _, ...userWithoutPassword } = user
  res.json({
    user: {
      ...userWithoutPassword,
      role
    },
    accessToken,
    token: accessToken
  })
})

router.post('/refresh', (req, res) => {
  const refreshToken = String(req.cookies?.[REFRESH_COOKIE_NAME] || '')
  if (!refreshToken) {
    return res.status(401).json({ message: '刷新令牌不存在' })
  }

  const decoded = verifyRefreshToken(refreshToken)
  if (!decoded) {
    clearAuthCookies(res)
    return res.status(401).json({ message: '刷新令牌无效或已过期' })
  }

  const db = readDB()
  const user = db.users.find(u => u.id === decoded.userId)
  if (!user || !user.roleState) {
    clearAuthCookies(res)
    return res.status(401).json({ message: '用户状态无效，请重新登录' })
  }

  const tokenPayload = buildTokenPayload(user)
  const accessToken = generateAccessToken(tokenPayload)
  const nextRefreshToken = generateRefreshToken(tokenPayload)
  setRefreshCookie(res, nextRefreshToken)

  res.json({
    accessToken,
    token: accessToken
  })
})

// 登出
router.post('/logout', (req, res) => {
  clearAuthCookies(res)
  res.json({ message: 'Logged out' })
})

// 注册（可选）
router.post('/register', (req, res) => {
  const { username, password, roleId = 3 } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' })
  }

  const db = readDB()

  // 检查用户名是否已存在
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ message: '用户名已存在' })
  }

  // 哈希密码
  const hashedPassword = bcrypt.hashSync(password, 12)

  // 创建新用户
  const newUser = {
    id: Math.max(...db.users.map(u => u.id)) + 1,
    username,
    password: hashedPassword,
    roleState: true,
    default: false,
    roleId,
    allowedCategoryIds: [2, 3]
  }

  db.users.push(newUser)
  writeDB(db)

  const { password: _, ...userWithoutPassword } = newUser
  res.status(201).json({ user: userWithoutPassword })
})

module.exports = router
