import UserForm from './UserForm'
import React, { useEffect, useState, useRef } from 'react'
import { Table, Switch, Button, Modal, message, Tag, FormInstance } from 'antd'
import axios from 'axios'
import { EditOutlined, DeleteOutlined, ExclamationCircleFilled, UserAddOutlined } from '@ant-design/icons'
import type { User, Role, Category } from '@/types'

const { confirm } = Modal

export default function UserList() {
    const addForm = useRef<FormInstance>(null)
    const editForm = useRef<FormInstance>(null)
    const [userList, setUserList] = useState<User[]>([])
    const [categoryList, setCategoryList] = useState<Category[]>([])
    const [roleList, setRoleList] = useState<Role[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [currentId, setCurrentId] = useState(0)
    const [isSelectDisabled, setIsSelectDisabled] = useState(false)
    const [isUpdate, setIsUpdate] = useState(false)
    useEffect(() => {
        const rank: Record<number, string> = {
            1: 'superAdmin',
            2: 'admin',
            3: 'editor'
        }
        axios.get('/users?_expand=role').then((res) => {
            //过滤权限比登录用户大的用户
            const { roleId, username, allowedCategoryIds } = JSON.parse(localStorage.getItem('token') || '{}')
            const list = res.data as User[]
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
        axios.get('/categories').then((res) => {
            setCategoryList(res.data)
        })
        axios.get('/roles').then((res) => {
            setRoleList(res.data)
        })
    }, [])
    // table表格要渲染的数据
    const columns = [
        {
            title: '可管理的分类',
            dataIndex: 'allowedCategoryIds',
            render: (allowedCategoryIds: number[]) => {
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
            onFilter: (value: React.Key | boolean, item: User) => {
                return item.allowedCategoryIds?.includes(value as number) ?? false
            }
        },
        {
            title: '角色类别',
            dataIndex: 'role',
            render: (role: Role) => {
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
            render: (_id: number, user: User) => {
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
            render: (_id: number, user: User) => {
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
    function handleSwitch(item: User) {
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
        axios.patch(`/users/${item.id}`, { roleState: !item.roleState })
    }
    // 删除前的确认框
    function confirmMethod(user: User) {
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
    function deleteUser(item: User) {
        let list = userList.filter((user) => {
            return user.id !== item.id
        })
        axios.delete(`/users/${item.id}`).then(
            () => {
                setUserList([...list])
                message.success('删除成功')
            },
            () => {
                message.error('删除失败')
            }
        )
    }
    // 提交添加用户信息
    function handleAdd() {
        addForm.current?.validateFields().then(
            (value) => {
                axios
                    .post('/users', {
                        ...value,
                        default: false,
                        roleState: true
                    })
                    .then(
                        () => {
                            message.success('成功添加用户')
                            axios.get('/users?_expand=role').then((res) => {
                                setUserList(res.data)
                            })
                            setIsAddModalOpen(false)
                            addForm.current?.resetFields()
                        },
                        () => message.error('出现错误了!添加用户失败！')
                    )
            },
            () => message.error('请确认所有信息已填写')
        )
    }
    // 点击编辑按钮的回调
    function handleEditButton(user: User) {
        setIsUpdate(true)
        setIsEditModalOpen(!isEditModalOpen)
        if (user.roleId === 1) {
            setIsSelectDisabled(true)
        } else {
            setIsSelectDisabled(false)
        }
        setTimeout(() => {
            editForm.current?.setFieldsValue({
                ...user,
                roleName: user.role?.roleName
            })
        }, 10)
        setCurrentId(user.id)
    }
    // 提交编辑后的用户信息
    function editUser() {
        editForm.current?.validateFields().then(
            (value) => {
                axios
                    .patch(`/users/${currentId}`, {
                        ...value
                    })
                    .then(
                        () => {
                            message.success('成功编辑用户')
                            axios.get('/users?_expand=role').then((res) => {
                                setUserList(res.data)
                            })
                            setIsEditModalOpen(false)
                        },
                        () => message.error('出现错误了!编辑用户失败！')
                    )
            },
            () => message.error('请确认所有信息已填写')
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
                minHeight: '72px'
            }}>
                <h2 style={{ margin: 0 }}>用户列表</h2>
                <Button
                    type="primary"
                    size="middle"
                    icon={<UserAddOutlined />}
                    onClick={() => setIsAddModalOpen(!isAddModalOpen)}
                >
                    添加用户
                </Button>
            </div>
            <Table
                className="user-table"
                dataSource={userList}
                columns={columns}
                //tableLayout="fixed"
                rowKey={(item) => {
                    return item.id
                }}
                pagination={{
                    pageSize: 5,
                    position: ['bottomCenter']
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
                    userId={currentId}
                ></UserForm>
            </Modal>
        </div>
    )
}
