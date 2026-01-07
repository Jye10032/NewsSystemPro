import style from './NewsAdd.module.scss'
import NewsEditor from '../components/NewsEditor'
import React, { useState, useEffect } from 'react'
import { Button, Input, Select, message, notification, Space } from 'antd'
import { SaveOutlined, SendOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function NewsAdd() {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(undefined)
  const [content, setContent] = useState('')
  const [categoryList, setCategoryList] = useState([])
  const [saving, setSaving] = useState(false)
  const userInfo = JSON.parse(localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/categories').then((res) => setCategoryList(res.data))
  }, [])

  function validate() {
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

  function handleSave(auditState) {
    if (!validate()) return

    setSaving(true)
    axios
      .post('/news', {
        title,
        categoryId,
        content,
        author: userInfo.username,
        roleId: userInfo.roleId,
        auditState: auditState,
        publishState: 0,
        createTime: Date.now(),
        star: 0,
        view: 0
      })
      .then(
        (res) => {
          navigate(auditState === 0 ? '/news-manage/draft' : '/audit-manage/list')
          notification.info({
            message: '提示',
            description: `您可以到${auditState === 0 ? '草稿箱' : '审核列表'}中查看您的新闻`,
            placement: 'bottomRight'
          })
        },
        (err) => {
          message.error('出错了，请联系管理员')
        }
      )
      .finally(() => setSaving(false))
  }

  return (
    <div className={style.editorPage}>
      {/* 顶部工具栏 */}
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

      {/* 标题输入 */}
      <Input
        className={style.titleInput}
        placeholder="请输入标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        showCount
      />

      {/* 富文本编辑器 */}
      <div className={style.editorWrapper}>
        <NewsEditor getContent={(value) => setContent(value)} />
      </div>
    </div>
  )
}
