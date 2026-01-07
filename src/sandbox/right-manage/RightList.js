import React, { useState, useEffect } from 'react'
import { Table, Tag, Button, Modal, Popover, Switch } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ExclamationCircleFilled } from '@ant-design/icons';
import axios from 'axios'
import '../../styles/TableStyles.css'

const { confirm } = Modal;

export default function RightList() {
    const [dataSource, setdataSource] = useState([])

    useEffect(() => {
        axios.get("/rights").then(res => {
            const list = res.data
            list.forEach(item => {
                if (!item.children || item.children.length === 0) {
                    item.children = ""
                }
            })
            setdataSource(list)
        })
    }, [])

    const [modal, contextHolder] = Modal.useModal();




    const columns = [
        // {
        //     title: 'ID',
        //     dataIndex: 'id',
        //     //key: 'name',
        //     render: (id) => {
        //         return <b>{id}</b>
        //     }
        // },
        {
            title: '权限名称',
            dataIndex: 'title',
            render: (title, record) => {
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
            //key: 'address',
            render: (key) => {
                return <Tag color="orange">{key}</Tag>
            }
        },
        {
            title: '操作',
            //key: 'age',

            render: (item) => {
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />}
                        onClick={() => showConfirm(item)} />
                    <Popover content={<div style={{ textAlign: "center" }}>
                        <Switch checked={item.pagepermisson} onChange={() => switchMethod(item)}></Switch>
                    </div>} title="配置项" trigger={item.pagepermisson === undefined ? '' : 'click'}>
                        <Button type="primary" shape="circle" icon={<EditOutlined />} disabled={item.pagepermisson === undefined} />
                    </Popover>

                </div>
            }
        },
    ];

    const switchMethod = (item) => {
        item.pagepermisson = Number(!item.pagepermisson)
        setdataSource([...dataSource])

        // 通过路径层级判断：一级菜单只有一层路径
        const isTopLevel = item.key.split('/').filter(Boolean).length === 1

        if (isTopLevel) {
            axios.patch(`/rights/${item.id}`, {
                pagepermisson: item.pagepermisson
            })
        } else {
            // 二级菜单：找到父级，更新整个 rights 项
            const parentKey = '/' + item.key.split('/').filter(Boolean)[0]
            const parent = dataSource.find(d => d.key === parentKey)
            if (parent) {
                axios.patch(`/rights/${parent.id}`, {
                    children: parent.children
                })
            }
        }
    }


    const showConfirm = (item) => {
        confirm({
            title: 'Do you Want to delete these items?',
            icon: <ExclamationCircleFilled />,
            content: 'Some descriptions',
            onOk() {
                deleteMethod(item);
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };


    //删除
    const deleteMethod = (item) => {
        // 通过路径层级判断
        const isTopLevel = item.key.split('/').filter(Boolean).length === 1

        if (isTopLevel) {
            // 一级菜单：直接删除
            setdataSource(dataSource.filter(data => data.id !== item.id))
            axios.delete(`/rights/${item.id}`)
        } else {
            // 二级菜单：找到父级，从 children 中删除
            const parentKey = '/' + item.key.split('/').filter(Boolean)[0]
            const parent = dataSource.find(d => d.key === parentKey)
            if (parent) {
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
