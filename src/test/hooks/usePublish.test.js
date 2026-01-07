import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import axios from 'axios'
import { message, notification } from 'antd'
import usePublish from '../../publish-manage/usePublish'

// Mock dependencies
vi.mock('axios')
vi.mock('antd', () => ({
  message: {
    error: vi.fn()
  },
  notification: {
    info: vi.fn()
  },
  Modal: {
    confirm: vi.fn()
  }
}))

describe('usePublish Hook', () => {
  const mockUsername = 'testuser'
  const mockToken = JSON.stringify({ username: mockUsername })

  beforeEach(async () => {
    // 设置 localStorage
    localStorage.setItem('token', mockToken)

    // 清空所有 mock
    vi.clearAllMocks()

    // Mock Modal.confirm 为立即执行 onOk
    const antd = await import('antd')
    const Modal = vi.mocked(antd).Modal
    Modal.confirm.mockImplementation(({ onOk }) => {
      if (onOk) {
        return onOk()
      }
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('初始化和数据获取', () => {
    it('应该在挂载时获取新闻列表', async () => {
      // Arrange
      const mockNewsList = [
        { id: 1, title: '新闻1', author: mockUsername, publishState: 1 },
        { id: 2, title: '新闻2', author: mockUsername, publishState: 1 }
      ]

      vi.mocked(axios).mockResolvedValue({ data: mockNewsList })

      // Act
      const { result } = renderHook(() => usePublish(1))

      // Assert: 等待数据加载
      await waitFor(() => {
        expect(result.current.newsList).toHaveLength(2)
      })

      // 验证 API 调用参数
      expect(axios).toHaveBeenCalledWith(
        `/news?author=${mockUsername}&auditState_ne=0&publishState=1&_expand=category`
      )
    })

    it('应该根据 publishState 参数获取不同状态的新闻', async () => {
      // Arrange
      const mockNewsList = [
        { id: 1, title: '已发布新闻', publishState: 2 }
      ]

      vi.mocked(axios).mockResolvedValue({ data: mockNewsList })

      // Act: publishState = 2 (已发布)
      const { result } = renderHook(() => usePublish(2))

      // Assert
      await waitFor(() => {
        expect(result.current.newsList).toHaveLength(1)
      })

      expect(axios).toHaveBeenCalledWith(
        expect.stringContaining('publishState=2')
      )
    })

    it('应该在 publishState 变化时重新获取数据', async () => {
      // Arrange
      vi.mocked(axios).mockResolvedValue({ data: [] })

      // Act: 初始 publishState = 1
      const { rerender } = renderHook(
        ({ state }) => usePublish(state),
        { initialProps: { state: 1 } }
      )

      await waitFor(() => {
        expect(axios).toHaveBeenCalledWith(
          expect.stringContaining('publishState=1')
        )
      })

      // 清空之前的调用记录
      vi.clearAllMocks()

      // Rerender with publishState = 2
      rerender({ state: 2 })

      // Assert: 应该重新获取数据
      await waitFor(() => {
        expect(axios).toHaveBeenCalledWith(
          expect.stringContaining('publishState=2')
        )
      })
    })

    it('应该返回正确的方法', () => {
      // Arrange
      vi.mocked(axios).mockResolvedValue({ data: [] })

      // Act
      const { result } = renderHook(() => usePublish(1))

      // Assert
      expect(result.current).toHaveProperty('newsList')
      expect(result.current).toHaveProperty('confirmMethod')
      expect(typeof result.current.confirmMethod).toBe('function')
    })
  })

  describe('发布功能 (publishState = 1)', () => {
    it('应该能够发布新闻', async () => {
      // Arrange
      const newsId = 1
      const mockNewsList = [
        { id: 2, title: '其他新闻', publishState: 1 }
      ]

      // Mock axios.patch 和重新获取列表
      vi.mocked(axios).mockResolvedValueOnce({ data: [] }) // 初始获取
      vi.mocked(axios.patch).mockResolvedValueOnce({ data: { success: true } })
      vi.mocked(axios).mockResolvedValueOnce({ data: mockNewsList }) // 更新后重新获取

      const { result } = renderHook(() => usePublish(1))

      await waitFor(() => {
        expect(result.current.newsList).toBeDefined()
      })

      // Act: 发布新闻
      await act(async () => {
        await result.current.confirmMethod(newsId)
      })

      // Assert: 验证 patch 请求
      await waitFor(() => {
        expect(axios.patch).toHaveBeenCalledWith(`/news/${newsId}`, {
          publishState: 2
        })
      })

      // 验证通知
      expect(notification.info).toHaveBeenCalledWith({
        message: '通知',
        description: '您可以到【发布管理/已经发布】中查看您的新闻',
        placement: 'bottomRight'
      })
    })

    it('应该在发布失败时显示错误消息', async () => {
      // Arrange
      const newsId = 1
      vi.mocked(axios).mockResolvedValueOnce({ data: [] })
      vi.mocked(axios.patch).mockRejectedValueOnce(new Error('Network Error'))

      const { result } = renderHook(() => usePublish(1))

      await waitFor(() => {
        expect(result.current.newsList).toBeDefined()
      })

      // Act
      await act(async () => {
        await result.current.confirmMethod(newsId)
      })

      // Assert
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('出错了，请再次尝试')
      })
    })
  })

  describe('下线功能 (publishState = 2)', () => {
    it('应该能够下线新闻', async () => {
      // Arrange
      const newsId = 1
      vi.mocked(axios).mockResolvedValueOnce({ data: [] })
      vi.mocked(axios.patch).mockResolvedValueOnce({ data: { success: true } })
      vi.mocked(axios).mockResolvedValueOnce({ data: [] })

      const { result } = renderHook(() => usePublish(2))

      await waitFor(() => {
        expect(result.current.newsList).toBeDefined()
      })

      // Act: 下线新闻
      await act(async () => {
        await result.current.confirmMethod(newsId)
      })

      // Assert
      await waitFor(() => {
        expect(axios.patch).toHaveBeenCalledWith(`/news/${newsId}`, {
          publishState: 3
        })
      })

      expect(notification.info).toHaveBeenCalledWith({
        message: '通知',
        description: '您可以到【发布管理/已下线】中查看您的新闻',
        placement: 'bottomRight'
      })
    })

    it('应该在下线失败时显示错误消息', async () => {
      // Arrange
      const newsId = 1
      vi.mocked(axios).mockResolvedValueOnce({ data: [] })
      vi.mocked(axios.patch).mockRejectedValueOnce(new Error('Server Error'))

      const { result } = renderHook(() => usePublish(2))

      await waitFor(() => {
        expect(result.current.newsList).toBeDefined()
      })

      // Act
      await act(async () => {
        await result.current.confirmMethod(newsId)
      })

      // Assert
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('出错了，请再次尝试')
      })
    })
  })

  describe('删除功能 (publishState = 3)', () => {
    it('应该能够删除已下线的新闻', async () => {
      // Arrange
      const newsId = 1
      vi.mocked(axios).mockResolvedValueOnce({ data: [] })
      vi.mocked(axios.delete).mockResolvedValueOnce({ data: { success: true } })
      vi.mocked(axios).mockResolvedValueOnce({ data: [] })

      const { result } = renderHook(() => usePublish(3))

      await waitFor(() => {
        expect(result.current.newsList).toBeDefined()
      })

      // Act: 删除新闻
      await act(async () => {
        await result.current.confirmMethod(newsId)
      })

      // Assert
      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(`/news/${newsId}`, {})
      })

      expect(notification.info).toHaveBeenCalledWith({
        message: '通知',
        description: '您已经删除了已下线的新闻',
        placement: 'bottomRight'
      })
    })

    it('应该在删除失败时显示错误消息', async () => {
      // Arrange
      const newsId = 1
      vi.mocked(axios).mockResolvedValueOnce({ data: [] })
      vi.mocked(axios.delete).mockRejectedValueOnce(new Error('Delete failed'))

      const { result } = renderHook(() => usePublish(3))

      await waitFor(() => {
        expect(result.current.newsList).toBeDefined()
      })

      // Act
      await act(async () => {
        await result.current.confirmMethod(newsId)
      })

      // Assert
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('出错了，请再次尝试')
      })
    })
  })

  describe('无效的 publishState', () => {
    it('应该在 publishState 无效时显示错误消息', async () => {
      // Arrange
      vi.mocked(axios).mockResolvedValueOnce({ data: [] })

      const { result } = renderHook(() => usePublish(999)) // 无效的 state

      await waitFor(() => {
        expect(result.current.newsList).toBeDefined()
      })

      // Act
      await act(async () => {
        await result.current.confirmMethod(1)
      })

      // Assert
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('暂无相应功能！')
      })
    })
  })
})
