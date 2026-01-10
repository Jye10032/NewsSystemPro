import axios from 'axios'
import { useEffect, useState } from 'react'
import { Table, Button, Tag, notification, message } from 'antd'
import { Link } from 'react-router-dom'
import '../../styles/TableStyles.css'

interface NewsItem {
    id: number
    title: string
    author: string
    categoryId: number
    auditState: number
    publishState: number
    category: { title: string }
}

export default function AuditList() {
    const auditList = ['未审核', '审核中', '已通过', '未通过']
    const [newsList, setNewsList] = useState<NewsItem[]>([])

    useEffect(() => {
        const { username } = JSON.parse(localStorage.getItem('token') || '{}')
        axios.get<NewsItem[]>(`/news?author=${username}&auditState_ne=0&publishState_lte=1&_expand=category`).then((res) => {
            setNewsList(res.data)
        })
    }, [])

    function handleRervert(item: NewsItem) {
        setNewsList(newsList.filter((data) => data.id !== item.id))

        axios
            .patch(`/news/${item.id}`, {
                auditState: 0
            })
            .then(() => {
                const { username } = JSON.parse(localStorage.getItem('token') || '{}')
                axios.get<NewsItem[]>(`/news?author=${username}&auditState_ne=0&publishState_lte=1&_expand=category`).then((res) => {
                    setNewsList(res.data)
                })
                notification.info({
                    message: `通知`,
                    description: `您可以到草稿箱中查看您的新闻`,
                    placement: 'bottomRight'
                })
            })
    }

    function handlePublish(item: NewsItem) {
        axios
            .patch(`/news/${item.id}`, {
                publishState: 2,
                publishTime: Date.now()
            })
            .then(
                () => {
                    const { username } = JSON.parse(localStorage.getItem('token') || '{}')
                    axios.get<NewsItem[]>(`/news?author=${username}&auditState_ne=0&publishState_lte=1&_expand=category`).then((res) => {
                        setNewsList(res.data)
                    })
                    notification.info({
                        message: `通知`,
                        description: `您可以到【发布管理/已经发布】中查看您的新闻`,
                        placement: 'bottomRight'
                    })
                },
                () => {
                    message.error('发布失败，请稍后再试')
                }
            )
    }

    const columns = [
        {
            title: '新闻标题',
            dataIndex: 'title',
            render: (title: string, item: NewsItem) => {
                return <Link to={{ pathname: `/news-manage/preview/${item.id}` }}>{title}</Link>
            }
        },
        {
            title: '作者',
            dataIndex: 'author'
        },
        {
            title: '新闻分类',
            dataIndex: 'categoryId',
            render: (_: number, item: NewsItem) => {
                return item.category.title
            }
        },
        {
            title: '审核状态',
            dataIndex: 'auditState',
            render: (auditState: number) => {
                if (auditState === 1) {
                    return <Tag color="orange">{auditList[auditState]}</Tag>
                } else if (auditState === 2) {
                    return <Tag color="green">{auditList[auditState]}</Tag>
                } else {
                    return <Tag color="red">{auditList[auditState]}</Tag>
                }
            }
        },
        {
            title: '操作',
            dataIndex: 'auditState',
            render: (auditState: number, item: NewsItem) => {
                if (auditState === 1) {
                    return (
                        <Button
                            danger
                            onClick={() => {
                                handleRervert(item)
                            }}
                        >
                            撤销
                        </Button>
                    )
                } else if (auditState === 2) {
                    return (
                        <Button
                            type="primary"
                            onClick={() => {
                                handlePublish(item)
                            }}
                        >
                            发布
                        </Button>
                    )
                } else {
                    return (
                        <Link to={{ pathname: `/news-manage/update/${item.id}` }}>
                            <Button>修改</Button>
                        </Link>
                    )
                }
            }
        }
    ]

    return (
        <div>
            <div className="table-header">
                <h2>审核列表</h2>
            </div>
            <Table
                className="audit-list-table"
                dataSource={newsList}
                columns={columns}
                rowKey={(item) => item.id}
                pagination={{
                    pageSize: 5,
                    position: ['bottomCenter']
                }}
            />
        </div>
    )
}
