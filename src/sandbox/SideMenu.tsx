import { useState, useEffect, ReactNode } from 'react'
import { Layout, Menu, Button } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
    HomeOutlined,
    UserOutlined,
    ContainerOutlined,
    AuditOutlined,
    ExceptionOutlined,
    SettingOutlined
} from '@ant-design/icons'
import './index.css'
import api from '@/utils/Request'
import type { Right, RootState } from '@/types'

const { SubMenu } = Menu
const { Sider } = Layout

// 一级菜单图标映射：key 对应路由路径
const iconList: Record<string, ReactNode> = {
    '/home': <HomeOutlined />,
    '/news-manage': <ContainerOutlined />,
    '/audit-manage': <AuditOutlined />,
    '/publish-manage': <ExceptionOutlined />,
    '/system-manage': <SettingOutlined />,
    '/user-manage': <UserOutlined />
}

export default function SideMenu() {
    const [meun, setMeun] = useState<Right[]>([])
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [mobileVisible, setMobileVisible] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
            if (window.innerWidth > 768) {
                setMobileVisible(false)
            }
        }
        const handleToggleMobile = () => setMobileVisible(v => !v)
        window.addEventListener('resize', handleResize)
        window.addEventListener('toggleMobileMenu', handleToggleMobile)
        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('toggleMobileMenu', handleToggleMobile)
        }
    }, [])

    useEffect(() => {
        // 从后端获取菜单权限数据（包含嵌套的 children 结构）
        api.get<Right[]>("/rights").then(res => {
            setMeun(res.data)
        })
    }, [])

    // 检查菜单项是否有页面权限
    // 双重过滤：1. pagepermisson=1（菜单配置为显示）2. 用户角色有该菜单权限
    const user = useSelector((state: RootState) => state.user)
    const checkPagePermission = (item: Right): boolean => {
        // 菜单本身必须配置为显示
        if (item.pagepermisson !== 1) {
            return false
        }
        // 用户必须有该菜单的权限
        const userRights: string[] = user?.role?.rights || []
        return userRights.includes(item.key)
    }

    const handleMenuClick = (key: string) => {
        nav(key)
        if (isMobile) {
            setMobileVisible(false)
        }
    }

    // 递归渲染菜单：有 children 渲染 SubMenu，否则渲染 Menu.Item
    const renderMenu = (meun: Right[]): ReactNode[] => {
        return meun.map(item => {
            if (item.children && item.children.length > 0 && checkPagePermission(item)) {
                return (
                    <SubMenu key={item.key} icon={iconList[item.key]} title={item.title}>
                        {renderMenu(item.children)}
                    </SubMenu>
                )
            }
            return checkPagePermission(item) && (
                <Menu.Item key={item.key} icon={iconList[item.key]} onClick={() => {
                    handleMenuClick(item.key)
                }}>
                    {item.title}
                </Menu.Item>
            )
        })
    }

    const [hovered, setHovered] = useState(false)

    // 从 Redux 获取侧边栏折叠状态
    const isCollapsible = useSelector((state: RootState) => state.collapsible)
    const dispatch = useDispatch()

    // 折叠状态：用户主动折叠 && 鼠标未悬停时才真正折叠
    const showCollapsed = isCollapsible && !hovered

    const toggleCollapsed = () => {
        if (isMobile) {
            setMobileVisible(!mobileVisible)
        } else {
            dispatch({ type: 'change_collapsed' })
        }
    }

    const nav = useNavigate()
    const location = useLocation()

    // 根据当前路径计算选中和展开的菜单项
    // 如 /user-manage/list → parentKey='/user-manage', selectKeys=['/user-manage/list', '/user-manage']
    const parentKey = "/" + location.pathname.split("/")[1]
    const selectKeys = [location.pathname, parentKey]

    const [openKeys, setOpenKeys] = useState([parentKey])

    const handleOpenChange = (keys: string[]) => {
        setOpenKeys(keys)
    }

    return (
        <>
            {isMobile && mobileVisible && (
                <div className="mobile-overlay" onClick={() => setMobileVisible(false)} />
            )}
            <Sider
                trigger={null}
                collapsible
                collapsed={isMobile ? false : showCollapsed}
                theme="light"
                className={isMobile && mobileVisible ? 'mobile-visible' : ''}
                onMouseEnter={() => !isMobile && isCollapsible && setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{ transition: 'all 0.2s' }}
            >
                <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
                    <div className="sider-collapse-button">
                        <Button
                            type="text"
                            icon={isCollapsible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={toggleCollapsed}
                            style={{
                                fontSize: '16px',
                                width: '100%',
                                height: '48px',
                            }}
                        />
                    </div>
                    <div style={{ flex: 1, "overflow": "auto" }}>
                        <Menu
                            key={meun.length}
                            theme="light"
                            mode="inline"
                            selectedKeys={selectKeys}
                            openKeys={showCollapsed ? [] : openKeys}
                            onOpenChange={handleOpenChange}>
                            {renderMenu(meun)}
                        </Menu>
                    </div>
                </div>
            </Sider>
        </>
    )
}
