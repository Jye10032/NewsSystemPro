import React from 'react'
import { Button } from 'antd'
import NewsPublish from '../../publish-manage/NewsPublish'
import usePublish from '../../publish-manage/usePublish'

export default function Sunset() {
  const { newsList, confirmMethod } = usePublish(3)
  return (
    <div>
      <NewsPublish
        title="已下线"
        newsList={newsList}
        button={(id) => (
          <Button
            type="primary"
            onClick={() => confirmMethod(id, 3)}
          >
            删除
          </Button>
        )}
      ></NewsPublish>
    </div>
  )
}
