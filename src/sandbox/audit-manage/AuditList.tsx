import api from '@/utils/Request'
import { useEffect, useState } from 'react'
import { Table, Button, Tag, notification, message } from 'antd'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import '../../styles/TableStyles.css'
import type { NewsItem, RootState } from '@/types'

export default function AuditList() {
    const auditList = ['未审核', '审核中', '已通过', '未通过']
    const [newsList, setNewsList] = useState<NewsItem[]>([])
    const user = useSelector((state: RootState) => state.user)
    const username = user?.username || ''

    useEffect(() => {
        // 获取已审核但未发布/待发布的新闻
        api.get<NewsItem[]>(`/news?author=${username}&auditState_ne=0&publishState_lte=1&_expand=category`).then((res) => {
            setNewsList(res.data.filter((item) => item.auditState !== 1))
        })
    }, [username])

    function handlePublish(item: NewsItem) {
        api
            .patch(`/news/${item.id}`, {
                publishState: 2,
                publishTime: Date.now()
            })
            .then(
                () => {
                    // 获取已审核但未发布/待发布的新闻
                    api.get<NewsItem[]>(`/news?author=${username}&auditState_ne=0&publishState_lte=1&_expand=category`).then((res) => {
                        setNewsList(res.data.filter((item) => item.auditState !== 1))
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

    function handleDelete(item: NewsItem) {
        api.delete(`/news/${item.id}`).then(
            () => {
                setNewsList(newsList.filter((data) => data.id !== item.id))
                message.success('删除成功')
            },
            () => message.error('删除失败')
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
                if (auditState === 2) {
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
                        <div>
                            <Link to={{ pathname: `/news-manage/update/${item.id}` }}>
                                <Button style={{ marginRight: 8 }}>修改</Button>
                            </Link>
                            <Button danger onClick={() => handleDelete(item)}>删除</Button>
                        </div>
                    )
                }
            }
        }
    ]

    return (
        <div>
            <div className="table-header">
                <h2>已审核</h2>
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
