import React, { useState, useEffect } from 'react'
import { Layout, Button, theme, Dropdown } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined, SmileOutlined, DownOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
/**
 * 1.侧边栏收缩组件：redux
 * 2.右上角用户名显示、退出按钮
 *  
 */


export default function TopHead() {

    const [username, setUsername] = useState('')
    const [roleName, setRoleName] = useState('')
    const isCollapsible = useSelector(state => state.collapsible);
    const dispatch = useDispatch();
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('token'))
        setRoleName(userInfo.role.roleName)
        setUsername(userInfo.username)
    }, [])

    const {
        token: { colorBgContainer },
    } = theme.useToken();
    // 侧边栏伸缩按钮回调事件

    //edit
    function changeCollapsed() {
        dispatch({ type: 'change_collapsed' });
    }

    const { Header } = Layout
    const navigate = useNavigate()


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

    const [collapsed, setCollapsed] = useState(false);

    return (
        <Header
            style={{
                padding: 0,
                background: colorBgContainer,
            }}
        >
            {isCollapsible ? (
                <MenuUnfoldOutlined onClick={changeCollapsed} />
            ) : (
                <MenuFoldOutlined onClick={changeCollapsed} />
            )}
            {/* <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    fontSize: '16px',
                    width: 64,
                    height: 64,
                }}
            /> */}
            <div style={{ float: "right" }}>
                欢迎<span style={{ color: '#1677ff', margin: '0 5px' }}>{username}</span>回来
                <Dropdown menu={{ items }} arrow>
                    <Avatar size="large" icon={<UserOutlined />} />
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
