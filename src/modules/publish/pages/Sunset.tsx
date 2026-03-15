import { Button } from 'antd'
import { Link } from 'react-router-dom'
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
          <div>
            <Link to={{ pathname: `/news-manage/update/${id}` }}>
              <Button style={{ marginRight: 8 }}>编辑</Button>
            </Link>
            <Button
              type="primary"
              danger
              onClick={() => confirmMethod(id)}
            >
              删除
            </Button>
          </div>
        )}
      ></NewsPublish>
    </div>
  )
}
