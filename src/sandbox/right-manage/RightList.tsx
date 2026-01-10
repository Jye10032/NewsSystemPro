import { useState, useEffect } from 'react'
import { Table, Tag, Button, Modal, Popover, Switch } from 'antd'
import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import axios from 'axios'
import '../../styles/TableStyles.css'
import type { Right } from '@/types'

const { confirm } = Modal

export default function RightList() {
    const [dataSource, setdataSource] = useState<Right[]>([])

    useEffect(() => {
        axios.get<Right[]>("/rights").then(res => {
            const list = res.data
            list.forEach(item => {
                if (!item.children || item.children.length === 0) {
                    item.children = undefined
                }
            })
            setdataSource(list)
        })
    }, [])

    const columns = [
        {
            title: '权限名称',
            dataIndex: 'title',
            render: (title: string, record: Right) => {
                const isEnabled = record.pagepermisson === 1
                return (
                    <span>
                        <span style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: isEnabled ? '#1890ff' : '#d9d9d9',
                            marginRight: 8
                        }} />
                        <span style={{ color: isEnabled ? 'inherit' : '#999' }}>{title}</span>
                    </span>
                )
            }
        },
        {
            title: '权限路径',
            dataIndex: 'key',
            render: (key: string) => {
                return <Tag color="orange">{key}</Tag>
            }
        },
        {
            title: '操作',
            render: (item: Right) => {
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />}
                        onClick={() => showConfirm(item)} />
                    <Popover content={<div style={{ textAlign: "center" }}>
                        <Switch checked={item.pagepermisson === 1} onChange={() => switchMethod(item)}></Switch>
                    </div>} title="配置项" trigger={item.pagepermisson === undefined ? undefined : 'click'}>
                        <Button type="primary" shape="circle" icon={<EditOutlined />} disabled={item.pagepermisson === undefined} />
                    </Popover>
                </div>
            }
        },
    ]

    const switchMethod = (item: Right) => {
        item.pagepermisson = item.pagepermisson ? 0 : 1
        setdataSource([...dataSource])

        const isTopLevel = item.key.split('/').filter(Boolean).length === 1

        if (isTopLevel) {
            axios.patch(`/rights/${item.id}`, {
                pagepermisson: item.pagepermisson
            })
        } else {
            const parentKey = '/' + item.key.split('/').filter(Boolean)[0]
            const parent = dataSource.find(d => d.key === parentKey)
            if (parent) {
                axios.patch(`/rights/${parent.id}`, {
                    children: parent.children
                })
            }
        }
    }

    const showConfirm = (item: Right) => {
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

    const deleteMethod = (item: Right) => {
        const isTopLevel = item.key.split('/').filter(Boolean).length === 1

        if (isTopLevel) {
            setdataSource(dataSource.filter(data => data.id !== item.id))
            axios.delete(`/rights/${item.id}`)
        } else {
            const parentKey = '/' + item.key.split('/').filter(Boolean)[0]
            const parent = dataSource.find(d => d.key === parentKey)
            if (parent && parent.children) {
                parent.children = parent.children.filter(child => child.id !== item.id)
                setdataSource([...dataSource])
                axios.patch(`/rights/${parent.id}`, {
                    children: parent.children
                })
            }
        }
    }

    return (
        <div>
            <div className="table-header">
                <h2>菜单管理</h2>
            </div>
            <Table
                className="right-table"
                dataSource={dataSource}
                columns={columns}
                tableLayout="fixed"
                pagination={{
                    pageSize: 5,
                    position: ['bottomCenter']
                }}
            />
        </div>
    )
}
