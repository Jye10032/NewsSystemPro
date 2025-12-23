const express = require('express')
const bcrypt = require('bcryptjs')
const { readDB, writeDB } = require('../utils/db.cjs')
const { generateToken } = require('../utils/jwt.cjs')

const router = express.Router()

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
