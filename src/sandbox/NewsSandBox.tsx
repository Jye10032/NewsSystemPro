import SideMenu from './SideMenu'
import TopHead from './TopHead'
import NewsRouter from '../router/NewsRouter'
import '@/styles/NewsSandBox.css'
import { useEffect } from 'react'
import { Layout } from 'antd'
import axios from 'axios'
const { Content } = Layout

export default function NewsSandBox() {
    useEffect(() => {
        // 每次进入系统时刷新用户权限数据
        const jwt = localStorage.getItem('jwt')
        if (jwt) {
            axios.get('/api/users/me').then(res => {
                localStorage.setItem('token', JSON.stringify(res.data))
            }).catch(() => {
                // JWT 无效，清除登录状态
                localStorage.removeItem('jwt')
                localStorage.removeItem('token')
                window.location.href = '/login'
            })
        }
    }, [])

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
