import { describe, it, expect } from 'vitest'
import UserReducer from '../../redux/reducers/UserReducer'

describe('UserReducer', () => {
  it('应该返回初始状态', () => {
    const state = UserReducer(undefined, { type: 'unknown' })
    expect(state).toBeNull()
  })

  it('应该设置用户信息', () => {
    const user = { id: 1, username: 'tester', roleId: 3 }
    const state = UserReducer(null, { type: 'set_user', payload: user })
    expect(state).toEqual(user)
  })

  it('应该清空用户信息', () => {
    const user = { id: 1, username: 'tester', roleId: 3 }
    const state = UserReducer(user, { type: 'clear_user' })
    expect(state).toBeNull()
  })

  it('应该保持未知 action 的状态', () => {
    const user = { id: 1, username: 'tester', roleId: 3 }
    const state = UserReducer(user, { type: 'no_op' })
    expect(state).toEqual(user)
  })
})
