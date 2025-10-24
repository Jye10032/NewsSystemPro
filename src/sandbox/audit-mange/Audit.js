import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Button, notification, message } from 'antd'
import '../../styles/TableStyles.css'


export default function Audit() {
  const [newsList, setNewsList] = useState([])

  //   为什么不能将allowedCategoryIds放在useEffect的依赖数组中？
  useEffect(() => {
    const { roleId, username, allowedCategoryIds } = JSON.parse(localStorage.getItem('token'))
    //   useEffect(() => {
    //     // ... 发起请求
    //   }, [roleId, username, allowedCategoryIds])  // ⚠️ 问题在这里
    // }

    // 执行流程：

    //   第1次渲染：
    //   1. 执行 JSON.parse(localStorage.getItem('token'))
    // 2. 创建一个新对象，包含 allowedCategoryIds: [1, 2, 3]（假设是这个值）
    //   3. 解构出 allowedCategoryIds，它是一个数组，内存地址假设是 0x001
    // 4. useEffect 记录依赖：allowedCategoryIds 的地址是 0x001
    // 5. 执行 useEffect，发起请求

    // 第2次渲染（由 setNewsList 触发）：
    //   1. 再次执行 JSON.parse(localStorage.getItem('token'))
    // 2. 又创建了一个新对象，虽然内容相同，但这是一个全新的对象
    // 3. 解构出新的 allowedCategoryIds: [1, 2, 3]，内存地址是 0x002（新地址！）
    //   4. React 比较依赖：0x002 !== 0x001 → 依赖变化了！
    //   5. 触发 useEffect → 发起请求 → setNewsList → 触发重新渲染
    // 6. 回到步骤 1，无限循环！

    axios.get(`/news?auditState=1&_expand=category`).then((res) => {
      if (roleId === 1) {
        return setNewsList(res.data)
      } else if (roleId === 2) {
        const list = res.data.filter((item) => {
          // 管理员可以审核：1. 自己发布的新闻 2. 编辑发布的且分类在自己权限范围内的新闻
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
    });
  }, [])
  // 请求新闻数据
  function getNewsList() {
    const { roleId, username, allowedCategoryIds } = JSON.parse(localStorage.getItem('token'))

    axios.get(`/news?auditState=1&_expand=category`).then((res) => {
      if (roleId === 1) {
        return setNewsList(res.data)
      } else if (roleId === 2) {
        const list = res.data.filter((item) => {
          // 管理员可以审核：1. 自己发布的新闻 2. 编辑发布的且分类在自己权限范围内的新闻
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
  }
  // 审核操作
  function handleAudit(item, auditState, publishState) {
    axios
      .patch(`/news/${item.id}`, {
        auditState,
        publishState
      })
      .then(
        (res) => {
          notification.info({
            message: `通知`,
            description: `您可以到[审核管理/审核列表]中查看您的新闻的审核状态`,
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
      dataIndex: 'auditState',
      render: (_, item) => {
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
                handleAudit(item, 3, 0)
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
        <h2>审核新闻</h2>
      </div>
      <Table
        className="audit-table"
        dataSource={newsList}
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
