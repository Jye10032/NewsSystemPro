import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface AuthRouteProps {
    children: ReactNode
}

/**
 * 路由守卫组件
 * 检查用户是否已登录（是否有 token）
 * 如果已登录，渲染子组件
 * 如果未登录，重定向到登录页面
 */
export default function AuthRoute({ children }: AuthRouteProps) {
    const token = localStorage.getItem('token')

    if (token) {
        return <>{children}</>
    } else {
        return <Navigate to="/login" replace />
    }
}
