import React from 'react'
import IndexRouter from './router/IndexRouter'
import { Provider } from 'react-redux'
import { store, persistor } from './redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import { ConfigProvider } from 'antd'
import { antdTheme } from './config/theme'

/**
 * 主应用组件
 */
export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
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
