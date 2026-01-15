import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'news-system-pro-secret-key'

// 生成测试用 JWT token
function generateTestToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}

// 测试用户 token
const adminToken = generateTestToken({ userId: 1, username: 'admin', roleId: 1 })
const managerToken = generateTestToken({ userId: 2, username: '铁锤', roleId: 2 })
const editorToken = generateTestToken({ userId: 5, username: '西门吹灯', roleId: 3 })

// 导入 Express app
const app = require('../../../server/index.cjs')

describe('后端权限校验', () => {

  describe('用户管理权限 /users', () => {
    it('GET 请求应该放行（无需权限）', async () => {
      const res = await request(app).get('/users')
      expect(res.status).toBe(200)
    })

    it('超级管理员可以修改用户', async () => {
      const res = await request(app)
        .patch('/users/5')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ roleState: true })

      // 200 或 404（用户不存在）都算通过权限校验
      expect([200, 404]).toContain(res.status)
    })

    it('编辑不能修改用户（权限不足）', async () => {
      const res = await request(app)
        .patch('/users/5')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ roleState: true })

      expect(res.status).toBe(403)
      expect(res.body.error).toBe('权限不足')
    })

    it('未登录不能修改用户', async () => {
      const res = await request(app)
        .patch('/users/5')
        .send({ roleState: true })

      expect(res.status).toBe(403)
      expect(res.body.error).toBe('未登录')
    })
  })

  describe('角色管理权限 /roles', () => {
    it('超级管理员可以修改角色', async () => {
      const res = await request(app)
        .patch('/roles/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rights: ['/home'] })

      expect([200, 404]).toContain(res.status)
    })

    it('分类管理员不能修改角色', async () => {
      const res = await request(app)
        .patch('/roles/2')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ rights: ['/home'] })

      expect(res.status).toBe(403)
    })
  })

  describe('分类管理权限 /categories', () => {
    it('超级管理员可以删除分类', async () => {
      const res = await request(app)
        .delete('/categories/999')
        .set('Authorization', `Bearer ${adminToken}`)

      // 200 或 404 都算通过权限校验
      expect([200, 404]).toContain(res.status)
    })

    it('编辑不能删除分类', async () => {
      const res = await request(app)
        .delete('/categories/1')
        .set('Authorization', `Bearer ${editorToken}`)

      expect(res.status).toBe(403)
    })
  })

  describe('新闻访问权限 /news', () => {
    it('已发布新闻所有人可访问', async () => {
      // 先获取一个已发布的新闻 ID
      const listRes = await request(app).get('/news?publishState=2&_limit=1')

      if (listRes.body.length > 0) {
        const newsId = listRes.body[0].id
        const res = await request(app).get(`/news/${newsId}`)
        expect(res.status).toBe(200)
      }
    })

    it('未发布新闻非作者不能访问', async () => {
      // 获取一个未发布的新闻
      const listRes = await request(app).get('/news?publishState_ne=2&_limit=1')

      if (listRes.body.length > 0) {
        const newsId = listRes.body[0].id
        const author = listRes.body[0].author

        // 用不是作者的 token 访问
        const otherToken = author === 'admin' ? editorToken : adminToken
        const res = await request(app)
          .get(`/news/${newsId}`)
          .set('Authorization', `Bearer ${otherToken}`)

        expect(res.status).toBe(403)
        expect(res.body.error).toBe('无权访问未发布内容')
      }
    })

    it('作者可以访问自己的未发布新闻', async () => {
      // 获取 admin 的未发布新闻
      const listRes = await request(app).get('/news?author=admin&publishState_ne=2&_limit=1')

      if (listRes.body.length > 0) {
        const newsId = listRes.body[0].id
        const res = await request(app)
          .get(`/news/${newsId}`)
          .set('Authorization', `Bearer ${adminToken}`)

        expect(res.status).toBe(200)
      }
    })
  })
})
