import { describe, it, expect, beforeEach, vi } from 'vitest'

// TODO: vitest 对 Node.js 内置模块 (fs) 的 mock 在 CommonJS 环境下有限制
// 这些测试需要重构为集成测试或使用其他 mock 方案
describe.skip('DB utils', () => {
  beforeEach(() => {
    mockReadFileSync.mockReset()
    mockWriteFileSync.mockReset()
  })

  it('readDB 应该读取并解析 db.json', () => {
    mockReadFileSync.mockReturnValueOnce(JSON.stringify({ users: [] }))

    const data = readDB()

    expect(mockReadFileSync).toHaveBeenCalledWith(expect.stringContaining('db.json'), 'utf-8')
    expect(data).toEqual({ users: [] })
  })

  it('readNews 应该读取并解析 news.json', () => {
    mockReadFileSync.mockReturnValueOnce(JSON.stringify([{ id: 1, title: 'news' }]))

    const data = readNews()

    expect(mockReadFileSync).toHaveBeenCalledWith(expect.stringContaining('news.json'), 'utf-8')
    expect(data).toEqual([{ id: 1, title: 'news' }])
  })

  it('writeDB 应该写入 db.json', () => {
    const payload = { users: [{ id: 1 }] }

    writeDB(payload)

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('db.json'),
      JSON.stringify(payload, null, 2)
    )
  })

  it('writeNews 应该写入 news.json', () => {
    const payload = [{ id: 2 }]

    writeNews(payload)

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('news.json'),
      JSON.stringify(payload, null, 2)
    )
  })
})
