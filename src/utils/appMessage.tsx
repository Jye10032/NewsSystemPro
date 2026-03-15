import { App as AntdApp } from 'antd'
import { useEffect } from 'react'

type MessageApi = ReturnType<typeof AntdApp.useApp>['message']

let messageInstance: MessageApi | null = null

export function AppMessageBridge() {
  const { message } = AntdApp.useApp()

  useEffect(() => {
    messageInstance = message
    return () => {
      if (messageInstance === message) {
        messageInstance = null
      }
    }
  }, [message])

  return null
}

function emit(method: 'success' | 'error' | 'warning' | 'info', content: string) {
  if (messageInstance) {
    messageInstance[method](content)
    return
  }

  if (method === 'error') {
    console.error(content)
    return
  }
  console.log(content)
}

export const appMessage = {
  success(content: string) {
    emit('success', content)
  },
  error(content: string) {
    emit('error', content)
  },
  warning(content: string) {
    emit('warning', content)
  },
  info(content: string) {
    emit('info', content)
  }
}
