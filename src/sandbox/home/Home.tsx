import { lazy, Suspense, useEffect, useState } from 'react'
import api from '@/utils/Request'
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
import type { NewsItem, RootState } from '@/types'

interface Stats {
    totalViews: number
    totalNews: number
    totalLikes: number
    totalUsers: number
}

interface ChartDatum {
    name: string
    value: number
}

interface DashboardHomeResponse {
    stats: Stats
    categoryDistribution: ChartDatum[]
    topViewed: NewsItem[]
    topLiked: NewsItem[]
    currentUserSummary: {
        totalNews: number
        totalViews: number
        totalLikes: number
        categoryDistribution: ChartDatum[]
    }
}

const HomeTrendChart = lazy(() => import('./components/HomeTrendChart'))
const HomeCategoryChart = lazy(() => import('./components/HomeCategoryChart'))
const HomePersonalPieChart = lazy(() => import('./components/HomePersonalPieChart'))

function ChartPlaceholder({ height = 300, text = '图表加载中...' }: { height?: number; text?: string }) {
    return (
        <div
            style={{
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8c8c8c',
                background: 'linear-gradient(135deg, rgba(245,247,250,0.9) 0%, rgba(233,238,245,0.95) 100%)',
                borderRadius: 12
            }}
        >
            <span>{text}</span>
        </div>
    )
}

export default function Home() {
    const [open, setOpen] = useState(false)
    const [newsViewList, setNewsViewList] = useState<NewsItem[]>([])
    const [newsStarList, setNewsStarList] = useState<NewsItem[]>([])
    const [stats, setStats] = useState<Stats>({
        totalViews: 0,
        totalNews: 0,
        totalLikes: 0,
        totalUsers: 0
    })
    const [categoryDistribution, setCategoryDistribution] = useState<ChartDatum[]>([])
    const [currentUserSummary, setCurrentUserSummary] = useState({
        totalNews: 0,
        totalViews: 0,
        totalLikes: 0,
        categoryDistribution: [] as ChartDatum[]
    })

    useEffect(() => {
        api.get<DashboardHomeResponse>('/api/dashboard/home').then((res) => {
            setNewsViewList(res.data.topViewed)
            setNewsStarList(res.data.topLiked)
            setStats(res.data.stats)
            setCategoryDistribution(res.data.categoryDistribution)
            setCurrentUserSummary(res.data.currentUserSummary)
        })
    }, [])

    const user = useSelector((state: RootState) => state.user)
    const username = user?.username || ''
    const region = user?.region || ''
    const roleName = user?.role?.roleName || ''

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
                                    value={currentUserSummary.totalNews}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                            <Col>
                                <Statistic
                                    title="我的浏览"
                                    value={currentUserSummary.totalViews}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                            <Col>
                                <Statistic
                                    title="我的点赞"
                                    value={currentUserSummary.totalLikes}
                                    valueStyle={{ fontSize: 20 }}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <a
                            onClick={() => {
                                setOpen(true)
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
                        <Suspense fallback={<ChartPlaceholder text="趋势图加载中..." />}>
                            <HomeTrendChart />
                        </Suspense>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card>
                        <Suspense fallback={<ChartPlaceholder text="分类图加载中..." />}>
                            <HomeCategoryChart data={categoryDistribution} />
                        </Suspense>
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
                <Suspense fallback={<ChartPlaceholder height={400} text="个人图表加载中..." />}>
                    {open ? <HomePersonalPieChart data={currentUserSummary.categoryDistribution} /> : null}
                </Suspense>
            </Drawer>
        </div>
    )
}
