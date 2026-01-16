const express = require('express')
const bcrypt = require('bcryptjs')
const { readDB, writeDB } = require('../utils/db.cjs')
const { authMiddleware } = require('../middleware/auth.cjs')

const router = express.Router()

// 获取当前登录用户信息
router.get('/me', authMiddleware, (req, res) => {
  const db = readDB()
  const user = db.users.find(u => u.id === req.user.userId)

  if (!user) {
    return res.status(404).json({ message: '用户不存在' })
  }

  const { password, ...userWithoutPassword } = user
  const role = db.roles.find(r => r.id === user.roleId)

  res.json({
    ...userWithoutPassword,
    role
  })
})

// 获取用户列表（需要认证）
router.get('/', authMiddleware, (req, res) => {
  const db = readDB()
  const { _expand } = req.query

  let users = db.users.map(({ password, ...user }) => user)

  // 支持 _expand=role 展开角色信息
  if (_expand === 'role') {
    users = users.map(user => ({
      ...user,
      role: db.roles.find(r => r.id === user.roleId)
    }))
  }

  res.json(users)
})

// 获取单个用户
router.get('/:id', authMiddleware, (req, res) => {
  const db = readDB()
  const user = db.users.find(u => u.id === parseInt(req.params.id))

  if (!user) {
    return res.status(404).json({ message: '用户不存在' })
  }

  const { password, ...userWithoutPassword } = user
  res.json(userWithoutPassword)
})

// 创建用户
router.post('/', authMiddleware, (req, res) => {
  const { username, password, roleId, roleState = true, allowedCategoryIds = [] } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' })
  }

  const db = readDB()

  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ message: '用户名已存在' })
  }

  const hashedPassword = bcrypt.hashSync(password, 12)

  const newUser = {
    id: Math.max(...db.users.map(u => u.id)) + 1,
    username,
    password: hashedPassword,
    roleState,
    default: false,
    roleId,
    allowedCategoryIds
  }

  db.users.push(newUser)
  writeDB(db)

  const { password: _, ...userWithoutPassword } = newUser
  res.status(201).json(userWithoutPassword)
})

// 更新用户
router.patch('/:id', authMiddleware, (req, res) => {
  const db = readDB()
  const userIndex = db.users.findIndex(u => u.id === parseInt(req.params.id))

  if (userIndex === -1) {
    return res.status(404).json({ message: '用户不存在' })
  }

  const updates = { ...req.body }

  // 如果更新密码，需要哈希
  if (updates.password) {
    updates.password = bcrypt.hashSync(updates.password, 12)
  }

  db.users[userIndex] = { ...db.users[userIndex], ...updates }
  writeDB(db)

  const { password, ...userWithoutPassword } = db.users[userIndex]
  res.json(userWithoutPassword)
})

// 删除用户
router.delete('/:id', authMiddleware, (req, res) => {
  const db = readDB()
  const userIndex = db.users.findIndex(u => u.id === parseInt(req.params.id))

  if (userIndex === -1) {
    return res.status(404).json({ message: '用户不存在' })
  }

  if (db.users[userIndex].default) {
    return res.status(403).json({ message: '不能删除默认用户' })
  }

  db.users.splice(userIndex, 1)
  writeDB(db)

  res.status(204).send()
})

module.exports = router
