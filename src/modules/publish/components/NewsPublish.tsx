import { Table } from 'antd'
import { Link } from 'react-router-dom'
import '../../../styles/TableStyles.css'
import type { ReactNode } from 'react'

interface NewsItem {
  id: number
  title: string
  author: string
  categoryId: number
  category?: { title: string }
}

interface NewsPublishProps {
  title: string
  newsList: NewsItem[]
  button: (id: number) => ReactNode
}

export default function NewsPublish(props: NewsPublishProps) {
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
        return item.category?.title
      }
    },
    {
      title: '操作',
      dataIndex: 'id',
      render: (id: number) => {
        return <div>{props.button(id)}</div>
      }
    }
  ]

  return (
    <div>
      <div className="table-header">
        <h2>{props.title}</h2>
      </div>
      <Table
        className="news-publish-table"
        dataSource={props.newsList}
        columns={columns}
        rowKey={(item) => {
          return item.id
        }}
        pagination={{
          pageSize: 5,
          position: ['bottomCenter']
        }}
      />
    </div>
  )
}
