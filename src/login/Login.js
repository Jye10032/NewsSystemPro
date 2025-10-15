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
    //粒子参数
    const options = {
        background: {
            color: {
                value: '#232741'
            },
            position: '50% 50%',
            repeat: 'no-repeat',
            size: 'cover'
        },
        // 帧数，越低越卡,默认60
        fpsLimit: 120,
        fullScreen: {
            zIndex: 1
        },
        interactivity: {
            events: {
                onClick: {
                    enable: true,
                    mode: 'push'
                },
                onHover: {
                    enable: true,
                    mode: 'slow'
                }
            },
            modes: {
                push: {
                    //点击是添加1个粒子
                    quantity: 3
                },
                bubble: {
                    distance: 200,
                    duration: 2,
                    opacity: 0.8,
                    size: 20,
                    divs: {
                        distance: 200,
                        duration: 0.4,
                        mix: false,
                        selectors: []
                    }
                },
                grab: {
                    distance: 400
                },
                //击退
                repulse: {
                    divs: {
                        //鼠标移动时排斥粒子的距离
                        distance: 200,
                        //翻译是持续时间
                        duration: 0.4,
                        factor: 100,
                        speed: 1,
                        maxSpeed: 50,
                        easing: 'ease-out-quad',
                        selectors: []
                    }
                },
                //缓慢移动
                slow: {
                    //移动速度
                    factor: 2,
                    //影响范围
                    radius: 200
                },
                //吸引
                attract: {
                    distance: 200,
                    duration: 0.4,
                    easing: 'ease-out-quad',
                    factor: 3,
                    maxSpeed: 50,
                    speed: 1
                }
            }
        },
        //  粒子的参数
        particles: {
            //粒子的颜色
            color: {
                value: '#ffffff'
            },
            //是否启动粒子碰撞
            collisions: {
                enable: true
            },
            //粒子之间的线的参数
            links: {
                color: {
                    value: '#ffffff'
                },
                distance: 150,
                enable: true,
                warp: true
            },
            move: {
                attract: {
                    rotate: {
                        x: 600,
                        y: 1200
                    }
                },
                enable: true,
                outModes: {
                    bottom: 'out',
                    left: 'out',
                    right: 'out',
                    top: 'out'
                },
                speed: 6,
                warp: true
            },
            number: {
                density: {
                    enable: true
                },
                //初始粒子数
                value: 40
            },
            //透明度
            opacity: {
                value: 0.5,
                animation: {
                    speed: 3,
                    minimumValue: 0.1
                }
            },
            //大小
            size: {
                random: {
                    enable: true
                },
                value: {
                    min: 1,
                    max: 3
                },
                animation: {
                    speed: 20,
                    minimumValue: 0.1
                }
            }
        }
    }

    // 提交表单数据验证成功后的回调事件
    function onFinish(user) {
        axios.get(`http://localhost:8000/users?_expand=role&username=${user.username}&password=${user.password}&roleState=true`).then(
            (res) => {
                if (res.data.length === 0) {
                    return message.error('用户名或密码错误')
                } else {
                    console.log(res.data[0]);
                    localStorage.setItem('token', JSON.stringify(res.data[0]))
                    nav('/home', { replace: true })
                    return message.success('登录成功')
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
                <h2>全球新闻发布管理系统</h2>
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
                            style={{ float: 'right' }}
                            type="primary"
                            htmlType="submit"
                        >
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    )
}

