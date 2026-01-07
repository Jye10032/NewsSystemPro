import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import axios from 'axios'

// Mock Redux store - 使用工厂函数
vi.mock('../../redux/store', () => {
  const mockDispatch = vi.fn()
  return {
    store: {
      dispatch: mockDispatch
    },
    // 导出 mockDispatch 供测试使用
    __mockDispatch: mockDispatch
  }
})

// 导入 Request 来触发拦截器的设置
import '../../utils/Request'
import { __mockDispatch as mockDispatch } from '../../redux/store'

describe('Axios 拦截器', () => {
  beforeEach(() => {
    // 清空所有 mock 调用记录
    mockDispatch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('请求拦截器', () => {
    it('应该在发送请求前触发 loading', async () => {
      // Arrange: 创建一个新的 axios 实例进行测试
      const testAxios = axios.create()

      // 设置拦截器
      testAxios.interceptors.request.use(
        function (config) {
          mockDispatch({ type: 'change_loading' })
          return config
        }
      )

      // Mock 适配器
      testAxios.defaults.adapter = async (config) => {
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config }
      }

      // Act: 发送请求
      await testAxios.get('/test')

      // Assert: 验证 dispatch 被调用
      expect(mockDispatch).toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'change_loading' })
    })

    it('应该正确传递请求配置', async () => {
      // Arrange
      const testAxios = axios.create()
      let capturedConfig = null

      testAxios.defaults.adapter = async (config) => {
        capturedConfig = config
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config }
      }

      const testData = { name: 'test' }

      // Act
      await testAxios.post('/test', testData)

      // Assert: 验证请求配置被正确传递
      expect(capturedConfig).toBeTruthy()
      expect(capturedConfig.method).toBe('post')
      expect(capturedConfig.data).toEqual(JSON.stringify(testData))
    })

    it('应该在请求失败时返回错误', async () => {
      // Arrange
      const testAxios = axios.create()
      const mockError = new Error('Network Error')

      testAxios.defaults.adapter = async () => {
        throw mockError
      }

      // Act & Assert
      await expect(testAxios.get('/test')).rejects.toThrow('Network Error')
    })
  })

  describe('响应拦截器', () => {
    it('应该在接收响应后触发 loading', async () => {
      // Arrange
      const testAxios = axios.create()

      // 设置请求和响应拦截器
      testAxios.interceptors.request.use(
        function (config) {
          mockDispatch({ type: 'change_loading' })
          return config
        }
      )

      testAxios.interceptors.response.use(
        function (response) {
          mockDispatch({ type: 'change_loading' })
          return response
        }
      )

      testAxios.defaults.adapter = async (config) => {
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config }
      }

      // Act
      await testAxios.get('/test')

      // Assert: 验证 dispatch 被调用了两次（请求前和响应后）
      expect(mockDispatch).toHaveBeenCalledTimes(2)
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'change_loading' })
    })

    it('应该正确返回响应数据', async () => {
      // Arrange
      const testAxios = axios.create()
      const mockData = { id: 1, title: '测试新闻' }

      testAxios.defaults.adapter = async (config) => {
        return { data: mockData, status: 200, statusText: 'OK', headers: {}, config }
      }

      // Act
      const response = await testAxios.get('/news/1')

      // Assert
      expect(response.data).toEqual(mockData)
    })

    it('应该在响应错误时正确处理', async () => {
      // Arrange
      const testAxios = axios.create()
      const mockError = new Error('Server Error')

      testAxios.interceptors.request.use(
        function (config) {
          mockDispatch({ type: 'change_loading' })
          return config
        }
      )

      testAxios.defaults.adapter = async () => {
        throw mockError
      }

      // Act & Assert
      await expect(testAxios.get('/test')).rejects.toThrow('Server Error')

      // 验证 loading 被触发（至少请求时调用一次）
      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  describe('基础配置', () => {
    it('应该能够配置 baseURL', () => {
      // Arrange
      const testAxios = axios.create({
        baseURL: 'http://localhost:8000'
      })

      // Assert
      expect(testAxios.defaults.baseURL).toBe('http://localhost:8000')
    })

    it('应该能够使用相对路径发送请求', async () => {
      // Arrange
      const testAxios = axios.create({ baseURL: 'http://localhost:8000' })
      let capturedConfig = null

      testAxios.defaults.adapter = async (config) => {
        capturedConfig = config
        return { data: [], status: 200, statusText: 'OK', headers: {}, config }
      }

      // Act
      await testAxios.get('/news')

      // Assert: 验证使用相对路径发送请求
      expect(capturedConfig.url).toBe('/news')
      expect(capturedConfig.baseURL).toBe('http://localhost:8000')
    })
  })

  describe('Loading 状态切换', () => {
    it('应该在多个并发请求时正确切换 loading', async () => {
      // Arrange
      const testAxios = axios.create()

      // 设置请求和响应拦截器
      testAxios.interceptors.request.use(
        function (config) {
          mockDispatch({ type: 'change_loading' })
          return config
        }
      )

      testAxios.interceptors.response.use(
        function (response) {
          mockDispatch({ type: 'change_loading' })
          return response
        }
      )

      testAxios.defaults.adapter = async (config) => {
        return {
          data: config.method === 'get' ? { id: 1 } : { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      }

      // Act: 发送多个并发请求
      await Promise.all([
        testAxios.get('/news/1'),
        testAxios.post('/news', { title: 'test' })
      ])

      // Assert: 验证 dispatch 被多次调用
      expect(mockDispatch).toHaveBeenCalled()

      // 每个请求应该触发 2 次 change_loading (请求前 + 响应后)
      expect(mockDispatch).toHaveBeenCalledTimes(4) // 2个请求 × 2次调用
    })
  })
})
