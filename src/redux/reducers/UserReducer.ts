import { User, UserAction } from '../../types'

const initState: User | null = null

export default function UserReducer(
  preState: User | null = initState,
  action: UserAction
): User | null {
  switch (action.type) {
    case 'set_user':
      return action.payload
    case 'clear_user':
      return null
    default:
      return preState
  }
}
