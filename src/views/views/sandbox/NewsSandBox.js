// import React from 'react'
// import SideMenu from '../../components/sandbox/SideMenu'
// import TopHeader from '../../components/sandbox/TopHead'
// import './NewsSandBox.css'

// import Home from './home/Home'
// import UserList from './user-manage/UserList'
// import RoleList from './right-manage/RoleList'
// import RightList from './right-manage/RightList'
// import Nopermission from './nopermission/Nopermission'

// import { BrowserRouter, Routes, Route, Navigate, redirect } from 'react-router-dom'
// import { Layout } from 'antd'
// import { Content } from 'antd/es/layout/layout'

// export default function NewsSandBox() {
//     return (
//         <Layout>
//             <SideMenu></SideMenu>
//             <Layout className="site-layout">
//                 <TopHeader></TopHeader>
//                 <Content>

//                     <Routes>
//                         <Route path="/home" element={<Home />}></Route>
//                         <Route path="/user-manage/list" element={<UserList />}></Route>
//                         <Route path="/right-manage/role/list" element={<RoleList />}></Route>
//                         <Route path="/right-manage/right/list" element={<RightList />}></Route>

//                         <Route path="/" element={<Home />}></Route>
//                         <Route path="*" element={<Nopermission />} />
//                     </Routes>

//                 </Content>
//             </Layout>
//         </Layout>
//     )
// }
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import SideMenu from '../../components/sandbox/SideMenu'
import TopHead from '../../components/sandbox/TopHead'
import NewsRouter from '../../components/sandbox/NewsRouter'
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
