const express = require('express')
const { readDB, writeDB, readNews, writeNews } = require('../utils/db.cjs')
const { optionalAuth } = require('../middleware/auth.cjs')

const router = express.Router()

// 兼容原有 json-server 的通用数据路由

// 角色
router.get('/roles', (req, res) => {
  const db = readDB()
  res.json(db.roles)
})

router.patch('/roles/:id', (req, res) => {
  const db = readDB()
  const index = db.roles.findIndex(r => r.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: '角色不存在' })
  }
  db.roles[index] = { ...db.roles[index], ...req.body }
  writeDB(db)
  res.json(db.roles[index])
})

router.delete('/roles/:id', (req, res) => {
  const db = readDB()
  const index = db.roles.findIndex(r => r.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: '角色不存在' })
  }
  db.roles.splice(index, 1)
  writeDB(db)
  res.status(204).send()
})

// 权限
router.get('/rights', (req, res) => {
  const db = readDB()
  const { _embed } = req.query

  // 支持 _embed=children（json-server 兼容）
  if (_embed === 'children') {
    const rightsWithChildren = db.rights.map(right => ({
      ...right,
      children: db.children.filter(child => child.rightId === right.id)
    }))
    return res.json(rightsWithChildren)
  }

  res.json(db.rights)
})

router.get('/children', (req, res) => {
  const db = readDB()
  res.json(db.children)
})

router.patch('/children/:id', (req, res) => {
  const db = readDB()
  const index = db.children.findIndex(c => c.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: '子权限不存在' })
  }
  db.children[index] = { ...db.children[index], ...req.body }
  writeDB(db)
  res.json(db.children[index])
})

router.delete('/children/:id', (req, res) => {
  const db = readDB()
  const index = db.children.findIndex(c => c.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: '子权限不存在' })
  }
  db.children.splice(index, 1)
  writeDB(db)
  res.status(204).send()
})

router.patch('/rights/:id', (req, res) => {
  const db = readDB()
  const index = db.rights.findIndex(r => r.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: '权限不存在' })
  }
  db.rights[index] = { ...db.rights[index], ...req.body }
  writeDB(db)
  res.json(db.rights[index])
})

router.delete('/rights/:id', (req, res) => {
  const db = readDB()
  const index = db.rights.findIndex(r => r.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: '权限不存在' })
  }
  db.rights.splice(index, 1)
  writeDB(db)
  res.status(204).send()
})

// 分类
router.get('/categories', (req, res) => {
  const db = readDB()
  res.json(db.categories)
})

router.post('/categories', (req, res) => {
  const db = readDB()
  const newCategory = {
    id: Math.max(...db.categories.map(c => c.id), 0) + 1,
    ...req.body
  }
  db.categories.push(newCategory)
  writeDB(db)
  res.status(201).json(newCategory)
})

router.delete('/categories/:id', (req, res) => {
  const db = readDB()
  const index = db.categories.findIndex(c => c.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: '分类不存在' })
  }
  db.categories.splice(index, 1)
  writeDB(db)
  res.status(204).send()
})

router.patch('/categories/:id', (req, res) => {
  const db = readDB()
  const index = db.categories.findIndex(c => c.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: '分类不存在' })
  }
  db.categories[index] = { ...db.categories[index], ...req.body }
  writeDB(db)
  res.json(db.categories[index])
})

// 区域
router.get('/regions', (req, res) => {
  const db = readDB()
  res.json(db.regions)
})

// 新闻相关
router.get('/news', (req, res) => {
  const news = readNews()
  const db = readDB()
  const { author, auditState, publishState, _expand, _sort, _order, _limit } = req.query

  let result = Array.isArray(news) ? news : (news.news || [])

  // 过滤
  if (author) {
    result = result.filter(n => n.author === author)
  }
  if (auditState !== undefined) {
    result = result.filter(n => n.auditState === parseInt(auditState))
  }
  if (publishState !== undefined) {
    result = result.filter(n => n.publishState === parseInt(publishState))
  }

  // 排序
  if (_sort) {
    result = [...result].sort((a, b) => {
      if (_order === 'desc') {
        return (b[_sort] || 0) - (a[_sort] || 0)
      }
      return (a[_sort] || 0) - (b[_sort] || 0)
    })
  }

  // 限制数量
  if (_limit) {
    result = result.slice(0, parseInt(_limit))
  }

  // 展开分类信息
  if (_expand === 'category') {
    result = result.map(n => ({
      ...n,
      category: db.categories.find(c => c.id === n.categoryId)
    }))
  }

  res.json(result)
})

router.get('/news/:id', (req, res) => {
  const news = readNews()
  const db = readDB()
  const newsArray = Array.isArray(news) ? news : (news.news || [])
  const item = newsArray.find(n => n.id === parseInt(req.params.id))

  if (!item) {
    return res.status(404).json({ message: '新闻不存在' })
  }

  // 支持多个 _expand 参数
  const expands = [].concat(req.query._expand || [])

  if (expands.includes('category')) {
    item.category = db.categories.find(c => c.id === item.categoryId)
  }
  if (expands.includes('role')) {
    const user = db.users.find(u => u.username === item.author)
    if (user) {
      item.role = db.roles.find(r => r.id === user.roleId)
    }
  }

  res.json(item)
})

router.post('/news', (req, res) => {
  let news = readNews()
  const newsArray = Array.isArray(news) ? news : (news.news || [])

  const newItem = {
    id: Math.max(...newsArray.map(n => n.id), 0) + 1,
    ...req.body,
    createTime: Date.now()
  }

  newsArray.push(newItem)
  writeNews(newsArray)
  res.status(201).json(newItem)
})

router.patch('/news/:id', (req, res) => {
  let news = readNews()
  const newsArray = Array.isArray(news) ? news : (news.news || [])
  const index = newsArray.findIndex(n => n.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ message: '新闻不存在' })
  }

  newsArray[index] = { ...newsArray[index], ...req.body }
  writeNews(newsArray)
  res.json(newsArray[index])
})

router.delete('/news/:id', (req, res) => {
  let news = readNews()
  const newsArray = Array.isArray(news) ? news : (news.news || [])
  const index = newsArray.findIndex(n => n.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ message: '新闻不存在' })
  }

  newsArray.splice(index, 1)
  writeNews(newsArray)
  res.status(204).send()
})

// 兼容原有登录接口（用于过渡）
const bcrypt = require('bcryptjs')

router.get('/users', (req, res) => {
  const db = readDB()
  const { username, password, _expand } = req.query

  let users = db.users

  // 登录查询
  if (username && password) {
    const user = users.find(u => {
      if (u.username !== username) return false
      // 支持明文和哈希两种格式
      if (u.password.startsWith('$2')) {
        return bcrypt.compareSync(password, u.password)
      }
      return u.password === password
    })
    if (user && _expand === 'role') {
      const { password: _, ...userWithoutPassword } = user
      const role = db.roles.find(r => r.id === user.roleId)
      return res.json([{ ...userWithoutPassword, role }])
    }
    const { password: _, ...userWithoutPassword } = user || {}
    return res.json(user ? [userWithoutPassword] : [])
  }

  // 列表查询
  if (_expand === 'role') {
    users = users.map(u => ({
      ...u,
      role: db.roles.find(r => r.id === u.roleId)
    }))
  }

  res.json(users)
})

module.exports = router
