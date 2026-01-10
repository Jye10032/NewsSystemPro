import type { CollapsedAction } from '@/types'

const initState = false

export default function CollapsedReducer(
  preState = initState,
  action: CollapsedAction | { type: string }
): boolean {
  const { type } = action
  switch (type) {
    case 'change_collapsed':
      return !preState
    default:
      return preState
  }
}
