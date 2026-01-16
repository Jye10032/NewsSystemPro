import { useEffect, useState, lazy, Suspense, ComponentType } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'
import axios from 'axios'
import { connect } from 'react-redux'
import type { Right, RootState } from '@/types'


/**
 * 对应页面的路由导航
 * 1.判断用户是否具有访问权限
 * 2.判断路由是否存在
 * 3.Spin：进度条加载指示器
 * 4.动态组件渲染：由于 LocalRouterMap[item.key] 是动态获取的组件，
 * JSX 不支持 <LocalRouterMap[item.key] /> 这种写法，
 * 需要先赋值给大写变量 Component，再用 <Component /> 渲染
 */

// 懒加载组件 - 首屏只加载当前页面，其他页面延迟加载
const Home = lazy(() => import('../sandbox/home/Home'))
const UserList = lazy(() => import('../sandbox/user-manage/UserList'))
const RoleList = lazy(() => import('../sandbox/right-manage/RoleList'))
const RightList = lazy(() => import('../sandbox/right-manage/RightList'))
const Nopermission = lazy(() => import('../sandbox/nopermission/Nopermission'))
const Audit = lazy(() => import('../sandbox/audit-manage/Audit'))
const AuditList = lazy(() => import('../sandbox/audit-manage/AuditList'))
const NewsAdd = lazy(() => import('../modules/news/pages/NewsAdd'))
const NewsCategory = lazy(() => import('../modules/news/pages/NewsCategory'))
const NewsDraft = lazy(() => import('../modules/news/pages/NewsDraft'))
const NewsPreview = lazy(() => import('../modules/news/pages/NewsPreivew'))
const NewsUpdate = lazy(() => import('../modules/news/pages/NewsUpdate'))
const Published = lazy(() => import('../modules/publish/pages/Published'))
const Unpublished = lazy(() => import('../modules/publish/pages/Unpublished'))
const Sunset = lazy(() => import('../modules/publish/pages/Sunset'))

const LocalRouterMap: Record<string, ComponentType> = {
    '/home': Home,
    '/user-manage/list': UserList,
    '/user-manage/role': RoleList,
    '/user-manage/menu': RightList,
    '/audit-manage/audit': Audit,
    '/audit-manage/list': AuditList,
    '/news-manage/add': NewsAdd,
    '/news-manage/draft': NewsDraft,
    '/news-manage/preview/:id': NewsPreview,
    '/news-manage/update/:id': NewsUpdate,
    '/publish-manage/sunset': Sunset,
    '/publish-manage/published': Published,
    '/publish-manage/unpublished': Unpublished,
    '/system-manage/category': NewsCategory
}

interface NewsRouterProps {
    isLoading: boolean
}

function NewsRouter(props: NewsRouterProps) {
    console.log('[NewsRouter] isLoading prop:', props.isLoading)
    const tokenData = JSON.parse(localStorage.getItem('token') || '{}')
    const rights: string[] = tokenData.role?.rights || []
    const [backRouteList, setBackRouteList] = useState<Right[]>([])

    useEffect(() => {
        axios.get<Right[]>('/rights').then((res) => {
            const flatList = res.data.reduce<Right[]>((acc, item) => {
                acc.push(item)
                if (item.children && item.children.length > 0) {
                    acc.push(...item.children)
                }
                return acc
            }, [])
            setBackRouteList(flatList)
        })
    }, [])

    function checkUserPermission(key: string): boolean {
        return rights.includes(key)
    }

    function checkRoute(item: Right): boolean {
        return !!LocalRouterMap[item.key] && !!(item.pagepermisson || item.routepermisson)
    }

    return (
        <Spin size="large" tip="加载中..." spinning={props.isLoading}>
            <Suspense fallback={<Spin size="large" tip="页面加载中..." />}>
                <Routes>
                    {backRouteList.map((item) => {
                        if (checkUserPermission(item.key) && checkRoute(item)) {
                            const Component = LocalRouterMap[item.key]
                            return <Route path={item.key} key={item.key} element={<Component />} />
                        }
                        return null
                    })}
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<Nopermission />} />
                </Routes>
            </Suspense>
        </Spin>
    )
}

export default connect((state: RootState) => {
    console.log('[NewsRouter connect] raw state.isLoading:', state.isLoading)
    return {
        isLoading: state.isLoading > 0
    }
})(NewsRouter)
