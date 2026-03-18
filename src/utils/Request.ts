import axios from 'axios'
import { store } from '../redux/store'
import { clearAuthToken, getAuthToken } from './authToken'
import { appMessage } from './appMessage'
import type { InternalAxiosRequestConfig } from 'axios'

/*
 * axios的二次封装
 * 1. 配置基础路径和超时限制
 * 2. 设置拦截器，加载loading
 */

// API基础URL配置
// 开发环境: http://localhost:8000
// 生产环境: 您部署的后端URL (如: https://your-project.vercel.app)
const api = axios
if (api.defaults) {
  api.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  api.defaults.withCredentials = true // 跨域请求携带 Cookie
}

type ExtendedAxiosConfig = InternalAxiosRequestConfig & {
  skipGlobalLoading?: boolean
}

if (api.interceptors?.request && api.interceptors?.response) {
  api.interceptors.request.use(
    function (config: ExtendedAxiosConfig) {
      if (!config.skipGlobalLoading) {
        store.dispatch({ type: 'loading_start' })
      }
      const token = getAuthToken()
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      if (import.meta.env.DEV) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log('[Request Start]', config.method?.toUpperCase(), config.url, '| Loading:', (store.getState() as any).isLoading)
      }
      return config
    },
    function (error) {
      return Promise.reject(error)
    },
  )
  api.interceptors.response.use(
    function (response) {
      if (!(response.config as ExtendedAxiosConfig).skipGlobalLoading) {
        store.dispatch({ type: 'loading_end' })
      }
      if (import.meta.env.DEV) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log('[Request End]', response.config.method?.toUpperCase(), response.config.url, '| Loading:', (store.getState() as any).isLoading)
      }
      return response
    },
    function (error) {
      if (!(error.config as ExtendedAxiosConfig | undefined)?.skipGlobalLoading) {
        store.dispatch({ type: 'loading_end' })
      }
      if (import.meta.env.DEV) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log('[Request Error]', error.config?.method?.toUpperCase(), error.config?.url, '| Loading:', (store.getState() as any).isLoading)
      }
      if (Number(error.response?.status || 0) === 401) {
        clearAuthToken()
      }
      // 显示错误提示
      const msg = error.response?.data?.message || error.response?.data?.error || '请求失败'
      appMessage.error(msg)
      return Promise.reject(error)
    },
  )
}

export default api
