import { memo } from 'react'
import { Card, Col, Row, Statistic } from 'antd'
import { UserOutlined } from '@ant-design/icons'

interface CurrentUserSummary {
    totalNews: number
    totalViews: number
    totalLikes: number
}

interface HomeSummaryCardProps {
    username: string
    region: string
    roleName: string
    summary: CurrentUserSummary
    loading: boolean
    onOpenAnalysis: () => void
}

function SummaryValue({ value, loading }: { value: number; loading: boolean }) {
    return (
        <span
            style={{
                display: 'inline-block',
                minWidth: 56,
                textAlign: 'center'
            }}
        >
            {loading ? '--' : value}
        </span>
    )
}

function HomeSummaryCard({
    username,
    region,
    roleName,
    summary,
    loading,
    onOpenAnalysis
}: HomeSummaryCardProps) {
    return (
        <Card style={{ marginBottom: 24 }}>
            <Row align="middle" gutter={24}>
                <Col>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: '#1890ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
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
                                valueRender={() => <SummaryValue value={summary.totalNews} loading={loading} />}
                                valueStyle={{ fontSize: 20 }}
                            />
                        </Col>
                        <Col>
                            <Statistic
                                title="我的浏览"
                                valueRender={() => <SummaryValue value={summary.totalViews} loading={loading} />}
                                valueStyle={{ fontSize: 20 }}
                            />
                        </Col>
                        <Col>
                            <Statistic
                                title="我的点赞"
                                valueRender={() => <SummaryValue value={summary.totalLikes} loading={loading} />}
                                valueStyle={{ fontSize: 20 }}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <a onClick={onOpenAnalysis}>查看个人数据分析 →</a>
                </Col>
            </Row>
        </Card>
    )
}

export default memo(HomeSummaryCard)
