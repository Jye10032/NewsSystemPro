import type { LoadingAction } from '@/types'

const initState = false

export default function LoadingReducer(
  preState = initState,
  action: LoadingAction | { type: string }
): boolean {
  const { type } = action
  switch (type) {
    case 'change_loading':
      return !preState
    default:
      return preState
  }
}
