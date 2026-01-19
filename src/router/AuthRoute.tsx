import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/types'

interface AuthRouteProps {
    children: ReactNode
}

/**
 * 路由守卫组件
 * 检查用户是否已登录（Redux 中是否有用户信息）
 * 如果已登录，渲染子组件
 * 如果未登录，重定向到登录页面
 */
export default function AuthRoute({ children }: AuthRouteProps) {
    const user = useSelector((state: RootState) => state.user)

    if (user) {
        return <>{children}</>
    } else {
        return <Navigate to="/login" replace />
    }
}
