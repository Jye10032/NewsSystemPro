import { useState, useEffect } from 'react'
import { Table, Button, Modal, Tree } from 'antd'
import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import api from '@/utils/Request'
import '../../styles/TableStyles.css'
import type { Role, Right } from '@/types'

const { confirm } = Modal

export default function RoleList() {
    const [dataSource, setdataSource] = useState<Role[]>([])
    const [rightList, setRightList] = useState<Right[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentRights, setcurrentRights] = useState<string[]>([])
    const [currentId, setcurrentId] = useState<number>(0)

    const showConfirm = (item: Role) => {
        confirm({
            title: 'Do you Want to delete these items?',
            icon: <ExclamationCircleFilled />,
            content: 'Some descriptions',
            onOk() {
                deleteMethod(item)
            },
            onCancel() {
                console.log('Cancel')
            },
        })
    }

    const deleteMethod = (item: Role) => {
        setdataSource(dataSource.filter(data => data.id !== item.id))
        api.delete(`/roles/${item.id}`)
    }

    useEffect(() => {
        api.get<Role[]>("/roles").then(res => {
            setdataSource(res.data)
        })
    }, [])

    useEffect(() => {
        api.get<Right[]>("/rights?_embed=children").then(res => {
            setRightList(res.data)
        })
    }, [])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (id: number) => {
                return <b>{id}</b>
            }
        },
        {
            title: '角色名称',
            dataIndex: 'roleName',
        },
        {
            title: '操作',
            render: (item: Role) => {
                return (
                    <div>
                        <Button danger shape="circle" icon={<DeleteOutlined />}
                            onClick={() => showConfirm(item)} />
                        <Button type="primary" shape="circle" icon={<EditOutlined />}
                            onClick={() => {
                                setIsModalOpen(true)
                                setcurrentRights(item.rights)
                                setcurrentId(item.id)
                            }} />
                    </div>
                )
            }
        },
    ]

    const handleOk = () => {
        setIsModalOpen(false)
        setdataSource(dataSource.map(item => {
            if (item.id === currentId) {
                return {
                    ...item,
                    rights: currentRights
                }
            }
            return item
        }))
        api.patch(`/roles/${currentId}`, {
            rights: currentRights
        })
    }

    const handleCancel = () => {
        setIsModalOpen(false)
    }

    const onCheck = (checkedKeys: { checked: string[] } | string[]) => {
        if (Array.isArray(checkedKeys)) {
            setcurrentRights(checkedKeys)
        } else {
            setcurrentRights(checkedKeys.checked)
        }
    }

    return (
        <div>
            <div className="table-header">
                <h2>角色列表</h2>
            </div>
            <Table
                className="role-table"
                dataSource={dataSource}
                columns={columns}
                pagination={{
                    pageSize: 5,
                    position: ['bottomCenter']
                }}
                rowKey={(item) => item.id}
            />

            <Modal title="权限分配" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Tree
                    checkable
                    checkedKeys={currentRights}
                    onCheck={onCheck as any}
                    checkStrictly={true}
                    treeData={rightList as any}
                />
            </Modal>
        </div>
    )
}
