import React from 'react'
import { Table } from 'antd'
import { Link } from 'react-router-dom'
import '../styles/TableStyles.css'

export default function NewsPublish(props) {
  // table表格要渲染的数据
  const columns = [
    {
      title: '新闻标题',
      dataIndex: 'title',
      render: (title, item) => {
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
      render: (_, item) => {
        return item.category.title
      }
    },
    {
      title: '操作',
      dataIndex: 'id',
      render: (id) => {
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
