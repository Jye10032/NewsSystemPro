import SideMenu from './SideMenu'
import TopHead from './TopHead'
import NewsRouter from '../router/NewsRouter'
import '@/styles/NewsSandBox.css'
import { useEffect } from 'react'
import { Layout } from 'antd'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '@/utils/Request'
import { clearAuthToken } from '@/utils/authToken'
const { Content } = Layout

export default function NewsSandBox() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        // 只在组件挂载时刷新一次用户权限数据（Cookie 自动携带）
        api.get('/api/users/me').then(res => {
            dispatch({ type: 'set_user', payload: res.data })
        }).catch(() => {
            // Cookie 无效，清除登录状态
            clearAuthToken()
            dispatch({ type: 'clear_user' })
            navigate('/login', { replace: true })
        })
    }, [dispatch, navigate])

    return (
        <Layout>
            <SideMenu></SideMenu>
            <Layout className="site-layout">
                <TopHead></TopHead>
                <Content>
                    <NewsRouter></NewsRouter>
                </Content>
            </Layout>
        </Layout>
    )
}
