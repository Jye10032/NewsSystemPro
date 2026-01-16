import { useState, useEffect } from 'react'
import { Layout, theme, Dropdown, Breadcrumb, Avatar, Space, Button } from 'antd'
import { UserOutlined, HomeOutlined, MenuOutlined } from '@ant-design/icons'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../types'

export default function TopHead() {
    const user = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch()
    const location = useLocation()
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const {
        token: { colorBgContainer },
    } = theme.useToken()

    const { Header } = Layout
    const navigate = useNavigate()

    // 面包屑映射
    const breadcrumbNameMap: Record<string, string> = {
        '/home': '首页',
        '/user-manage': '用户管理',
        '/user-manage/list': '用户列表',
        '/right-manage': '权限管理',
        '/right-manage/rolelist': '角色列表',
        '/right-manage/rightlist': '权限列表',
        '/news-manage': '新闻管理',
        '/news-manage/add': '撰写新闻',
        '/news-manage/draft': '草稿箱',
        '/news-manage/category': '新闻分类',
        '/audit-manage': '审核管理',
        '/audit-manage/audit': '审核新闻',
        '/audit-manage/list': '审核列表',
        '/publish-manage': '发布管理',
        '/publish-manage/unpublished': '待发布',
        '/publish-manage/published': '已发布',
        '/publish-manage/sunset': '已下线',
    }

    // 有实际页面的路径（可点击）
    const clickablePaths = new Set([
        '/home',
        '/user-manage/list',
        '/right-manage/rolelist',
        '/right-manage/rightlist',
        '/news-manage/add',
        '/news-manage/draft',
        '/news-manage/category',
        '/audit-manage/audit',
        '/audit-manage/list',
        '/publish-manage/unpublished',
        '/publish-manage/published',
        '/publish-manage/sunset',
    ])

    const pathSnippets = location.pathname.split('/').filter((i) => i)
    const extraBreadcrumbItems = pathSnippets
        .map((_, index) => {
            const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
            if (!breadcrumbNameMap[url]) return null
            return {
                key: url,
                title: clickablePaths.has(url)
                    ? <Link to={url}>{breadcrumbNameMap[url]}</Link>
                    : <span>{breadcrumbNameMap[url]}</span>,
            }
        })
        .filter(Boolean)

    const breadcrumbItems = [
        {
            key: 'home-icon',
            title: <Link to="/home"><HomeOutlined /></Link>,
        },
        ...extraBreadcrumbItems
    ]

    // 退出登录
    function logout() {
        dispatch({ type: 'clear_user' })
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
    }

    const items = [
        {
            key: '0',
            label: (
                <span>
                    欢迎<span style={{ color: '#1677ff', margin: '0 5px' }}>{user?.username}</span>回来
                </span>
            ),
            disabled: true
        },
        {
            key: '1',
            label: user?.role?.roleName
        },
        {
            key: '2',
            danger: true,
            label: '退出',
            onClick: logout
        },
    ]

    const handleMobileMenuClick = () => {
        window.dispatchEvent(new CustomEvent('toggleMobileMenu'))
    }

    return (
        <Header
            style={{
                padding: '0 24px',
                background: colorBgContainer,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px #f0f1f2',
                zIndex: 1,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isMobile && (
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={handleMobileMenuClick}
                        style={{ fontSize: 18 }}
                    />
                )}
                <Breadcrumb items={breadcrumbItems.filter(Boolean) as { key: string; title: React.ReactNode }[]} />
            </div>

            <div style={{ float: "right" }}>
                <Dropdown menu={{ items }} arrow>
                    <Space style={{ cursor: 'pointer' }}>
                        <span style={{ color: 'rgba(0,0,0,0.65)' }}>欢迎, {user?.username}</span>
                        <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                    </Space>
                </Dropdown>
            </div>
        </Header>
    )
}
