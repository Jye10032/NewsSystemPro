import Home from '../sandbox/home/Home'
import RightList from '../sandbox/right-manage/RightList'
import RoleList from '../sandbox/right-manage/RoleList'
import UserList from '../sandbox/user-manage/UserList'
import Nopermission from '../sandbox/nopermission/Nopermission'
import Audit from '../sandbox/audit-manage/Audit'
import AuditList from '../sandbox/audit-manage/AuditList'
import NewAdd from '../modules/news/pages/NewsAdd'
import NewsCategory from '../modules/news/pages/NewsCategory'
import NewsDraft from '../modules/news/pages/NewsDraft'
import NewsPreivew from '../modules/news/pages/NewsPreivew'
import NewsUpdate from '../modules/news/pages/NewsUpdate'
import Published from '../modules/publish/pages/Published'
import Unpublished from '../modules/publish/pages/Unpublished'
import Sunset from '../modules/publish/pages/Sunset'
import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'
import axios from 'axios'
import { connect } from 'react-redux'
/**
 * 对应页面的路由导航
 * 1.判断用户是否具有访问权限
 * 2.判断路由是否存在
 * 3.Spin：进度条加载指示器
 * 4.在backRouteList中,由于LocalRouterMap[item.key] 是一个组件，
 * 应该返回 <LocalRouterMap[item.key] />，而不是 LocalRouterMap[item.key]，
 * 但是因为 item.key 是一个变量，
 * 不能直接在 JSX 中使用它来创建一个组件实例。
 * 需要先获取到组件，然后再使用 React.createElement() 来创建一个组件实例
 */

const LocalRouterMap = {
    '/home': Home,
    '/user-manage/list': UserList,
    '/user-manage/role': RoleList,
    '/user-manage/menu': RightList,
    '/audit-manage/audit': Audit,
    '/audit-manage/list': AuditList,
    '/news-manage/add': NewAdd,
    '/news-manage/draft': NewsDraft,
    '/news-manage/preview/:id': NewsPreivew,
    '/news-manage/update/:id': NewsUpdate,
    '/publish-manage/sunset': Sunset,
    '/publish-manage/published': Published,
    '/publish-manage/unpublished': Unpublished,
    '/system-manage/category': NewsCategory
}

function NewsRouter(props) {
    const {
        role: { rights }
    } = JSON.parse(localStorage.getItem('token'))
    const [backRouteList, setBackRouteList] = useState([])
    useEffect(() => {
        axios.get('/rights').then((res) => {
            // 展平嵌套结构：一级菜单 + 所有二级菜单
            const flatList = res.data.reduce((acc, item) => {
                acc.push(item)
                if (item.children && item.children.length > 0) {
                    acc.push(...item.children)
                }
                return acc
            }, [])
            setBackRouteList(flatList)
        })
    }, [])
    // 检车用户的权限
    function checkUserPermission(key) {
        return rights.includes(key)
    }
    // 检测路径是否存在
    function checkRoute(item) {
        return LocalRouterMap[item.key] && (item.pagepermisson || item.routepermisson)
    }
    return (
        <Spin
            size="large"
            tip="加载中..."
            spinning={props.isLoading}
        >
            <Routes>
                {backRouteList.map((item) => {
                    if (checkUserPermission(item.key) && checkRoute(item)) {
                        //console.log(item.key)
                        return (
                            <Route
                                path={item.key}
                                key={item.key}
                                element={React.createElement(LocalRouterMap[item.key])}
                            ></Route>
                        )
                    } else {
                        return null
                    }
                })}

                {/* <Redirect
                    from="/"
                    to="/home"
                    exact
                ></Redirect>
                <Route
                    path="*"
                    component={NoPermission}
                ></Route> */}
                <Route path="/" element={<Home />}></Route>
                <Route path="*" element={<Nopermission />} />
            </Routes>
        </Spin >
    )
}

export default connect((state) => ({
    isLoading: state.isLoading
}))(NewsRouter)
