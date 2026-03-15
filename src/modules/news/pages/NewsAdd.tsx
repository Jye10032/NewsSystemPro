import style from './NewsAdd.module.scss'
import NewsEditor from '../components/NewsEditor'
import { useState, useEffect } from 'react'
import { Button, Input, Select, message, notification, Space } from 'antd'
import { SaveOutlined, SendOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '@/utils/Request'
import type { Category, RootState } from '@/types'

export default function NewsAdd() {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [content, setContent] = useState('')
  const [categoryList, setCategoryList] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const user = useSelector((state: RootState) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    api.get<Category[]>('/categories').then((res) => setCategoryList(res.data))
  }, [])

  function validate(): boolean {
    if (!title.trim()) {
      message.error('请填写新闻标题')
      return false
    }
    if (!categoryId) {
      message.error('请选择新闻分类')
      return false
    }
    if (!content || content.trim() === '<p></p>') {
      message.error('请填写新闻内容')
      return false
    }
    return true
  }

  function handleSave(auditState: number) {
    if (!validate()) return

    setSaving(true)
    api
      .post('/news', {
        title,
        categoryId,
        content,
        author: user?.username,
        roleId: user?.roleId,
        auditState: auditState,
        publishState: 0,
        createTime: Date.now(),
        star: 0,
        view: 0
      })
      .then(
        () => {
          navigate(auditState === 0 ? '/news-manage/draft' : '/audit-manage/list')
          notification.info({
            message: '提示',
            description: `您可以到${auditState === 0 ? '草稿箱' : '已审核'}中查看您的新闻`,
            placement: 'bottomRight'
          })
        },
        () => {
          message.error('出错了，请联系管理员')
        }
      )
      .finally(() => setSaving(false))
  }

  return (
    <div className={style.editorPage}>
      <div className={style.toolbar}>
        <Select
          placeholder="选择分类"
          value={categoryId}
          onChange={setCategoryId}
          style={{ width: 140 }}
          options={categoryList.map((item) => ({
            value: item.id,
            label: item.title
          }))}
        />
        <Space>
          <Button
            icon={<SaveOutlined />}
            onClick={() => handleSave(0)}
            loading={saving}
          >
            保存草稿
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSave(1)}
            loading={saving}
          >
            提交审核
          </Button>
        </Space>
      </div>

      <Input
        className={style.titleInput}
        placeholder="请输入标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        showCount
      />

      <div className={style.editorWrapper}>
        <NewsEditor getContent={(value) => setContent(value)} />
      </div>
    </div>
  )
}
