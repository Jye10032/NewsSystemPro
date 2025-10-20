import UserForm from './UserForm'
import React, { useEffect, useState, useRef } from 'react'
import { Table, Switch, Button, Modal, message, Tag } from 'antd'
import axios from 'axios'
import { EditOutlined, DeleteOutlined, ExclamationCircleFilled, UserAddOutlined } from '@ant-design/icons'
const { confirm } = Modal

export default function UserList() {
    const addForm = useRef()
    const editForm = useRef()
    const [userList, setUserList] = useState([])
    const [categoryList, setCategoryList] = useState([])
    const [roleList, setRoleList] = useState([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [currentId, setCurrentId] = useState(0)
    const [isSelectDisabled, setIsSelectDisabled] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)
    useEffect(() => {
        const rank = {
            1: 'superAdmin',
            2: 'admin',
            3: 'editor'
        }
        axios.get('http://localhost:8000/users?_expand=role').then((res) => {
            //过滤权限比登录用户大的用户
            const { roleId, username, allowedCategoryIds } = JSON.parse(localStorage.getItem('token'))
            const list = res.data
            setUserList(
                rank[roleId] === 'superAdmin'
                    ? list
                    : [
                        ...list.filter((user) => {
                            return user.username === username
                        }),
                        ...list.filter((user) => {
                            // 只显示与当前用户有相同分类权限且角色为编辑的用户
                            return user.allowedCategoryIds?.some(id => allowedCategoryIds.includes(id)) && rank[user.roleId] === 'editor'
                        })
                    ]
            )
            setUserList(res.data)
        })
        axios.get('http://localhost:8000/categories').then((res) => {
            setCategoryList(res.data)
        })
        axios.get('http://localhost:8000/roles').then((res) => {
            setRoleList(res.data)
        })
    }, [])
    // table表格要渲染的数据
    const columns = [
        {
            title: '可管理的分类',
            dataIndex: 'allowedCategoryIds',
            render: (allowedCategoryIds) => {
                if (!allowedCategoryIds || allowedCategoryIds.length === 0) {
                    return <Tag>无</Tag>
                }
                // 定义分类颜色映射
                const colorMap = ['blue', 'green', 'orange', 'red', 'purple', 'cyan']

                // 显示分类标签
                return (
                    <>
                        {allowedCategoryIds.map((id) => {
                            const category = categoryList.find(cat => cat.id === id)
                            if (!category) return null
                            return (
                                <Tag color={colorMap[(id - 1) % colorMap.length]} key={id} bordered={false}>
                                    {category.title}
                                </Tag>
                            )
                        })}
                    </>
                )
            },
            filters: categoryList.map((category) => {
                return {
                    value: category.id,
                    text: category.title
                }
            }),
            onFilter: (value, item) => {
                return item.allowedCategoryIds?.includes(value)
            }
        },
        {
            title: '角色类别',
            dataIndex: 'role',
            render: (role) => {
                return role?.roleName
            }
        },
        {
            title: '用户名',
            dataIndex: 'username'
        },
        {
            title: '用户状态',
            dataIndex: 'id',
            render: (id, user) => {
                return (
                    <div>
                        <Switch
                            checked={user.roleState}
                            disabled={user.default}
                            onChange={() => handleSwitch(user)}
                        />
                    </div>
                )
            }
        },
        {
            title: '操作',
            dataIndex: 'id',
            key: 'grade',
            render: (id, user) => {
                return (
                    <div>
                        <Button
                            danger
                            shape="circle"
                            icon={<DeleteOutlined />}
                            onClick={() => confirmMethod(user)}
                            style={{
                                marginRight: '10px'
                            }}
                            disabled={user.default}
                        />
                        <Button
                            type="primary"
                            shape="circle"
                            onClick={() => handleEditButton(user)}
                            icon={<EditOutlined />}
                            disabled={user.default}
                        />
                    </div>
                )
            }
        }
    ]
    // 更新用户状态
    function handleSwitch(item) {
        setUserList(
            userList.map((user) => {
                if (user.id === item.id) {
                    return {
                        ...user,
                        roleState: !user.roleState
                    }
                } else {
                    return user
                }
            })
        )
        axios.patch(`http://localhost:8000/users/${item.id}`, { roleState: !item.roleState })
    }
    // 删除前的确认框
    function confirmMethod(user) {
        confirm({
            title: '警告',
            icon: <ExclamationCircleFilled />,
            content: '是否删除该用户?',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                deleteUser(user)
            },
            onCancel() { }
        })
    }
    // 删除用户
    function deleteUser(item) {
        let list = userList.filter((user) => {
            return user.id !== item.id
        })
        axios.delete(`http://localhost:8000/users/${item.id}`).then(
            (res) => {
                setUserList([...list])
                message.success('删除成功')
            },
            (err) => {
                message.error('删除失败')
            }
        )
        // setUserList([...list])
        // message.success('删除成功')
    }
    // 提交添加用户信息
    function handleAdd() {
        addForm.current.validateFields().then(
            (value) => {
                axios
                    .post('http://localhost:8000/users', {
                        ...value,
                        default: false,
                        roleState: true
                    })
                    .then(
                        (res) => {
                            message.success('成功添加用户')
                            axios.get('http://localhost:8000/users?_expand=role').then((res) => {
                                setUserList(res.data)
                            })
                            setIsAddModalOpen(false)
                            addForm.current.resetFields()
                        },
                        (err) => message.error('出现错误了!添加用户失败！')
                    )
            },
            (err) => message.error('请确认所有信息已填写')
        )
    }
    // 点击编辑按钮的回调
    function handleEditButton(user) {
        setIsUpdate(true)
        setIsEditModalOpen(!isEditModalOpen)
        if (user.roleId === 1) {
            setIsSelectDisabled(true)
        } else {
            setIsSelectDisabled(false)
        }
        setTimeout(() => {
            editForm.current.setFieldsValue({
                ...user,
                roleName: user.role.roleName
            })
        }, 10)
        setCurrentId(user.id)
    }
    // 提交编辑后的用户信息
    function editUser() {
        editForm.current.validateFields().then(
            (value) => {
                axios
                    .patch(`http://localhost:8000/users/${currentId}`, {
                        ...value
                    })
                    .then(
                        (res) => {
                            message.success('成功编辑用户')
                            axios.get('http://localhost:8000/users?_expand=role').then((res) => {
                                setUserList(res.data)
                            })
                            setIsEditModalOpen(false)
                        },
                        (err) => message.error('出现错误了!编辑用户失败！')
                    )
            },
            (err) => message.error('请确认所有信息已填写')
        )

        setIsUpdate(false)
    }
    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                padding: '16px 24px',
                marginBottom: '0',
                // borderRadius: '8px 8px 0 0'
            }}>
                <h2 style={{ margin: 0 }}>用户列表</h2>
                <Button
                    type="primary"
                    size="large"
                    icon={<UserAddOutlined />}
                    onClick={() => setIsAddModalOpen(!isAddModalOpen)}
                >
                    添加用户
                </Button>
            </div>
            <style>{`
                .user-table .ant-table-thead > tr > th:first-child {
                    border-top-left-radius: 0 !important;
                }
                .user-table .ant-table-thead > tr > th:last-child {
                    border-top-right-radius: 0 !important;
                }
            `}</style>
            <Table
                className="user-table"
                dataSource={userList}
                columns={columns}
                rowKey={(item) => {
                    return item.id
                }}
                pagination={{
                    pageSize: 5
                }}
            />
            {/* 添加用户的对话框 */}
            <Modal
                title="添加用户信息"
                open={isAddModalOpen}
                cancelText="取消"
                okText="确认"
                onCancel={() => setIsAddModalOpen(!isAddModalOpen)}
                onOk={handleAdd}
            >
                <UserForm
                    isUpdate={isUpdate}
                    roleList={roleList}
                    categoryList={categoryList}
                    ref={addForm}
                ></UserForm>
            </Modal>
            {/* 编辑用户的对话框 */}
            <Modal
                title="编辑用户信息"
                open={isEditModalOpen}
                cancelText="取消"
                okText="确认"
                onOk={editUser}
                onCancel={() => {
                    setIsEditModalOpen(!isEditModalOpen)
                    setIsUpdate(false)
                }}
            >
                <UserForm
                    isUpdate={isUpdate}
                    roleList={roleList}
                    categoryList={categoryList}
                    ref={editForm}
                    isSelectDisabled={isSelectDisabled}
                ></UserForm>
            </Modal>
        </div>
    )
}
