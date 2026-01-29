import api from '@/utils/Request'
import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Table, Button, notification, message, Modal, Input } from 'antd'
import { useSelector } from 'react-redux'
import '../../styles/TableStyles.css'
import type { NewsItem, RootState } from '@/types'

export default function Audit() {
    const [newsList, setNewsList] = useState<NewsItem[]>([])
    const user = useSelector((state: RootState) => state.user)
    const { roleId, username, allowedCategoryIds } = user || {}

    const getNewsList = useCallback(() => {
        api.get<NewsItem[]>(`/news?auditState=1&_expand=category`).then((res) => {
            if (roleId === 1) {
                return setNewsList(res.data)
            } else if (roleId === 2) {
                const list = res.data.filter((item) => {
                    if (item.author === username) {
                        return true
                    }
                    if (item.roleId === 3 && allowedCategoryIds?.includes(item.categoryId)) {
                        return true
                    }
                    return false
                })
                return setNewsList(list)
            }
        })
    }, [roleId, username, allowedCategoryIds])

    useEffect(() => {
        getNewsList()
    }, [getNewsList])

    function handleAudit(item: NewsItem, auditState: number, publishState: number, reason?: string) {
        api
            .patch(`/news/${item.id}`, {
                auditState,
                publishState
            })
            .then(
                () => {
                    if (auditState === 3 && reason) {
                        api.post('/auditLogs', {
                            newsId: item.id,
                            result: auditState,
                            reason,
                            operator: username,
                            time: Date.now()
                        })
                    }
                    notification.info({
                        message: `通知`,
                        description: `您可以到[审核管理/已审核]中查看您的新闻的审核状态`,
                        placement: 'bottomRight'
                    })
                    getNewsList()
                },
                (err) => {
                    console.log(err)
                    message.error('出错了，请再次进行操作')
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
            title: '操作',
            dataIndex: 'auditState',
            render: (_: number, item: NewsItem) => {
                return (
                    <div>
                        <Button
                            type="primary"
                            style={{ marginRight: '15px' }}
                            onClick={() => {
                                handleAudit(item, 2, 1)
                            }}
                        >
                            通过
                        </Button>
                        <Button
                            danger
                            onClick={() => {
                                let reason = ''
                                Modal.confirm({
                                    title: '驳回原因',
                                    content: (
                                        <Input.TextArea
                                            placeholder="请输入驳回原因"
                                            onChange={(e) => {
                                                reason = e.target.value
                                            }}
                                        />
                                    ),
                                    okText: '确认驳回',
                                    cancelText: '取消',
                                    onOk() {
                                        if (!reason.trim()) {
                                            message.error('请填写驳回原因')
                                            return Promise.reject()
                                        }
                                        handleAudit(item, 3, 0, reason.trim())
                                        return Promise.resolve()
                                    }
                                })
                            }}
                        >
                            驳回
                        </Button>
                    </div>
                )
            }
        }
    ]

    return (
        <div>
            <div className="table-header">
                <h2>待审核</h2>
            </div>
            <Table
                className="audit-table"
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
