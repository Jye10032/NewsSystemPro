import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'
import AuthRoute from './AuthRoute'

const Login = lazy(() => import('../modules/login/Login'))
const NewsSandBox = lazy(() => import('../sandbox/NewsSandBox'))
const Detail = lazy(() => import('../modules/visitor/pages/Detail'))
const News = lazy(() => import('../modules/visitor/pages/News'))

/**
 * 基础路由，在App.js中引入
 */
export default function IndexRouter() {
    return (
        <Suspense fallback={<Spin size="large" tip="页面加载中..." />}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/news" element={<News />} />
                <Route path="/detail/:id" element={<Detail />} />
                <Route path="/*" element={
                    <AuthRoute>
                        <NewsSandBox />
                    </AuthRoute>
                } />
            </Routes>
        </Suspense>
    )
}
