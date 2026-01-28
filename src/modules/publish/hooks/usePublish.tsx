import { ExclamationCircleFilled } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import api from '@/utils/Request'
import { notification, message, Modal } from 'antd'
import { useSelector } from 'react-redux'
import type { NewsItem, RootState } from '@/types'

const { confirm } = Modal

function usePublish(publishState: number) {
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const user = useSelector((state: RootState) => state.user)
  const username = user?.username || ''

  useEffect(() => {
    api<NewsItem[]>(`/news?author=${username}&auditState_ne=0&publishState=${publishState}&_expand=category`).then((res) => {
      setNewsList(res.data)
    })
  }, [publishState, username])

  function confirmMethod(id: number) {
    confirm({
      title: '警告',
      icon: <ExclamationCircleFilled />,
      content: '是否要进行该操作?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        if (publishState === 3) {
          return handleDelete(id)
        } else if (publishState === 1) {
          return handlePublish(id)
        } else if (publishState === 2) {
          return handleSunset(id)
        } else {
          return message.error('暂无相应功能！')
        }
      },
      onCancel() {}
    })
  }

  function handlePublish(id: number) {
    api
      .patch(`/news/${id}`, {
        publishState: 2
      })
      .then(
        () => {
          api<NewsItem[]>(`/news?author=${username}&auditState_ne=0&publishState=${publishState}&_expand=category`).then(
            (res) => {
              setNewsList(res.data)
            }
          )
          notification.info({
            message: `通知`,
            description: `您可以到【发布管理/已经发布】中查看您的新闻`,
            placement: 'bottomRight'
          })
        },
        () => message.error('出错了，请再次尝试')
      )
  }

  function handleSunset(id: number) {
    api
      .patch(`/news/${id}`, {
        publishState: 3
      })
      .then(
        () => {
          api<NewsItem[]>(`/news?author=${username}&auditState_ne=0&publishState=${publishState}&_expand=category`).then(
            (res) => {
              setNewsList(res.data)
            }
          )
          notification.info({
            message: `通知`,
            description: `您可以到【发布管理/已下线】中查看您的新闻`,
            placement: 'bottomRight'
          })
        },
        () => message.error('出错了，请再次尝试')
      )
  }

  function handleDelete(id: number) {
    api.delete(`/news/${id}`, {}).then(
      () => {
        api<NewsItem[]>(`/news?author=${username}&auditState_ne=0&publishState=${publishState}&_expand=category`).then((res) => {
          setNewsList(res.data)
        })
        notification.info({
          message: `通知`,
          description: `您已经删除了已下线的新闻`,
          placement: 'bottomRight'
        })
      },
      () => message.error('出错了，请再次尝试')
    )
  }

  return {
    newsList,
    confirmMethod
  }
}

export default usePublish
