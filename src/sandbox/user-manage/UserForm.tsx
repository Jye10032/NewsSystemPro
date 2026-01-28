import React, { forwardRef, useState, useEffect } from 'react'
import { Form, Input, Select, FormInstance, Button, Modal, message } from 'antd'
import { KeyOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import api from '@/utils/Request'
import type { Role, Category, RootState } from '@/types'

const { Option } = Select

interface UserFormProps {
    isUpdate?: boolean
    isSelectDisabled?: boolean
    roleList?: Role[]
    categoryList?: Category[]
    userId?: number  // 编辑时传入用户ID，用于重置密码
}

const UserForm = forwardRef<FormInstance, UserFormProps>((props, ref) => {
    const [form] = Form.useForm()
    const [isDisabled, setIsDisabled] = useState<boolean>()
    const [resetModalOpen, setResetModalOpen] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [resetting, setResetting] = useState(false)
    const user = useSelector((state: RootState) => state.user)
    const rank: Record<number, string> = {
        1: 'superAdmin',
        2: 'admin',
        3: 'editor'
    }
    useEffect(() => {
        // 若打开的是超级管理员的编辑对话框，不使用下列方法会导致分类可选框可选
        setIsDisabled(props.isSelectDisabled)
    }, [props])
    // 选择角色的回调函数
    function handleSetRole(value: number) {
        if (value === 1) {
            setIsDisabled(true)
            ;(ref as React.RefObject<FormInstance>).current?.setFieldsValue({
                allowedCategoryIds: [1, 2, 3, 4, 5, 6]
            })
        } else {
            setIsDisabled(false)
        }
    }
    // 根据登录用户的权限来显示可选的分类
    function checkCategoryDisable(item: Category) {
        const { roleId, allowedCategoryIds } = user || {}
        // 若打开的是编辑对话框
        if (props.isUpdate) {
            // 除超级管理员，其他角色不能修改分类选择
            if (rank[roleId || 0] === 'superAdmin') {
                return false
            } else {
                return true
            }
        } else {
            // 若打开的是添加对话框，除超级管理员，其他角色只能选择自己拥有权限的分类
            if (rank[roleId || 0] === 'superAdmin') {
                return false
            } else {
                // 处理 allowedCategoryIds 可能为 undefined 的情况
                return !allowedCategoryIds?.includes(item.id)
            }
        }
    }
    // 根据登录用户的权限来显示可选的角色
    function checkRoleDisable(item: Role) {
        const { roleId } = user || {}
        // 若打开的是编辑对话框
        if (props.isUpdate) {
            // 除超级管理员，其他角色只不能修改角色
            if (rank[roleId || 0] === 'superAdmin') {
                return false
            } else {
                return true
            }
        } else {
            // 若打开的是添加对话框，除超级管理员，其他角色只能选择比自己低一级的角色（即只管理员能选编辑，编辑什么也不能选）
            if (rank[roleId || 0] === 'superAdmin') {
                return false
            } else {
                return rank[item.id] !== 'editor'
            }
        }
    }
    // 重置密码
    function handleResetPassword() {
        if (!newPassword.trim()) {
            message.error('请输入新密码')
            return
        }
        if (!props.userId) {
            message.error('用户ID不存在')
            return
        }
        setResetting(true)
        api.patch(`/users/${props.userId}`, { password: newPassword })
            .then(() => {
                message.success('密码重置成功')
                setResetModalOpen(false)
                setNewPassword('')
            })
            .catch(() => {
                message.error('密码重置失败')
            })
            .finally(() => {
                setResetting(false)
            })
    }
    return (
        <div>
            <Form
                ref={ref}
                form={form}
                layout="vertical"
                name="form_in_modal"
                initialValues={{
                    modifier: 'public'
                }}
            >
                <Form.Item
                    name="username"
                    label="用户名"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the title of collection!'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                {/* 新增用户时显示密码输入框，编辑时显示重置密码按钮 */}
                {!props.isUpdate ? (
                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[
                            {
                                required: true,
                                message: '请输入密码'
                            }
                        ]}
                    >
                        <Input.Password placeholder="请输入密码" />
                    </Form.Item>
                ) : (
                    <Form.Item label="密码">
                        <Button icon={<KeyOutlined />} onClick={() => setResetModalOpen(true)}>
                            重置密码
                        </Button>
                    </Form.Item>
                )}
                <Form.Item
                    name="allowedCategoryIds"
                    label="可管理的分类"
                    rules={
                        isDisabled
                            ? []
                            : [
                                {
                                    required: true,
                                    message: '请选择可管理的分类!'
                                }
                            ]
                    }
                >
                    <Select mode="multiple" disabled={isDisabled} placeholder="请选择可管理的分类">
                        {props.categoryList?.map((category) => {
                            return (
                                <Option
                                    key={category.id}
                                    value={category.id}
                                    disabled={checkCategoryDisable(category)}
                                >
                                    {category.title}
                                </Option>
                            )
                        })}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="roleId"
                    label="角色"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the title of collection!'
                        }
                    ]}
                >
                    <Select onChange={(value) => handleSetRole(value)}>
                        {props.roleList?.map((role) => {
                            return (
                                <Option
                                    key={role.id}
                                    value={role.id}
                                    disabled={checkRoleDisable(role)}
                                >
                                    {role.roleName}
                                </Option>
                            )
                        })}
                    </Select>
                </Form.Item>
            </Form>
            {/* 重置密码弹窗 */}
            <Modal
                title="重置密码"
                open={resetModalOpen}
                onOk={handleResetPassword}
                onCancel={() => {
                    setResetModalOpen(false)
                    setNewPassword('')
                }}
                okText="确认"
                cancelText="取消"
                confirmLoading={resetting}
            >
                <Input.Password
                    placeholder="请输入新密码"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </Modal>
        </div>
    )
})

export default UserForm
