import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import SideMenu from './SideMenu'
import TopHead from './TopHead'
import NewsRouter from '../router/NewsRouter'
import '@/styles/NewsSandBox.css'
import { useEffect } from 'react'
import { Layout } from 'antd'
const { Content } = Layout

export default function NewsSandBox() {
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
                <Content>
                    <NewsRouter></NewsRouter>
                </Content>
            </Layout>
        </Layout>
    )
}
