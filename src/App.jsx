import React from 'react'
import IndexRouter from './router/IndexRouter'
import { Provider } from 'react-redux'
import { store, persistor } from './redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import { App as AntdApp, ConfigProvider } from 'antd'
import { antdTheme } from './styles/antd.theme'
import { AppMessageBridge } from './utils/appMessage'

/**
 * 主应用组件
 */
export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        <AppMessageBridge />
        <Provider store={store}>
          <PersistGate
            loading={null}
            persistor={persistor}
          >
            <IndexRouter></IndexRouter>
          </PersistGate>
        </Provider>
      </AntdApp>
    </ConfigProvider>
  )
}
