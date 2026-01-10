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
import axios from 'axios'
import type { Right, RootState } from '@/types'

const { SubMenu } = Menu
const { Sider } = Layout

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

    useEffect(() => {
        axios.get<Right[]>("/rights").then(res => {
            setMeun(res.data)
        })
    }, [])

    const checkPagePermission = (item: Right): boolean => {
        return item.pagepermisson === 1
    }

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
                    nav(item.key)
                }}>
                    {item.title}
                </Menu.Item>
            )
        })
    }

    const [hovered, setHovered] = useState(false)

    const isCollapsible = useSelector((state: RootState) => state.collapsible)
    const dispatch = useDispatch()

    const showCollapsed = isCollapsible && !hovered

    const toggleCollapsed = () => {
        dispatch({ type: 'change_collapsed' })
    }

    const nav = useNavigate()
    const location = useLocation()

    const parentKey = "/" + location.pathname.split("/")[1]
    const selectKeys = [location.pathname, parentKey]

    const [openKeys, setOpenKeys] = useState([parentKey])

    const handleOpenChange = (keys: string[]) => {
        setOpenKeys(keys)
    }

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={showCollapsed}
            theme="light"
            onMouseEnter={() => isCollapsible && setHovered(true)}
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
    )
}
