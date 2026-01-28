import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import bcrypt from 'bcryptjs'

// TODO: vitest 对 CommonJS 模块 (.cjs) 的 mock 在某些场景下有限制
// 这些测试需要重构或使用其他 mock 方案
const { mockReadDB, mockWriteDB } = vi.hoisted(() => ({
  mockReadDB: vi.fn(),
  mockWriteDB: vi.fn()
}))

vi.mock('../../../server/utils/db.cjs', () => ({
  readDB: mockReadDB,
  writeDB: mockWriteDB
}))

vi.mock('../../../server/middleware/auth.cjs', () => ({
  authMiddleware: vi.fn((req, _res, next) => {
    req.user = { userId: 1 }
    next()
  })
}))

const usersRouter = require('../../../server/routes/users.cjs')

describe.skip('Users routes', () => {
  let app
  let db

  beforeEach(() => {
    db = {
      users: [
        {
          id: 1,
          username: 'admin',
          password: bcrypt.hashSync('123456', 10),
          roleState: true,
          default: true,
          roleId: 1,
          allowedCategoryIds: [1]
        },
        {
          id: 2,
          username: 'tom',
          password: bcrypt.hashSync('123456', 10),
          roleState: true,
          default: false,
          roleId: 2,
          allowedCategoryIds: [2]
        }
      ],
      roles: [
        { id: 1, roleName: '超级管理员' },
        { id: 2, roleName: '编辑' }
      ]
    }

    mockReadDB.mockImplementation(() => db)
    mockWriteDB.mockImplementation((next) => {
      db = next
    })

    app = express()
    app.use(express.json())
    app.use('/api/users', usersRouter)
  })

  it('GET /me 返回当前用户信息', async () => {
    const res = await request(app).get('/api/users/me')
    expect(res.status).toBe(200)
    expect(res.body.username).toBe('admin')
    expect(res.body.password).toBeUndefined()
    expect(res.body.role).toEqual({ id: 1, roleName: '超级管理员' })
  })

  it('GET /me 用户不存在返回 404', async () => {
    authMiddleware.mockImplementationOnce((req, _res, next) => {
      req.user = { userId: 999 }
      next()
    })

    const res = await request(app).get('/api/users/me')
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('用户不存在')
  })

  it('GET / 支持 _expand=role', async () => {
    const res = await request(app).get('/api/users?_expand=role')
    expect(res.status).toBe(200)
    expect(res.body[0].role).toEqual({ id: 1, roleName: '超级管理员' })
  })

  it('GET /:id 用户不存在返回 404', async () => {
    const res = await request(app).get('/api/users/999')
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('用户不存在')
  })

  it('POST / 缺少用户名密码返回 400', async () => {
    const res = await request(app).post('/api/users').send({})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('用户名和密码不能为空')
  })

  it('POST / 用户名已存在返回 400', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: 'admin', password: '123', roleId: 1 })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('用户名已存在')
  })

  it('POST / 创建用户成功', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: 'newuser', password: '123', roleId: 2 })

    expect(res.status).toBe(201)
    expect(res.body.username).toBe('newuser')
    expect(res.body.password).toBeUndefined()
    expect(writeDB).toHaveBeenCalled()
  })

  it('PATCH /:id 用户不存在返回 404', async () => {
    const res = await request(app)
      .patch('/api/users/999')
      .send({ roleState: false })

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('用户不存在')
  })

  it('PATCH /:id 更新密码应哈希', async () => {
    const res = await request(app)
      .patch('/api/users/2')
      .send({ password: 'newpass', roleState: false })

    expect(res.status).toBe(200)
    expect(res.body.password).toBeUndefined()
    expect(db.users[1].password.startsWith('$2')).toBe(true)
  })

  it('DELETE /:id 默认用户不可删除', async () => {
    const res = await request(app).delete('/api/users/1')
    expect(res.status).toBe(403)
    expect(res.body.message).toBe('不能删除默认用户')
  })

  it('DELETE /:id 删除用户成功', async () => {
    const res = await request(app).delete('/api/users/2')
    expect(res.status).toBe(204)
    expect(db.users.find(user => user.id === 2)).toBeUndefined()
  })
})
