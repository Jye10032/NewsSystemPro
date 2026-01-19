import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Card, Col, Row, List, Drawer, Statistic, Progress, Table, Tag } from 'antd'
import {
    UserOutlined,
    EyeOutlined,
    FileTextOutlined,
    LikeOutlined,
    TeamOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import * as echarts from 'echarts'
import _ from 'lodash'
import type { NewsItem, RootState } from '@/types'

interface Stats {
    totalViews: number
    totalNews: number
    totalLikes: number
    totalUsers: number
}

export default function Home() {
    const barRef = useRef<HTMLDivElement>(null)
    const pieRef = useRef<HTMLDivElement>(null)
    const categoryChartRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false)
    const [pieChart, setPieChart] = useState<echarts.ECharts | null>(null)
    const [newsViewList, setNewsViewList] = useState<NewsItem[]>([])
    const [newsStarList, setNewsStarList] = useState<NewsItem[]>([])
    const [allList, setAllList] = useState<NewsItem[]>([])
    const [stats, setStats] = useState<Stats>({
        totalViews: 0,
        totalNews: 0,
        totalLikes: 0,
        totalUsers: 0
    })

    useEffect(() => {
        Promise.all([
            axios.get<NewsItem[]>('/news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=7'),
            axios.get<NewsItem[]>('/news?publishState=2&_expand=category&_sort=star&_order=desc&_limit=7'),
            axios.get<NewsItem[]>('/news?publishState=2&_expand=category'),
            axios.get<{ id: number }[]>('/users')
        ]).then((res) => {
            setNewsViewList(res[0].data)
            setNewsStarList(res[1].data)
            setAllList(res[2].data)

            const totalViews = res[2].data.reduce((sum, item) => sum + (item.view || 0), 0)
            const totalLikes = res[2].data.reduce((sum, item) => sum + (item.star || 0), 0)
            setStats({
                totalViews,
                totalNews: res[2].data.length,
                totalLikes,
                totalUsers: res[3].data.length
            })

            renderLineView()
            renderCategoryChart(_.groupBy(res[2].data, (item) => item.category.title))
        })
        return () => {
            window.onresize = null
        }
    }, [])

    const user = useSelector((state: RootState) => state.user)
    const username = user?.username || ''
    const region = user?.region || ''
    const roleName = user?.role?.roleName || ''

    function renderLineView() {
        if (!barRef.current) return
        const myChart = echarts.init(barRef.current)
        window.onresize = () => myChart.resize()

        function generateSeriesData() {
            const seriesData: { date: string; views: number }[] = []
            const startDate = new Date()
            const DATA_COUNT = 14
            let baseViews = 400
            let growth = 30

            for (let i = 0; i < DATA_COUNT; i++) {
                const date = new Date(startDate)
                date.setDate(startDate.getDate() - (DATA_COUNT - 1 - i))
                const mm = String(date.getMonth() + 1).padStart(2, '0')
                const dd = String(date.getDate()).padStart(2, '0')
                const dayStr = `${mm}-${dd}`
                const noise = (Math.random() - 0.5) * 40
                const views = Math.round(baseViews + i * growth + noise)
                seriesData.push({ date: dayStr, views })
            }
            return seriesData
        }

        const data = generateSeriesData()

        const option = {
            title: {
                text: '近两周访问趋势',
                left: 'left',
                textStyle: { fontSize: 16, fontWeight: 500 }
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: { name: string; value: number }[]) => {
                    const item = params[0]
                    return `${item.name}<br/>浏览量：<b>${item.value}</b>`
                }
            },
            grid: { top: 50, bottom: 30, left: 50, right: 20 },
            xAxis: {
                type: 'category',
                data: data.map((d) => d.date),
                axisTick: { show: false },
                axisLabel: { rotate: 40 }
            },
            yAxis: { type: 'value', axisTick: { show: true } },
            series: [
                {
                    type: 'line',
                    data: data.map((d) => d.views),
                    smooth: true,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
                        ])
                    },
                    lineStyle: { width: 2, color: '#1890ff' },
                    itemStyle: { color: '#1890ff' }
                }
            ]
        }
        myChart.setOption(option)
    }

    function renderCategoryChart(groupObj: Record<string, NewsItem[]>) {
        if (!categoryChartRef.current) return
        const myChart = echarts.init(categoryChartRef.current)
        const data = Object.entries(groupObj).map(([name, items]) => ({
            name,
            value: items.length
        }))

        const option = {
            title: {
                text: '新闻分类分布',
                left: 'left',
                textStyle: { fontSize: 16, fontWeight: 500 }
            },
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { orient: 'vertical', right: 10, top: 'center' },
            series: [
                {
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['40%', '55%'],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
                    label: { show: false },
                    emphasis: {
                        label: { show: true, fontSize: 14, fontWeight: 'bold' }
                    },
                    data
                }
            ]
        }
        myChart.setOption(option)
    }

    function renderPieView() {
        const currentList = allList.filter((item) => item.author === username)
        const groupObj = _.groupBy(currentList, (item) => item.category.title)
        const list: { name: string; value: number }[] = []
        for (const i in groupObj) {
            list.push({ name: i, value: groupObj[i].length })
        }
        let myChart: echarts.ECharts
        if (!pieChart && pieRef.current) {
            myChart = echarts.init(pieRef.current)
            setPieChart(myChart)
        } else if (pieChart) {
            myChart = pieChart
        } else {
            return
        }

        const option = {
            title: { text: '个人新闻分类', left: 'center' },
            tooltip: { trigger: 'item' },
            legend: { orient: 'vertical', left: 'left' },
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
        myChart.setOption(option)
    }

    const colorMap = ['blue', 'green', 'orange', 'red', 'purple', 'cyan']
    const hotColors = ['#ff4d4f', '#ff7a45', '#ffa940']

    const recentNewsColumns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text: string, record: NewsItem) => (
                <Link to={{ pathname: `/news-manage/preview/${record.id}` }}>{text}</Link>
            )
        },
        {
            title: '分类',
            dataIndex: ['category', 'title'],
            key: 'category',
            width: 100,
            render: (text: string, record: NewsItem) => (
                <Tag color={colorMap[(record.categoryId - 1) % colorMap.length]} bordered={false}>
                    {text}
                </Tag>
            )
        },
        {
            title: '浏览',
            dataIndex: 'view',
            key: 'view',
            width: 80,
            render: (val: number) => <span style={{ color: '#1890ff' }}>{val || 0}</span>
        }
    ]

    return (
        <div style={{ padding: '24px', minHeight: '100vh' }}>
            <Card style={{ marginBottom: 24 }}>
                <Row align="middle" gutter={24}>
                    <Col>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserOutlined style={{ color: '#fff', fontSize: 24 }} />
                            </div>
                            <div style={{ marginLeft: 12 }}>
                                <h3 style={{ margin: 0, fontSize: 16 }}>{username}</h3>
                                <p style={{ color: '#999', margin: 0, fontSize: 13 }}>
                                    {region ? region : '全球'} · {roleName}
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col flex="auto">
                        <Row gutter={32} justify="center">
                            <Col>
                                <Statistic
                                    title="我的新闻"
                                    value={allList.filter((item) => item.author === username).length}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                            <Col>
                                <Statistic
                                    title="我的浏览"
                                    value={allList
                                        .filter((item) => item.author === username)
                                        .reduce((sum, item) => sum + (item.view || 0), 0)}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                            <Col>
                                <Statistic
                                    title="我的点赞"
                                    value={allList
                                        .filter((item) => item.author === username)
                                        .reduce((sum, item) => sum + (item.star || 0), 0)}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <a
                            onClick={() => {
                                setOpen(true)
                                setTimeout(() => renderPieView(), 0)
                            }}
                        >
                            查看个人数据分析 →
                        </a>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="总浏览量"
                            value={stats.totalViews}
                            prefix={<EyeOutlined style={{ color: '#1890ff' }} />}
                            suffix={
                                <span style={{ fontSize: 14, color: '#52c41a' }}>
                                    <ArrowUpOutlined /> 12%
                                </span>
                            }
                        />
                        <Progress percent={75} showInfo={false} strokeColor="#1890ff" size="small" />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="新闻总数"
                            value={stats.totalNews}
                            prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
                            suffix={
                                <span style={{ fontSize: 14, color: '#52c41a' }}>
                                    <ArrowUpOutlined /> 8%
                                </span>
                            }
                        />
                        <Progress percent={60} showInfo={false} strokeColor="#722ed1" size="small" />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="总点赞数"
                            value={stats.totalLikes}
                            prefix={<LikeOutlined style={{ color: '#eb2f96' }} />}
                            suffix={
                                <span style={{ fontSize: 14, color: '#52c41a' }}>
                                    <ArrowUpOutlined /> 15%
                                </span>
                            }
                        />
                        <Progress percent={85} showInfo={false} strokeColor="#eb2f96" size="small" />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="用户总数"
                            value={stats.totalUsers}
                            prefix={<TeamOutlined style={{ color: '#13c2c2' }} />}
                            suffix={
                                <span style={{ fontSize: 14, color: '#ff4d4f' }}>
                                    <ArrowDownOutlined /> 2%
                                </span>
                            }
                        />
                        <Progress percent={45} showInfo={false} strokeColor="#13c2c2" size="small" />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <Card>
                        <div ref={barRef} style={{ width: '100%', height: 300 }}></div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card>
                        <div ref={categoryChartRef} style={{ width: '100%', height: 300 }}></div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card
                        title="热门浏览"
                        extra={<Link to="/news-manage/draft">更多</Link>}
                        bodyStyle={{ padding: 0 }}
                    >
                        <Table
                            dataSource={newsViewList}
                            columns={recentNewsColumns}
                            pagination={false}
                            size="small"
                            rowKey="id"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        title="热门点赞"
                        extra={<Link to="/news-manage/draft">更多</Link>}
                        bodyStyle={{ padding: 0 }}
                    >
                        <List
                            dataSource={newsStarList}
                            size="small"
                            renderItem={(item, index) => (
                                <List.Item style={{ padding: '8px 16px' }}>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            width: 20,
                                            height: 20,
                                            lineHeight: '20px',
                                            textAlign: 'center',
                                            borderRadius: '50%',
                                            backgroundColor: index < 3 ? hotColors[index] : '#f0f0f0',
                                            color: index < 3 ? '#fff' : '#666',
                                            marginRight: 8,
                                            fontSize: 12
                                        }}
                                    >
                                        {index + 1}
                                    </span>
                                    <Link
                                        to={{ pathname: `/news-manage/preview/${item.id}` }}
                                        style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                    >
                                        {item.title}
                                    </Link>
                                    <LikeOutlined style={{ color: '#eb2f96', marginLeft: 8 }} />
                                    <span style={{ marginLeft: 4, color: '#999' }}>{item.star || 0}</span>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Drawer
                width="500px"
                title="个人新闻数据分析"
                placement="right"
                onClose={() => setOpen(false)}
                open={open}
            >
                <div ref={pieRef} style={{ width: '100%', height: '400px' }}></div>
            </Drawer>
        </div>
    )
}
