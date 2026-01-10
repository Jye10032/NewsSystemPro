import { Button } from 'antd'
import NewsPublish from '../components/NewsPublish'
import usePublish from '../hooks/usePublish'

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
            onClick={() => confirmMethod(id)}
          >
            删除
          </Button>
        )}
      ></NewsPublish>
    </div>
  )
}
