import { describe, it, expect } from 'vitest'
const {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../../../server/utils/jwt.cjs')

describe('JWT utils', () => {
  it('应该生成可验证的 token', () => {
    const token = generateToken({ userId: 10, username: 'tester' })
    expect(typeof token).toBe('string')

    const decoded = verifyToken(token)
    expect(decoded.userId).toBe(10)
    expect(decoded.username).toBe('tester')
  })

  it('无效 token 应该返回 null', () => {
    const decoded = verifyToken('bad-token')
    expect(decoded).toBeNull()
  })

  it('应该生成可验证的 refresh token', () => {
    const token = generateRefreshToken({ userId: 11, username: 'refresh-user' })
    expect(typeof token).toBe('string')

    const decoded = verifyRefreshToken(token)
    expect(decoded.userId).toBe(11)
    expect(decoded.username).toBe('refresh-user')
  })
})
