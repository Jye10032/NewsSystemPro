import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Modal } from 'antd'
import { UserOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import { Engine } from 'tsparticles-engine'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import './Login.css'
import api from '@/utils/Request'
import { User } from '../../types'
import { setAuthToken } from '@/utils/authToken'
import { appMessage } from '@/utils/appMessage'

interface LoginForm {
    username: string
    password: string
}

const TEST_ACCOUNTS = [
    { role: '超级管理员', username: 'admin', password: '123456' },
    { role: '分类管理员', username: 'tom', password: '123' },
    { role: '分类编辑', username: 'alice', password: '123' }
]

export default function Login() {
    const dispatch = useDispatch()
    const [accountsVisible, setAccountsVisible] = useState(false)
    const particlesInit = async (main: Engine) => {
        await loadFull(main)
    }
    useEffect(() => { }, [])
    const nav = useNavigate()
    // 粒子参数 - 极简风格
    const options = {
        background: {
            color: {
                value: 'transparent' // 背景交给 CSS 渐变处理
            },
        },
        fpsLimit: 120,
        fullScreen: {
            zIndex: 1
        },
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: 'grab'
                }
            },
            modes: {
                grab: {
                    distance: 140,
                    links: {
                        opacity: 0.5
                    }
                }
            }
        },
        particles: {
            color: {
                value: '#a1a1a1' // 浅灰色粒子
            },
            links: {
                color: '#a1a1a1',
                distance: 150,
                enable: true,
                opacity: 0.2, // 连线更淡
                width: 1
            },
            move: {
                direction: 'none' as const,
                enable: true,
                outModes: {
                    default: 'bounce' as const
                },
                random: false,
                speed: 1, // 移动速度变慢
                straight: false
            },
            number: {
                density: {
                    enable: true,
                    area: 800
                },
                value: 50
            },
            opacity: {
                value: 0.3
            },
            shape: {
                type: 'circle'
            },
            size: {
                value: { min: 1, max: 3 }
            }
        }
    }

    // 提交表单数据验证成功后的回调事件
    function onFinish(formData: LoginForm) {
        api.post<{ user: User; token?: string }>('/api/auth/login', formData).then(
            (res) => {
                const { user, token } = res.data
                setAuthToken(String(token || ''))
                dispatch({ type: 'set_user', payload: user })
                appMessage.success('登录成功')
                nav('/', { replace: true })
            },
            (err) => {
                const errorMsg = err.response?.data?.message || '用户名或密码错误'
                appMessage.error(errorMsg)
            }
        )
    }
    // 提交表单数据验证失败后的回调事件
    function onFinishFailed(errorInfo: unknown) {
        console.log(errorInfo)
    }
    return (
        <div id="login-container">
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={options}
            />

            <div id="loginForm">
                <h2>新闻发布管理系统</h2>
                <div className="login-helper-row">
                    <Button
                        type="text"
                        icon={<InfoCircleOutlined />}
                        className="login-helper-button"
                        onClick={() => setAccountsVisible(true)}
                    >
                        查看测试账号
                    </Button>
                </div>
                <Form
                    name="basic"
                    style={{
                        maxWidth: 600
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: '请输入用户名!'
                            }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: '请输入密码!'
                            }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            style={{ height: '40px', fontSize: '16px' }}
                        >
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </div>
            <Modal
                open={accountsVisible}
                onCancel={() => setAccountsVisible(false)}
                footer={null}
                centered
                width={560}
                title="测试账号"
                className="login-account-modal"
            >
                <div className="login-account-table">
                    <div className="login-account-row login-account-head">
                        <span>角色</span>
                        <span>用户名</span>
                        <span>密码</span>
                    </div>
                    {TEST_ACCOUNTS.map((account) => (
                        <div className="login-account-row" key={account.username}>
                            <span>{account.role}</span>
                            <span>{account.username}</span>
                            <span>{account.password}</span>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    )
}
