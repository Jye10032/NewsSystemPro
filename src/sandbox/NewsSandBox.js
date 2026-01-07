
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import SideMenu from './SideMenu'
import TopHead from './TopHead'
import NewsRouter from '../router/NewsRouter'
import './NewsSandBox.css'
import React, { useEffect } from 'react'
import { Layout, theme } from 'antd'
const { Content } = Layout

export default function NewsSandBox() {
    const {
        token: { colorBgContainer }
    } = theme.useToken()

    //加载进度条
    NProgress.start()
    useEffect(() => {
        NProgress.done()
    })

    return (
        <Layout>
            <SideMenu></SideMenu>
            <Layout className="site-layout">
                <TopHead></TopHead>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        overflow: 'auto'
                    }}
                >
                    <NewsRouter></NewsRouter>
                </Content>
            </Layout>
        </Layout>
    )
}
