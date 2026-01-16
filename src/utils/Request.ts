import axios from 'axios'
import { message } from 'antd'
import { store } from '../redux/store'

/*
 * axios的二次封装
 * 1. 配置基础路径和超时限制
 * 2. 设置拦截器，加载loading
 */

// API基础URL配置
// 开发环境: http://localhost:8000
// 生产环境: 您部署的后端URL (如: https://your-project.vercel.app)
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

axios.interceptors.request.use(
  function (config) {
    store.dispatch({ type: 'loading_start' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log('[Request Start]', config.method?.toUpperCase(), config.url, '| Loading:', (store.getState() as any).isLoading)
    // 添加 JWT Authorization header 用于后端权限校验
    const jwt = localStorage.getItem('jwt')
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)
axios.interceptors.response.use(
  function (response) {
    store.dispatch({ type: 'loading_end' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log('[Request End]', response.config.method?.toUpperCase(), response.config.url, '| Loading:', (store.getState() as any).isLoading)
    return response
  },
  function (error) {
    store.dispatch({ type: 'loading_end' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log('[Request Error]', error.config?.method?.toUpperCase(), error.config?.url, '| Loading:', (store.getState() as any).isLoading)
    // 显示错误提示
    const msg = error.response?.data?.message || error.response?.data?.error || '请求失败'
    message.error(msg)
    return Promise.reject(error)
  },
)
