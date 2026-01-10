import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Table, Button, notification, Modal, message } from 'antd'
import axios from 'axios'
import { EditOutlined, DeleteOutlined, VerticalAlignTopOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import '../../../styles/TableStyles.css'
import type { Category, NewsItem } from '@/types'

const { confirm } = Modal

export default function NewsDraft() {
  const navigate = useNavigate()
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [categoryList, setCategoryList] = useState<Category[]>([])
  const { username } = JSON.parse(localStorage.getItem('token') || '{}')

  useEffect(() => {
    axios.get<NewsItem[]>(`/news?author=${username}&auditState=0&_expand=category`).then((res) => {
      setNewsList(res.data)
    })
    axios.get<Category[]>('/categories').then((res) => setCategoryList(res.data))
  }, [username])

  function handleCheck(id: number) {
    axios
      .patch(`news/${id}`, {
        auditState: 1
      })
      .then(() => {
        navigate('/audit-manage/list')
        notification.info({
          message: '通知',
          description: '您可以到审核列表中查看该新闻',
          placement: 'bottomRight'
        })
      })
  }

  function confirmMethod(news: NewsItem) {
    confirm({
      title: '警告',
      icon: <ExclamationCircleFilled />,
      content: '是否删除该新闻?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        deleteNews(news)
      },
      onCancel() { }
    })
  }

  function deleteNews(news: NewsItem) {
    const list = newsList.filter((item) => news.id !== item.id)
    axios.delete(`/news/${news.id}`).then(
      () => {
        setNewsList([...list])
        message.success('删除成功')
      },
      () => {
        message.error('删除失败')
      }
    )
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id'
    },
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
      render: (id: number) => {
        return categoryList.map((item) => {
          if (item.id === id) {
            return item.title
          }
          return null
        })
      }
    },
    {
      title: '操作',
      dataIndex: 'id',
      render: (_: number, item: NewsItem) => {
        return (
          <div>
            <Button
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              style={{ marginRight: '10px' }}
              onClick={() => confirmMethod(item)}
            />
            <Link to={{ pathname: `/news-manage/update/${item.id}` }}>
              <Button
                shape="circle"
                icon={<EditOutlined />}
                style={{ marginRight: '10px' }}
              />
            </Link>
            <Button
              type="primary"
              shape="circle"
              icon={<VerticalAlignTopOutlined />}
              onClick={() => handleCheck(item.id)}
            />
          </div>
        )
      }
    }
  ]

  return (
    <div>
      <div className="table-header">
        <h2>草稿箱</h2>
      </div>
      <Table
        className="news-draft-table"
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
