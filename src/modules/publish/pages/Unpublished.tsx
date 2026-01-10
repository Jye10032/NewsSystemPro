import { Button } from 'antd'
import NewsPublish from '../components/NewsPublish'
import usePublish from '../hooks/usePublish'

export default function Unpublished() {
  const { newsList, confirmMethod } = usePublish(1)
  return (
    <div>
      <NewsPublish
        title="待发布"
        newsList={newsList}
        button={(id) => (
          <Button
            type="primary"
            onClick={() => confirmMethod(id)}
          >
            发布
          </Button>
        )}
      ></NewsPublish>
    </div>
  )
}
