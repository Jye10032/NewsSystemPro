import axios from 'axios'
import React, { useEffect, useState, useRef, useContext } from 'react'
import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { Table, Button, message, Modal, Input, Form } from 'antd'
const { confirm } = Modal
const EditableContext = React.createContext(null)

export default function NewsCategory() {
  const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm()
    return (
      <Form
        form={form}
        component={false}
      >
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    )
  }
  const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
    const [editing, setEditing] = useState(false)
    const inputRef = useRef(null)
    const form = useContext(EditableContext)
    useEffect(() => {
      if (editing) {
        inputRef.current.focus()
      }
    }, [editing])
    const toggleEdit = () => {
      setEditing(!editing)
      form.setFieldsValue({
        [dataIndex]: record[dataIndex]
      })
    }
    const save = async () => {
      try {
        const values = await form.validateFields()
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
          style={{
            margin: 0
          }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`
            }
          ]}
        >
          <Input
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
          />
        </Form.Item>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{
            paddingRight: 24
          }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      )
    }
    return <td {...restProps}>{childNode}</td>
  }

  const [categoryList, setCategoryList] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const addForm = useRef()
  useEffect(() => {
    axios.get('/categories').then((res) => setCategoryList(res.data))
  }, [])
  // 删除前的确认框
  function confirmMethod(item) {
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
  // 删除分类
  async function deleteCateogry(item) {
    try {
      // 1. 先获取所有用户
      const usersRes = await axios.get('/users')
      const users = usersRes.data

      // 2. 更新所有包含该分类的用户权限
      const updatePromises = users
        .filter(user => user.allowedCategoryIds?.includes(item.id))
        .map(user => {
          // 从用户的 allowedCategoryIds 中移除被删除的分类 ID
          const updatedCategoryIds = user.allowedCategoryIds.filter(id => id !== item.id)
          return axios.patch(`/users/${user.id}`, {
            allowedCategoryIds: updatedCategoryIds
          })
        })

      // 等待所有用户更新完成
      await Promise.all(updatePromises)

      // 3. 删除分类
      await axios.delete(`/categories/${item.id}`)

      // 4. 更新本地列表
      const list = categoryList.filter((category) => {
        return category.id !== item.id
      })
      setCategoryList([...list])
      message.success('删除成功，已同步更新用户权限')
    } catch (err) {
      console.error('删除失败:', err)
      message.error('删除失败')
    }
  }
  // 修改分类
  function handleSave(item) {
    axios
      .post(`/categories/${item.id}`, {
        title: item.title,
        value: item.title
      })
      .then(
        (res) => {
          axios.get('/categories').then((res) => setCategoryList(res.data))
          message.success('修改成功！')
        },
        (err) => message.error('修改失败！')
      )
  }
  // 添加分类
  function handleOk() {
    addForm.current.validateFields().then((info) => {
      axios
        .post('/categories', {
          title: info.title,
          value: info.title
        })
        .then(
          (res) => {
            message.success('添加成功！')
            axios.get('/categories').then((res) => setCategoryList(res.data))
            setIsModalOpen(false)
          },
          (err) => message.error('添加失败！请稍后再试')
        )
    })
  }
  // 取消添加分类
  function handleCancel() {
    addForm.current.resetFields()
    setIsModalOpen(false)
  }
  // table表格要渲染的数据
  const columns = [
    {
      title: 'Id',
      dataIndex: 'id'
    },
    {
      title: '栏目名称',
      dataIndex: 'title',
      onCell: (record) => ({
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
      render: (_, item) => {
        return (
          <div>
            <Button
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => {
                confirmMethod(item)
              }}
              style={{
                marginRight: '10px'
              }}
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
          onClick={() => {
            setIsModalOpen(true)
          }}
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
        rowKey={(item) => {
          return item.id
        }}
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
            rules={[
              {
                required: true,
                message: '请输入分类!'
              }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
