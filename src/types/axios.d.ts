import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    skipGlobalLoading?: boolean
  }

  interface InternalAxiosRequestConfig {
    skipGlobalLoading?: boolean
  }
}
