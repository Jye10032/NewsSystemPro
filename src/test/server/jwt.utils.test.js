import { describe, it, expect } from 'vitest'
const { generateToken, verifyToken } = require('../../../server/utils/jwt.cjs')

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
})
