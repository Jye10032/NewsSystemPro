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

vi.mock('../../../server/utils/jwt.cjs', () => ({
  generateToken: vi.fn(() => 'test-token')
}))

const authRouter = require('../../../server/routes/auth.cjs')

describe.skip('Auth routes', () => {
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
          username: 'plain',
          password: 'pass',
          roleState: true,
          default: false,
          roleId: 2,
          allowedCategoryIds: []
        },
        {
          id: 3,
          username: 'disabled',
          password: 'pass',
          roleState: false,
          default: false,
          roleId: 2,
          allowedCategoryIds: []
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
    app.use('/api/auth', authRouter)
  })

  it('登录缺少参数应返回 400', async () => {
    const res = await request(app).post('/api/auth/login').send({})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('用户名和密码不能为空')
  })

  it('登录用户不存在应返回 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: '123' })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('用户名或密码错误')
  })

  it('登录密码错误应返回 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('用户名或密码错误')
  })

  it('登录账号禁用应返回 403', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'disabled', password: 'pass' })

    expect(res.status).toBe(403)
    expect(res.body.message).toBe('账号已被禁用')
  })

  it('登录成功应设置 Cookie 并返回角色信息', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: '123456' })

    expect(res.status).toBe(200)
    expect(res.headers['set-cookie'][0]).toContain('jwt=test-token')
    expect(res.body.user.username).toBe('admin')
    expect(res.body.user.password).toBeUndefined()
    expect(res.body.user.role).toEqual({ id: 1, roleName: '超级管理员' })
  })

  it('登录支持明文密码', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'plain', password: 'pass' })

    expect(res.status).toBe(200)
    expect(res.body.user.username).toBe('plain')
  })

  it('登出应清除 Cookie', async () => {
    const res = await request(app).post('/api/auth/logout')
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Logged out')
  })

  it('注册缺少参数应返回 400', async () => {
    const res = await request(app).post('/api/auth/register').send({})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('用户名和密码不能为空')
  })

  it('注册用户名已存在应返回 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin', password: '123' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('用户名已存在')
  })

  it('注册成功应写入用户并返回数据', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', password: '123', roleId: 2 })

    expect(res.status).toBe(201)
    expect(res.body.user.username).toBe('newuser')
    expect(res.body.user.password).toBeUndefined()
    expect(writeDB).toHaveBeenCalled()
  })
})
