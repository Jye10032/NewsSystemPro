import axios from 'axios'
import { store } from '../redux/store'

/*
 * axios的二次封装
 * 1. 配置基础路径和超时限制
 * 2. 设置拦截器，加载loading
 */

axios.defaults.baseURL = 'http://localhost:8000'

axios.interceptors.request.use(
  function (config) {
    store.dispatch({ type: 'change_loading' })
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
