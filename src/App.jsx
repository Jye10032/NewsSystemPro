import React from 'react'
import IndexRouter from './router/IndexRouter'
import { Provider } from 'react-redux'
import { store, persistor } from './redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import { ConfigProvider } from 'antd'

/**
 * 主应用组件
 */
export default function App() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            siderBg: '#ffff',    // 你的侧边栏背景色
          },
        },
      }}
    >
      <Provider store={store}>
        <PersistGate
          loading={null}
          persistor={persistor}
        >
          <IndexRouter></IndexRouter>
        </PersistGate>
      </Provider>
    </ConfigProvider>
  )
}
