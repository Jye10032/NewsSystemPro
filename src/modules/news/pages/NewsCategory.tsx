import axios from 'axios'
import React, { useEffect, useState, useRef, useContext, ReactNode } from 'react'
import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { Table, Button, message, Modal, Input, Form, FormInstance } from 'antd'
import type { Category } from '@/types'

const { confirm } = Modal
const EditableContext = React.createContext<FormInstance | null>(null)

interface EditableRowProps {
  index: number
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}

interface EditableCellProps {
  title: string
  editable: boolean
  children: ReactNode
  dataIndex: string
  record: Category
  handleSave: (record: Category) => void
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<any>(null)
  const form = useContext(EditableContext)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
    form?.setFieldsValue({
      [dataIndex]: (record as any)[dataIndex]
    })
  }

  const save = async () => {
    try {
      const values = await form?.validateFields()
      toggleEdit()
      handleSave({
        ...record,
        ...values
      })
    } catch (errInfo) {
      console.log('Save failed:', errInfo)
    }
  }

  let childNode = children
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    )
  }
  return <td {...restProps}>{childNode}</td>
}

interface UserWithCategories {
  id: number
  allowedCategoryIds?: number[]
}

export default function NewsCategory() {
  const [categoryList, setCategoryList] = useState<Category[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const addForm = useRef<FormInstance>(null)

  useEffect(() => {
    axios.get<Category[]>('/categories').then((res) => setCategoryList(res.data))
  }, [])

  function confirmMethod(item: Category) {
    confirm({
      title: '警告',
      icon: <ExclamationCircleFilled />,
      content: '是否删除该分类?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        deleteCateogry(item)
      },
      onCancel() { }
    })
  }

  async function deleteCateogry(item: Category) {
    try {
      const usersRes = await axios.get<UserWithCategories[]>('/users')
      const users = usersRes.data

      const updatePromises = users
        .filter(user => user.allowedCategoryIds?.includes(item.id))
        .map(user => {
          const updatedCategoryIds = user.allowedCategoryIds!.filter(id => id !== item.id)
          return axios.patch(`/users/${user.id}`, {
            allowedCategoryIds: updatedCategoryIds
          })
        })

      await Promise.all(updatePromises)
      await axios.delete(`/categories/${item.id}`)

      const list = categoryList.filter((category) => category.id !== item.id)
      setCategoryList([...list])
      message.success('删除成功，已同步更新用户权限')
    } catch (err) {
      console.error('删除失败:', err)
      message.error('删除失败')
    }
  }

  function handleSave(item: Category) {
    axios
      .post(`/categories/${item.id}`, {
        title: item.title,
        value: item.title
      })
      .then(
        () => {
          axios.get<Category[]>('/categories').then((res) => setCategoryList(res.data))
          message.success('修改成功！')
        },
        () => message.error('修改失败！')
      )
  }

  function handleOk() {
    addForm.current?.validateFields().then((info) => {
      axios
        .post('/categories', {
          title: info.title,
          value: info.title
        })
        .then(
          () => {
            message.success('添加成功！')
            axios.get<Category[]>('/categories').then((res) => setCategoryList(res.data))
            setIsModalOpen(false)
          },
          () => message.error('添加失败！请稍后再试')
        )
    })
  }

  function handleCancel() {
    addForm.current?.resetFields()
    setIsModalOpen(false)
  }

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id'
    },
    {
      title: '栏目名称',
      dataIndex: 'title',
      onCell: (record: Category) => ({
        record,
        editable: true,
        dataIndex: 'title',
        title: '栏目名称',
        handleSave
      })
    },
    {
      title: '操作',
      dataIndex: 'auditState',
      render: (_: any, item: Category) => {
        return (
          <div>
            <Button
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => confirmMethod(item)}
              style={{ marginRight: '10px' }}
            />
          </div>
        )
      }
    }
  ]

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: '16px 24px',
        marginBottom: '0',
        minHeight: '72px'
      }}>
        <h2 style={{ margin: 0 }}>新闻分类</h2>
        <Button
          type="primary"
          size="middle"
          onClick={() => setIsModalOpen(true)}
        >
          添加分类
        </Button>
      </div>
      <Table
        className="news-category-table"
        components={{
          body: {
            row: EditableRow,
            cell: EditableCell
          }
        }}
        dataSource={categoryList}
        columns={columns}
        rowKey={(item) => item.id}
        pagination={{
          pageSize: 5,
          position: ['bottomCenter']
        }}
      />
      <Modal
        title="添加分类"
        okText="添加"
        cancelText="取消"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form ref={addForm}>
          <Form.Item
            label="分类名称"
            name="title"
            rules={[{ required: true, message: '请输入分类!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
