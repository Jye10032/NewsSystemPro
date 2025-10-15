import NewsSandBox from '../NewsSandBox'
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Card, Col, Row, List, Avatar, Drawer } from 'antd'
import { EditOutlined, EllipsisOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import * as echarts from 'echarts'
import _ from 'lodash'
const { Meta } = Card
/**
 * 后台管理首页
 * 
 */
// export default function Home() {
//     const barRef = useRef()
//     const pieRef = useRef()
//     const [open, setOpen] = useState(false)
//     const [pieChart, setPieChart] = useState(null)
//     const [newsViewList, setNewsViewList] = useState([])
//     const [newsStarList, setNewsStarList] = useState([])
//     const [allList, setAllList] = useState([])
//     return (
//         <div>
//             <Row gutter={16}>
//                 <Col span={8}>
//                     <Card
//                         title="用户最常浏览"
//                         bordered={true}
//                     >
//                         {/* <List
//                             dataSource={newsViewList}
//                             renderItem={(item) => (
//                                 <List.Item>
//                                     <Link to={{ pathname: `/news-manage/preview/${item.id}` }}>{item.title}</Link>
//                                 </List.Item>
//                             )}
//                         /> */}
//                     </Card>
//                 </Col>
//                 <Col span={8}>
//                     <Card
//                         title="用户点赞最多"
//                         bordered={true}
//                     >
//                         {/* <List
//                             dataSource={newsStarList}
//                             renderItem={(item) => (
//                                 <List.Item>
//                                     <Link to={{ pathname: `/news-manage/preview/${item.id}` }}>{item.title}</Link>
//                                 </List.Item>
//                             )}
//                         /> */}
//                     </Card>
//                 </Col>
//                 <Col span={8}>
//                     <Card bordered={true}>
//                         <Card
//                             cover={
//                                 <img
//                                     alt="example"
//                                     src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
//                                 />
//                             }
//                         // actions={[
//                         //     <SettingOutlined
//                         //         key="setting"
//                         //         onClick={() => {
//                         //             setOpen(true)
//                         //             setTimeout(() => {
//                         //                 renderPieView()
//                         //             }, 0)
//                         //         }}
//                         //     />,
//                         //     <EditOutlined key="edit" />,
//                         //     <EllipsisOutlined key="ellipsis" />
//                         // ]}
//                         >
//                             {/* <Meta
//                                 avatar={<Avatar icon={<UserOutlined />} />}
//                                 title={username}
//                                 description={
//                                     <div>
//                                         <b>{region ? region : '全球'}</b>
//                                         <span style={{ marginLeft: '15px' }}>{roleName}</span>
//                                     </div>
//                                 }
//                             /> */}
//                         </Card>
//                     </Card>
//                 </Col>
//             </Row>
//             {/* <div
//                 ref={barRef}
//                 style={{ width: '100%', height: '400px', marginTop: '30px' }}
//             ></div>
//             <Drawer
//                 width="550px"
//                 title="个人新闻数据分析"
//                 placement="right"
//                 onClose={() => setOpen(false)}
//                 open={open}
//             >
//                 <div
//                     ref={pieRef}
//                     style={{ width: '100%', height: '400px' }}
//                 ></div>
//                         </Drawer>*/}
//         </div>
//     )
// }

//


export default function Home() {
    const barRef = useRef()
    const pieRef = useRef()
    const [open, setOpen] = useState(false)
    const [pieChart, setPieChart] = useState(null)
    const [newsViewList, setNewsViewList] = useState([])
    const [newsStarList, setNewsStarList] = useState([])
    const [allList, setAllList] = useState([])
    useEffect(() => {
        Promise.all([
            axios.get('/news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=7'),
            axios.get('/news?publishState=2&_expand=category&_sort=star&_order=desc&_limit=7'),
            axios.get('/news?publishState=2&_expand=category')
        ]).then((res) => {
            setNewsViewList(res[0].data)
            setNewsStarList(res[1].data)
            renderBarView(_.groupBy(res[2].data, (item) => item.category.title))
            setAllList(res[2].data)
        })
        return () => {
            window.onresize = null
        }
    }, [])
    const {
        username,
        region,
        role: { roleName }
    } = JSON.parse(localStorage.getItem('token'))
    // 渲染柱状图
    function renderBarView(obj) {
        const myChart = echarts.init(barRef.current)
        window.onresize = () => {
            myChart.resize()
        }
        // 绘制图表
        myChart.setOption({
            title: {
                text: '新闻分类图示'
            },
            tooltip: {},
            xAxis: {
                data: Object.keys(obj)
            },
            yAxis: {
                minInterval: 1
            },
            series: [
                {
                    name: '销量',
                    type: 'bar',
                    data: Object.values(obj).map((item) => item.length)
                }
            ]
        })
    }
    // 渲染饼状图
    function renderPieView() {
        const currentList = allList.filter((item) => item.author === username)
        const groupObj = _.groupBy(currentList, (item) => item.category.title)
        let list = []
        for (let i in groupObj) {
            list.push({
                name: i,
                value: groupObj[i].length
            })
        }
        var myChart
        if (!pieChart) {
            myChart = echarts.init(pieRef.current)
            setPieChart(true)
        } else {
            myChart = pieChart
        }

        const option = {
            title: {
                text: '当前用户新闻分类图示',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                    name: '发布数量',
                    type: 'pie',
                    radius: '50%',
                    data: list,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        }

        option && myChart.setOption(option)
    }
    return (
        <div>
            <Row gutter={16}>
                <Col span={8}>
                    <Card
                        title="用户最常浏览"
                        bordered={true}
                    >
                        <List
                            dataSource={newsViewList}
                            renderItem={(item) => (
                                <List.Item>
                                    <Link to={{ pathname: `/news-manage/preview/${item.id}` }}>{item.title}</Link>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        title="用户点赞最多"
                        bordered={true}
                    >
                        <List
                            dataSource={newsStarList}
                            renderItem={(item) => (
                                <List.Item>
                                    <Link to={{ pathname: `/news-manage/preview/${item.id}` }}>{item.title}</Link>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={true}>
                        <Card
                            cover={
                                <img
                                    alt="example"
                                    src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                                />
                            }
                            actions={[
                                <SettingOutlined
                                    key="setting"
                                    onClick={() => {
                                        setOpen(true)
                                        setTimeout(() => {
                                            renderPieView()
                                        }, 0)
                                    }}
                                />,
                                <EditOutlined key="edit" />,
                                <EllipsisOutlined key="ellipsis" />
                            ]}
                        >
                            <Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={username}
                                description={
                                    <div>
                                        <b>{region ? region : '全球'}</b>
                                        <span style={{ marginLeft: '15px' }}>{roleName}</span>
                                    </div>
                                }
                            />
                        </Card>
                    </Card>
                </Col>
            </Row>
            <div
                ref={barRef}
                style={{ width: '100%', height: '400px', marginTop: '30px' }}
            ></div>
            <Drawer
                width="550px"
                title="个人新闻数据分析"
                placement="right"
                onClose={() => setOpen(false)}
                open={open}
            >
                <div
                    ref={pieRef}
                    style={{ width: '100%', height: '400px' }}
                ></div>
            </Drawer>
        </div>
    )
}
