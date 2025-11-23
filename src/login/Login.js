import React, { useEffect } from 'react'
import { Button, Form, Input, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import axios from 'axios'

export default function Login() {
    const particlesInit = async (main) => {
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
                direction: 'none',
                enable: true,
                outModes: {
                    default: 'bounce'
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
    function onFinish(user) {
        axios.get(`/users?_expand=role&username=${user.username}&password=${user.password}&roleState=true`).then(
            (res) => {
                if (res.data.length === 0) {
                    return message.error('用户名或密码错误')
                } else {
                    console.log(res.data[0]);
                    localStorage.setItem('token', JSON.stringify(res.data[0]))
                    message.success('登录成功')
                    nav('/', { replace: true })
                }
            },
            (err) => message.error(err)
        )
    }
    // 提交表单数据验证失败后的回调事件
    function onFinishFailed(a) {
        console.log(a)
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
        </div>
    )
}

