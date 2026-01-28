import { describe, it, expect, vi } from 'vitest'
const { authMiddleware, optionalAuth } = require('../../../server/middleware/auth.cjs')
const { generateToken } = require('../../../server/utils/jwt.cjs')

function createRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('authMiddleware', () => {
  it('未提供 token 时返回 401', () => {
    const req = { cookies: {} }
    const res = createRes()
    const next = vi.fn()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: '未提供认证令牌' })
    expect(next).not.toHaveBeenCalled()
  })

  it('无效 token 时返回 401', () => {
    const req = { cookies: { jwt: 'bad-token' } }
    const res = createRes()
    const next = vi.fn()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: '令牌无效或已过期' })
    expect(next).not.toHaveBeenCalled()
  })

  it('有效 token 时放行并写入 req.user', () => {
    const token = generateToken({ userId: 1, username: 'admin', roleId: 1 })
    const req = { cookies: { jwt: token } }
    const res = createRes()
    const next = vi.fn()

    authMiddleware(req, res, next)

    expect(req.user).toBeTruthy()
    expect(req.user.userId).toBe(1)
    expect(next).toHaveBeenCalled()
  })
})

describe('optionalAuth', () => {
  it('无 token 时直接放行', () => {
    const req = { cookies: {} }
    const res = createRes()
    const next = vi.fn()

    optionalAuth(req, res, next)

    expect(req.user).toBeUndefined()
    expect(next).toHaveBeenCalled()
  })

  it('有效 token 时写入 req.user', () => {
    const token = generateToken({ userId: 2, username: 'tom', roleId: 2 })
    const req = { cookies: { jwt: token } }
    const res = createRes()
    const next = vi.fn()

    optionalAuth(req, res, next)

    expect(req.user).toBeTruthy()
    expect(req.user.userId).toBe(2)
    expect(next).toHaveBeenCalled()
  })
})
