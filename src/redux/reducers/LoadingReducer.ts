// 使用计数器方式处理并发请求的 loading 状态
const initState = 0

export default function LoadingReducer(
  preState = initState,
  action: { type: string }
): number {
  switch (action.type) {
    case 'loading_start':
      return preState + 1
    case 'loading_end':
      return Math.max(0, preState - 1)
    default:
      return preState
  }
}
