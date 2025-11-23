import React, { useState, useEffect } from 'react'
import { Layout, theme, Dropdown, Breadcrumb, Avatar, Space } from 'antd'
import { UserOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
/**
 * 1.右上角用户名显示、退出按钮
 *  
 */


export default function TopHead() {

    const [username, setUsername] = useState('')
    const [roleName, setRoleName] = useState('')
    const location = useLocation();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('token'))
        setRoleName(userInfo.role.roleName)
        setUsername(userInfo.username)
    }, [])

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const { Header } = Layout
    const navigate = useNavigate()

    // 面包屑映射 (简单示例，实际可提取为配置文件)
    const breadcrumbNameMap = {
        '/home': '首页',
        '/user-manage': '用户管理',
        '/user-manage/list': '用户列表',
        '/right-manage': '权限管理',
        '/right-manage/role/list': '角色列表',
        '/right-manage/right/list': '权限列表',
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
    };

    const pathSnippets = location.pathname.split('/').filter((i) => i);
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return {
            key: url,
            title: breadcrumbNameMap[url] || url,
        };
    });

    const breadcrumbItems = [
        {
            key: '/home',
            title: <HomeOutlined />,
        },
    ].concat(extraBreadcrumbItems);


    // 退出登录
    function logout() {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
    }
    // // 退出登录
    // function logout() {
    //     localStorage.removeItem('token')
    //     props.history.replace('/login')
    // }
    const items = [
        {
            key: '0',
            label: (
                <span>
                    欢迎<span style={{ color: '#1677ff', margin: '0 5px' }}>{username}</span>回来
                </span>
            ),
            disabled: true
        },
        {
            key: '1',
            label: roleName
        },
        {
            key: '2',
            danger: true,
            label: '退出',
            onClick: logout
        },
    ];

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
            {/* <div className="demo-logo-vertical" >{isCollapsible ? 'News' : '新闻发布管理系统'}</div> */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Breadcrumb items={breadcrumbItems} />
            </div>

            <div style={{ float: "right" }}>
                <Dropdown menu={{ items }} arrow>
                    <Space style={{ cursor: 'pointer' }}>
                        <span style={{ color: 'rgba(0,0,0,0.65)' }}>欢迎, {username}</span>
                        <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                    </Space>
                </Dropdown>
            </div>
        </Header>
    )
}


// function TopHeader(props) {
//     const [username, setUsername] = useState('')
//     const [roleName, setRoleName] = useState('')
//     useEffect(() => {
//         const userInfo = JSON.parse(localStorage.getItem('token'))
//         setRoleName(userInfo.role.roleName)
//         setUsername(userInfo.username)
//     }, [])
//     const {
//         token: { colorBgContainer }
//     } = theme.useToken()
//     // 侧边栏伸缩按钮回调事件
//     function changeCollapsed() {
//         props.changeCollapsed()
//     }
//     // 退出登录
//     function logout() {
//         localStorage.removeItem('token')
//         props.history.replace('/login')
//     }
//     const items = [
//         {
//             key: '1',
//             label: roleName
//         },
//         {
//             key: '2',
//             danger: true,
//             label: '退出登录',
//             onClick: logout
//         }
//     ]
//     return (
//         <Header
//             style={{
//                 padding: '0 16px',
//                 background: colorBgContainer
//             }}
//         >
//             {props.isCollapsible ? (
//                 <MenuUnfoldOutlined onClick={changeCollapsed} />
//             ) : (
//                 <MenuFoldOutlined onClick={changeCollapsed} />
//             )}
//             <div style={{ float: 'right' }}>
//                 <span>
//                     欢迎<span style={{ color: '#1677ff', margin: '0 5px' }}>{username}</span>回来
//                 </span>
//                 <Dropdown
//                     menu={{
//                         items
//                     }}
//                     arrow
//                 >
//                     <Avatar
//                         size="large"
//                         icon={<UserOutlined />}
//                         style={{ marginLeft: '20px' }}
//                     />
//                 </Dropdown>
//             </div>
//         </Header>
//     )
// }
// export default connect(
//     (state) => ({
//         isCollapsible: state.collapsible
//     }),
//     {
//         changeCollapsed() {
//             return {
//                 type: 'change_collapsed'
//                 // payload:
//             } //action
//         }
//     }
// )(withRouter(TopHeader))
