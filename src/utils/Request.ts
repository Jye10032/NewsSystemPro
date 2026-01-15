import axios from 'axios'
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
    store.dispatch({ type: 'change_loading' })
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
  function (config) {
    store.dispatch({ type: 'change_loading' })
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)
